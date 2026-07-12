"""ポリシー層 - コードで強制するガードレール (LLMがバイパスできない)

設計原則: LLMは判断、実行はツール。
金額・伝票番号・勘定コードの整合性はすべてこの層の決定的コードで検証する。
"""

from __future__ import annotations

from .models import InvoiceData

# 請求書の自動転記上限 (これを超えるとPower Automate承認必須)
AUTO_POST_LIMIT_JPY = 100_000

# 消費税率の許容 (10% / 8% 軽減)
VALID_TAX_RATES = (0.10, 0.08)


def validate_invoice_arithmetic(invoice: InvoiceData) -> list[str]:
    """LLM抽出結果を決定的に再検証する。エラーのリストを返す (空 = OK)。

    LLM (OCR/vision) の抽出値は信用せず、明細合計と税額を再計算して突合する。
    """
    errors: list[str] = []

    line_total = sum(amount for _, amount in invoice.line_items)
    if line_total != invoice.amount_jpy:
        errors.append(
            f"明細合計 ¥{line_total:,} が請求額 ¥{invoice.amount_jpy:,} と不一致"
        )

    if not any(
        abs(invoice.tax_jpy - round(invoice.amount_jpy * rate)) <= 1
        for rate in VALID_TAX_RATES
    ):
        errors.append(
            f"税額 ¥{invoice.tax_jpy:,} が標準税率 (10%/8%) のいずれとも不一致"
        )

    if not invoice.invoice_no:
        errors.append("請求書番号が抽出できていない")

    return errors


def validate_po_match(
    invoice: InvoiceData, po_vendor: str, po_open_amount_jpy: int
) -> list[str]:
    """発注書 (PO) との突合。PO情報はSAPからRFCで取得した値を渡す。"""
    errors: list[str] = []
    if po_vendor != invoice.vendor:
        errors.append(f"POの取引先 ({po_vendor}) と請求書の取引先 ({invoice.vendor}) が不一致")
    if invoice.amount_jpy > po_open_amount_jpy:
        errors.append(
            f"請求額 ¥{invoice.amount_jpy:,} がPO残額 ¥{po_open_amount_jpy:,} を超過"
        )
    return errors


def requires_approval(invoice: InvoiceData, po_matched: bool) -> str | None:
    """HITL承認が必要かを判定。必要なら理由を返す。

    承認レス条件: PO完全一致 かつ 上限以下。それ以外はすべて承認へ。
    """
    if invoice.amount_jpy > AUTO_POST_LIMIT_JPY:
        return f"金額 ¥{invoice.amount_jpy:,} が自動転記上限 ¥{AUTO_POST_LIMIT_JPY:,} を超過"
    if not po_matched:
        return "PO突合なし (発注書に紐付かない請求)"
    return None
