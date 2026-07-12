"""バックオフィスAIエージェント - データモデル

docs/BACKOFFICE_AI_ARCHITECTURE.md §8 のリファレンス実装。
TypeScript版 (src/support-agent/types.ts) と同じ構造をPythonで表現する。
"""

from __future__ import annotations

import time
from dataclasses import dataclass, field
from enum import Enum


class RiskLevel(str, Enum):
    L0 = "L0"  # 参照のみ → 自動
    L1 = "L1"  # 可逆write → 自動 + 事後通知
    L2 = "L2"  # 不可逆・金銭 → HITL承認必須 (上限以下の例外あり)


class RunState(str, Enum):
    RUNNING = "running"
    AWAITING_APPROVAL = "awaiting_approval"
    COMPLETED = "completed"
    ESCALATED = "escalated"
    BLOCKED = "blocked"


@dataclass
class InvoiceData:
    """請求書から抽出された構造化データ (本番はClaude visionで抽出)"""

    vendor: str
    invoice_no: str
    invoice_date: str
    amount_jpy: int
    tax_jpy: int
    po_number: str | None
    line_items: list[tuple[str, int]]  # (品目, 金額)


@dataclass
class Step:
    kind: str  # info / llm / tool / guardrail / verify / hitl
    name: str
    detail: str
    ok: bool
    at: float = field(default_factory=time.time)


@dataclass
class AuditEntry:
    run_id: str
    tool: str
    input_desc: str
    output_desc: str
    ok: bool
    at: float = field(default_factory=time.time)


@dataclass
class ApprovalRequest:
    """Power Automate承認フローに相当 (モックでは同期コールバック)"""

    approval_id: str
    run_id: str
    action: str
    summary: str
    diff: list[tuple[str, str, str]]  # (項目, before, after)
    status: str = "pending"  # pending / approved / rejected
    decided_by: str | None = None


@dataclass
class Run:
    run_id: str
    task_kind: str
    source_ref: str  # 例: SharePoint上のファイルパス
    idempotency_key: str
    risk: RiskLevel
    state: RunState = RunState.RUNNING
    steps: list[Step] = field(default_factory=list)
    outcome: str | None = None
    sap_document_no: str | None = None
