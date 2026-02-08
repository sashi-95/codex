"""
Central configuration for the NQ trading system.
All magic numbers live here. No scattered constants.
"""

from dataclasses import dataclass, field
from typing import Optional


@dataclass(frozen=True)
class TopstepRules:
    """Topstep Trading Combine / Funded Account rules."""
    # --- Account Limits ---
    # These MUST match your specific Topstep plan. Defaults = 50k Combine.
    max_daily_loss: float = 1_000.0        # Absolute daily loss limit ($)
    max_trailing_drawdown: float = 2_000.0  # Trailing max drawdown ($)
    daily_loss_kill_pct: float = 0.80       # Kill switch at 80% of daily limit
    max_contracts: int = 5                   # Max simultaneous NQ contracts

    # --- NQ Contract Specs ---
    tick_size: float = 0.25                  # NQ tick size
    tick_value: float = 5.00                 # $ per tick for NQ
    point_value: float = 20.00              # $ per point (= tick_value / tick_size * 1)


@dataclass(frozen=True)
class SMTConfig:
    """SMT Divergence detection parameters."""
    # Lookback window for swing detection (candles)
    swing_lookback: int = 5
    # Minimum divergence threshold in ticks for NQ vs correlated instrument
    min_divergence_ticks: int = 8
    # Correlation rolling window (candles)
    correlation_window: int = 20
    # Correlation breakdown threshold (below this = divergence is meaningful)
    correlation_breakdown: float = 0.85
    # Instruments to compare against NQ
    correlated_symbols: tuple = ("ES", "YM")


@dataclass(frozen=True)
class FVGConfig:
    """Fair Value Gap detection parameters."""
    # Minimum gap size in ticks to qualify as a valid FVG
    min_gap_ticks: int = 4
    # Max candles to look back for FVG zones
    lookback: int = 50
    # FVG must be filled within this many candles or it expires
    max_age_candles: int = 30


@dataclass(frozen=True)
class KillzoneConfig:
    """ICT Killzone time windows (all times in ET/New York)."""
    # London Killzone: 02:00 - 05:00 ET
    london_start: str = "02:00"
    london_end: str = "05:00"
    # NY AM Killzone: 09:30 - 12:00 ET
    ny_am_start: str = "09:30"
    ny_am_end: str = "12:00"
    # NY PM Killzone (lunch liquidity grab): 13:30 - 16:00 ET
    ny_pm_start: str = "13:30"
    ny_pm_end: str = "16:00"


@dataclass(frozen=True)
class RiskConfig:
    """Risk management parameters."""
    # Default risk per trade as fraction of daily limit
    risk_per_trade_pct: float = 0.02  # 2% of account
    # Max risk per trade in dollars (hard cap)
    max_risk_per_trade: float = 200.0
    # Stop loss in NQ points
    default_stop_points: float = 10.0
    # Take profit ratio (R:R)
    min_reward_risk: float = 2.0
    # Trailing stop activation (in points of profit)
    trailing_activation_points: float = 8.0
    # Trailing stop distance (points behind price)
    trailing_distance_points: float = 4.0
    # Max consecutive losses before pause
    max_consecutive_losses: int = 3
    # Cooldown after max consecutive losses (minutes)
    loss_cooldown_minutes: int = 30


@dataclass
class SystemConfig:
    """Top-level system configuration."""
    topstep: TopstepRules = field(default_factory=TopstepRules)
    smt: SMTConfig = field(default_factory=SMTConfig)
    fvg: FVGConfig = field(default_factory=FVGConfig)
    killzone: KillzoneConfig = field(default_factory=KillzoneConfig)
    risk: RiskConfig = field(default_factory=RiskConfig)

    # Timeframe for primary analysis (minutes)
    primary_timeframe: int = 5
    # Timeframe for higher-timeframe bias (minutes)
    htf_timeframe: int = 15

    # Tradovate API (populate from env vars in production)
    tradovate_api_url: str = "https://demo.tradovateapi.com/v1"
    tradovate_ws_url: str = "wss://demo.tradovateapi.com/v1/websocket"
    tradovate_username: Optional[str] = None
    tradovate_password: Optional[str] = None
    tradovate_app_id: Optional[str] = None
    tradovate_cid: Optional[str] = None
    tradovate_secret: Optional[str] = None

    # Logging
    log_level: str = "INFO"
    log_trades: bool = True
    log_dir: str = "logs"
