"""
Topstep-Compliant Risk Management Module.

This is the most critical module in the system. It enforces:

1. Daily Loss Limit: Hard stop at 80% of max daily loss (configurable).
   When hit, ALL positions close and trading halts for the day.

2. Trailing Max Drawdown: Topstep's trailing drawdown rule means
   the floor rises as your account hits new highs. We track this
   tick-by-tick and kill trading before breaching.

3. Position Sizing: Dynamic lot calculation based on:
   - Account risk budget per trade
   - Distance to stop loss
   - Remaining daily loss capacity

4. Consecutive Loss Circuit Breaker: After N consecutive losses,
   force a cooldown period.

NO OVERRIDES. NO MANUAL BYPASS. This module has final authority.
"""

from __future__ import annotations

import logging
from datetime import datetime, timedelta
from typing import Optional

from trading_system.config import RiskConfig, TopstepRules
from trading_system.utils.types import AccountState, Side, Trade, TradeSignal

logger = logging.getLogger(__name__)


class RiskManager:
    """Enforces all risk rules. Has veto power over any trade."""

    def __init__(self, rules: TopstepRules, risk_cfg: RiskConfig):
        self.rules = rules
        self.cfg = risk_cfg
        self._cooldown_until: Optional[datetime] = None

    # ------------------------------------------------------------------
    # Pre-trade validation
    # ------------------------------------------------------------------
    def can_trade(self, account: AccountState, now: datetime) -> tuple[bool, str]:
        """
        Master gate check. Returns (allowed, reason).
        Called BEFORE any signal is acted upon.
        """
        # 1. Account halted?
        if account.is_halted:
            return False, f"Account halted: {account.halt_reason}"

        # 2. Daily loss limit (80% threshold)
        daily_limit_threshold = (
            self.rules.max_daily_loss * self.rules.daily_loss_kill_pct
        )
        if abs(account.daily_pnl) >= daily_limit_threshold and account.daily_pnl < 0:
            self._halt_account(
                account,
                f"Daily loss at {abs(account.daily_pnl):.2f} "
                f"(limit: {daily_limit_threshold:.2f})",
            )
            return False, account.halt_reason

        # 3. Trailing drawdown
        if account.trailing_drawdown >= self.rules.max_trailing_drawdown * 0.90:
            self._halt_account(
                account,
                f"Trailing drawdown at {account.trailing_drawdown:.2f} "
                f"(90% of max {self.rules.max_trailing_drawdown:.2f})",
            )
            return False, account.halt_reason

        # 4. Max contracts
        if account.open_positions >= self.rules.max_contracts:
            return False, f"Max contracts reached: {account.open_positions}"

        # 5. Consecutive loss cooldown
        if account.consecutive_losses >= self.cfg.max_consecutive_losses:
            if self._cooldown_until is None:
                self._cooldown_until = now + timedelta(
                    minutes=self.cfg.loss_cooldown_minutes
                )
                logger.warning(
                    "Consecutive loss limit hit (%d). Cooldown until %s",
                    account.consecutive_losses,
                    self._cooldown_until,
                )
            if now < self._cooldown_until:
                remaining = (self._cooldown_until - now).seconds // 60
                return False, f"Cooldown active: {remaining} minutes remaining"
            else:
                # Cooldown expired, reset
                self._cooldown_until = None
                account.consecutive_losses = 0

        return True, "OK"

    # ------------------------------------------------------------------
    # Position sizing
    # ------------------------------------------------------------------
    def calculate_position_size(
        self,
        account: AccountState,
        stop_distance_points: float,
    ) -> int:
        """
        Calculate number of contracts based on:
        - Risk per trade (% of account or hard cap)
        - Stop distance
        - Remaining daily loss capacity
        """
        if stop_distance_points <= 0:
            return 0

        # Risk budget for this trade
        risk_pct_amount = account.current_balance * self.cfg.risk_per_trade_pct
        risk_budget = min(risk_pct_amount, self.cfg.max_risk_per_trade)

        # How much room do we have left in daily loss?
        daily_remaining = (
            self.rules.max_daily_loss * self.rules.daily_loss_kill_pct
        ) - abs(min(account.daily_pnl, 0))
        risk_budget = min(risk_budget, daily_remaining * 0.5)

        if risk_budget <= 0:
            return 0

        # Dollar risk per contract = stop_distance * point_value
        risk_per_contract = stop_distance_points * self.rules.point_value
        if risk_per_contract <= 0:
            return 0

        contracts = int(risk_budget / risk_per_contract)
        # Clamp to max contracts
        contracts = min(contracts, self.rules.max_contracts - account.open_positions)
        # At least 1 if we have budget
        return max(contracts, 1) if risk_budget > risk_per_contract * 0.5 else 0

    # ------------------------------------------------------------------
    # Stop / Target calculation
    # ------------------------------------------------------------------
    def calculate_stops(
        self,
        entry_price: float,
        side: Side,
        stop_distance: Optional[float] = None,
    ) -> tuple[float, float]:
        """
        Calculate stop loss and take profit prices.
        Returns (stop_loss, take_profit).
        """
        sd = stop_distance or self.cfg.default_stop_points
        rr = self.cfg.min_reward_risk

        if side == Side.LONG:
            stop_loss = entry_price - sd
            take_profit = entry_price + (sd * rr)
        else:
            stop_loss = entry_price + sd
            take_profit = entry_price - (sd * rr)

        return stop_loss, take_profit

    # ------------------------------------------------------------------
    # Trade result processing
    # ------------------------------------------------------------------
    def process_trade_result(self, account: AccountState, trade: Trade) -> None:
        """Update account state after a trade closes."""
        account.daily_pnl += trade.net_pnl
        account.current_balance += trade.net_pnl
        account.open_positions = max(0, account.open_positions - trade.contracts)
        account.trades_today.append(trade)
        account.update_peak()

        if trade.net_pnl < 0:
            account.consecutive_losses += 1
        else:
            account.consecutive_losses = 0

        logger.info(
            "Trade closed: PnL=%.2f | Daily=%.2f | Balance=%.2f | ConsecLoss=%d",
            trade.net_pnl,
            account.daily_pnl,
            account.current_balance,
            account.consecutive_losses,
        )

    # ------------------------------------------------------------------
    # Trailing stop management
    # ------------------------------------------------------------------
    def check_trailing_stop(
        self,
        trade: Trade,
        current_price: float,
    ) -> Optional[float]:
        """
        Returns new stop price if trailing stop should be updated, else None.
        Only activates after price moves trailing_activation_points in profit.
        """
        entry = trade.entry_price
        side = trade.signal.side

        if side == Side.LONG:
            profit_points = current_price - entry
            if profit_points >= self.cfg.trailing_activation_points:
                new_stop = current_price - self.cfg.trailing_distance_points
                current_stop = trade.signal.stop_loss
                if new_stop > current_stop:
                    return new_stop
        else:
            profit_points = entry - current_price
            if profit_points >= self.cfg.trailing_activation_points:
                new_stop = current_price + self.cfg.trailing_distance_points
                current_stop = trade.signal.stop_loss
                if new_stop < current_stop:
                    return new_stop
        return None

    # ------------------------------------------------------------------
    # Emergency actions
    # ------------------------------------------------------------------
    def _halt_account(self, account: AccountState, reason: str) -> None:
        """Halt all trading activity."""
        account.is_halted = True
        account.halt_reason = reason
        logger.critical("ACCOUNT HALTED: %s", reason)

    def force_close_all(self, account: AccountState, reason: str) -> None:
        """Signal that all positions must be closed immediately."""
        self._halt_account(account, f"FORCE CLOSE: {reason}")
        logger.critical(
            "FORCE CLOSE ALL POSITIONS. Reason: %s | Daily PnL: %.2f",
            reason,
            account.daily_pnl,
        )
