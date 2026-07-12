"""オーケストレーションエンジン - 請求書処理フロー

docs/BACKOFFICE_AI_ARCHITECTURE.md §6.1 の実装:
  抽出 (LLM) → 決定的検証 → PO突合 (SAP照会) → 重複チェック
  → リスク判定 → [承認] → BAPI転記 → 読み戻し検証 → 台帳記録

設計原則の実装ポイント:
  - LLM抽出値は validate_invoice_arithmetic で必ず再計算検証
  - 転記金額はLLMの生成文ではなく検証済みInvoiceDataの構造化フィールドから渡す
  - write後は read_document で読み戻し、金額・税額・取引先を突合
  - 冪等性: vendor+invoice_no の業務キーで重複転記を遮断
"""

from __future__ import annotations

from .adapters.approval_mock import ApprovalAdapter
from .adapters.sap_mock import SapAdapter
from .adapters.sharepoint_mock import SharePointAdapter
from .llm_mock import extract_invoice
from .models import AuditEntry, InvoiceData, RiskLevel, Run, RunState, Step
from .policies import requires_approval, validate_invoice_arithmetic, validate_po_match


class BackofficeEngine:
    def __init__(self) -> None:
        self.sap = SapAdapter()
        self.sharepoint = SharePointAdapter()
        self.approvals = ApprovalAdapter()
        self.runs: dict[str, Run] = {}
        self.audit: list[AuditEntry] = []
        self._seq = 0
        # 冪等キー → run_id (Power Automateトリガーの重複配送対策)
        self._processed: dict[str, str] = {}
        # 承認待ちRunの再開に必要な情報
        self._pending_context: dict[str, InvoiceData] = {}

    # ------------------------------------------------------------
    # エントリポイント: SharePoint新着請求書 (PA Webhook相当)
    # ------------------------------------------------------------

    def handle_incoming_invoice(self, file_path: str, pdf_content: dict) -> Run:
        idem_key = f"invoice|{pdf_content.get('vendor')}|{pdf_content.get('invoice_no')}"
        if idem_key in self._processed:
            existing = self.runs[self._processed[idem_key]]
            self._log(existing, "guardrail", "idempotency", f"重複トリガーを検出 ({idem_key}) → 既存Runを返却", True)
            return existing

        self._seq += 1
        run = Run(
            run_id=f"run-{self._seq}",
            task_kind="invoice_posting",
            source_ref=file_path,
            idempotency_key=idem_key,
            risk=RiskLevel.L2,
        )
        self.runs[run.run_id] = run
        self._processed[idem_key] = run.run_id
        self._execute(run, pdf_content)
        return run

    # ------------------------------------------------------------
    # 実行フロー
    # ------------------------------------------------------------

    def _execute(self, run: Run, pdf_content: dict) -> None:
        # 1. LLM抽出 (本番: Claude vision)
        invoice = self._call(run, "llm.extract_invoice", run.source_ref, lambda: extract_invoice(pdf_content))
        if invoice is None:
            return self._escalate(run, "請求書の構造化抽出に失敗")

        # 2. 決定的検証: LLM抽出値を再計算で突合 (LLMを信用しない)
        errors = validate_invoice_arithmetic(invoice)
        if errors:
            self._log(run, "guardrail", "arithmetic-check", " / ".join(errors), False)
            return self._escalate(run, f"抽出値の検証NG: {errors[0]}")
        self._log(run, "guardrail", "arithmetic-check", "明細合計・税率の再計算一致", True)

        # 3. 重複請求チェック (業務キー)
        if self.sap.is_duplicate_invoice(invoice.vendor, invoice.invoice_no):
            self._log(run, "guardrail", "duplicate-check", f"{invoice.invoice_no} は転記済み", False)
            return self._blocked(run, "重複請求のため遮断")
        self._log(run, "guardrail", "duplicate-check", "転記履歴に重複なし", True)

        # 4. PO突合 (SAPからRFCで取得した値と突合)
        po_matched = False
        if invoice.po_number:
            po = self._call(run, "sap.get_purchase_order", invoice.po_number, lambda: self.sap.get_purchase_order(invoice.po_number))
            if po is not None:
                po_errors = validate_po_match(invoice, po.vendor, po.open_amount_jpy)
                if po_errors:
                    self._log(run, "guardrail", "po-match", " / ".join(po_errors), False)
                    return self._escalate(run, f"PO突合NG: {po_errors[0]}")
                po_matched = True
                self._log(run, "guardrail", "po-match", f"PO {po.po_number} と一致 (取引先・残額OK)", True)

        # 5. リスク判定 → 承認 or 自動転記
        approval_reason = requires_approval(invoice, po_matched)
        if approval_reason:
            approval = self.approvals.request(
                run.run_id,
                "sap.post_vendor_invoice",
                f"{invoice.vendor} の請求書 {invoice.invoice_no} (¥{invoice.amount_jpy:,}) の転記承認。理由: {approval_reason}。検証: 計算一致{'・PO一致' if po_matched else ''}・重複なし。",
                [("転記金額", "—", f"¥{invoice.amount_jpy:,}"), ("税額", "—", f"¥{invoice.tax_jpy:,}")],
            )
            self._pending_context[run.run_id] = invoice
            run.state = RunState.AWAITING_APPROVAL
            self._log(run, "hitl", "approval-requested", f"{approval.approval_id}: {approval_reason} → Power Automate承認へ", True)
            return
        self._log(run, "guardrail", "auto-approve", "PO完全一致かつ上限以下 → 承認レスで転記", True)

        self._post_and_verify(run, invoice, approved_by=None)

    def resume_after_decision(self, approval_id: str, approve: bool, decided_by: str) -> Run:
        """Power Automate承認コールバック相当"""
        approval = self.approvals.decide(approval_id, approve, decided_by)
        run = self.runs[approval.run_id]
        invoice = self._pending_context.pop(run.run_id)
        self._log(run, "hitl", "approved" if approve else "rejected", f"{decided_by} が{'承認' if approve else '却下'}", approve)
        if not approve:
            return self._escalate(run, "承認者により却下。有人対応へ") or run
        run.state = RunState.RUNNING
        self._post_and_verify(run, invoice, approved_by=decided_by)
        return run

    # ------------------------------------------------------------
    # 転記 + 読み戻し検証
    # ------------------------------------------------------------

    def _post_and_verify(self, run: Run, invoice: InvoiceData, approved_by: str | None) -> None:
        # 転記 (本番: BAPI_ACC_DOCUMENT_POST + COMMIT)
        doc_no = self._call(
            run,
            "sap.post_vendor_invoice",
            f"{invoice.vendor} / {invoice.invoice_no} / ¥{invoice.amount_jpy:,}",
            lambda: self.sap.post_vendor_invoice(invoice.vendor, invoice.invoice_no, invoice.amount_jpy, invoice.tax_jpy),
        )
        if doc_no is None:
            return self._escalate(run, "SAP転記に失敗")

        # 読み戻し検証 (GUI経路でも必ずRFCで読み直して突合する)
        doc = self._call(run, "sap.read_document", f"{doc_no} (検証読み戻し)", lambda: self.sap.read_document(doc_no))
        if (
            doc is None
            or doc.amount_jpy != invoice.amount_jpy
            or doc.tax_jpy != invoice.tax_jpy
            or doc.vendor != invoice.vendor
        ):
            self._log(run, "verify", "write-verification", "読み戻し不一致。要手動確認", False)
            return self._escalate(run, f"伝票 {doc_no} の読み戻し検証NG")
        self._log(run, "verify", "write-verification", f"伝票 {doc_no} の金額・税額・取引先が一致", True)

        # 台帳記録 (本番: SharePointリスト + Teams通知)
        self._call(
            run,
            "sharepoint.append_ledger_row",
            invoice.invoice_no,
            lambda: self.sharepoint.append_ledger_row(
                {
                    "invoice_no": invoice.invoice_no,
                    "vendor": invoice.vendor,
                    "amount_jpy": invoice.amount_jpy,
                    "sap_document_no": doc_no,
                    "approved_by": approved_by or "auto (policy)",
                    "run_id": run.run_id,
                }
            ),
        )
        run.sap_document_no = doc_no
        run.state = RunState.COMPLETED
        run.outcome = f"伝票 {doc_no} を転記・検証済み (¥{invoice.amount_jpy:,})"

    # ------------------------------------------------------------
    # 共通処理
    # ------------------------------------------------------------

    def _call(self, run: Run, tool: str, input_desc: str, fn):
        """全ツール呼び出しの関門: 監査ログ + 例外の安全化"""
        try:
            result = fn()
            self.audit.append(AuditEntry(run.run_id, tool, input_desc, str(result)[:120], True))
            self._log(run, "tool", tool, input_desc, True)
            return result
        except Exception as error:  # noqa: BLE001 - ツール失敗は全てエスカレーションに集約
            self.audit.append(AuditEntry(run.run_id, tool, input_desc, f"エラー: {error}", False))
            self._log(run, "tool", tool, f"{input_desc} → エラー: {error}", False)
            return None

    def _log(self, run: Run, kind: str, name: str, detail: str, ok: bool) -> None:
        run.steps.append(Step(kind=kind, name=name, detail=detail, ok=ok))

    def _escalate(self, run: Run, reason: str) -> None:
        run.state = RunState.ESCALATED
        run.outcome = f"有人対応へ: {reason}"

    def _blocked(self, run: Run, reason: str) -> None:
        run.state = RunState.BLOCKED
        run.outcome = reason
