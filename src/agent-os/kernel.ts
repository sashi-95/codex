/**
 * AI Agent OS カーネル
 *
 * 責務:
 *   - プロセスライフサイクル管理 (spawn / wait / terminate / kill)
 *   - スケジューリング (優先度付きラウンドロビン、同時実行数 = cores)
 *   - IPC (メッセージバス)
 *   - イベントログ (syslog)
 *   - タスク管理 (ユーザーゴール → ルートプロセス起動 → 結果回収)
 *
 * 実行モデル:
 *   一定間隔の tick でスケジューラが ready なプロセスを選び、
 *   1ステップ (LLM推論 → ツール実行) を非同期に走らせる。
 *   delegate による親子プロセスの fork/wait も tick で解決する。
 */

import { AGENT_DEFINITIONS, getAgent } from './agents';
import { ContextManager } from './context-manager';
import { GuardrailEngine } from './guardrails';
import { createProvider } from './llm';
import { MemoryStore } from './memory';
import { ToolRegistry } from './tools';
import type {
  BusMessage,
  EventLevel,
  HistoryEntry,
  KernelApi,
  KernelEvent,
  KernelSnapshot,
  KernelTask,
  ProcessInfo,
} from './types';

const TICK_INTERVAL_MS = 300;

/** ナレッジベースの初期データ (RAGデモ用の社内ナレッジ) */
const SEED_KNOWLEDGE = [
  {
    content:
      '自社の主力SaaS製品のARRは1,200 (百万円)。直近3年の年平均成長率は18%で、来期も同水準の成長を見込む。',
    tags: ['finance', 'arr', 'kpi', '売上', '成長率'],
  },
  {
    content:
      'カスタマーサポート部門の月間チケット数は約24,000件。AIエージェント導入のPoCでは一次解決率が38%→61%に改善した。',
    tags: ['support', 'ai', 'チケット', '顧客', 'サポート'],
  },
  {
    content:
      '全社のAI活用方針: 2026年度中に主要業務プロセスの30%にエージェント型自動化を導入する。ガードレールと監査ログの整備が前提条件。',
    tags: ['strategy', 'ai', 'agent', '方針', 'ガードレール'],
  },
  {
    content:
      '競合他社AはAIエージェント基盤を自社開発し、運用コストを22%削減したと発表。業界全体でエージェントOS的なアーキテクチャへの関心が高まっている。',
    tags: ['competitor', 'ai', 'agent', '競合', 'コスト'],
  },
  {
    content:
      '在庫回転率の全社目標は6.0x。現状はSKU-789が4.2xで最も低く、リオーダーポイントの見直しが検討課題。',
    tags: ['inventory', 'kpi', '在庫', 'sku'],
  },
];

export class Kernel {
  private processes = new Map<number, ProcessInfo>();
  private histories = new Map<number, HistoryEntry[]>();
  private tasks = new Map<string, KernelTask>();
  private events: KernelEvent[] = [];
  private messages: BusMessage[] = [];

  private memory = new MemoryStore();
  private guardrails = new GuardrailEngine();
  private tools = new ToolRegistry();
  private contextManager = new ContextManager();
  private provider = createProvider();

  /** 同時にLLM推論を走らせられるプロセス数 */
  private readonly cores = 3;
  private inFlight = new Set<number>();

