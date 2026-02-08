"""
Fair Value Gap (FVG) Detection Module.

ICT Concept: A Fair Value Gap is a three-candle pattern where:
  - Bullish FVG: Candle[i-1].high < Candle[i+1].low  (gap up that isn't filled)
  - Bearish FVG: Candle[i-1].low > Candle[i+1].high  (gap down that isn't filled)

The gap represents an imbalance — institutional orders were so aggressive
that price left behind an "unfair" zone. Price tends to revisit these
zones before continuing, making them ideal entry zones after an SMT signal.
"""

from __future__ import annotations

from trading_system.config import FVGConfig
from trading_system.utils.types import Candle, FairValueGap


class FVGDetector:
    """Detect and track Fair Value Gaps."""

    def __init__(self, config: FVGConfig):
        self.cfg = config

    def detect_fvgs(self, candles: list[Candle]) -> list[FairValueGap]:
        """
        Scan candle array for Fair Value Gaps.
        Returns list of FVG objects with their fill status.
        """
        fvgs: list[FairValueGap] = []
        tick_size = 0.25  # NQ tick size

        for i in range(1, len(candles) - 1):
            prev_candle = candles[i - 1]
            curr_candle = candles[i]
            next_candle = candles[i + 1]

            # --- Bullish FVG: gap between prev.high and next.low ---
            if next_candle.low > prev_candle.high:
                gap_size = next_candle.low - prev_candle.high
                gap_ticks = gap_size / tick_size
                if gap_ticks >= self.cfg.min_gap_ticks:
                    fvgs.append(
                        FairValueGap(
                            timestamp=curr_candle.timestamp,
                            high=next_candle.low,
                            low=prev_candle.high,
                            is_bullish=True,
                            bar_index=i,
                        )
                    )

            # --- Bearish FVG: gap between next.high and prev.low ---
            if prev_candle.low > next_candle.high:
                gap_size = prev_candle.low - next_candle.high
                gap_ticks = gap_size / tick_size
                if gap_ticks >= self.cfg.min_gap_ticks:
                    fvgs.append(
                        FairValueGap(
                            timestamp=curr_candle.timestamp,
                            high=prev_candle.low,
                            low=next_candle.high,
                            is_bullish=False,
                            bar_index=i,
                        )
                    )

        return fvgs

    def update_fill_status(
        self, fvgs: list[FairValueGap], candles: list[Candle]
    ) -> list[FairValueGap]:
        """
        Update FVG fill status based on subsequent price action.
        An FVG is filled when price trades through 50%+ of the gap.
        """
        for fvg in fvgs:
            if fvg.filled:
                continue
            gap_mid = (fvg.high + fvg.low) / 2.0
            for candle in candles:
                if candle.timestamp <= fvg.timestamp:
                    continue
                if fvg.is_bullish:
                    # Bullish FVG fills when price drops into it
                    if candle.low <= gap_mid:
                        fvg.fill_pct = min(
                            1.0,
                            (fvg.high - candle.low) / (fvg.high - fvg.low),
                        )
                        if fvg.fill_pct >= 0.5:
                            fvg.filled = True
                            break
                else:
                    # Bearish FVG fills when price rises into it
                    if candle.high >= gap_mid:
                        fvg.fill_pct = min(
                            1.0,
                            (candle.high - fvg.low) / (fvg.high - fvg.low),
                        )
                        if fvg.fill_pct >= 0.5:
                            fvg.filled = True
                            break
        return fvgs

    def get_active_fvgs(
        self,
        fvgs: list[FairValueGap],
        current_bar_index: int,
    ) -> list[FairValueGap]:
        """Return FVGs that are still active (not fully filled, not expired)."""
        active: list[FairValueGap] = []
        for fvg in fvgs:
            age = current_bar_index - fvg.bar_index
            if not fvg.filled and age <= self.cfg.max_age_candles:
                active.append(fvg)
        return active

    def price_in_fvg(self, price: float, fvg: FairValueGap) -> bool:
        """Check if a price is within an FVG zone."""
        return fvg.low <= price <= fvg.high
