/**
 * サポートエージェント・オーケストレーションエンジン
 *
 * 設計書 §4 の実装。Zendesk風Webhookを受理し、インテントに応じた
 * 業務フローを自律実行する。
 *
 * 設計原則の実装ポイント:
 *   - 「LLMは判断、実行はツール」: 金額・住所・IDはすべてツールの
 *     構造化入出力から取得。返金額は顧客のメッセージではなくERPの注文レコードから決まる
 *   - 本人確認 (メール一致) はコードで強制 (checkAuth)
 *   - 全ツール呼び出しはアロウリスト検証 + 監査ログを通過 (callTool)
 *   - write後は読み戻し検証 (verify系ステップ)。不一致はエスカレーション
 *   - L2 (不可逆・金銭) はHITL承認で一時停止し、承認後に再開
 */

import { KnowledgeBase } from './kb';
import { MockCRM, MockERP, MockZendesk } from './mock-systems';
import {
  AUTO_REFUND_LIMIT_JPY,
  detectInjection,
  INTENT_POLICIES,
  redactPii,
} from './policies';
import type {
  AgentRun,
  ApprovalRequest,
  AuditEntry,
  ExtractedEntities,
  Intent,
  PolicyViolation,
  RunStep,
  StepKind,
  SupportSnapshot,
  Ticket,
} from './types';

/** FAQ回答に必要な最低検索スコア (これ未満は推測で答えずエスカレーション) */
const KB_CONFIDENCE_THRESHOLD = 0.15;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ============================================================
// 決定論的な補助関数 (LLMに任せない処理)
// ============================================================

/** エンティティ抽出: ID・住所は正規表現で決定的に取る (転記ミス対策) */
export function extractEntities(text: string): ExtractedEntities {
  const memberId = text.match(/M-\d{4}/)?.[0];
  const orderId = text.match(/O-\d{4}/)?.[0];
  const newAddress = text
    .match(/新住所[:：]\s*([^\n。]+)/)?.[1]
    ?.trim();
  return { memberId, orderId, newAddress };
}

/**
 * インテント分類 (プロトタイプはキーワードルール)。
 * 本番では Claude によるゼロショット分類 + 確信度閾値に差し替える。
 * 分類結果はポリシー参照のキーにしかならないため、
 * 誤分類してもアロウリスト外のツールは実行できない。
 */
export function classifyIntent(subject: string, comment: string): Intent {
  const text = `${subject} ${comment}`;
  if (/返金|払い戻し|キャンセルして返して/.test(text)) return 'refund_request';
  if (/住所.{0,6}(変更|変わ|引っ越)|引越/.test(text)) return 'address_change';
  if (/(注文|配送|発送|届).{0,12}(状況|いつ|確認|どこ)/.test(text)) return 'order_status';
  if (/ポリシー|方法|教えて|とは|できますか|日数|送料|支払/.test(text)) return 'faq';
  return 'unknown';
}

// ============================================================
// エンジン本体
// ============================================================

export class SupportEngine {
  readonly zendesk = new MockZendesk();
  readonly crm = new MockCRM();
  readonly erp = new MockERP();
  readonly kb = new KnowledgeBase();

  private runs = new Map<string, AgentRun>();
  private approvals = new Map<string, ApprovalRequest>();
  private audit: AuditEntry[] = [];
  private violations: PolicyViolation[] = [];
  /** 冪等キー → runId (Webhook重複配送対策) */
  private processedKeys = new Map<string, string>();
  private seq = 0;

  // ----------------------------------------------------------
  // Webhook受理
  // ----------------------------------------------------------

  /**
   * Zendesk風Webhookの受け口。チケットを起票し、エージェント実行を開始する。
   * 同一内容の重複配送は冪等キーで検出し、既存Runを返す。
   */
  handleInquiry(
    subject: string,
    comment: string,
    requesterEmail: string
  ): { run: AgentRun; duplicate: boolean } {
    const idempotencyKey = `${subject}|${comment}|${requesterEmail}`;
    const existingRunId = this.processedKeys.get(idempotencyKey);
    if (existingRunId) {
      const existing = this.runs.get(existingRunId);
      if (existing && Date.now() - existing.createdAt < 60_000) {
        return { run: existing, duplicate: true };
      }
    }

    const ticket = this.zendesk.createTicket(subject, comment, requesterEmail);
    const intent = classifyIntent(subject, comment);
    const policy = INTENT_POLICIES[intent];

    const run: AgentRun = {
      id: `run-${++this.seq}`,
      ticketId: ticket.id,
      intent,
      risk: policy.risk,
      state: 'running',
      entities: extractEntities(comment),
      steps: [],
      idempotencyKey,
      createdAt: Date.now(),
    };
    this.runs.set(run.id, run);
    this.processedKeys.set(idempotencyKey, run.id);

    // 非同期で実行 (Webhookレスポンスはブロックしない)
    void this.execute(run).catch((error) => {
      this.finish(run, 'failed', `想定外のエラー: ${error instanceof Error ? error.message : error}`);
    });

    return { run, duplicate: false };
  }

