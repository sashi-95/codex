/**
 * AI Agent OS - コア型定義
 *
 * OSのメタファーでAIエージェントを管理する:
 *   - エージェント = プロセス (PCB: Process Control Block)
 *   - LLM呼び出し + ツール実行 = CPUステップ
 *   - ツールレジストリ = システムコール
 *   - メッセージバス = IPC
 *   - ベクトルメモリ = 共有メモリ / ファイルシステム
 *   - ガードレール = セキュリティモジュール (SELinux的な存在)
 */

// ============================================================
// プロセス管理
// ============================================================

/** プロセス状態 (OSのプロセス状態遷移に対応) */
export type ProcessState =
  | 'ready' // 実行可能 (スケジューラ待ち)
  | 'running' // 実行中 (LLM推論 or ツール実行中)
  | 'waiting' // 待機中 (子プロセスの完了待ち)
  | 'terminated' // 正常終了
  | 'failed'; // 異常終了

/** エージェント定義 (実行可能バイナリに相当) */
export interface AgentDefinition {
  id: string;
  name: string;
  nameJa: string;
  role: string;
  /** システムプロンプト (エージェントの人格・行動規範) */
  systemPrompt: string;
  /** 使用を許可されたツール (ケーパビリティ) */
  allowedTools: string[];
  /** スケジューリング優先度 (数値が小さいほど高優先) */
  priority: number;
  /** 1プロセスあたりの最大ステップ数 */
  maxSteps: number;
  /** UI表示用カラー */
  color: string;
}

/** 会話履歴のエントリ */
export interface HistoryEntry {
  role: 'user' | 'assistant' | 'tool';
  content: string;
  toolName?: string;
}

/** プロセス制御ブロック (PCB) */
export interface ProcessInfo {
  pid: number;
  agentId: string;
  name: string;
  state: ProcessState;
  priority: number;
  goal: string;
  taskId: string;
  parentPid: number | null;
  childPids: number[];
  createdAt: number;
  updatedAt: number;
  /** 消費したCPUステップ数 (LLM呼び出し回数) */
  steps: number;
  /** 累計トークン使用量 */
  tokensUsed: number;
  /** 現在の活動内容 (UI表示用) */
  currentActivity: string;
  /** 終了理由 */
  exitReason?: string;
  /** 最終出力 */
  result?: string;
}

// ============================================================
// タスク管理
// ============================================================

export type TaskStatus = 'queued' | 'running' | 'completed' | 'failed';

/** ユーザーがOSに投入するタスク */
export interface KernelTask {
  id: string;
  goal: string;
  status: TaskStatus;
  createdAt: number;
  completedAt?: number;
  rootPid?: number;
  result?: string;
  error?: string;
}

// ============================================================
// IPC (メッセージバス)
// ============================================================

export interface BusMessage {
  id: string;
  /** 送信元 (pid or 'kernel') */
  from: string;
  /** 宛先 (pid, topic名, '*' はブロードキャスト) */
  to: string;
  topic: string;
  payload: string;
  timestamp: number;
}

// ============================================================
// カーネルイベントログ (syslog)
// ============================================================

export type EventLevel = 'debug' | 'info' | 'warn' | 'error';

export interface KernelEvent {
  id: string;
  timestamp: number;
  level: EventLevel;
  /** 発生源 (kernel / scheduler / guardrail / pid:N など) */
  source: string;
  message: string;
}

// ============================================================
// メモリサブシステム (RAG)
// ============================================================

export interface MemoryRecord {
  id: string;
  content: string;
  /** 書き込み元 (seed / pid:N) */
  source: string;
  tags: string[];
  importance: number;
  createdAt: number;
  accessCount: number;
}

/** 検索結果 (スコア付き) */
export interface MemorySearchHit {
  record: MemoryRecord;
  score: number;
}

// ============================================================
// ツール (システムコール)
// ============================================================

export interface ToolContext {
  pid: number;
  kernel: KernelApi;
}

export interface ToolDefinition {
  name: string;
  description: string;
  /** 入力パラメータの説明 (LLMプロンプト用) */
  inputSchema: Record<string, string>;
  execute: (input: Record<string, unknown>, ctx: ToolContext) => Promise<string>;
}

/** エージェント→カーネルの限定インターフェース (ツールから使う) */
export interface KernelApi {
  memorySearch(query: string, k?: number): MemorySearchHit[];
  memorySave(content: string, source: string, tags: string[]): MemoryRecord;
  publish(from: string, to: string, topic: string, payload: string): void;
  spawnChildren(
    parentPid: number,
    specs: { agentId: string; goal: string }[]
  ): number[];
  log(level: EventLevel, source: string, message: string): void;
}

// ============================================================
// LLMプロバイダ
// ============================================================

export interface LLMToolSpec {
  name: string;
  description: string;
  inputSchema: Record<string, string>;
}

export interface LLMRequest {
  system: string;
  messages: HistoryEntry[];
  tools: LLMToolSpec[];
  maxTokens: number;
}

export interface LLMToolCall {
  name: string;
  input: Record<string, unknown>;
}

export interface LLMResponse {
  /** テキスト応答 (最終出力) */
  text?: string;
  /** ツール呼び出し要求 */
  toolCall?: LLMToolCall;
  tokensIn: number;
  tokensOut: number;
}

export interface LLMCallMeta {
  agentId: string;
  pid: number;
  step: number;
  goal: string;
}

export interface LLMProvider {
  readonly name: string;
  complete(req: LLMRequest, meta: LLMCallMeta): Promise<LLMResponse>;
}

// ============================================================
// ガードレール
// ============================================================

export type GuardrailAction = 'blocked' | 'redacted' | 'warned';

export interface GuardrailViolation {
  id: string;
  timestamp: number;
  policy: string;
  severity: 'low' | 'medium' | 'high';
  pid: number;
  detail: string;
  action: GuardrailAction;
}

// ============================================================
// カーネルスナップショット (API/UI用)
// ============================================================

export interface KernelStats {
  bootedAt: number;
  ticks: number;
  totalTokens: number;
  totalSteps: number;
  totalLLMCalls: number;
  provider: string;
  cores: number;
  runningProcesses: number;
}

export interface KernelSnapshot {
  stats: KernelStats;
  processes: ProcessInfo[];
  tasks: KernelTask[];
  events: KernelEvent[];
  messages: BusMessage[];
  memory: MemoryRecord[];
  violations: GuardrailViolation[];
  agents: AgentDefinition[];
}
