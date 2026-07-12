/**
 * メモリサブシステム - ベクトル検索ベースの長期記憶 (RAG)
 *
 * 外部依存なしで動くように、TF (term frequency) ベクトル +
 * コサイン類似度による軽量セマンティック検索を実装。
 * 本番では埋め込みモデル + pgvector 等に差し替える想定のインターフェース。
 */

import type { MemoryRecord, MemorySearchHit } from './types';

/** テキストをトークン化 (日英対応の簡易実装) */
function tokenize(text: string): string[] {
  const lowered = text.toLowerCase();
  // 英数字の単語
  const words = lowered.match(/[a-z0-9]+/g) ?? [];
  // 日本語はbi-gramで近似
  const cjk = lowered.match(/[぀-ヿ一-鿿]/g) ?? [];
  const bigrams: string[] = [];
  for (let i = 0; i < cjk.length - 1; i++) {
    bigrams.push(cjk[i] + cjk[i + 1]);
  }
  return [...words, ...cjk, ...bigrams];
}

/** TFベクトル化 */
function vectorize(text: string): Map<string, number> {
  const vec = new Map<string, number>();
  for (const token of tokenize(text)) {
    vec.set(token, (vec.get(token) ?? 0) + 1);
  }
  return vec;
}

/** コサイン類似度 */
function cosine(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (const [token, weight] of Array.from(a)) {
    normA += weight * weight;
    const other = b.get(token);
    if (other) dot += weight * other;
  }
  for (const weight of Array.from(b.values())) {
    normB += weight * weight;
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export class MemoryStore {
  private records: MemoryRecord[] = [];
  private vectors = new Map<string, Map<string, number>>();
  private seq = 0;

  save(content: string, source: string, tags: string[], importance = 0.5): MemoryRecord {
    const record: MemoryRecord = {
      id: `mem-${++this.seq}`,
      content,
      source,
      tags,
      importance,
      createdAt: Date.now(),
      accessCount: 0,
    };
    this.records.push(record);
    this.vectors.set(record.id, vectorize(`${content} ${tags.join(' ')}`));
    // メモリ上限 (古い低重要度レコードから破棄)
    if (this.records.length > 500) {
      const evicted = [...this.records]
        .sort((a, b) => a.importance - b.importance || a.createdAt - b.createdAt)[0];
      this.records = this.records.filter((r) => r.id !== evicted.id);
      this.vectors.delete(evicted.id);
    }
    return record;
  }

  /** セマンティック検索 (スコア = 類似度 × 重要度補正) */
  search(query: string, k = 4): MemorySearchHit[] {
    const queryVec = vectorize(query);
    const hits: MemorySearchHit[] = [];
    for (const record of this.records) {
      const vec = this.vectors.get(record.id);
      if (!vec) continue;
      const similarity = cosine(queryVec, vec);
      if (similarity <= 0.01) continue;
      hits.push({ record, score: similarity * (0.7 + 0.3 * record.importance) });
    }
    hits.sort((a, b) => b.score - a.score);
    const top = hits.slice(0, k);
    for (const hit of top) hit.record.accessCount++;
    return top;
  }

  all(): MemoryRecord[] {
    return [...this.records].sort((a, b) => b.createdAt - a.createdAt);
  }

  /** ナレッジベースの初期シード (RAGのデモ用) */
  seed(entries: { content: string; tags: string[]; importance?: number }[]): void {
    for (const entry of entries) {
      this.save(entry.content, 'seed', entry.tags, entry.importance ?? 0.8);
    }
  }
}
