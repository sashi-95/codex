"""SharePointアダプタ (モック)

本番実装の差し替え先: Microsoft Graph API
  - アプリ登録 + Sites.Selected 権限 (テナント全体権限は付与しない)
  - 受領請求書ライブラリの監視は Power Automate 側 (新着→Webhook) が担当
  - このアダプタは台帳 (処理結果リスト) への追記と成果物保存を担当
"""

from __future__ import annotations

import time


class SharePointAdapter:
    """モックSharePoint: 処理台帳リストへの追記"""

    def __init__(self) -> None:
        self.ledger: list[dict] = []

    def append_ledger_row(self, row: dict) -> None:
        self.ledger.append({**row, "recorded_at": time.strftime("%H:%M:%S")})

    def dump_ledger(self) -> list[dict]:
        return list(self.ledger)
