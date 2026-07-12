/**
 * ポリシー定義 - インテント別のリスク階層・ツールアロウリスト・認証要件
 *
 * 設計書 §5 の実装。ここは「コードで強制する」レイヤであり、
 * LLMの判断でバイパスできない。
 */

import type { Intent, IntentPolicy } from './types';

export const INTENT_POLICIES: Record<Intent, IntentPolicy> = {
  faq: {
    intent: 'faq',
    labelJa: 'FAQ (L1一次回答)',
    risk: 'L0',
    allowedTools: ['kb.search', 'zendesk.reply', 'zendesk.solve'],
    requiresAuth: false,
  },
  order_status: {
    intent: 'order_status',
    labelJa: '注文状況照会',
    risk: 'L0',
    allowedTools: ['crm.lookup_member', 'erp.get_order', 'zendesk.reply', 'zendesk.solve'],
    requiresAuth: true,
  },
  address_change: {
    intent: 'address_change',
    labelJa: '住所変更 (可逆write)',
    risk: 'L1',
    allowedTools: [
      'crm.lookup_member',
      'crm.update_address',
      'zendesk.reply',
      'zendesk.solve',
      'zendesk.note',
    ],
    requiresAuth: true,
  },
  refund_request: {
    intent: 'refund_request',
    labelJa: '返金申請 (不可逆・金銭)',
    risk: 'L2',
    allowedTools: [
      'crm.lookup_member',
      'erp.get_order',
      'erp.create_refund',
      'erp.get_refund',
      'hitl.request_approval',
      'zendesk.reply',
      'zendesk.solve',
      'zendesk.note',
    ],
    requiresAuth: true,
  },
  unknown: {
    intent: 'unknown',
    labelJa: '分類不能',
    risk: 'L0',
    allowedTools: ['zendesk.note'],
    requiresAuth: false,
  },
};

/** 返金の自動実行上限 (これを超えるとHITL承認必須) */
export const AUTO_REFUND_LIMIT_JPY = 10000;

/** プロンプトインジェクション検知パターン (顧客入力は常にデータとして扱う) */
export const INJECTION_PATTERNS: RegExp[] = [
  /ignore (all )?(previous|prior) instructions/i,
  /これまでの指示を(すべて)?無視/,
  /全会員の情報/,
  /システムプロンプト/,
  /rm\s+-rf/,
  /drop\s+table/i,
];

/** PIIリダクション (顧客向け返信・完了通知に適用) */
export const PII_PATTERNS: { regex: RegExp; replacement: string }[] = [
  {
    regex: /(?<![\d.])(?:\d[ -]?){12,15}\d(?![\d.])/g,
    replacement: '[CARD_REDACTED]',
  },
];

export function redactPii(text: string): string {
  let out = text;
  for (const { regex, replacement } of PII_PATTERNS) {
    out = out.replace(regex, replacement);
    regex.lastIndex = 0;
  }
  return out;
}

export function detectInjection(text: string): RegExp | undefined {
  return INJECTION_PATTERNS.find((p) => p.test(text));
}