  // ----------------------------------------------------------
  // 実行フロー
  // ----------------------------------------------------------

  private async execute(run: AgentRun): Promise<void> {
    const ticket = this.zendesk.getTicket(run.ticketId)!;
    this.zendesk.setStatus(ticket.id, 'open');
    this.step(run, 'info', 'intent-classification', `インテント: ${INTENT_POLICIES[run.intent].labelJa} (リスク ${run.risk})`, true);

    // ガードレール: プロンプトインジェクション検知 (顧客入力はデータとして扱う)
    const injection = detectInjection(`${ticket.subject} ${ticket.comment}`);
    if (injection) {
      this.violate(run, 'prompt-injection', 'high', `危険なパターンを検知: ${injection.source}`);
      this.step(run, 'guardrail', 'injection-check', '入力に危険なパターンを検知。自動処理を遮断し有人対応へ', false);
      this.zendesk.addTags(ticket.id, ['ai_blocked', 'security_review']);
      this.zendesk.addInternalNote(ticket.id, '【AI】インジェクション疑いのため自動処理を遮断しました。セキュリティ確認のうえ有人対応してください。');
      this.zendesk.setStatus(ticket.id, 'escalated');
      this.finish(run, 'blocked', 'ガードレールにより遮断');
      return;
    }
    this.step(run, 'guardrail', 'injection-check', '入力チェック通過', true);

    await sleep(400); // デモ用: UIで進行が見えるように

    switch (run.intent) {
      case 'faq':
        await this.runFaq(run, ticket);
        break;
      case 'order_status':
        await this.runOrderStatus(run, ticket);
        break;
      case 'address_change':
        await this.runAddressChange(run, ticket);
        break;
      case 'refund_request':
        await this.runRefund(run, ticket);
        break;
      default:
        this.escalate(run, ticket, 'インテントを分類できませんでした。会話サマリを添付して有人対応へ引き継ぎます。');
    }
  }

  /** L0: FAQ — KB検索 → 出典付き回答。低確信度は答えずエスカレーション */
  private async runFaq(run: AgentRun, ticket: Ticket): Promise<void> {
    const hits = this.callTool(run, 'kb.search', ticket.comment, () =>
      this.kb.search(`${ticket.subject} ${ticket.comment}`)
    );
    if (!hits || hits.length === 0 || hits[0].score < KB_CONFIDENCE_THRESHOLD) {
      this.step(run, 'guardrail', 'confidence-check', `KB検索スコアが閾値 ${KB_CONFIDENCE_THRESHOLD} 未満。推測で回答せずエスカレーション`, false);
      this.escalate(run, ticket, '該当するナレッジ記事が見つかりませんでした (低確信度)。');
      return;
    }
    const top = hits[0];
    this.step(run, 'llm', 'compose-answer', `記事 ${top.article.articleId} (スコア ${top.score.toFixed(2)}) に基づき回答を生成`, true);
    await sleep(400);

    const reply = redactPii(
      `お問い合わせありがとうございます。\n\n${top.article.body}\n\n【出典】${top.article.title} (${top.article.articleId})\nご不明点があれば返信ください。`
    );
    this.callTool(run, 'zendesk.reply', reply.slice(0, 60), () => this.zendesk.addReply(ticket.id, reply));
    this.callTool(run, 'zendesk.solve', 'status=solved', () => {
      this.zendesk.addTags(ticket.id, ['ai_resolved', 'faq']);
      this.zendesk.setStatus(ticket.id, 'solved');
    });
    this.finish(run, 'completed', `FAQ自動回答 (出典: ${top.article.articleId})`);
  }

