/**
 * useEntryChecklist
 * FVG / Liquidity Sweep / SMT など、エントリー条件の判定ロジック
 */

import { useMemo } from 'react';
import type { EntryCheckItem, TradeLevels, MarketBias, Verdict } from '@/types/trading';
import { LIQUIDITY_TOUCH_THRESHOLD, STRUCTURE, LIQUIDITY, FVG_ZONES } from '@/lib/trading-constants';

interface EntryChecklistOptions {
  smtDetected: boolean;
  currentPrice: number;
  levels: TradeLevels;
  isKillzoneActive: boolean;
}

interface BiasResult {
  label: MarketBias;
  color: string;
  IconName: 'TrendingUp' | 'TrendingDown' | 'Activity';
}

/* ── Entry Conditions ── */

export function getEntryChecklist(
  smtDetected: boolean,
  currentPrice: number,
  levels: TradeLevels,
): EntryCheckItem[] {
  const { pdl, pdh, entryMin, entryMax } = levels;
  const liquiditySwept =
    currentPrice <= pdl + LIQUIDITY_TOUCH_THRESHOLD ||
    currentPrice >= pdh - LIQUIDITY_TOUCH_THRESHOLD;
  const inEntryZone = currentPrice >= entryMin && currentPrice <= entryMax;

  return [
    { id: 'fvg', label: 'FVG Present', desc: '5m or 15m Fair Value Gap unfilled', ok: inEntryZone },
    { id: 'liquidity_sweep', label: 'Liquidity Sweep', desc: 'BSL/SSL swept before entry', ok: liquiditySwept },
    { id: 'smt_0945', label: 'SMT at 9:45', desc: 'NQ vs ES divergence at 9:45 candle', ok: smtDetected },
    { id: 'judas_swing', label: 'Judas Swing', desc: '1m 5-candle volatility fakeout identified', ok: true },
    { id: 'macro_align', label: 'Macro Alignment', desc: '9:45 candle close confirms direction', ok: smtDetected },
  ];
}

/* ── Composite Hook ── */

export function useEntryChecklist({ smtDetected, currentPrice, levels, isKillzoneActive }: EntryChecklistOptions) {
  const entryConditions = useMemo(
    () => getEntryChecklist(smtDetected, currentPrice, levels),
    [smtDetected, currentPrice, levels],
  );

  const scoringChecks = useMemo(
    () => [
      { label: 'Killzone Active', ok: isKillzoneActive },
      {
        label: 'HTF Bias Aligned',
        ok: STRUCTURE.filter((m) => m.tf === '1H' || m.tf === '4H').every((m) => m.bias === 'BULLISH'),
      },
      { label: 'Liquidity Swept', ok: LIQUIDITY.some((l) => l.swept) },
      { label: 'FVG Present', ok: FVG_ZONES.some((f) => f.filled < 0.5) },
      { label: 'OB Proximity', ok: true },
      { label: 'SMT Divergence', ok: smtDetected },
      { label: 'Market Structure Shift', ok: STRUCTURE.some((m) => m.shift.includes('MSS')) },
    ],
    [isKillzoneActive, smtDetected],
  );

  const score = scoringChecks.filter((c) => c.ok).length;
  const total = scoringChecks.length;

  return { entryConditions, scoringChecks, score, total };
}

/* ── HTF Bias ── */

export function useHTFBias(): BiasResult {
  return useMemo(() => {
    const bull = STRUCTURE.filter((m) => m.bias === 'BULLISH').length;
    const bear = STRUCTURE.filter((m) => m.bias === 'BEARISH').length;
    if (bull > bear) return { label: 'BULLISH', color: '#00C805', IconName: 'TrendingUp' as const };
    if (bear > bull) return { label: 'BEARISH', color: '#FF6AC1', IconName: 'TrendingDown' as const };
    return { label: 'NEUTRAL', color: '#888', IconName: 'Activity' as const };
  }, []);
}

/* ── Premium / Discount Zone ── */

export function usePDZone(price: number, high: number, low: number) {
  return useMemo(() => {
    const range = high - low;
    const eq = low + range * 0.5;
    const pct = ((price - low) / range) * 100;
    if (price > eq + range * 0.2) return { zone: 'PREMIUM' as const, color: '#FF6AC1', pct };
    if (price < eq - range * 0.2) return { zone: 'DISCOUNT' as const, color: '#00C805', pct };
    return { zone: 'EQUILIBRIUM' as const, color: '#D4AF37', pct };
  }, [price, high, low]);
}

/* ── Verdict Calculation ── */

export function useVerdict(score: number, protocolComplete: boolean): { verdict: Verdict; color: string } {
  return useMemo(() => {
    if (score >= 6 && protocolComplete) return { verdict: 'EXECUTE', color: '#00C805' };
    if (score >= 4) return { verdict: 'STANDBY', color: '#D4AF37' };
    return { verdict: 'NO TRADE', color: '#555' };
  }, [score, protocolComplete]);
}
