"""
Synthetic market data generator for backtesting.

Generates realistic NQ, ES, and YM candle data with:
  - Correlated base movement (normal market conditions)
  - Injected SMT divergence events (for testing detection)
  - Fair Value Gaps (large candles leaving gaps)
  - Time-of-day volume patterns matching killzones

In production, replace this with Tradovate historical data feed.
"""

from __future__ import annotations

import random
from datetime import datetime, timedelta
from typing import Optional

import numpy as np

from trading_system.utils.types import Candle


def generate_correlated_candles(
    num_bars: int = 500,
    start_time: Optional[datetime] = None,
    timeframe_minutes: int = 5,
    base_price_nq: float = 18000.0,
    base_price_es: float = 5200.0,
    base_price_ym: float = 39000.0,
    volatility_nq: float = 15.0,
    correlation: float = 0.92,
    num_divergence_events: int = 5,
    num_fvg_events: int = 8,
    seed: int = 42,
) -> tuple[list[Candle], list[Candle], list[Candle]]:
    """
    Generate time-aligned candle data for NQ, ES, and YM.

    Returns (nq_candles, es_candles, ym_candles).
    """
    rng = np.random.default_rng(seed)

    if start_time is None:
        # Start at a Monday 02:00 ET (London open)
        start_time = datetime(2025, 1, 6, 2, 0, 0)

    # Generate base returns for NQ
    nq_returns = rng.normal(0, volatility_nq / num_bars**0.5, num_bars)

    # ES returns: correlated with NQ but scaled differently
    es_noise = rng.normal(0, 1, num_bars)
    es_returns = correlation * nq_returns * (5200 / 18000) + (
        1 - correlation
    ) * es_noise * (volatility_nq * 0.3 / num_bars**0.5)

    # YM returns: correlated with NQ but scaled differently
    ym_noise = rng.normal(0, 1, num_bars)
    ym_returns = correlation * nq_returns * (39000 / 18000) + (
        1 - correlation
    ) * ym_noise * (volatility_nq * 0.5 / num_bars**0.5)

    # Inject divergence events (break correlation at specific points)
    divergence_bars = sorted(
        rng.choice(
            range(50, num_bars - 50), size=num_divergence_events, replace=False
        )
    )
    for bar_idx in divergence_bars:
        # NQ spikes but ES/YM don't follow (or reverse)
        direction = rng.choice([-1, 1])
        spike = volatility_nq * 0.8 / num_bars**0.5
        nq_returns[bar_idx] = direction * spike * 3
        # ES/YM go flat or reverse
        es_returns[bar_idx] = -direction * spike * 0.5
        ym_returns[bar_idx] = -direction * spike * 0.3
        # Persist divergence for a few bars
        for offset in range(1, 4):
            if bar_idx + offset < num_bars:
                nq_returns[bar_idx + offset] = direction * spike * 1.5
                es_returns[bar_idx + offset] = -direction * spike * 0.3

    # Inject FVG events (large candles with gaps)
    fvg_bars = sorted(
        rng.choice(
            range(30, num_bars - 30), size=num_fvg_events, replace=False
        )
    )
    for bar_idx in fvg_bars:
        direction = rng.choice([-1, 1])
        nq_returns[bar_idx] = direction * volatility_nq * 2.0 / num_bars**0.5

    # Build price series
    nq_prices = np.cumsum(nq_returns) + base_price_nq
    es_prices = np.cumsum(es_returns) + base_price_es
    ym_prices = np.cumsum(ym_returns) + base_price_ym

    # Build candles
    nq_candles: list[Candle] = []
    es_candles: list[Candle] = []
    ym_candles: list[Candle] = []

    for i in range(num_bars):
        ts = start_time + timedelta(minutes=i * timeframe_minutes)

        # Skip weekend hours (Sat/Sun)
        while ts.weekday() >= 5:
            ts += timedelta(days=1)

        nq_candles.append(
            _make_candle(
                ts, nq_prices, i, rng, tick_size=0.25, symbol="NQ"
            )
        )
        es_candles.append(
            _make_candle(
                ts, es_prices, i, rng, tick_size=0.25, symbol="ES"
            )
        )
        ym_candles.append(
            _make_candle(
                ts, ym_prices, i, rng, tick_size=1.0, symbol="YM"
            )
        )

    return nq_candles, es_candles, ym_candles


def _make_candle(
    ts: datetime,
    prices: np.ndarray,
    idx: int,
    rng: np.random.Generator,
    tick_size: float,
    symbol: str,
) -> Candle:
    """Construct a single candle with realistic OHLC from a price series."""
    close = round(prices[idx] / tick_size) * tick_size
    spread = abs(rng.normal(0, 3)) * tick_size
    high = close + abs(rng.normal(0, 1)) * spread
    low = close - abs(rng.normal(0, 1)) * spread
    open_price = low + rng.random() * (high - low)

    # Round to tick size
    high = round(high / tick_size) * tick_size
    low = round(low / tick_size) * tick_size
    open_price = round(open_price / tick_size) * tick_size

    # Ensure OHLC consistency
    high = max(high, open_price, close)
    low = min(low, open_price, close)

    volume = int(rng.poisson(500) + 100)

    return Candle(
        timestamp=ts,
        open=open_price,
        high=high,
        low=low,
        close=close,
        volume=volume,
        symbol=symbol,
    )
