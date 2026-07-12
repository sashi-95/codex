"""SAPアダプタ (モック)

本番実装の差し替え先 (docs/BACKOFFICE_AI_ARCHITECTURE.md §3):
  - 第一選択: PyRFC で BAPI_ACC_DOCUMENT_POST + BAPI_TRANSACTION_COMMIT
  - 過渡期: 既存VBS GUIスクリプトをパラメータ化して subprocess で起動し、
    実行後に必ずRFCで読み戻し検証する
インターフェース (メソッドシグネチャ) は本番と共通。
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass
class PurchaseOrder:
    po_number: str
    vendor: str
    open_amount_jpy: int


@dataclass
class PostedDocument:
    document_no: str
    vendor: str
    amount_jpy: int
    tax_jpy: int
    invoice_no: str


class SapAdapter:
    """モックSAP: PO照会と会計伝票転記 (実装差し替えポイント)"""

    def __init__(self) -> None:
        self._pos = {
            "PO-7001": PurchaseOrder("PO-7001", "株式会社アルファ商事", 60_000),
            "PO-7002": PurchaseOrder("PO-7002", "ベータ物流株式会社", 300_000),
        }
        self._documents: dict[str, PostedDocument] = {}
        self._doc_seq = 5100000000
        # 転記済み請求書の業務キー (重複転記の遮断に使用)
        self._posted_invoice_keys: set[str] = set()

    # ---- 参照系 (RFC読み取り相当) ----

    def get_purchase_order(self, po_number: str) -> PurchaseOrder | None:
        return self._pos.get(po_number)

    def is_duplicate_invoice(self, vendor: str, invoice_no: str) -> bool:
        return f"{vendor}|{invoice_no}" in self._posted_invoice_keys

    def read_document(self, document_no: str) -> PostedDocument | None:
        """読み戻し検証用。本番ではBAPIで転記した伝票をRFCで読み直す。"""
        return self._documents.get(document_no)

    # ---- 更新系 (BAPI_ACC_DOCUMENT_POST相当) ----

    def post_vendor_invoice(
        self, vendor: str, invoice_no: str, amount_jpy: int, tax_jpy: int
    ) -> str:
        """会計伝票を転記し伝票番号を返す。COMMITまで含む想定。"""
        key = f"{vendor}|{invoice_no}"
        if key in self._posted_invoice_keys:
            raise RuntimeError(f"請求書 {invoice_no} は転記済みです (重複)")
        self._doc_seq += 1
        doc = PostedDocument(
            document_no=str(self._doc_seq),
            vendor=vendor,
            amount_jpy=amount_jpy,
            tax_jpy=tax_jpy,
            invoice_no=invoice_no,
        )
        self._documents[doc.document_no] = doc
        self._posted_invoice_keys.add(key)
        return doc.document_no

    def all_documents(self) -> list[PostedDocument]:
        return list(self._documents.values())
