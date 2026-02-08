"""
Shared data types used across all modules.
Using dataclasses over Pydantic to keep dependencies minimal.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum, auto
from typing import Optional


class Side(Enum):
    LONG = auto()
    SHORT = auto()


class SignalStrength(Enum):
    """Confluence-weighted signal quality."""
    WEAK = 1       # Single factor only
    MODERATE = 2   # Two factors aligned
    STRONG = 3     # All three factors (SMT + FVG + Killzone)


class OrderStatus(Enum):
    PENDING = auto()
    FILLED = auto()
    PARTIALLY_FILLED = auto()
    CANCELLED = auto()
    REJECTED = auto()


@dataclass
class Candle:
    """OHLCV bar."""
    timestamp: datetime
    open: float
    high: float
    low: float
    close: float
    volume: int
    symbol: str = "NQ"


@dataclass
class SwingPoint:
    """Identified swing high or swing low."""
    timestamp: datetime
    price: float
    is_high: bool  # True = swing high, False = swing low
    index: int     # Bar index in the series


@dataclass
class FairValueGap:
    """A detected Fair Value Gap zone."""
    timestamp: datetime
    high: float        # Top of the gap
    low: float         # Bottom of the gap
    is_bullish: bool   # True = bullish FVG (gap up), False = bearish FVG (gap down)
    bar_index: int     # Bar index where the gap was created
    filled: bool = False
    fill_pct: float = 0.0


@dataclass
class SMTSignal:
    """Smart Money Technique divergence signal."""
    timestamp: datetime
    side: Side
    nq_swing: SwingPoint
    correlated_swing: SwingPoint
    correlated_symbol: str
    divergence_ticks: float
    correlation_at_signal: float
    strength: SignalStrength = SignalStrength.WEAK


@dataclass
class TradeSignal:
    """Aggregated trade signal after all filters."""
    timestamp: datetime
    side: Side
    entry_price: float
    stop_loss: float
    take_profit: float
    strength: SignalStrength
    contracts: int
    smt_signal: Optional[SMTSignal] = None
    fvg_zone: Optional[FairValueGap] = None
    killzone: Optional[str] = None  # Name of active killzone
    notes: str = ""


@dataclass
class Trade:
    """Record of an executed trade."""
    signal: TradeSignal
    entry_time: datetime
    entry_price: float
    exit_time: Optional[datetime] = None
    exit_price: Optional[float] = None
    contracts: int = 1
    pnl: float = 0.0
    status: OrderStatus = OrderStatus.PENDING
    fees: float = 0.0
    slippage_ticks: float = 0.0

    @property
    def is_open(self) -> bool:
        return self.exit_time is None

    @property
    def net_pnl(self) -> float:
        return self.pnl - self.fees


@dataclass
class AccountState:
    """Current account state for risk checks."""
    starting_balance: float
    current_balance: float
    daily_pnl: float = 0.0
    peak_balance: float = 0.0
    open_positions: int = 0
    consecutive_losses: int = 0
    trades_today: list = field(default_factory=list)
    is_halted: bool = False
    halt_reason: str = ""

    @property
    def trailing_drawdown(self) -> float:
        return self.peak_balance - self.current_balance

    def update_peak(self):
        if self.current_balance > self.peak_balance:
            self.peak_balance = self.current_balance
