"""Teams通知アダプタ (モック)

本番実装の差し替え先:
  - Power Automate「Teamsメッセージ投稿」フロー (HTTPトリガー) or
  - Microsoft Graph (chatMessage) / Incoming Webhook
"""

from __future__ import annotations

import time
from dataclasses import dataclass, field


@dataclass
class TeamsMessage:
    to: str
    text: str
    at: str = field(default_factory=lambda: time.strftime("%H:%M:%S"))


class TeamsAdapter:
    def __init__(self) -> None:
        self.messages: list[TeamsMessage] = []

    def post(self, to: str, text: str) -> None:
        self.messages.append(TeamsMessage(to=to, text=text))
