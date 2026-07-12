"""ルーティン系自動化 - スケジュール実行 (定例レポート・リマインド・突合チェック)

本番では Power Automate のスケジュールトリガー or cron からWebhookで起動する。
このモジュールが担保するのは「安全に繰り返す」ための制御:

  - 期間キーによる冪等性: 同じ月次ジョブは同じ期間に1回しか実行されない
    (スケジューラの二重起動・リトライ・手動再実行があっても重複しない)
  - 失敗時の記録とエスカレーション (黙って落ちない)
  - 全実行の監査証跡

代表ジョブ:
  1. monthly_vendor_report: 月次のベンダー別支払レポートを自動生成・配信
  2. weekly_open_po_reminder: 未消込POの担当者リマインド
  3. daily_reconciliation: SAP伝票とSharePoint台帳の突合。不一致は例外キューへ
"""

from __future__ import annotations

import time
from dataclasses import dataclass, field
from typing import Callable

from .adapters.sap_mock import SapAdapter
from .adapters.sharepoint_mock import SharePointAdapter
from .adapters.teams_mock import TeamsAdapter
from .reporting import ReportEngine


@dataclass
class RoutineJob:
    job_id: str
    name: str
    cadence: str  # daily / weekly / monthly
    run: Callable[[str], str]  # period_key を受けて結果サマリを返す


@dataclass
class RoutineExecution:
    job_id: str
    period_key: str
    status: str  # completed / failed / skipped_duplicate
    summary: str
    at: str = field(default_factory=lambda: time.strftime("%H:%M:%S"))


@dataclass
class ReconciliationException:
    """突合で見つかった不一致 (人間が処理する例外キュー)"""

    kind: str
    detail: str
    period_key: str


class RoutineScheduler:
    def __init__(
        self,
        sap: SapAdapter,
        sharepoint: SharePointAdapter,
        teams: TeamsAdapter,
        reports: ReportEngine,
    ) -> None:
        self.sap = sap
        self.sharepoint = sharepoint
        self.teams = teams
        self.reports = reports
        self.executions: list[RoutineExecution] = []
        self.exceptions: list[ReconciliationException] = []
        # (job_id, period_key) → 実行済み (冪等性)
        self._done: set[tuple[str, str]] = set()

        self.jobs: list[RoutineJob] = [
            RoutineJob("monthly_vendor_report", "月次ベンダー別支払レポート", "monthly", self._job_monthly_report),
            RoutineJob("weekly_open_po_reminder", "未消込POリマインド", "weekly", self._job_po_reminder),
            RoutineJob("daily_reconciliation", "SAP×台帳 突合チェック", "daily", self._job_reconciliation),
        ]

    # ------------------------------------------------------------
    # スケジューラ本体
    # ------------------------------------------------------------

    def tick(self, now: str) -> list[RoutineExecution]:
        """スケジュール起動 (本番: PAスケジュールトリガー→Webhook)。

        now は "YYYY-MM-DD" 。cadenceごとに期間キーを計算し、
        未実行の (job, period) だけを実行する。
        """
        results: list[RoutineExecution] = []
        for job in self.jobs:
            period_key = self._period_key(job.cadence, now)
            if (job.job_id, period_key) in self._done:
                results.append(
                    RoutineExecution(job.job_id, period_key, "skipped_duplicate", "実行済みのためスキップ (冪等性)")
                )
                continue
            try:
                summary = job.run(period_key)
                self._done.add((job.job_id, period_key))
                execution = RoutineExecution(job.job_id, period_key, "completed", summary)
            except Exception as error:  # noqa: BLE001 - ジョブ失敗は記録してエスカレーション
                execution = RoutineExecution(job.job_id, period_key, "failed", str(error))
                self.teams.post("ops-channel", f"⚠ ルーティン {job.name} ({period_key}) が失敗: {error}")
            self.executions.append(execution)
            results.append(execution)
        return results

    @staticmethod
    def _period_key(cadence: str, now: str) -> str:
        year, month, day = now.split("-")
        if cadence == "monthly":
            return f"{year}-{month}"
        if cadence == "weekly":
            import datetime

            iso = datetime.date(int(year), int(month), int(day)).isocalendar()
            return f"{iso.year}-W{iso.week:02d}"
        return now  # daily

    # ------------------------------------------------------------
    # ジョブ定義
    # ------------------------------------------------------------

    def _job_monthly_report(self, period_key: str) -> str:
        """月次レポート: 前月分をレポートエンジン経由で生成 (経路を共通化)"""
        year, month = map(int, period_key.split("-"))
        prev = f"{year - 1}-12" if month == 1 else f"{year}-{month - 1:02d}"
        run = self.reports.handle_request(
            "keiri-team-channel", "system", f"{prev}のベンダー別支払一覧を出力"
        )
        if run.state != "completed":
            raise RuntimeError(f"レポート生成に失敗: {run.outcome}")
        return run.outcome or ""

    def _job_po_reminder(self, period_key: str) -> str:
        pos = self.sap.list_open_pos()
        if not pos:
            return "未消込POなし (通知不要)"
        lines = "\n".join(f"  - {po.po_number} {po.vendor} 残額 ¥{po.open_amount_jpy:,}" for po in pos)
        self.teams.post("koubai-channel", f"【{period_key}】未消込POが {len(pos)} 件あります:\n{lines}")
        return f"未消込PO {len(pos)} 件を購買チャネルへリマインド"

    def _job_reconciliation(self, period_key: str) -> str:
        """SAP伝票とSharePoint台帳の双方向突合。不一致は例外キューへ。"""
        sap_keys = {doc.invoice_no for doc in self.sap.all_documents()}
        ledger_keys = {row["invoice_no"] for row in self.sharepoint.dump_ledger()}

        missing_in_ledger = sap_keys - ledger_keys
        missing_in_sap = ledger_keys - sap_keys
        for invoice_no in sorted(missing_in_ledger):
            self.exceptions.append(
                ReconciliationException("ledger-missing", f"SAP伝票あり・台帳なし: {invoice_no}", period_key)
            )
        for invoice_no in sorted(missing_in_sap):
            self.exceptions.append(
                ReconciliationException("sap-missing", f"台帳あり・SAP伝票なし: {invoice_no}", period_key)
            )

        mismatch = len(missing_in_ledger) + len(missing_in_sap)
        if mismatch:
            self.teams.post(
                "ops-channel",
                f"【突合 {period_key}】不一致 {mismatch} 件を検出。例外キューを確認してください。",
            )
            return f"突合NG: 不一致 {mismatch} 件を例外キューに登録"
        return f"突合OK: SAP {len(sap_keys)} 件 = 台帳 {len(ledger_keys)} 件"
