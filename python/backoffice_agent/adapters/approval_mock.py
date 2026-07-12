"""HITL承認アダプタ (モック)

本番実装の差し替え先: Power Automate 承認フロー
  - HTTPトリガーで承認フローを起動 (summary / diff / 根拠を渡す)
  - 承認者のTeams/Outlookに承認カードが届き、モバイルでも決裁できる
  - 結果はコールバックURLでエージェントに返る (非同期)
  - タイムアウト時は自動エスカレーション

モックでは承認リクエストをキューに積み、decide() で決裁を模擬する。
"""

from __future__ import annotations

from ..models import ApprovalRequest


class ApprovalAdapter:
    def __init__(self) -> None:
        self._approvals: dict[str, ApprovalRequest] = {}
        self._seq = 0

    def request(self, run_id: str, action: str, summary: str, diff: list) -> ApprovalRequest:
        self._seq += 1
        approval = ApprovalRequest(
            approval_id=f"apr-{self._seq}",
            run_id=run_id,
            action=action,
            summary=summary,
            diff=diff,
        )
        self._approvals[approval.approval_id] = approval
        return approval

    def decide(self, approval_id: str, approve: bool, decided_by: str) -> ApprovalRequest:
        approval = self._approvals[approval_id]
        if approval.status != "pending":
            raise RuntimeError(f"{approval_id} は決裁済みです")
        approval.status = "approved" if approve else "rejected"
        approval.decided_by = decided_by
        return approval

    def pending(self) -> list[ApprovalRequest]:
        return [a for a in self._approvals.values() if a.status == "pending"]
