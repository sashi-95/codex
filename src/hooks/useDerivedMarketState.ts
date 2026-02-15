'use client';

/**
 * useDerivedMarketState
 * marketTicks と currentTime から以下を派生:
 * - smtDivergence: NQ vs ES の相関崩れ検出
 * - isKillzoneActive: NY AM killzone (09:30–11:00 ET) 判定
 * - vixRegime: VIX レベルに基づく市場レジーム
 */

import { useMemo } from 'react';
import type { MarketTick, SMTDivergence } from '@/types/trading';

export type VixRegime = 'LOW' | 'NORMAL' | 'ELEVATED' | 'EXTREME';

export interface DerivedMarketState {
  smtDivergence: SMTDivergence;
  isKillzoneActive: boolean;
  vixRegime: VixRegime;
}

/**
 * NY AM Killzone: 09:30–11:00 ET
 * 簡易判定 — ホストのタイムゾーンを US/Eastern として扱う。
 * 本番では date-fns-tz や Intl.DateTimeFormat で ET を明示すべき。
 */
function checkKillzone(now: Date): boolean {
  // Convert to ET hours/minutes using Intl
  const etStr = now.toLocaleString('en-US', { timeZone: 'America/New_York', hour12: false });
  const timePart = etStr.split(', ')[1] ?? etStr;
  const [hStr, mStr] = timePart.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  const totalMin = h * 60 + m;
  // 09:30 = 570, 11:00 = 660
  return totalMin >= 570 && totalMin <= 660;
}

/**
 * SMT Divergence 検出
 * NQ と ES の change% の符号が逆 → divergence detected
 */
function detectSMT(ticks: Record<string, MarketTick>): SMTDivergence {
  const nq = ticks['NQ1!'];
  const es = ticks['ES1!'];

  if (!nq?.changePercent || !es?.changePercent) {
    return { detected: false };
  }

  const nqDir = Math.sign(nq.changePercent);
  const esDir = Math.sign(es.changePercent);

  if (nqDir !== 0 && esDir !== 0 && nqDir !== esDir) {
    const magnitude = Math.abs(nq.changePercent - es.changePercent);
    return {
      detected: true,
      type: nq.changePercent > 0 ? 'bullish' : 'bearish',
      magnitude,
      timestamp: Date.now(),
      description: `NQ ${nq.changePercent > 0 ? '↑' : '↓'} vs ES ${es.changePercent > 0 ? '↑' : '↓'} — 相関崩れ`,
    };
  }

  return { detected: false };
}

/**
 * VIX Regime 判定
 */
function classifyVix(ticks: Record<string, MarketTick>): VixRegime {
  const vix = ticks.VIX?.price;
  if (vix == null) return 'NORMAL';
  if (vix < 13) return 'LOW';
  if (vix < 20) return 'NORMAL';
  if (vix < 30) return 'ELEVATED';
  return 'EXTREME';
}

export function useDerivedMarketState(
  ticks: Record<string, MarketTick>,
  currentTime: Date,
): DerivedMarketState {
  const smtDivergence = useMemo(() => detectSMT(ticks), [ticks]);
  const isKillzoneActive = useMemo(() => checkKillzone(currentTime), [currentTime]);
  const vixRegime = useMemo(() => classifyVix(ticks), [ticks]);

  return { smtDivergence, isKillzoneActive, vixRegime };
}