  /** L0: 注文状況照会 — 認証 → CRM/ERP読み取り → 回答 */
  private async runOrderStatus(run: AgentRun, ticket: Ticket): Promise<void> {
    const member = this.checkAuth(run, ticket);
    if (!member) return;
    const orderId = run.entities.orderId;
    if (!orderId) {
      this.escalate(run, ticket, '注文番号を特定できませんでした。');
      return;
    }
    const order = this.callTool(run, 'erp.get_order', orderId, () => this.erp.getOrder(orderId));
    if (!order || order.memberId !== member.memberId) {
      this.step(run, 'guardrail', 'ownership-check', '注文が本人のものではない、または存在しません', false);
      this.escalate(run, ticket, '注文の所有者確認に失敗しました。');
      return;
    }
    await sleep(300);
    const statusJa: Record<string, string> = {
      processing: '手配中',
      shipped: '発送済み',
      delivered: '配達完了',
      cancelled: 'キャンセル済み',
    };
    const reply = `${member.name} 様\n\nご注文 ${order.orderId}（${order.item} / ¥${order.amountJpy.toLocaleString()}）の状況は「${statusJa[order.status]}」です。\n\n※ この回答はERPの最新データに基づきます。`;
    this.callTool(run, 'zendesk.reply', reply.slice(0, 60), () => this.zendesk.addReply(ticket.id, reply));
    this.callTool(run, 'zendesk.solve', 'status=solved', () => {
      this.zendesk.addTags(ticket.id, ['ai_resolved', 'order_status']);
      this.zendesk.setStatus(ticket.id, 'solved');
    });
    this.finish(run, 'completed', `注文状況を自動回答 (${order.orderId}: ${order.status})`);
  }

  /** L1: 住所変更 — 認証 → 現値照会 → write → 読み戻し検証 → 完了 */
  private async runAddressChange(run: AgentRun, ticket: Ticket): Promise<void> {
    const member = this.checkAuth(run, ticket);
    if (!member) return;
    const newAddress = run.entities.newAddress;
    if (!newAddress || newAddress.length < 6) {
      this.escalate(run, ticket, '新住所を特定できませんでした。「新住所: 〜」の形式で確認が必要です。');
      return;
    }

    const before = member.address;
    this.step(run, 'info', 'plan', `住所変更: 「${before}」→「${newAddress}」(値は正規表現抽出とCRM照会から取得。LLM生成値は不使用)`, true);
    await sleep(400);

    this.callTool(run, 'crm.update_address', `${member.memberId} → ${newAddress}`, () =>
      this.crm.updateAddress(member.memberId, newAddress)
    );

    // 読み戻し検証: 書いた値が実際に反映されたか
    const readBack = this.callTool(run, 'crm.lookup_member', `${member.memberId} (検証読み戻し)`, () =>
      this.crm.lookupMember(member.memberId)
    );
    if (!readBack || readBack.address !== newAddress) {
      this.step(run, 'verify', 'write-verification', '読み戻し不一致。ロールバック相当としてエスカレーション', false);
      this.escalate(run, ticket, '住所変更の書き込み検証に失敗しました。手動確認が必要です。');
      return;
    }
    this.step(run, 'verify', 'write-verification', '読み戻し一致を確認 (CRM上の値 = 意図した値)', true);

    const reply = redactPii(
      `${member.name} 様\n\nご登録住所の変更が完了しました。\n変更後: ${newAddress}\n\n※ お心当たりがない場合は至急このメールにご返信ください。`
    );
    this.callTool(run, 'zendesk.reply', reply.slice(0, 60), () => this.zendesk.addReply(ticket.id, reply));
    this.callTool(run, 'zendesk.note', '監査記録', () =>
      this.zendesk.addInternalNote(
        ticket.id,
        `【AI実行記録】住所変更を自動実行 (L1)。変更前: ${before} / 変更後: ${newAddress} / 検証: 読み戻し一致 / run=${run.id}`
      )
    );
    this.callTool(run, 'zendesk.solve', 'status=solved', () => {
      this.zendesk.addTags(ticket.id, ['ai_resolved', 'address_change']);
      this.zendesk.setStatus(ticket.id, 'solved');
    });
    this.finish(run, 'completed', `住所変更を自動実行・検証済み (${member.memberId})`);
  }

