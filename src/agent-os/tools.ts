/**
 * ツールレジストリ - システムコールインターフェース
 *
 * エージェント (ユーザー空間) がカーネル機能や外部世界に触れる唯一の窓口。
 * すべての呼び出しはガードレールのアロウリスト検証を通過してから実行される。
 */

import type { ToolDefinition } from './types';

/** 四則演算のみを許可する安全な数式評価器 (eval不使用) */
function safeEvaluate(expression: string): number {
  const tokens = expression.match(/\d+\.?\d*|[+\-*/()]/g);
  if (!tokens || tokens.join('') !== expression.replace(/\s/g, '')) {
    throw new Error('数式に使用できない文字が含まれています');
  }
  let pos = 0;
  const peek = () => tokens[pos];
  const next = () => tokens[pos++];

  function parseExpr(): number {
    let value = parseTerm();
    while (peek() === '+' || peek() === '-') {
      const op = next();
      const rhs = parseTerm();
      value = op === '+' ? value + rhs : value - rhs;
    }
    return value;
  }
  function parseTerm(): number {
    let value = parseFactor();
    while (peek() === '*' || peek() === '/') {
      const op = next();
      const rhs = parseFactor();
      value = op === '*' ? value * rhs : value / rhs;
    }
    return value;
  }
  function parseFactor(): number {
    const token = next();
    if (token === '(') {
      const value = parseExpr();
      if (next() !== ')') throw new Error('括弧が閉じていません');
      return value;
    }
    if (token === '-') return -parseFactor();
    const num = Number(token);
    if (Number.isNaN(num)) throw new Error(`数値として解釈できません: ${token}`);
    return num;
  }

  const result = parseExpr();
  if (pos !== tokens.length) throw new Error('数式を最後まで解釈できませんでした');
  return result;
}

/** モックWeb検索の応答データ (オフラインデモ用) */
const MOCK_WEB_RESULTS: { keywords: string[]; result: string }[] = [
  {
    keywords: ['ai', 'agent', 'エージェント', 'llm'],
    result:
      '2026年のAIエージェント市場は前年比240%成長。エンタープライズ導入の鍵は「ガードレール」「可観測性」「既存システム統合」の3点とされる (業界レポートより)。',
  },
  {
    keywords: ['market', '市場', 'growth', '成長', '売上'],
    result:
      'グローバルSaaS市場は年平均成長率18%で拡大中。特にカスタマーサポート自動化領域は投資が集中している。',
  },
  {
    keywords: ['customer', 'support', 'サポート', '顧客'],
    result:
      'AIによる一次対応自動化で解決時間が平均62%短縮、CSATが12ポイント向上したという導入事例が複数報告されている。',
  },
];

export const BUILTIN_TOOLS: ToolDefinition[] = [
  {
    name: 'delegate',
    description:
      'サブタスクを専門エージェントに並列委譲する。全員の完了を待ってから結果を受け取る。',
    inputSchema: {
      assignments:
        'JSON配列: [{"agent": "researcher|analyst|writer|critic", "goal": "サブゴール"}]',
    },
    execute: async (input, ctx) => {
      const assignments = input.assignments as { agent: string; goal: string }[];
      if (!Array.isArray(assignments) || assignments.length === 0) {
        throw new Error('assignments には1件以上の委譲先が必要です');
      }
      if (assignments.length > 4) {
        throw new Error('一度に委譲できるのは4エージェントまでです');
      }
      const pids = ctx.kernel.spawnChildren(
        ctx.pid,
        assignments.map((a) => ({ agentId: a.agent, goal: a.goal }))
      );
      return `${pids.length}個の子プロセスを起動しました (PID: ${pids.join(', ')})。完了を待機します...`;
    },
  },
  {
    name: 'memory_search',
    description: '長期記憶 (ナレッジベース) をセマンティック検索する。',
    inputSchema: { query: '検索クエリ文字列' },
    execute: async (input, ctx) => {
      const query = String(input.query ?? '');
      const hits = ctx.kernel.memorySearch(query, 4);
      if (hits.length === 0) return '関連する記憶は見つかりませんでした。';
      return hits
        .map((h) => `[スコア ${h.score.toFixed(2)}] ${h.record.content}`)
        .join('\n');
    },
  },
  {
    name: 'memory_save',
    description: '重要な発見を長期記憶に保存する。',
    inputSchema: {
      content: '保存する内容',
      tags: 'カンマ区切りのタグ (例: "market,2026")',
    },
    execute: async (input, ctx) => {
      const content = String(input.content ?? '');
      const tags = String(input.tags ?? '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      const record = ctx.kernel.memorySave(content, `pid:${ctx.pid}`, tags);
      return `記憶 ${record.id} として保存しました。`;
    },
  },
  {
    name: 'web_search',
    description: 'Webを検索して最新情報を取得する (デモ環境ではキュレーション済みデータを返す)。',
    inputSchema: { query: '検索クエリ' },
    execute: async (input) => {
      const query = String(input.query ?? '').toLowerCase();
      const matched = MOCK_WEB_RESULTS.filter((entry) =>
        entry.keywords.some((kw) => query.includes(kw))
      );
      if (matched.length === 0) {
        return `"${input.query}" の検索結果: 特筆すべき新情報は見つかりませんでした。ナレッジベース (memory_search) の情報を活用してください。`;
      }
      return matched.map((m) => `- ${m.result}`).join('\n');
    },
  },
  {
    name: 'calculator',
    description: '四則演算を正確に計算する。',
    inputSchema: { expression: '数式 (例: "(1200 * 1.18) / 4")' },
    execute: async (input) => {
      const expression = String(input.expression ?? '');
      const result = safeEvaluate(expression);
      // 浮動小数点誤差を丸めて表示
      const rounded = Math.round(result * 10000) / 10000;
      return `${expression} = ${rounded}`;
    },
  },
  {
    name: 'get_time',
    description: '現在時刻を取得する。',
    inputSchema: {},
    execute: async () => new Date().toISOString(),
  },
];

export class ToolRegistry {
  private tools = new Map<string, ToolDefinition>();

  constructor(tools: ToolDefinition[] = BUILTIN_TOOLS) {
    for (const tool of tools) this.tools.set(tool.name, tool);
  }

  get(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  specsFor(allowedTools: string[]) {
    return allowedTools
      .map((name) => this.tools.get(name))
      .filter((t): t is ToolDefinition => Boolean(t))
      .map((t) => ({
        name: t.name,
        description: t.description,
        inputSchema: t.inputSchema,
      }));
  }
}
