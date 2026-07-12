/**
 * Zendesk自律型サポートエージェント - 型定義
 *
 * docs/ZENDESK_AI_AGENT_DESIGN.md の「② オーケストレーション層」のプロトタイプ。
 * 設計原則:
 *   - LLMは判断、実行はツール (値はツールの構造化入出力からのみ取る)
 *   - 本人確認・リスク判定・金額上限はコードで強制 (LLMの判断に委ねない)
 *   - writeは読み戻し検証、不可逆操作はHITL承認
 */

// ============================================================
// Zendesk (モック)
// ============================================================

export type TicketStatus = 'new' | 'open' | 'pending' | 'solved' | 'escalated';

export interface Ticket {
  id: number;
  subject: string;
  comment: string;
  requesterEmail: string;
  status: TicketStatus;
  tags: string[];
  /** 内部メモ (エージェントの実行記録・引き継ぎサマリ) */
  internalNotes: string[];
  /** 顧客向け返信 */
  replies: string[];
  createdAt: number;
  updatedAt: number;
}

// ============================================================
// 基幹システム (モック CRM / ERP)
// ============================================================

export interface Member {
  memberId: string;
  name: string;
  email: string;
  address: string;
  updatedAt: number;
}

export type OrderStatus = 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  orderId: string;
  memberId: string;
  item: string;
  amountJpy: number;
  status: OrderStatus;
}

export interface Refund {
  refundId: string;
  orderId: string;
  amountJpy: number;
  reason: string;
  createdAt: number;
}

// ============================================================
// インテントとポリシー
// ============================================================

export type Intent =
  | 'faq'
  | 'order_status'
  | 'address_change'
  | 'refund_request'
  | 'unknown';

/** リスク階層 (設計書 §5) */
export type RiskLevel = 'L0' | 'L1' | 'L2';

export interface IntentPolicy {
  intent: Intent;
  labelJa: string;
  risk: RiskLevel;
  /** このインテントで呼び出しを許可するツール */
  allowedTools: string[];
  /** write系で本人確認 (メール一致) を必須にするか */
  requiresAuth: boolean;
}

// ============================================================
// エージェント実行 (Run)
// ============================================================

export type RunState =
  | 'running'
  | 'awaiting_approval' // HITL承認待ち
  | 'completed' // 自動完了
  | 'escalated' // 有人対応へ引き継ぎ
  | 'blocked' // ガードレールで遮断
  | 'failed';

export type StepKind = 'info' | 'llm' | 'tool' | 'guardrail' | 'verify' | 'hitl';

export interface RunStep {
  seq: number;
  kind: StepKind;
  name: string;
  detail: string;
  ok: boolean;
  timestamp: number;
}

export interface ExtractedEntities {
  memberId?: string;
  orderId?: string;
  newAddress?: string;
}

export interface AgentRun {
  id: string;
  ticketId: number;
  intent: Intent;
  risk: RiskLevel;
  state: RunState;
  entities: ExtractedEntities;
  steps: RunStep[];
  /** 冪等キー (Webhook重複配送対策) */
  idempotencyKey: string;
  createdAt: number;
  finishedAt?: number;
  outcome?: string;
}

// ============================================================
// HITL承認
// ============================================================

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'expired';

export interface ApprovalRequest {
  id: string;
  runId: string;
  ticketId: number;
  action: string;
  /** 何を・なぜ・根拠 */
  summary: string;
  /** 実行内容のdiff表示 */
  diff: { field: string; before: string; after: string }[];
  status: ApprovalStatus;
  createdAt: number;
  decidedAt?: number;
  decidedBy?: string;
}

// ============================================================
// 監査ログ / ガードレール
// ============================================================

export interface AuditEntry {
  id: string;
  timestamp: number;
  runId: string;
  ticketId: number;
  tool: string;
  input: string;
  output: string;
  ok: boolean;
}

export interface PolicyViolation {
  id: string;
  timestamp: number;
  runId: string;
  policy: string;
  severity: 'low' | 'medium' | 'high';
  detail: string;
}

// ============================================================
// スナップショット (API/UI用)
// ============================================================

export interface SupportSnapshot {
  tickets: Ticket[];
  runs: AgentRun[];
  approvals: ApprovalRequest[];
  audit: AuditEntry[];
  violations: PolicyViolation[];
  members: Member[];
  orders: Order[];
  refunds: Refund[];
  stats: {
    totalRuns: number;
    autoResolved: number;
    escalated: number;
    blocked: number;
    pendingApprovals: number;
  };
}