  /** L2: 返金 — 認証 → ERP照会 (金額はERPから取る) → 上限判定 → 承認 or 自動実行 */
  private async runRefund(run: AgentRun, ticket: Ticket): Promise<void> {
    const member = this.checkAuth(run, ticket);
    if (!member) return;
    const orderId = run.entities.orderId;
    if (!orderId) {
      this.escalate(run, ticket, '返金対象の注文番号を特定できませんでした。');
      return;
    }
    const order = this.callTool(run, 'erp.get_order', orderId, () => this.erp.getOrder(orderId));
    if (!order || order.memberId !== member.memberId) {
      this.step(run, 'guardrail', 'ownership-check', '注文が本人のものではない、または存在しません', false);
      this.escalate(run, ticket, '注文の所有者確認に失敗しました。');
      return;
    }

    // 金額は顧客メッセージではなくERPレコードから決定 (転記ミス対策)
    const amount = order.amountJpy;
    this.step(run, 'info', 'amount-source', `返金額 ¥${amount.toLocaleString()} をERP注文レコードから取得 (顧客記載額は使用しない)`, true);
    await sleep(300);

    if (amount > AUTO_REFUND_LIMIT_JPY) {
      // 上限超過 → HITL承認で一時停止
      this.step(run, 'guardrail', 'amount-cap', `¥${amount.toLocaleString()} > 自動実行上限 ¥${AUTO_REFUND_LIMIT_JPY.toLocaleString()}。HITL承認が必要`, true);
      const approval: ApprovalRequest = {
        id: `apr-${++this.seq}`,
        runId: run.id,
        ticketId: ticket.id,
        action: 'erp.create_refund',
        summary: `${member.name} (${member.memberId}) の注文 ${order.orderId}（${order.item}）に対する全額返金。根拠: 顧客申請 + ERP注文レコード照合済み・所有者確認済み。`,
        diff: [
          { field: '返金額', before: '—', after: `¥${amount.toLocaleString()}` },
          { field: '注文ステータス', before: order.status, after: `${order.status} (返金付与)` },
        ],
        status: 'pending',
        createdAt: Date.now(),
      };
      this.approvals.set(approval.id, approval);
      this.callTool(run, 'hitl.request_approval', approval.summary.slice(0, 80), () => approval.id);
      this.zendesk.setStatus(ticket.id, 'pending');
      this.zendesk.addInternalNote(
        ticket.id,
        `【AI】高額返金 (¥${amount.toLocaleString()}) のため承認待ち。承認ID: ${approval.id} / run=${run.id}`
      );
      run.state = 'awaiting_approval';
      this.step(run, 'hitl', 'paused', `承認 ${approval.id} を待機中 (タイムアウト時は有人対応へ)`, true);
      return;
    }

    await this.executeRefund(run, ticket.id, orderId, amount, '顧客申請 (自動承認: 上限以下)');
  }

  /** 返金の実行と検証 (自動 or 承認後の共通処理) */
  private async executeRefund(
    run: AgentRun,
    ticketId: number,
    orderId: string,
    amount: number,
    reason: string
  ): Promise<void> {
    const ticket = this.zendesk.getTicket(ticketId)!;
    const refund = this.callTool(run, 'erp.create_refund', `${orderId} ¥${amount.toLocaleString()}`, () =>
      this.erp.createRefund(orderId, amount, reason)
    );
    if (!refund) {
      this.escalate(run, ticket, '返金レコードの作成に失敗しました。');
      return;
    }

    // 読み戻し検証
    const readBack = this.callTool(run, 'erp.get_refund', `${refund.refundId} (検証読み戻し)`, () =>
      this.erp.getRefund(refund.refundId)
    );
    if (!readBack || readBack.amountJpy !== amount || readBack.orderId !== orderId) {
      this.step(run, 'verify', 'write-verification', '読み戻し不一致。エスカレーション', false);
      this.escalate(run, ticket, '返金の書き込み検証に失敗しました。');
      return;
    }
    this.step(run, 'verify', 'write-verification', `読み戻し一致 (${refund.refundId}: ¥${amount.toLocaleString()})`, true);

    const reply = redactPii(
      `お客様\n\n注文 ${orderId} の返金手続きが完了しました。\n返金額: ¥${amount.toLocaleString()} (受付番号 ${refund.refundId})\n5営業日以内にお支払い方法へ払い戻されます。`
    );
    this.callTool(run, 'zendesk.reply', reply.slice(0, 60), () => this.zendesk.addReply(ticketId, reply));
    this.callTool(run, 'zendesk.note', '監査記録', () =>
      this.zendesk.addInternalNote(
        ticketId,
        `【AI実行記録】返金 ${refund.refundId} (¥${amount.toLocaleString()}) を実行。検証: 読み戻し一致 / run=${run.id}`
      )
    );
    this.callTool(run, 'zendesk.solve', 'status=solved', () => {
      this.zendesk.addTags(ticketId, ['ai_resolved', 'refund']);
      this.zendesk.setStatus(ticketId, 'solved');
    });
    this.finish(run, 'completed', `返金 ${refund.refundId} を実行・検証済み (¥${amount.toLocaleString()})`);
  }

