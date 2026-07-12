"""レポート抽出支援 - 自然言語依頼からの定型レポート生成

ユーザーが Teams / Power Apps から自然言語で依頼:
  「2026-06のベンダー別支払一覧をExcelでください」
  → LLMが依頼を【レポートカタログ】の項目にマッピング (判断のみ)
  → 権限チェック (ロール別・コードで強制)
  → SAP抽出 → 集計 → SharePoint保存 → Teamsでリンク返信 (実行はコード)

最重要ガードレール = レポートカタログ:
  LLMは任意のSQL/RFCを組み立てられない。カタログに定義済みの
  データセットとパラメータの組み合わせしか実行されないため、
  プロンプトインジェクションが成立しても未定義データには到達できない。
"""

from __future__ import annotations

import re
import time
from dataclasses import dataclass, field

from .adapters.sap_mock import SapAdapter
from .adapters.sharepoint_mock import SharePointAdapter
from .adapters.teams_mock import TeamsAdapter
from .models import Step

# ============================================================
# レポートカタログ (許可されたデータセットの完全な一覧)
# ============================================================


@dataclass
class CatalogEntry:
    dataset_id: str
    title: str
    keywords: list[str]
    required_roles: list[str]  # このデータセットを取得できるロール
    needs_period: bool


REPORT_CATALOG: list[CatalogEntry] = [
    CatalogEntry(
        dataset_id="vendor_payments",
        title="ベンダー別支払一覧",
        keywords=["支払", "ベンダー", "買掛"],
        required_roles=["keiri", "system"],
        needs_period=True,
    ),
    CatalogEntry(
        dataset_id="open_pos",
        title="未消込発注一覧",
        keywords=["発注", "PO", "未消込", "オープン"],
        required_roles=["keiri", "koubai", "system"],
        needs_period=False,
    ),
    CatalogEntry(
        dataset_id="payroll_summary",
        title="給与支給サマリ",
        keywords=["給与", "賞与", "支給"],
        required_roles=["jinji", "system"],
        needs_period=True,
    ),
]


# ============================================================
# 依頼の解釈 (LLM相当。本番はClaudeで構造化出力に差し替え)
# ============================================================


@dataclass
class ReportSpec:
    dataset_id: str
    period: str | None


def parse_report_request(text: str) -> ReportSpec | None:
    """自然言語依頼をカタログ項目へマッピングする (モックはキーワード)。

    本番: Claude に REPORT_CATALOG を提示し
    {"dataset_id": ..., "period": ...} を構造化出力させる。
    どちらの実装でも、返せるのはカタログに存在する dataset_id のみ。
    """
    matched = None
    for entry in REPORT_CATALOG:
        if any(kw in text for kw in entry.keywords):
            matched = entry
            break
    if matched is None:
        return None
    period = None
    m = re.search(r"(20\d{2})[-/年](\d{1,2})", text)
    if m:
        period = f"{m.group(1)}-{int(m.group(2)):02d}"
    return ReportSpec(dataset_id=matched.dataset_id, period=period)


# ============================================================
# レポートエンジン
# ============================================================


@dataclass
class ReportRun:
    run_id: str
    requester: str
    role: str
    request_text: str
    state: str = "running"  # completed / blocked / escalated
    steps: list[Step] = field(default_factory=list)
    file_url: str | None = None
    outcome: str | None = None


class ReportEngine:
    def __init__(self, sap: SapAdapter, sharepoint: SharePointAdapter, teams: TeamsAdapter) -> None:
        self.sap = sap
        self.sharepoint = sharepoint
        self.teams = teams
        self.runs: list[ReportRun] = []
        self._seq = 0

    def handle_request(self, requester: str, role: str, text: str) -> ReportRun:
        self._seq += 1
        run = ReportRun(run_id=f"rpt-{self._seq}", requester=requester, role=role, request_text=text)
        self.runs.append(run)

        # 1. LLM: 依頼→カタログマッピング (判断のみ)
        spec = parse_report_request(text)
        if spec is None:
            candidates = " / ".join(e.title for e in REPORT_CATALOG)
            self._log(run, "llm", "catalog-mapping", f"カタログに該当なし。候補提示: {candidates}", False)
            run.state = "escalated"
            run.outcome = f"依頼を解釈できませんでした。対応可能なレポート: {candidates}"
            self.teams.post(requester, f"ご依頼を特定できませんでした。対応可能なレポート: {candidates}")
            return run
        entry = next(e for e in REPORT_CATALOG if e.dataset_id == spec.dataset_id)
        self._log(run, "llm", "catalog-mapping", f"「{entry.title}」(dataset={entry.dataset_id}, period={spec.period}) にマッピング", True)

        # 2. ガードレール: ロール別アクセス制御 (コードで強制)
        if role not in entry.required_roles:
            self._log(run, "guardrail", "access-control", f"ロール {role} は {entry.dataset_id} の取得権限なし (許可: {entry.required_roles})", False)
            run.state = "blocked"
            run.outcome = f"権限不足: 「{entry.title}」は {'/'.join(entry.required_roles)} ロールのみ取得可能"
            self.teams.post(requester, f"「{entry.title}」の取得権限がありません。所属部門の管理者に依頼してください。")
            return run
        self._log(run, "guardrail", "access-control", f"ロール {role} のアクセス許可を確認", True)

        # 3. パラメータ検証
        if entry.needs_period and spec.period is None:
            self._log(run, "guardrail", "param-check", "対象期間が特定できない", False)
            run.state = "escalated"
            run.outcome = "対象期間 (例: 2026-06) を指定してください"
            self.teams.post(requester, "対象期間を「2026-06」の形式で指定してください。")
            return run

        # 4. 抽出・集計・保存 (すべて決定的コード)
        rows = self._extract(entry.dataset_id, spec.period)
        self._log(run, "tool", "sap.extract", f"{entry.dataset_id} {spec.period or ''} → {len(rows)}件", True)
        file_path = f"レポート/{entry.dataset_id}_{spec.period or 'current'}_{run.run_id}.xlsx"
        url = self.sharepoint.save_file(file_path, rows)
        self._log(run, "tool", "sharepoint.save_file", file_path, True)
        self.teams.post(requester, f"「{entry.title}」({len(rows)}件) を作成しました: {url}")
        self._log(run, "tool", "teams.post", f"{requester} へリンク送付", True)

        run.file_url = url
        run.state = "completed"
        run.outcome = f"{entry.title} ({len(rows)}件) を {url} に出力"
        return run

    # ---- データセット別の抽出 (本番: RFC/OData) ----

    def _extract(self, dataset_id: str, period: str | None) -> list[dict]:
        if dataset_id == "vendor_payments":
            return self.sap.list_vendor_payments(period or "")
        if dataset_id == "open_pos":
            return [
                {"po_number": po.po_number, "vendor": po.vendor, "open_amount_jpy": po.open_amount_jpy}
                for po in self.sap.list_open_pos()
            ]
        if dataset_id == "payroll_summary":
            # デモでは人事データは持たないため空 (権限チェックのデモ用データセット)
            return []
        raise ValueError(f"未定義のデータセット: {dataset_id}")

    def _log(self, run: ReportRun, kind: str, name: str, detail: str, ok: bool) -> None:
        run.steps.append(Step(kind=kind, name=name, detail=detail, ok=ok, at=time.time()))
