"""
Backtesting Engine.

Event-driven backtester that simulates the full trading pipeline:
  1. Feed candles bar-by-bar
  2. Run signal aggregator on each bar
  3. Execute trades with simulated fills
  4. Track PnL, drawdown, and Topstep rule compliance
  5. Generate performance analytics

This is NOT a vectorized backtester (those hide slippage and look-ahead bias).
Each bar is processed sequentially, exactly as it would be in live trading.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional

import numpy as np

from trading_system.config import SystemConfig
from trading_system.core.signal_aggregator import SignalAggregator
from trading_system.risk.risk_manager import RiskManager
from trading_system.utils.types import (
    AccountState,
    Candle,
    OrderStatus,
    Side,
    Trade,
    TradeSignal,
)

logger = logging.getLogger(__name__)


@dataclass
class BacktestResult:
    """Complete backtest output."""
    trades: list[Trade] = field(default_factory=list)
    equity_curve: list[float] = field(default_factory=list)
    daily_pnl: list[float] = field(default_factory=list)
    max_drawdown: float = 0.0
    total_pnl: float = 0.0
    win_rate: float = 0.0
    avg_winner: float = 0.0
    avg_loser: float = 0.0
    profit_factor: float = 0.0
    total_trades: int = 0
    winning_trades: int = 0
    losing_trades: int = 0
    max_consecutive_losses: int = 0
    avg_rr_achieved: float = 0.0
    sharpe_ratio: float = 0.0
    topstep_daily_limit_breaches: int = 0
    topstep_trailing_dd_breaches: int = 0
    halted_days: int = 0

    def summary(self) -> str:
        """Human-readable performance summary."""
        lines = [
            "=" * 60,
            "BACKTEST RESULTS",
            "=" * 60,
            f"Total Trades:           {self.total_trades}",
            f"Win Rate:               {self.win_rate:.1%}",
            f"Total PnL:              ${self.total_pnl:,.2f}",
            f"Avg Winner:             ${self.avg_winner:,.2f}",
            f"Avg Loser:              ${self.avg_loser:,.2f}",
            f"Profit Factor:          {self.profit_factor:.2f}",
            f"Max Drawdown:           ${self.max_drawdown:,.2f}",
            f"Max Consecutive Losses: {self.max_consecutive_losses}",
            f"Avg R:R Achieved:       {self.avg_rr_achieved:.2f}",
            f"Sharpe Ratio:           {self.sharpe_ratio:.2f}",
            "-" * 60,
            "TOPSTEP COMPLIANCE",
            f"Daily Limit Breaches:   {self.topstep_daily_limit_breaches}",
            f"Trailing DD Breaches:   {self.topstep_trailing_dd_breaches}",
            f"Halted Days:            {self.halted_days}",
            "=" * 60,
        ]
        return "\n".join(lines)


class BacktestEngine:
    """Event-driven backtester."""

    def __init__(
        self,
        config: SystemConfig,
        starting_balance: float = 50_000.0,
        commission_per_contract: float = 4.50,
        slippage_ticks: float = 1.0,
    ):
        self.cfg = config
        self.starting_balance = starting_balance
        self.commission = commission_per_contract
        self.slippage_ticks = slippage_ticks

        self.aggregator = SignalAggregator(config)
        self.risk_manager = RiskManager(config.topstep, config.risk)

    def run(
        self,
        nq_candles: list[Candle],
        es_candles: list[Candle],
        ym_candles: list[Candle],
    ) -> BacktestResult:
        """
        Run the full backtest.

        Processes candles sequentially, maintaining account state
        and executing trades as signals fire.
        """
        account = AccountState(
            starting_balance=self.starting_balance,
            current_balance=self.starting_balance,
            peak_balance=self.starting_balance,
        )

        result = BacktestResult()
        open_trades: list[Trade] = []
        current_day: Optional[datetime] = None
        daily_pnl_accumulator = 0.0

        # Minimum bars needed for analysis
        min_bars = max(
            self.cfg.smt.swing_lookback * 2 + 1,
            self.cfg.smt.correlation_window + 1,
            self.cfg.fvg.lookback,
            30,
        )

        logger.info(
            "Starting backtest: %d bars, starting balance: $%.2f",
            len(nq_candles),
            self.starting_balance,
        )

        for i in range(min_bars, len(nq_candles)):
            current_time = nq_candles[i].timestamp
            current_price = nq_candles[i].close

            # --- Day change: reset daily state ---
            if current_day is None or current_time.date() != current_day.date():
                if current_day is not None:
                    result.daily_pnl.append(daily_pnl_accumulator)
                current_day = current_time
                daily_pnl_accumulator = 0.0
                account.daily_pnl = 0.0
                account.is_halted = False
                account.halt_reason = ""
                account.trades_today = []

            # --- Manage open trades ---
            closed_trades = self._manage_open_trades(
                open_trades, nq_candles[i], account
            )
            for t in closed_trades:
                daily_pnl_accumulator += t.net_pnl
                result.trades.append(t)
                open_trades.remove(t)

            # --- Record equity ---
            result.equity_curve.append(account.current_balance)

            # --- Generate new signal ---
            if not account.is_halted and len(open_trades) == 0:
                window = slice(max(0, i - 200), i + 1)
                signal = self.aggregator.evaluate(
                    nq_candles=nq_candles[window],
                    es_candles=es_candles[window],
                    ym_candles=ym_candles[window],
                    account=account,
                    current_time=current_time,
                )

                if signal is not None:
                    trade = self._execute_signal(signal, current_time, account)
                    if trade is not None:
                        open_trades.append(trade)

        # Close any remaining open trades at market
        for trade in open_trades:
            self._close_trade(
                trade, nq_candles[-1].close, nq_candles[-1].timestamp, account
            )
            result.trades.append(trade)

        # Final daily PnL
        if daily_pnl_accumulator != 0:
            result.daily_pnl.append(daily_pnl_accumulator)

        # Calculate analytics
        self._calculate_analytics(result, account)
        return result

    # ------------------------------------------------------------------
    # Trade execution
    # ------------------------------------------------------------------
    def _execute_signal(
        self,
        signal: TradeSignal,
        time: datetime,
        account: AccountState,
    ) -> Optional[Trade]:
        """Simulate order fill with slippage and commission."""
        slippage = self.slippage_ticks * self.cfg.topstep.tick_size
        if signal.side == Side.LONG:
            fill_price = signal.entry_price + slippage
        else:
            fill_price = signal.entry_price - slippage

        fees = self.commission * signal.contracts * 2  # Round trip

        trade = Trade(
            signal=signal,
            entry_time=time,
            entry_price=fill_price,
            contracts=signal.contracts,
            fees=fees,
            slippage_ticks=self.slippage_ticks,
            status=OrderStatus.FILLED,
        )

        account.open_positions += signal.contracts
        logger.info(
            "FILL: %s %d @ %.2f (slippage: %.2f)",
            signal.side.name,
            signal.contracts,
            fill_price,
            slippage,
        )
        return trade

    def _manage_open_trades(
        self,
        trades: list[Trade],
        candle: Candle,
        account: AccountState,
    ) -> list[Trade]:
        """Check stops, targets, and trailing stops for open trades."""
        closed: list[Trade] = []

        for trade in trades:
            signal = trade.signal
            price = candle.close

            # Check stop loss
            hit_stop = False
            hit_target = False

            if signal.side == Side.LONG:
                if candle.low <= signal.stop_loss:
                    hit_stop = True
                elif candle.high >= signal.take_profit:
                    hit_target = True
            else:
                if candle.high >= signal.stop_loss:
                    hit_stop = True
                elif candle.low <= signal.take_profit:
                    hit_target = True

            if hit_stop:
                self._close_trade(
                    trade, signal.stop_loss, candle.timestamp, account
                )
                closed.append(trade)
            elif hit_target:
                self._close_trade(
                    trade, signal.take_profit, candle.timestamp, account
                )
                closed.append(trade)
            else:
                # Check trailing stop
                new_stop = self.risk_manager.check_trailing_stop(trade, price)
                if new_stop is not None:
                    trade.signal = TradeSignal(
                        timestamp=signal.timestamp,
                        side=signal.side,
                        entry_price=signal.entry_price,
                        stop_loss=new_stop,
                        take_profit=signal.take_profit,
                        strength=signal.strength,
                        contracts=signal.contracts,
                        smt_signal=signal.smt_signal,
                        fvg_zone=signal.fvg_zone,
                        killzone=signal.killzone,
                        notes=signal.notes,
                    )

        return closed

    def _close_trade(
        self,
        trade: Trade,
        exit_price: float,
        exit_time: datetime,
        account: AccountState,
    ) -> None:
        """Close a trade and update account."""
        trade.exit_price = exit_price
        trade.exit_time = exit_time
        trade.status = OrderStatus.FILLED

        if trade.signal.side == Side.LONG:
            points = exit_price - trade.entry_price
        else:
            points = trade.entry_price - exit_price

        trade.pnl = points * self.cfg.topstep.point_value * trade.contracts
        self.risk_manager.process_trade_result(account, trade)

    # ------------------------------------------------------------------
    # Analytics
    # ------------------------------------------------------------------
    def _calculate_analytics(
        self, result: BacktestResult, account: AccountState
    ) -> None:
        """Compute all performance metrics."""
        trades = result.trades
        result.total_trades = len(trades)

        if not trades:
            return

        pnls = [t.net_pnl for t in trades]
        winners = [p for p in pnls if p > 0]
        losers = [p for p in pnls if p < 0]

        result.total_pnl = sum(pnls)
        result.winning_trades = len(winners)
        result.losing_trades = len(losers)
        result.win_rate = len(winners) / len(trades) if trades else 0.0
        result.avg_winner = np.mean(winners) if winners else 0.0
        result.avg_loser = np.mean(losers) if losers else 0.0

        gross_profit = sum(winners) if winners else 0.0
        gross_loss = abs(sum(losers)) if losers else 1.0
        result.profit_factor = gross_profit / gross_loss if gross_loss > 0 else 0.0

        # Max drawdown from equity curve
        if result.equity_curve:
            equity = np.array(result.equity_curve)
            peak = np.maximum.accumulate(equity)
            drawdown = peak - equity
            result.max_drawdown = float(np.max(drawdown))

        # Max consecutive losses
        max_consec = 0
        current_consec = 0
        for p in pnls:
            if p < 0:
                current_consec += 1
                max_consec = max(max_consec, current_consec)
            else:
                current_consec = 0
        result.max_consecutive_losses = max_consec

        # Average R:R achieved
        rr_ratios = []
        for t in trades:
            risk = abs(t.entry_price - t.signal.stop_loss)
            if risk > 0:
                rr_ratios.append(t.net_pnl / (risk * self.cfg.topstep.point_value))
        result.avg_rr_achieved = float(np.mean(rr_ratios)) if rr_ratios else 0.0

        # Sharpe ratio (daily)
        if len(result.daily_pnl) > 1:
            daily_returns = np.array(result.daily_pnl)
            if np.std(daily_returns) > 0:
                result.sharpe_ratio = float(
                    np.mean(daily_returns)
                    / np.std(daily_returns)
                    * np.sqrt(252)
                )

        # Topstep compliance check
        daily_limit = self.cfg.topstep.max_daily_loss
        for d in result.daily_pnl:
            if d < -daily_limit:
                result.topstep_daily_limit_breaches += 1
        if result.max_drawdown > self.cfg.topstep.max_trailing_drawdown:
            result.topstep_trailing_dd_breaches += 1
