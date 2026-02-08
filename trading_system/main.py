#!/usr/bin/env python3
"""
NQ Futures Automated Trading System — Main Entry Point.

Usage:
  # Run backtest with synthetic data
  python -m trading_system.main --mode backtest

  # Run backtest with custom parameters
  python -m trading_system.main --mode backtest --balance 50000 --bars 1000

  # Run live (requires Tradovate credentials in env vars)
  python -m trading_system.main --mode live
"""

from __future__ import annotations

import argparse
import logging
import sys
from datetime import datetime

from trading_system.backtest.engine import BacktestEngine
from trading_system.config import SystemConfig
from trading_system.data.sample_data import generate_correlated_candles


def setup_logging(level: str = "INFO") -> None:
    logging.basicConfig(
        level=getattr(logging, level),
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )


def run_backtest(config: SystemConfig, balance: float, num_bars: int) -> None:
    """Run the backtesting engine with synthetic data."""
    logger = logging.getLogger(__name__)
    logger.info("Generating synthetic market data (%d bars)...", num_bars)

    nq, es, ym = generate_correlated_candles(
        num_bars=num_bars,
        base_price_nq=18000.0,
        base_price_es=5200.0,
        base_price_ym=39000.0,
        num_divergence_events=max(5, num_bars // 100),
        num_fvg_events=max(8, num_bars // 60),
    )

    logger.info("Running backtest...")
    engine = BacktestEngine(
        config=config,
        starting_balance=balance,
        commission_per_contract=4.50,
        slippage_ticks=1.0,
    )

    result = engine.run(nq, es, ym)
    print(result.summary())

    # Print individual trades
    if result.trades:
        print("\n--- TRADE LOG ---")
        print(
            f"{'#':>4} {'Side':<6} {'Entry':>10} {'Exit':>10} "
            f"{'PnL':>10} {'Net':>10} {'R:R':>6} {'Time'}"
        )
        for i, t in enumerate(result.trades, 1):
            risk = abs(t.entry_price - t.signal.stop_loss)
            rr = (
                t.net_pnl / (risk * config.topstep.point_value)
                if risk > 0
                else 0
            )
            print(
                f"{i:>4} {t.signal.side.name:<6} "
                f"{t.entry_price:>10.2f} "
                f"{t.exit_price or 0:>10.2f} "
                f"${t.pnl:>9.2f} "
                f"${t.net_pnl:>9.2f} "
                f"{rr:>5.2f}R "
                f"{t.entry_time.strftime('%m/%d %H:%M')}"
            )

    # Verdict
    print()
    if result.topstep_daily_limit_breaches == 0 and result.topstep_trailing_dd_breaches == 0:
        print("TOPSTEP COMPLIANCE: PASS")
    else:
        print("TOPSTEP COMPLIANCE: FAIL")
        if result.topstep_daily_limit_breaches:
            print(f"  - Daily limit breached {result.topstep_daily_limit_breaches} time(s)")
        if result.topstep_trailing_dd_breaches:
            print(f"  - Trailing drawdown breached")

    if result.win_rate >= 0.45 and result.profit_factor >= 1.3:
        print("STRATEGY ASSESSMENT: VIABLE — proceed to paper trading")
    elif result.total_trades == 0:
        print("STRATEGY ASSESSMENT: NO TRADES — adjust signal sensitivity parameters")
    else:
        print("STRATEGY ASSESSMENT: NEEDS TUNING — review parameters before live deployment")


def run_live(config: SystemConfig) -> None:
    """Start the live trading loop (requires Tradovate credentials)."""
    logger = logging.getLogger(__name__)

    if not config.tradovate_username:
        logger.error(
            "Tradovate credentials not configured. Set environment variables:\n"
            "  TRADOVATE_USERNAME, TRADOVATE_PASSWORD,\n"
            "  TRADOVATE_APP_ID, TRADOVATE_CID, TRADOVATE_SECRET"
        )
        sys.exit(1)

    logger.info("Live trading mode — NOT IMPLEMENTED YET")
    logger.info(
        "Complete the Tradovate API scaffold in api/tradovate_client.py "
        "and test on the demo environment first."
    )
    # Future: asyncio.run(live_trading_loop(config))


def main() -> None:
    parser = argparse.ArgumentParser(
        description="NQ Futures SMT Trading System"
    )
    parser.add_argument(
        "--mode",
        choices=["backtest", "live"],
        default="backtest",
        help="Run mode (default: backtest)",
    )
    parser.add_argument(
        "--balance",
        type=float,
        default=50_000.0,
        help="Starting account balance (default: 50000)",
    )
    parser.add_argument(
        "--bars",
        type=int,
        default=500,
        help="Number of bars for backtest (default: 500)",
    )
    parser.add_argument(
        "--log-level",
        default="INFO",
        choices=["DEBUG", "INFO", "WARNING", "ERROR"],
        help="Logging level (default: INFO)",
    )
    args = parser.parse_args()

    config = SystemConfig(log_level=args.log_level)
    setup_logging(args.log_level)

    if args.mode == "backtest":
        run_backtest(config, args.balance, args.bars)
    elif args.mode == "live":
        run_live(config)


if __name__ == "__main__":
    main()