  // ----------------------------------------------------------
  // HITL承認の決裁
  // ----------------------------------------------------------

  async decideApproval(approvalId: string, approve: boolean, decidedBy: string): Promise<ApprovalRequest> {
    const approval = this.approvals.get(approvalId);
    if (!approval) throw new Error(`承認 ${approvalId} が存在しません`);
    if (approval.status !== 'pending') throw new Error(`承認 ${approvalId} は決裁済みです (${approval.status})`);
    const run = this.runs.get(approval.runId);
    if (!run || run.state !== 'awaiting_approval') throw new Error('対応するRunが承認待ち状態ではありません');

    approval.status = approve ? 'approved' : 'rejected';
    approval.decidedAt = Date.now();
    approval.decidedBy = decidedBy;
    this.step(run, 'hitl', approve ? 'approved' : 'rejected', `${decidedBy} が${approve ? '承認' : '却下'} (${approvalId})`, approve);

    const ticket = this.zendesk.getTicket(approval.ticketId)!;
    if (approve) {
      run.state = 'running';
      const order = this.erp.getOrder(run.entities.orderId!)!;
      await this.executeRefund(run, ticket.id, order.orderId, order.amountJpy, `顧客申請 (HITL承認: ${decidedBy})`);
    } else {
      this.zendesk.addInternalNote(ticket.id, `【AI】返金申請は ${decidedBy} により却下されました。理由の説明と代替案内のため有人対応へ。`);
      this.escalate(run, ticket, '承認者により却下されたため、有人対応へ引き継ぎます。');
    }
    return approval;
  }

  // ----------------------------------------------------------
  // 共通処理 (認証 / ツール実行 / エスカレーション / 記録)
  // ----------------------------------------------------------

  /**
   * 本人確認: 会員IDのCRM照会 + チケット送信元メールの一致をコードで強制。
   * LLMの判断ではバイパスできない。
   */
  private checkAuth(run: AgentRun, ticket: Ticket): ReturnType<MockCRM['lookupMember']> {
    const memberId = run.entities.memberId;
    if (!memberId) {
      this.step(run, 'guardrail', 'auth-check', '会員番号が特定できません', false);
      this.escalate(run, ticket, '会員番号を確認できませんでした。');
      return undefined;
    }
    const member = this.callTool(run, 'crm.lookup_member', memberId, () => this.crm.lookupMember(memberId));
    if (!member) {
      this.step(run, 'guardrail', 'auth-check', `会員 ${memberId} がCRMに存在しません`, false);
      this.escalate(run, ticket, '会員情報が見つかりませんでした。');
      return undefined;
    }
    if (member.email !== ticket.requesterEmail) {
      this.violate(run, 'identity-mismatch', 'high', `送信元 ${ticket.requesterEmail} が会員 ${memberId} の登録メールと不一致`);
      this.step(run, 'guardrail', 'auth-check', '送信元メールが登録メールと不一致。なりすましの可能性', false);
      this.zendesk.addTags(ticket.id, ['identity_mismatch']);
      this.escalate(run, ticket, '本人確認に失敗しました。追加の本人確認が必要です。');
      return undefined;
    }
    this.step(run, 'guardrail', 'auth-check', `本人確認OK (${memberId} / 登録メール一致)`, true);
    return member;
  }

  /** 全ツール呼び出しの関門: アロウリスト検証 + 監査ログ */
  private callTool<T>(run: AgentRun, tool: string, inputDesc: string, fn: () => T): T | undefined {
    const policy = INTENT_POLICIES[run.intent];
    if (!policy.allowedTools.includes(tool)) {
      this.violate(run, 'tool-allowlist', 'medium', `インテント ${run.intent} に許可されていないツール ${tool} を遮断`);
      this.step(run, 'guardrail', 'tool-allowlist', `${tool} はこのインテントで許可されていません`, false);
      return undefined;
    }
    try {
      const result = fn();
      this.recordAudit(run, tool, inputDesc, this.describe(result), true);
      this.step(run, 'tool', tool, inputDesc, true);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.recordAudit(run, tool, inputDesc, `エラー: ${message}`, false);
      this.step(run, 'tool', tool, `${inputDesc} → エラー: ${message}`, false);
      return undefined;
    }
  }

