'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { tradingColors } from '@/lib/design-tokens';
import type { Verdict, PremiumDiscountZone } from '@/types/trading';

interface BiasHeaderProps {
  score: number;
  total: number;
  verdict: Verdict;
  verdictColor: string;
  htfBias: { label: string; color: string; IconName: 'TrendingUp' | 'TrendingDown' | 'Activity' };
  pdZone: { zone: PremiumDiscountZone; color: string; pct: number };
  isKillzoneActive: boolean;
  currentPrice: number;
}

const ICON_MAP = {
  TrendingUp,
  TrendingDown,
  Activity,
} as const;

export function BiasHeader({
  score,
  total,
  verdict,
  verdictColor,
  htfBias,
  pdZone,
  isKillzoneActive,
  currentPrice,
}: BiasHeaderProps) {
  const BiasIcon = ICON_MAP[htfBias.IconName];

  return (
    <div className="shrink-0 h-16 flex items-center px-6 border-b border-glass-border bg-background-secondary relative z-20">
      {/* Verdict Badge */}
      <motion.div
        className="flex items-center gap-4 mr-10"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div
          className="flex items-center justify-center w-12 h-12 rounded-xl border bg-opacity-10 backdrop-blur-md"
          style={{
            border: `1px solid ${verdictColor}`,
            backgroundColor: `${verdictColor}10`,
            boxShadow: `0 0 20px -5px ${verdictColor}`,
          }}
        >
          <span className="text-xl font-black" style={{ color: verdictColor }}>{score}</span>
          <span className="text-[10px] text-zinc-500 font-bold -mb-5 -ml-1">/{total}</span>
        </div>
        <div className="flex flex-col select-none">
          <span className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.2em]">VERDICT</span>
          <span className="text-2xl font-black tracking-tight leading-none" style={{ color: verdictColor }}>
            {verdict}
          </span>
        </div>
      </motion.div>

      {/* Bias Metrics */}
      <div className="h-10 flex items-center gap-8 px-8 border-l border-r border-glass-border bg-white/[0.01]">
        <div className="flex flex-col justify-center">
          <span className="text-[9px] text-zinc-600 font-black uppercase tracking-wider text-center mb-0.5">Bias</span>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/[0.03]">
            <BiasIcon className="w-3.5 h-3.5" style={{ color: htfBias.color }} />
            <span className="text-xs font-black" style={{ color: htfBias.color }}>{htfBias.label}</span>
          </div>
        </div>
        <div className="flex flex-col justify-center">
          <span className="text-[9px] text-zinc-600 font-black uppercase tracking-wider text-center mb-0.5">Zone</span>
          <span className="text-xs font-black px-2 py-0.5 rounded bg-white/[0.03]" style={{ color: pdZone.color }}>
            {pdZone.zone}
          </span>
        </div>
        <div className="flex flex-col justify-center">
          <span className="text-[9px] text-zinc-600 font-black uppercase tracking-wider text-center mb-0.5">Session</span>
          <div className="flex items-center gap-2 px-2 py-0.5 rounded bg-white/[0.03]">
            <div
              className={cn(
                'w-2 h-2 rounded-full',
                isKillzoneActive ? 'animate-pulse' : 'bg-zinc-700',
              )}
              style={isKillzoneActive ? { backgroundColor: tradingColors.pink, boxShadow: `0 0 8px ${tradingColors.pink}` } : undefined}
            />
            <span className={cn('text-xs font-black uppercase', isKillzoneActive ? 'text-white' : 'text-zinc-600')}>
              {isKillzoneActive ? 'NY AM ACTIVE' : 'NO KILLZONE'}
            </span>
          </div>
        </div>
      </div>

      {/* Price Feed */}
      <div className="ml-auto flex items-center gap-4">
        <div className="text-right">
          <span className="text-[9px] text-zinc-500 font-black text-right block uppercase tracking-wider mb-0.5">NQ1! Live</span>
          <motion.span
            key={currentPrice}
            className="text-2xl font-black font-mono text-zinc-100 tracking-tight leading-none"
            initial={{ opacity: 0.6, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
          >
            {currentPrice.toLocaleString()}
          </motion.span>
        </div>
      </div>
    </div>
  );
}
