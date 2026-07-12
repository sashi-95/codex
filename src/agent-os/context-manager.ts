/**
 * コンテキストマネージャ - LLMのコンテキストウィンドウ管理
 *
 * OSでいう仮想メモリ管理。限られたコンテキストウィンドウ (物理メモリ) に
 * 何を載せるかを決める:
 *   - システムプロンプト (常駐)
 *   - RAGで取得した関連記憶 (ページイン)
 *   - 会話履歴 (古いものからページアウト = トランケーション)
 */

import type { HistoryEntry, MemorySearchHit } from './types';

/** トークン数の概算 (日本語も考慮して 1トークン ≈ 3文字) */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 3);
}

export interface AssembledContext {
  system: string;
  messages: HistoryEntry[];
  /** トランケーションで落とした履歴数 */
  truncatedCount: number;
  estimatedTokens: number;
}

export class ContextManager {
  constructor(private maxContextTokens = 6000) {}

  /**
   * コンテキストを組み立てる。
   * 予算を超える場合は古い履歴から切り捨て、切り捨てた旨をマーカーとして残す。
   */
  assemble(
    systemPrompt: string,
    goal: string,
    memories: MemorySearchHit[],
    history: HistoryEntry[]
  ): AssembledContext {
    const memorySection =
      memories.length > 0
        ? '\n\n## 関連する長期記憶 (ナレッジベースから自動取得)\n' +
          memories
            .map((hit) => `- [関連度 ${hit.score.toFixed(2)}] ${hit.record.content}`)
            .join('\n')
        : '';

    const system = `${systemPrompt}${memorySection}\n\n## 現在のゴール\n${goal}`;

    let budget = this.maxContextTokens - estimateTokens(system);
    const kept: HistoryEntry[] = [];
    let truncatedCount = 0;

    // 新しい履歴を優先して残す (後ろから詰める)
    for (let i = history.length - 1; i >= 0; i--) {
      const cost = estimateTokens(history[i].content) + 8;
      if (budget - cost < 0 && kept.length > 0) {
        truncatedCount = i + 1;
        break;
      }
      budget -= cost;
      kept.unshift(history[i]);
    }

    const messages: HistoryEntry[] = [];
    if (truncatedCount > 0) {
      messages.push({
        role: 'user',
        content: `[コンテキスト管理: 古い履歴 ${truncatedCount} 件をトランケートしました]`,
      });
    }
    messages.push(...kept);

    const estimatedTokens =
      estimateTokens(system) +
      messages.reduce((sum, m) => sum + estimateTokens(m.content) + 8, 0);

    return { system, messages, truncatedCount, estimatedTokens };
  }
}