  private describe(value: unknown): string {
    if (value === undefined || value === null) return '(該当なし)';
    if (typeof value === 'string') return value.slice(0, 200);
    return JSON.stringify(value).slice(0, 200);
  }

  /** 有人対応への引き継ぎ: 会話サマリ + 実行済みステップをチケットに添付 */
  private escalate(run: AgentRun, ticket: Ticket, reason: string): void {
    const summary = run.steps
      .map((s) => `- [${s.kind}] ${s.name}: ${s.detail}${s.ok ? '' : ' (NG)'}`)
      .join('\n');
    this.zendesk.addInternalNote(
      ticket.id,
      `【AI引き継ぎサマリ】${reason}\nインテント: ${INTENT_POLICIES[run.intent].labelJa}\n抽出済みエンティティ: ${JSON.stringify(run.entities)}\n実行済みステップ:\n${summary}`
    );
    this.zendesk.addTags(ticket.id, ['ai_escalated']);
    this.zendesk.setStatus(ticket.id, 'escalated');
    this.finish(run, 'escalated', reason);
  }

  private finish(run: AgentRun, state: AgentRun['state'], outcome: string): void {
    if (run.state === 'completed' || run.state === 'escalated' || run.state === 'blocked' || run.state === 'failed') return;
    run.state = state;
    run.outcome = outcome;
    run.finishedAt = Date.now();
  }

  private step(run: AgentRun, kind: StepKind, name: string, detail: string, ok: boolean): void {
    const step: RunStep = {
      seq: run.steps.length + 1,
      kind,
      name,
      detail,
      ok,
      timestamp: Date.now(),
    };
    run.steps.push(step);
  }

  private recordAudit(run: AgentRun, tool: string, input: string, output: string, ok: boolean): void {
    this.audit.push({
      id: `aud-${++this.seq}`,
      timestamp: Date.now(),
      runId: run.id,
      ticketId: run.ticketId,
      tool,
      input,
      output,
      ok,
    });
    if (this.audit.length > 500) this.audit.shift();
  }

  private violate(run: AgentRun, policy: string, severity: PolicyViolation['severity'], detail: string): void {
    this.violations.push({
      id: `vio-${++this.seq}`,
      timestamp: Date.now(),
      runId: run.id,
      policy,
      severity,
      detail,
    });
    if (this.violations.length > 200) this.violations.shift();
  }

  // ----------------------------------------------------------
  // スナップショット
  // ----------------------------------------------------------

  snapshot(): SupportSnapshot {
    const runs = [...this.runs.values()].sort((a, b) => b.createdAt - a.createdAt);
    return {
      tickets: this.zendesk.all(),
      runs,
      approvals: [...this.approvals.values()].sort((a, b) => b.createdAt - a.createdAt),
      audit: [...this.audit].reverse().slice(0, 100),
      violations: [...this.violations].reverse(),
      members: this.crm.all(),
      orders: this.erp.allOrders(),
      refunds: this.erp.allRefunds(),
      stats: {
        totalRuns: runs.length,
        autoResolved: runs.filter((r) => r.state === 'completed').length,
        escalated: runs.filter((r) => r.state === 'escalated').length,
        blocked: runs.filter((r) => r.state === 'blocked').length,
        pendingApprovals: [...this.approvals.values()].filter((a) => a.status === 'pending').length,
      },
    };
  }
}

// ============================================================
// シングルトン
// ============================================================

const globalStore = globalThis as typeof globalThis & {
  __SUPPORT_ENGINE__?: SupportEngine;
};

export function getSupportEngine(): SupportEngine {
  if (!globalStore.__SUPPORT_ENGINE__) {
    globalStore.__SUPPORT_ENGINE__ = new SupportEngine();
  }
  return globalStore.__SUPPORT_ENGINE__;
}

export function resetSupportEngine(): SupportEngine {
  globalStore.__SUPPORT_ENGINE__ = new SupportEngine();
  return globalStore.__SUPPORT_ENGINE__;
}
