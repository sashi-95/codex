"""
ICT Killzone Time Filter.

Killzones are specific time windows where institutional order flow
is most active. Trading outside these windows dramatically increases
the probability of getting chopped out by noise.

Supported zones (all Eastern Time):
  - London Killzone:  02:00 - 05:00 ET
  - NY AM Killzone:   09:30 - 12:00 ET
  - NY PM Killzone:   13:30 - 16:00 ET
"""

from __future__ import annotations

from datetime import datetime, time

from trading_system.config import KillzoneConfig


class KillzoneFilter:
    """Determines if current time falls within a valid trading killzone."""

    def __init__(self, config: KillzoneConfig):
        self.zones: dict[str, tuple[time, time]] = {
            "london": (
                self._parse_time(config.london_start),
                self._parse_time(config.london_end),
            ),
            "ny_am": (
                self._parse_time(config.ny_am_start),
                self._parse_time(config.ny_am_end),
            ),
            "ny_pm": (
                self._parse_time(config.ny_pm_start),
                self._parse_time(config.ny_pm_end),
            ),
        }

    @staticmethod
    def _parse_time(t: str) -> time:
        parts = t.split(":")
        return time(int(parts[0]), int(parts[1]))

    def get_active_killzone(self, dt: datetime) -> str | None:
        """
        Returns the name of the currently active killzone, or None
        if we're outside all killzones.

        The datetime should be in Eastern Time.
        """
        current_time = dt.time()
        for name, (start, end) in self.zones.items():
            if start <= current_time <= end:
                return name
        return None

    def is_in_killzone(self, dt: datetime) -> bool:
        """Check if datetime falls within any killzone."""
        return self.get_active_killzone(dt) is not None

    def time_to_next_killzone(self, dt: datetime) -> tuple[str, int] | None:
        """
        Returns (killzone_name, seconds_until_start) for the next upcoming
        killzone, or None if already in a killzone.
        """
        if self.is_in_killzone(dt):
            return None

        current_time = dt.time()
        best: tuple[str, int] | None = None

        for name, (start, _) in self.zones.items():
            # Calculate seconds until this killzone starts
            now_secs = current_time.hour * 3600 + current_time.minute * 60
            start_secs = start.hour * 3600 + start.minute * 60
            diff = start_secs - now_secs
            if diff < 0:
                diff += 86400  # Next day
            if best is None or diff < best[1]:
                best = (name, diff)

        return best
