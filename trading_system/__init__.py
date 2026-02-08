"""
NQ Futures Automated Trading System
====================================
SMT Divergence + ICT Concepts based execution engine
with Topstep-compliant risk management.

Architecture:
  core/       - Signal detection (SMT, FVG, Killzones)
  risk/       - Drawdown guard, position sizing, daily loss limit
  backtest/   - Vectorized backtester + analytics
  api/        - Tradovate API adapter
  data/       - Market data ingestion
  utils/      - Helpers, logging, config
"""

__version__ = "0.1.0"
