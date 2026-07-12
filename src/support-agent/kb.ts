/**
 * ナレッジベース (Zendesk Guide相当のモック)
 *
 * FAQ記事をベクトル検索し、出典付きの回答素材を返す。
 * agent-os のメモリサブシステム (TFコサイン類似度) を再利用。
 */

import { MemoryStore } from '@/agent-os/memory';

export interface KBArticle {
  articleId: string;
  title: string;
  body: string;
}

const ARTICLES: KBArticle[] = [
  {
    articleId: 'KB-001',
    title: '返品・返金ポリシー',
    body: '商品到着後30日以内であれば返品を承ります。未開封の場合は全額返金、開封済みの場合は購入金額の80%を返金します。返送料はお客様負担となります。返金は申請承認後5営業日以内に決済手段へ払い戻されます。',
  },
  {
    articleId: 'KB-002',
    title: '配送日数と送料',
    body: '通常配送は注文確定から3〜5営業日でお届けします。送料は全国一律550円、¥5,000以上のご注文で無料です。お急ぎ便 (翌日配達) は追加440円で承ります。',
  },
  {
    articleId: 'KB-003',
    title: '会員情報の変更方法',
    body: '住所・電話番号・メールアドレスはマイページの「会員情報」から変更できます。チャットサポートでも本人確認のうえ変更を承ります。氏名の変更は本人確認書類の提出が必要です。',
  },
  {
    articleId: 'KB-004',
    title: '支払い方法',
    body: 'クレジットカード (VISA/Master/JCB/AMEX)、コンビニ払い、銀行振込、代金引換がご利用いただけます。コンビニ払いは¥30,000未満のご注文に限ります。',
  },
];

export class KnowledgeBase {
  private store = new MemoryStore();
  private articles = new Map<string, KBArticle>();

  constructor() {
    for (const article of ARTICLES) {
      this.articles.set(article.articleId, article);
      this.store.save(
        `${article.title}\n${article.body}`,
        article.articleId,
        [article.articleId],
        0.9
      );
    }
  }

  /** 検索結果 (記事 + スコア)。低確信度判定は呼び出し側で行う */
  search(query: string, k = 2): { article: KBArticle; score: number }[] {
    return this.store
      .search(query, k)
      .map((hit) => ({
        article: this.articles.get(hit.record.source)!,
        score: hit.score,
      }))
      .filter((h) => Boolean(h.article));
  }

  all(): KBArticle[] {
    return [...this.articles.values()];
  }
}
