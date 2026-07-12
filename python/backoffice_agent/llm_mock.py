"""LLM層のモック - 請求書PDFからの構造化抽出

本番では Claude API (vision + structured output) に差し替える:

    client.messages.create(
        model="claude-sonnet-5",
        messages=[{"role": "user", "content": [
            {"type": "document", "source": {...pdf...}},
            {"type": "text", "text": "請求書から vendor, invoice_no, ... をJSONで抽出"},
        ]}],
    )

モックでは「PDFの内容」を辞書で受け取り、そのまま構造化して返す。
抽出結果は必ず policies.validate_invoice_arithmetic() の決定的検証を通すこと。
"""

from __future__ import annotations

from .models import InvoiceData


def extract_invoice(pdf_content: dict) -> InvoiceData:
    """請求書PDF (モックでは辞書) から構造化データを抽出する。"""
    return InvoiceData(
        vendor=pdf_content["vendor"],
        invoice_no=pdf_content["invoice_no"],
        invoice_date=pdf_content["invoice_date"],
        amount_jpy=pdf_content["amount_jpy"],
        tax_jpy=pdf_content["tax_jpy"],
        po_number=pdf_content.get("po_number"),
        line_items=[tuple(item) for item in pdf_content["line_items"]],
    )
