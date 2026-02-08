"""
Signal Aggregator — The Decision Engine.

Combines all signal sources (SMT, FVG, Killzone) into a single
confluence-weighted TradeSignal. Only STRONG signals (all 3 aligned)
are acted upon by default.

Flow:
  1. SMT divergence fires a raw signal (direction + timing)
  2. Check if price is near/in an active FVG (entry refinement)
  3. Confirm we're inside a killzone (timing filter)
  4. Risk manager validates position sizing and risk limits
  5. Emit a fully-qualified TradeSignal or reject
"""

from __future__ import annotations

import logging
from datetime import datetime
from typing import Optional

from trading_system.config import SystemConfig
from trading_system.core.fvg_detector import FVGDetector
from trading_system.core.killzones import KillzoneFilter
from trading_system.core.smt_divergence import SMTDivergenceDetector
from trading_system.risk.risk_manager import RiskManager
from trading_system.utils.types import (
    AccountState,
    Candle,
    FairValueGap,
    Side,
    SignalStrength,
    SMTSignal,
    TradeSignal,
)

logger = logging.getLogger(__name__)


class SignalAggregator:
    """
    Orchestrates signal detection and produces actionable trade signals.
    """

    def __init__(self, config: SystemConfig):
        self.cfg = config
        self.smt_detector = SMTDivergenceDetector(config.smt)
        self.fvg_detector = FVGDetector(config.fvg)
        self.killzone_filter = KillzoneFilter(config.killzone)
        self.risk_manager = RiskManager(config.topstep, config.risk)

    def evaluate(
        self,
        nq_candles: list[Candle],
        es_candles: list[Candle],
        ym_candles: list[Candle],
        account: AccountState,
        current_time: datetime,
    ) -> Optional[TradeSignal]:
        """
        Main evaluation loop. Called on each new candle.
        Returns a TradeSignal if all conditions align, else None.
        """
        # --- Gate check: can we trade at all? ---
        can_trade, reason = self.risk_manager.can_trade(account, current_time)
        if not can_trade:
            logger.info("Trade blocked: %s", reason)
            return None

        # --- Detect SMT divergences against both ES and YM ---
        smt_signals: list[SMTSignal] = []
        smt_signals.extend(
            self.smt_detector.detect(nq_candles, es_candles, "ES")
        )
        smt_signals.extend(
            self.smt_detector.detect(nq_candles, ym_candles, "YM")
        )

        if not smt_signals:
            return None

        # Use the most recent SMT signal
        latest_smt = smt_signals[-1]

        # --- Check if we're in a killzone ---
        active_kz = self.killzone_filter.get_active_killzone(current_time)
        has_killzone = active_kz is not None

        # --- Find active FVGs ---
        all_fvgs = self.fvg_detector.detect_fvgs(nq_candles)
        self.fvg_detector.update_fill_status(all_fvgs, nq_candles)
        current_bar = len(nq_candles) - 1
        active_fvgs = self.fvg_detector.get_active_fvgs(all_fvgs, current_bar)

        # Find an FVG that aligns with the SMT signal direction
        matching_fvg = self._find_matching_fvg(
            latest_smt.side, nq_candles[-1].close, active_fvgs
        )
        has_fvg = matching_fvg is not None

        # --- Calculate confluence strength ---
        strength = self._calc_strength(
            has_smt=True, has_fvg=has_fvg, has_killzone=has_killzone
        )

        # Only take STRONG signals (all 3 factors) by default
        if strength.value < SignalStrength.STRONG.value:
            logger.debug(
                "Signal rejected: strength=%s (SMT=%s, FVG=%s, KZ=%s)",
                strength.name,
                True,
                has_fvg,
                has_killzone,
            )
            return None

        # --- Calculate entry, stops, sizing ---
        entry_price = nq_candles[-1].close
        stop_distance = self.cfg.risk.default_stop_points

        # If we have an FVG, refine entry
        if matching_fvg is not None:
            entry_price, stop_distance = self._refine_entry_with_fvg(
                latest_smt.side, matching_fvg, entry_price
            )

        stop_loss, take_profit = self.risk_manager.calculate_stops(
            entry_price, latest_smt.side, stop_distance
        )

        contracts = self.risk_manager.calculate_position_size(
            account, stop_distance
        )
        if contracts == 0:
            logger.info("Position size = 0; risk budget exhausted")
            return None

        signal = TradeSignal(
            timestamp=current_time,
            side=latest_smt.side,
            entry_price=entry_price,
            stop_loss=stop_loss,
            take_profit=take_profit,
            strength=strength,
            contracts=contracts,
            smt_signal=latest_smt,
            fvg_zone=matching_fvg,
            killzone=active_kz,
            notes=(
                f"SMT({latest_smt.correlated_symbol}) "
                f"div={latest_smt.divergence_ticks:.0f}t "
                f"corr={latest_smt.correlation_at_signal:.3f} | "
                f"FVG={'yes' if has_fvg else 'no'} | "
                f"KZ={active_kz or 'none'}"
            ),
        )
        logger.info("SIGNAL: %s %s @ %.2f | %s", signal.side.name,
                     contracts, entry_price, signal.notes)
        return signal

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------
    @staticmethod
    def _calc_strength(
        has_smt: bool, has_fvg: bool, has_killzone: bool
    ) -> SignalStrength:
        score = sum([has_smt, has_fvg, has_killzone])
        if score >= 3:
            return SignalStrength.STRONG
        elif score == 2:
            return SignalStrength.MODERATE
        return SignalStrength.WEAK

    @staticmethod
    def _find_matching_fvg(
        side: Side,
        current_price: float,
        fvgs: list[FairValueGap],
    ) -> Optional[FairValueGap]:
        """Find an FVG that aligns with the signal and is near current price."""
        for fvg in reversed(fvgs):  # Most recent first
            # Bullish SMT -> look for bullish FVG to buy into
            if side == Side.LONG and fvg.is_bullish:
                # Price should be near the FVG zone (within or slightly above)
                if fvg.low <= current_price <= fvg.high * 1.002:
                    return fvg
            # Bearish SMT -> look for bearish FVG to sell into
            elif side == Side.SHORT and not fvg.is_bullish:
                if fvg.low * 0.998 <= current_price <= fvg.high:
                    return fvg
        return None

    @staticmethod
    def _refine_entry_with_fvg(
        side: Side,
        fvg: FairValueGap,
        fallback_price: float,
    ) -> tuple[float, float]:
        """
        Refine entry price using FVG zone.
        Returns (entry_price, stop_distance).
        """
        if side == Side.LONG:
            # Enter at the top of the bullish FVG
            entry = fvg.high
            # Stop below the FVG
            stop_dist = entry - fvg.low + 2.0  # 2 points buffer
        else:
            # Enter at the bottom of the bearish FVG
            entry = fvg.low
            # Stop above the FVG
            stop_dist = fvg.high - entry + 2.0
        return entry, max(stop_dist, 4.0)  # Minimum 4 points stop
