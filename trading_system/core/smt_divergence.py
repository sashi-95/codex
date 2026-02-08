"""
SMT (Smart Money Technique) Divergence Detection Engine.

Core concept:
  When NQ makes a new high but ES/YM fails to confirm (or vice versa),
  smart money is likely distributing/accumulating. This divergence
  is the primary entry trigger.

Detection algorithm:
  1. Identify swing highs/lows on both NQ and the correlated instrument.
  2. Compare: If NQ makes a higher high but the correlated instrument
     makes a lower high -> bearish SMT divergence (short signal).
  3. Inverse for bullish: NQ makes a lower low but correlated makes
     a higher low -> bullish SMT divergence (long signal).
  4. Validate that rolling correlation has broken down below threshold,
     confirming the divergence is structural, not noise.
"""

from __future__ import annotations

from typing import Optional

import numpy as np

from trading_system.config import SMTConfig
from trading_system.utils.types import (
    Candle,
    Side,
    SignalStrength,
    SMTSignal,
    SwingPoint,
)


class SMTDivergenceDetector:
    """Detects SMT divergences between NQ and a correlated instrument."""

    def __init__(self, config: SMTConfig):
        self.cfg = config

    # ------------------------------------------------------------------
    # Swing point detection
    # ------------------------------------------------------------------
    def find_swing_highs(
        self, candles: list[Candle], lookback: int | None = None
    ) -> list[SwingPoint]:
        """Find swing highs: a bar whose high is the highest in +-lookback window."""
        lb = lookback or self.cfg.swing_lookback
        swings: list[SwingPoint] = []
        highs = np.array([c.high for c in candles])
        for i in range(lb, len(candles) - lb):
            window = highs[i - lb : i + lb + 1]
            if highs[i] == np.max(window):
                swings.append(
                    SwingPoint(
                        timestamp=candles[i].timestamp,
                        price=candles[i].high,
                        is_high=True,
                        index=i,
                    )
                )
        return swings

    def find_swing_lows(
        self, candles: list[Candle], lookback: int | None = None
    ) -> list[SwingPoint]:
        """Find swing lows: a bar whose low is the lowest in +-lookback window."""
        lb = lookback or self.cfg.swing_lookback
        swings: list[SwingPoint] = []
        lows = np.array([c.low for c in candles])
        for i in range(lb, len(candles) - lb):
            window = lows[i - lb : i + lb + 1]
            if lows[i] == np.min(window):
                swings.append(
                    SwingPoint(
                        timestamp=candles[i].timestamp,
                        price=candles[i].low,
                        is_high=False,
                        index=i,
                    )
                )
        return swings

    # ------------------------------------------------------------------
    # Rolling correlation
    # ------------------------------------------------------------------
    @staticmethod
    def rolling_correlation(
        series_a: np.ndarray, series_b: np.ndarray, window: int
    ) -> np.ndarray:
        """Compute rolling Pearson correlation between two price series."""
        n = len(series_a)
        corr = np.full(n, np.nan)
        for i in range(window, n):
            a_slice = series_a[i - window : i]
            b_slice = series_b[i - window : i]
            if np.std(a_slice) == 0 or np.std(b_slice) == 0:
                corr[i] = 1.0  # No movement = no divergence
            else:
                corr[i] = np.corrcoef(a_slice, b_slice)[0, 1]
        return corr

    # ------------------------------------------------------------------
    # Core divergence detection
    # ------------------------------------------------------------------
    def detect(
        self,
        nq_candles: list[Candle],
        correlated_candles: list[Candle],
        correlated_symbol: str = "ES",
    ) -> list[SMTSignal]:
        """
        Detect SMT divergences between NQ and a correlated instrument.

        Returns a list of SMTSignal objects, one per detected divergence.
        """
        if len(nq_candles) != len(correlated_candles):
            raise ValueError(
                "NQ and correlated candle arrays must have the same length"
            )

        signals: list[SMTSignal] = []

        # Find swing points on both instruments
        nq_highs = self.find_swing_highs(nq_candles)
        nq_lows = self.find_swing_lows(nq_candles)
        corr_highs = self.find_swing_highs(correlated_candles)
        corr_lows = self.find_swing_lows(correlated_candles)

        # Compute rolling correlation
        nq_closes = np.array([c.close for c in nq_candles])
        corr_closes = np.array([c.close for c in correlated_candles])
        rolling_corr = self.rolling_correlation(
            nq_closes, corr_closes, self.cfg.correlation_window
        )

        # --- Bearish SMT: NQ higher high, correlated lower high ---
        signals.extend(
            self._detect_bearish_smt(
                nq_highs, corr_highs, rolling_corr, correlated_symbol
            )
        )

        # --- Bullish SMT: NQ lower low, correlated higher low ---
        signals.extend(
            self._detect_bullish_smt(
                nq_lows, corr_lows, rolling_corr, correlated_symbol
            )
        )

        # Sort by timestamp
        signals.sort(key=lambda s: s.timestamp)
        return signals

    def _detect_bearish_smt(
        self,
        nq_highs: list[SwingPoint],
        corr_highs: list[SwingPoint],
        rolling_corr: np.ndarray,
        corr_symbol: str,
    ) -> list[SMTSignal]:
        """NQ makes higher high, correlated makes lower high -> bearish."""
        signals: list[SMTSignal] = []
        for i in range(1, len(nq_highs)):
            nq_prev, nq_curr = nq_highs[i - 1], nq_highs[i]
            # NQ higher high?
            if nq_curr.price <= nq_prev.price:
                continue
            # Find the correlated swing high closest in time to nq_curr
            corr_swing = self._find_nearest_swing(corr_highs, nq_curr.index)
            corr_prev = self._find_prev_swing(corr_highs, corr_swing)
            if corr_swing is None or corr_prev is None:
                continue
            # Correlated lower high?
            if corr_swing.price >= corr_prev.price:
                continue
            # Check divergence magnitude
            div_ticks = abs(nq_curr.price - nq_prev.price) / 0.25
            if div_ticks < self.cfg.min_divergence_ticks:
                continue
            # Check correlation breakdown
            idx = min(nq_curr.index, len(rolling_corr) - 1)
            corr_val = rolling_corr[idx]
            if np.isnan(corr_val) or corr_val > self.cfg.correlation_breakdown:
                continue
            signals.append(
                SMTSignal(
                    timestamp=nq_curr.timestamp,
                    side=Side.SHORT,
                    nq_swing=nq_curr,
                    correlated_swing=corr_swing,
                    correlated_symbol=corr_symbol,
                    divergence_ticks=div_ticks,
                    correlation_at_signal=float(corr_val),
                )
            )
        return signals

    def _detect_bullish_smt(
        self,
        nq_lows: list[SwingPoint],
        corr_lows: list[SwingPoint],
        rolling_corr: np.ndarray,
        corr_symbol: str,
    ) -> list[SMTSignal]:
        """NQ makes lower low, correlated makes higher low -> bullish."""
        signals: list[SMTSignal] = []
        for i in range(1, len(nq_lows)):
            nq_prev, nq_curr = nq_lows[i - 1], nq_lows[i]
            # NQ lower low?
            if nq_curr.price >= nq_prev.price:
                continue
            # Find correlated swing
            corr_swing = self._find_nearest_swing(corr_lows, nq_curr.index)
            corr_prev = self._find_prev_swing(corr_lows, corr_swing)
            if corr_swing is None or corr_prev is None:
                continue
            # Correlated higher low?
            if corr_swing.price <= corr_prev.price:
                continue
            # Check divergence magnitude
            div_ticks = abs(nq_prev.price - nq_curr.price) / 0.25
            if div_ticks < self.cfg.min_divergence_ticks:
                continue
            # Check correlation breakdown
            idx = min(nq_curr.index, len(rolling_corr) - 1)
            corr_val = rolling_corr[idx]
            if np.isnan(corr_val) or corr_val > self.cfg.correlation_breakdown:
                continue
            signals.append(
                SMTSignal(
                    timestamp=nq_curr.timestamp,
                    side=Side.LONG,
                    nq_swing=nq_curr,
                    correlated_swing=corr_swing,
                    correlated_symbol=corr_symbol,
                    divergence_ticks=div_ticks,
                    correlation_at_signal=float(corr_val),
                )
            )
        return signals

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------
    @staticmethod
    def _find_nearest_swing(
        swings: list[SwingPoint], target_index: int
    ) -> Optional[SwingPoint]:
        """Find the swing point closest in bar index to target."""
        if not swings:
            return None
        return min(swings, key=lambda s: abs(s.index - target_index))

    @staticmethod
    def _find_prev_swing(
        swings: list[SwingPoint], current: Optional[SwingPoint]
    ) -> Optional[SwingPoint]:
        """Find the swing point immediately before current in the list."""
        if current is None or not swings:
            return None
        prev = None
        for s in swings:
            if s.index >= current.index:
                break
            prev = s
        return prev
