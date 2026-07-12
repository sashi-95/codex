"""レポート抽出支援 + ルーティン自動化のデモ

実行: python3 demo_reports.py (依存なし)

シナリオ:
  A-1. 経理ロール: 自然言語でベンダー別支払一覧を依頼 → 自動生成・リンク返信
  A-2. 営業ロール: 同じ依頼 → ロール権限でブロック
  A-3. 給与データをカタログ外ロールが依頼 → ブロック
  A-4. 曖昧な依頼 → カタログ候補を提示して確認へ
  B-1. スケジューラtick (7/1): 月次レポート・POリマインド・突合が実行
  B-2. 同日に再tick: 冪等性で全ジョブスキップ
  B-3. 翌日tick: dailyの突合のみ実行。台帳欠損を仕込み → 例外キュー検出
"""

from __future__ import annotations

from backoffice_agent.adapters.sap_mock import SapAdapter
from backoffice_agent.adapters.sharepoint_mock import SharePointAdapter
from backoffice_agent.adapters.teams_mock import TeamsAdapter
from backoffice_agent.reporting import ReportEngine
from backoffice_agent.routines import RoutineScheduler

STATE = {"completed": "✅", "blocked": "🚫", "escalated": "❓", "failed": "⚠"}


def show_report(run) -> None:
    print(f"\n  [{run.run_id}] {run.requester} ({run.role}): 「{run.request_text}」")
    for step in run.steps:
        mark = "OK" if step.ok else "NG"
        print(f"    {mark:>2} [{step.kind:<9}] {step.name}: {step.detail}")
    print(f"  => {STATE.get(run.state, run.state)} {run.outcome}")


def main() -> None:
    sap = SapAdapter()
    sharepoint = SharePointAdapter()
    teams = TeamsAdapter()
    reports = ReportEngine(sap, sharepoint, teams)
    scheduler = RoutineScheduler(sap, sharepoint, teams, reports)

    print("=" * 72)
    print("A. レポート抽出支援 (自然言語 → カタログマッピング → 権限 → 抽出)")
    show_report(reports.handle_request("tanaka@company.jp", "keiri", "2026-06のベンダー別支払一覧をExcelでください"))
    show_report(reports.handle_request("sato@company.jp", "eigyo", "2026-06の支払一覧がほしい"))
    show_report(reports.handle_request("sato@company.jp", "eigyo", "2026-06の給与支給サマリをください"))
    show_report(reports.handle_request("suzuki@company.jp", "keiri", "例のデータをいい感じにまとめて"))

    print("\n" + "=" * 72)
    print("B-1. ルーティン: 2026-07-01 のスケジュールtick")
    for ex in scheduler.tick("2026-07-01"):
        print(f"  [{ex.job_id}] ({ex.period_key}) {ex.status}: {ex.summary}")

    print("\nB-2. 同日に再tick (スケジューラ二重起動を想定)")
    for ex in scheduler.tick("2026-07-01"):
        print(f"  [{ex.job_id}] ({ex.period_key}) {ex.status}: {ex.summary}")

    print("\nB-3. 翌日tick — SAPに台帳未記載の伝票を仕込んで突合エラーを検出")
    sap.post_vendor_invoice("ガンマ興産株式会社", "INV-C999", 44_000, 4_400)  # 台帳に載らない伝票
    for ex in scheduler.tick("2026-07-02"):
        print(f"  [{ex.job_id}] ({ex.period_key}) {ex.status}: {ex.summary}")

    print("\n" + "=" * 72)
    print("例外キュー (人間が処理):")
    for exc in scheduler.exceptions:
        print(f"  [{exc.kind}] {exc.detail} ({exc.period_key})")

    print("\nTeams通知:")
    for msg in teams.messages:
        print(f"  → {msg.to}: {msg.text.splitlines()[0]}")

    print("\nSharePoint保存ファイル:")
    for path, rows in sharepoint.files.items():
        print(f"  {path} ({len(rows)}行)")


if __name__ == "__main__":
    main()