  private nextPid = 1;
  private seq = 0;
  private ticks = 0;
  private totalSteps = 0;
  private totalTokens = 0;
  private totalLLMCalls = 0;
  private readonly bootedAt = Date.now();
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.memory.seed(SEED_KNOWLEDGE);
    this.log('info', 'kernel', `AI Agent OS 起動完了 (provider: ${this.provider.name}, cores: ${this.cores})`);
    this.log('info', 'kernel', `ナレッジベースに ${SEED_KNOWLEDGE.length} 件の初期記憶をロード`);
    this.timer = setInterval(() => this.tick(), TICK_INTERVAL_MS);
    // Node.jsプロセスの終了を妨げない
    if (typeof this.timer === 'object' && 'unref' in this.timer) this.timer.unref();
  }

  // ============================================================
  // 公開API
  // ============================================================

  /** ユーザータスクの投入 → オーケストレータープロセスを起動 */
  submitTask(goal: string): KernelTask {
    const trimmed = goal.trim();
    if (!trimmed) throw new Error('ゴールが空です');

    const inputCheck = this.guardrails.checkInput(0, trimmed);
    if (!inputCheck.allowed) {
      this.log('warn', 'guardrail', `タスク投入を遮断: ${inputCheck.reason}`);
      throw new Error(inputCheck.reason);
    }

    const task: KernelTask = {
      id: `task-${++this.seq}`,
      goal: trimmed,
      status: 'running',
      createdAt: Date.now(),
    };
    this.tasks.set(task.id, task);

    const pid = this.spawn('orchestrator', trimmed, task.id, null);
    task.rootPid = pid;
    this.log('info', 'kernel', `タスク ${task.id} を受理 → ルートプロセス PID ${pid} (orchestrator) を起動`);
    return task;
  }

  /** プロセスの強制終了 (SIGKILL相当。子プロセスも道連れ) */
  kill(pid: number): void {
    const process = this.processes.get(pid);
    if (!process || process.state === 'terminated' || process.state === 'failed') return;
    for (const childPid of process.childPids) this.kill(childPid);
    process.state = 'failed';
    process.exitReason = 'ユーザーによる強制終了 (SIGKILL)';
    process.updatedAt = Date.now();
    this.log('warn', 'kernel', `PID ${pid} (${process.name}) を強制終了しました`);
  }

  snapshot(): KernelSnapshot {
    return {
      stats: {
        bootedAt: this.bootedAt,
        ticks: this.ticks,
        totalTokens: this.totalTokens,
        totalSteps: this.totalSteps,
        totalLLMCalls: this.totalLLMCalls,
        provider: this.provider.name,
        cores: this.cores,
        runningProcesses: this.inFlight.size,
      },
      processes: [...this.processes.values()].sort((a, b) => a.pid - b.pid),
      tasks: [...this.tasks.values()].sort((a, b) => b.createdAt - a.createdAt),
      events: this.events.slice(-120).reverse(),
      messages: this.messages.slice(-60).reverse(),
      memory: this.memory.all().slice(0, 40),
      violations: this.guardrails.all(),
      agents: AGENT_DEFINITIONS,
    };
  }

  shutdown(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  // ============================================================
  // プロセス管理
  // ============================================================

  private spawn(
    agentId: string,
    goal: string,
    taskId: string,
    parentPid: number | null
  ): number {
    const agent = getAgent(agentId);
    const pid = this.nextPid++;
    const process: ProcessInfo = {
      pid,
      agentId,
      name: agent.name,
      state: 'ready',
      priority: agent.priority,
      goal,
      taskId,
      parentPid,
      childPids: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      steps: 0,
      tokensUsed: 0,
      currentActivity: '起動待ち',
    };
    this.processes.set(pid, process);
    this.histories.set(pid, []);
    if (parentPid !== null) {
      this.processes.get(parentPid)?.childPids.push(pid);
    }
    this.log('info', 'scheduler', `PID ${pid} (${agent.nameJa}) を生成 [優先度 ${agent.priority}]`);
    return pid;
  }

  /** ツールに渡す限定カーネルAPI */
  private apiFor(): KernelApi {
    return {
      memorySearch: (query, k) => this.memory.search(query, k),
      memorySave: (content, source, tags) => this.memory.save(content, source, tags, 0.6),
      publish: (from, to, topic, payload) => this.publish(from, to, topic, payload),
      spawnChildren: (parentPid, specs) => {
        const parent = this.processes.get(parentPid);
        if (!parent) throw new Error(`親プロセス ${parentPid} が存在しません`);
        return specs.map((spec) => this.spawn(spec.agentId, spec.goal, parent.taskId, parentPid));
      },
      log: (level, source, message) => this.log(level, source, message),
    };
  }

  // ============================================================
  // スケジューラ (tick駆動)
  // ============================================================

  private tick(): void {
    this.ticks++;
    this.wakeWaitingProcesses();
    this.reapTasks();

    if (this.inFlight.size >= this.cores) return;

    const ready = [...this.processes.values()]
      .filter((p) => p.state === 'ready' && !this.inFlight.has(p.pid))
      .sort((a, b) => a.priority - b.priority || a.pid - b.pid);

    for (const process of ready) {
      if (this.inFlight.size >= this.cores) break;
      this.inFlight.add(process.pid);
      process.state = 'running';
      process.updatedAt = Date.now();
      // 非同期にステップ実行 (完了時に自身でstateを更新する)
      void this.step(process.pid).finally(() => this.inFlight.delete(process.pid));
    }
  }

  /** 子プロセスが全員終了した waiting プロセスを起こす */
  private wakeWaitingProcesses(): void {
    for (const process of this.processes.values()) {
      if (process.state !== 'waiting') continue;
      const children = process.childPids.map((pid) => this.processes.get(pid)!);
      const pending = children.filter(
        (c) => c.state !== 'terminated' && c.state !== 'failed'
      );
      if (pending.length > 0) continue;

      // 子の成果物をツール結果として親の履歴に注入
      const results = children
        .map(
          (c) =>
            `【${c.name} (PID ${c.pid}) ${c.state === 'terminated' ? '完了' : '失敗'}】\n${c.result ?? c.exitReason ?? '(出力なし)'}`
        )
        .join('\n\n');
      this.histories.get(process.pid)?.push({
        role: 'tool',
        toolName: 'delegate',
        content: `全子プロセスが終了しました。\n\n${results}`,
      });
      process.state = 'ready';
      process.currentActivity = '子プロセスの結果を受領';
      process.updatedAt = Date.now();
      this.log('info', 'scheduler', `PID ${process.pid} を wait から復帰 (子プロセス ${children.length} 件完了)`);
    }
  }

  /** ルートプロセスが終了したタスクを回収 */
  private reapTasks(): void {
    for (const task of this.tasks.values()) {
      if (task.status !== 'running' || task.rootPid === undefined) continue;
      const root = this.processes.get(task.rootPid);
      if (!root) continue;
      if (root.state === 'terminated') {
        task.status = 'completed';
        task.result = root.result;
        task.completedAt = Date.now();
        this.log('info', 'kernel', `タスク ${task.id} が完了しました`);
      } else if (root.state === 'failed') {
        task.status = 'failed';
        task.error = root.exitReason;
        task.completedAt = Date.now();
        this.log('error', 'kernel', `タスク ${task.id} が失敗: ${root.exitReason}`);
      }
    }
  }

  // ============================================================
  // プロセスの1ステップ実行 (LLM推論 → ツール実行)
  // ============================================================

  private async step(pid: number): Promise<void> {
    const process = this.processes.get(pid);
    if (!process || process.state !== 'running') return;
    const agent = getAgent(process.agentId);
    const history = this.histories.get(pid) ?? [];

    // リソース予算チェック (ガードレール)
    const budget = this.guardrails.checkBudget(process);
    if (!budget.allowed) {
      this.terminate(process, 'failed', `ガードレール: ${budget.reason}`);
      return;
    }

    try {
      // RAG: ゴールに関連する記憶を取得してコンテキストに載せる
      const memories = this.memory.search(process.goal, 3);
      const context = this.contextManager.assemble(
        agent.systemPrompt,
        process.goal,
        memories,
        history
      );
      if (context.truncatedCount > 0) {
        this.log(
          'debug',
          `pid:${pid}`,
          `コンテキスト超過のため履歴 ${context.truncatedCount} 件をトランケート`
        );
      }

      process.currentActivity = `思考中 (step ${process.steps + 1}/${agent.maxSteps})`;
      const response = await this.provider.complete(
        {
          system: context.system,
          messages: context.messages,
          tools: this.tools.specsFor(agent.allowedTools),
          maxTokens: 1500,
        },
        { agentId: agent.id, pid, step: process.steps, goal: process.goal }
      );

      process.steps++;
      process.tokensUsed += response.tokensIn + response.tokensOut;
      this.totalSteps++;
      this.totalLLMCalls++;
      this.totalTokens += response.tokensIn + response.tokensOut;

      // LLM推論中に kill された場合は結果を破棄 (状態の上書き復活を防ぐ)
      if (this.isDead(process)) return;

      if (response.toolCall) {
        await this.executeToolCall(process, agent.id, history, response.toolCall);
      } else {
        // 最終出力 → PIIリダクション → 終了
        const output = this.guardrails.redactOutput(pid, response.text ?? '');
        process.result = output;
        this.publish(
          `pid:${pid}`,
          process.parentPid !== null ? `pid:${process.parentPid}` : 'kernel',
          'result',
          output.slice(0, 400)
        );
        this.terminate(process, 'terminated', '正常終了');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.terminate(process, 'failed', `実行時エラー: ${message}`);
    }
  }

  private async executeToolCall(
    process: ProcessInfo,
    agentId: string,
    history: HistoryEntry[],
    toolCall: { name: string; input: Record<string, unknown> }
  ): Promise<void> {
    const agent = getAgent(agentId);
    const inputPreview = JSON.stringify(toolCall.input).slice(0, 200);
    history.push({
      role: 'assistant',
      content: `[ツール呼び出し] ${toolCall.name}(${inputPreview})`,
    });

    // ガードレール: ツールアロウリスト検証
    const allowed = this.guardrails.checkToolCall(process, agent, toolCall.name);
    if (!allowed.allowed) {
      history.push({
        role: 'tool',
        toolName: toolCall.name,
        content: `エラー: ${allowed.reason}`,
      });
      this.log('warn', 'guardrail', `PID ${process.pid}: ${allowed.reason}`);
      process.state = 'ready';
      process.updatedAt = Date.now();
      return;
    }

    const tool = this.tools.get(toolCall.name);
    if (!tool) {
      history.push({
        role: 'tool',
        toolName: toolCall.name,
        content: `エラー: ツール "${toolCall.name}" は存在しません`,
      });
      process.state = 'ready';
      process.updatedAt = Date.now();
      return;
    }

    process.currentActivity = `ツール実行中: ${toolCall.name}`;
    this.log('info', `pid:${process.pid}`, `syscall: ${toolCall.name}(${inputPreview})`);

    try {
      const result = await tool.execute(toolCall.input, {
        pid: process.pid,
        kernel: this.apiFor(),
      });

      // ツール実行中に kill された場合、生き残った子プロセスを回収して終了
      if (this.isDead(process)) {
        for (const childPid of process.childPids) this.kill(childPid);
        return;
      }

      history.push({ role: 'tool', toolName: toolCall.name, content: result });

      // delegate は子プロセスの完了を待つ (wait状態へ遷移)
      const hasLiveChildren = process.childPids.some((pid) => {
        const child = this.processes.get(pid);
        return child && child.state !== 'terminated' && child.state !== 'failed';
      });
      if (toolCall.name === 'delegate' && hasLiveChildren) {
        process.state = 'waiting';
        process.currentActivity = '子プロセスの完了を待機中';
      } else {
        process.state = 'ready';
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      history.push({
        role: 'tool',
        toolName: toolCall.name,
        content: `エラー: ${message}`,
      });
      this.log('warn', `pid:${process.pid}`, `ツール ${toolCall.name} が失敗: ${message}`);
      process.state = 'ready';
    }
    process.updatedAt = Date.now();
  }

  private isDead(process: ProcessInfo): boolean {
    return process.state === 'terminated' || process.state === 'failed';
  }

  private terminate(
    process: ProcessInfo,
    state: 'terminated' | 'failed',
    reason: string
  ): void {
    if (this.isDead(process)) return;
    process.state = state;
    process.exitReason = reason;
    process.currentActivity = state === 'terminated' ? '完了' : '失敗';
    process.updatedAt = Date.now();
    this.log(
      state === 'terminated' ? 'info' : 'error',
      'kernel',
      `PID ${process.pid} (${process.name}) が終了: ${reason} [steps=${process.steps}, tokens=${process.tokensUsed}]`
    );
  }

  // ============================================================
  // IPC / ログ
  // ============================================================

  private publish(from: string, to: string, topic: string, payload: string): void {
    this.messages.push({
      id: `msg-${++this.seq}`,
      from,
      to,
      topic,
      payload,
      timestamp: Date.now(),
    });
    if (this.messages.length > 300) this.messages.shift();
  }

  private log(level: EventLevel, source: string, message: string): void {
    this.events.push({
      id: `evt-${++this.seq}`,
      timestamp: Date.now(),
      level,
      source,
      message,
    });
    if (this.events.length > 500) this.events.shift();
  }
}

// ============================================================
// シングルトン (Next.jsのHMR/リクエスト間で状態を維持)
// ============================================================

const globalStore = globalThis as typeof globalThis & {
  __AGENT_OS_KERNEL__?: Kernel;
};

export function getKernel(): Kernel {
  if (!globalStore.__AGENT_OS_KERNEL__) {
    globalStore.__AGENT_OS_KERNEL__ = new Kernel();
  }
  return globalStore.__AGENT_OS_KERNEL__;
}

export function resetKernel(): Kernel {
  globalStore.__AGENT_OS_KERNEL__?.shutdown();
  globalStore.__AGENT_OS_KERNEL__ = new Kernel();
  return globalStore.__AGENT_OS_KERNEL__;
}
