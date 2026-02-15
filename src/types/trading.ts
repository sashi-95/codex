/**
 * トレーディング・ダッシュボード 型定義
 * Judas Swing Sniper / ICT Smart Money 概念用
 */

/* ── Market Data ── */

export interface MarketTick {
  price: number;
  timestamp: number;
  volume?: number;
  change?: number;
  changePercent?: number;
}

export interface SMTDivergence {
  detected: boolean;
  type?: 'bullish' | 'bearish';
  magnitude?: number;
  timestamp?: number;
  description?: string;
}

/* ── Candle / OHLC ── */

export interface CandleSnapshot {
  time: string;
  o: number;
  h: number;
  l: number;
  c: number;
}

export interface MinuteDataPoint {
  time: string;
  nq: number;
  es: number;
}

/* ── Structure & Levels ── */

export type MarketBias = 'BULLISH' | 'BEARISH' | 'NEUTRAL';

export interface StructureEntry {
  tf: string;
  bias: MarketBias;
  shift: string;
  conf: number;
}

export interface KeyLevels {
  pdh: number;
  pdl: number;
  pwh: number;
  pwl: number;
  midnightOpen: number;
  asianHigh: number;
  asianLow: number;
  londonHigh: number;
  londonLow: number;
  nyOpen: number;
}

export interface OrderBlock {
  type: 'BULL' | 'BEAR';
  tf: string;
  zone: string;
  dist: string;
}

export interface FVGZone {
  dir: 'BULL' | 'BEAR';
  tf: string;
  range: string;
  filled: number;
}

export interface LiquidityPool {
  side: 'BSL' | 'SSL';
  level: string;
  ref: string;
  str: number;
  swept: boolean;
}

export interface SessionInfo {
  name: string;
  time: string;
  status: 'ACTIVE' | 'CLOSED' | 'PENDING';
  range: string;
  color: string;
}

/* ── Execution Protocol ── */

export interface ExecutionStep {
  id: string;
  label: string;
  desc: string;
}

export interface EntryCheckItem {
  id: string;
  label: string;
  desc: string;
  ok: boolean;
}

export type Verdict = 'EXECUTE' | 'STANDBY' | 'NO TRADE';

export type PremiumDiscountZone = 'PREMIUM' | 'DISCOUNT' | 'EQUILIBRIUM';

export interface PDZoneResult {
  zone: PremiumDiscountZone;
  color: string;
  pct: number;
}

/* ── Editable Levels ── */

export interface TradeLevels {
  pdh: number;
  pdl: number;
  sl: number;
  entryMin: number;
  entryMax: number;
}

/* ── Setup Log ── */

export interface SetupLogPayload {
  timestamp: string;
  completedSteps: string[];
  levels: TradeLevels;
  currentPrice: number;
  verdict: Verdict;
}

export interface EntryLogPayload {
  direction: 'LONG' | 'SHORT';
  price: number;
  sl: number;
  target: number;
  time: string;
}
