"""バックオフィスAIエージェント - 請求書処理デモ

実行: python3 demo.py (依存なし・標準ライブラリのみ)

シナリオ:
  1. ¥55,000 / PO一致      → 承認レスで自動転記 + 読み戻し検証
  2. ¥275,000 / PO一致     → 上限超過 → PA承認 (承認) → 転記
  3. ¥88,000 / PO残額超過  → PO突合NG → 有人対応へ
  4. 明細合計の不一致       → LLM抽出値の再計算検証NG → 有人対応へ
  5. シナリオ1の重複配送    → 冪等キーで遮断
  6. シナリオ2と同じ請求書番号の再転記 → 重複請求チェックで遮断
"""

from __future__ import annotations

from backoffice_agent.engine import BackofficeEngine

STATE_LABEL = {
    "completed": "✅ 自動完了",
    "awaiting_approval": "⏸  承認待ち",
    "escalated": "👤 有人対応へ",
    "blocked": "🚫 遮断",
    "running": "… 実行中",
}


def show(run) -> None:
    print(f"\n  [{run.run_id}] {run.source_ref}")
    for step in run.steps:
        mark = "OK" if step.ok else "NG"
        print(f"    {mark:>2} [{step.kind:<9}] {step.name}: {step.detail}")
    print(f"  => {STATE_LABEL[run.state.value]} {run.outcome or ''}")


def main() -> None:
    engine = BackofficeEngine()

    print("=" * 72)
    print("シナリオ1: ¥55,000 / PO-7001一致 → 承認レス自動転記")
    run1 = engine.handle_incoming_invoice(
        "受領請求書/alpha_202607_INV-A100.pdf",
        {
            "vendor": "株式会社アルファ商事",
            "invoice_no": "INV-A100",
            "invoice_date": "2026-07-01",
            "amount_jpy": 55_000,
            "tax_jpy": 5_500,
            "po_number": "PO-7001",
            "line_items": [["事務用品一式", 30_000], ["保守サービス7月分", 25_000]],
        },
    )
    show(run1)

    print("\n" + "=" * 72)
    print("シナリオ2: ¥275,000 / PO-7002一致 → 上限超過で承認 → 承認後に転記")
    run2 = engine.handle_incoming_invoice(
        "受領請求書/beta_202607_INV-B200.pdf",
        {
            "vendor": "ベータ物流株式会社",
            "invoice_no": "INV-B200",
            "invoice_date": "2026-07-05",
            "amount_jpy": 275_000,
            "tax_jpy": 27_500,
            "po_number": "PO-7002",
            "line_items": [["7月分配送委託費", 275_000]],
        },
    )
    show(run2)
    pending = engine.approvals.pending()[0]
    print(f"\n  --- Teams承認カード (Power Automate相当) ---\n  {pending.summary}")
    print("  --- 承認者が [承認] をタップ ---")
    run2 = engine.resume_after_decision(pending.approval_id, approve=True, decided_by="keiri-mgr@company.jp")
    show(run2)

    print("\n" + "=" * 72)
    print("シナリオ3: ¥88,000 だがPO-7001の残額 ¥60,000 を超過 → PO突合NG")
    run3 = engine.handle_incoming_invoice(
        "受領請求書/alpha_202607_INV-A101.pdf",
        {
            "vendor": "株式会社アルファ商事",
            "invoice_no": "INV-A101",
            "invoice_date": "2026-07-08",
            "amount_jpy": 88_000,
            "tax_jpy": 8_800,
            "po_number": "PO-7001",
            "line_items": [["追加発注分", 88_000]],
        },
    )
    show(run3)

    print("\n" + "=" * 72)
    print("シナリオ4: 明細合計 ¥40,000 ≠ 請求額 ¥50,000 (抽出ミス想定) → 検証NG")
    run4 = engine.handle_incoming_invoice(
        "受領請求書/gamma_202607_INV-C300.pdf",
        {
            "vendor": "ガンマ興産株式会社",
            "invoice_no": "INV-C300",
            "invoice_date": "2026-07-10",
            "amount_jpy": 50_000,
            "tax_jpy": 5_000,
            "po_number": None,
            "line_items": [["コンサルティング費", 40_000]],
        },
    )
    show(run4)

    print("\n" + "=" * 72)
    print("シナリオ5: シナリオ1と同一請求書の重複配送 (PAトリガー二重発火想定)")
    run5 = engine.handle_incoming_invoice(
        "受領請求書/alpha_202607_INV-A100.pdf",
        {
            "vendor": "株式会社アルファ商事",
            "invoice_no": "INV-A100",
            "invoice_date": "2026-07-01",
            "amount_jpy": 55_000,
            "tax_jpy": 5_500,
            "po_number": "PO-7001",
            "line_items": [["事務用品一式", 30_000], ["保守サービス7月分", 25_000]],
        },
    )
    print(f"\n  同一Runが返却されたか: {run5.run_id == run1.run_id} (run={run5.run_id})")

    print("\n" + "=" * 72)
    print("最終状態")
    print("-" * 72)
    print("SAP転記済み伝票:")
    for doc in engine.sap.all_documents():
        print(f"  伝票 {doc.document_no}: {doc.vendor} / {doc.invoice_no} / ¥{doc.amount_jpy:,}")
    print("\nSharePoint処理台帳:")
    for row in engine.sharepoint.dump_ledger():
        print(f"  {row['invoice_no']} → 伝票{row['sap_document_no']} (承認: {row['approved_by']})")
    print(f"\n監査ログ: {len(engine.audit)} 件のツール呼び出しを記録")
    ok = sum(1 for e in engine.audit if e.ok)
    print(f"  成功 {ok} / 失敗 {len(engine.audit) - ok}")


if __name__ == "__main__":
    main()
