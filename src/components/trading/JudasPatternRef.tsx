'use client';

import React from 'react';
import { tradingColors } from '@/lib/design-tokens';

interface JudasPatternRefProps {
  type: 'long' | 'short';
}

/**
 * JudasPatternRef - Judas Swing パターン参照図
 * TODO: Cursor で SVG / Canvas ベースの本格的なパターン図に発展させる
 *
 * 現在はプレースホルダー。以下の要素を描画予定：
 * - Manipulation phase (fakeout candles)
 * - Distribution / Accumulation zone
 * - FVG zone highlighting
 * - Entry / SL / TP markers
 */
export function JudasPatternRef({ type }: JudasPatternRefProps) {
  const isLong = type === 'long';
  const color = isLong ? tradingColors.green : tradingColors.pink;
  const label = isLong ? 'LONG MODEL' : 'SHORT MODEL';

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-center p-4">
      {/* Simplified Pattern Illustration */}
      <svg viewBox="0 0 200 120" className="w-full max-w-[200px] h-auto">
        {/* Manipulation Phase */}
        <path
          d={isLong
            ? 'M 10,40 L 50,60 L 70,80 L 90,75'
            : 'M 10,80 L 50,60 L 70,40 L 90,45'
          }
          fill="none"
          stroke="#666"
          strokeWidth="2"
          strokeDasharray="4 2"
        />
        {/* Reversal / True Move */}
        <path
          d={isLong
            ? 'M 90,75 L 110,55 L 140,30 L 170,20 L 190,15'
            : 'M 90,45 L 110,65 L 140,90 L 170,100 L 190,105'
          }
          fill="none"
          stroke={color}
          strokeWidth="2.5"
        />
        {/* Key Points */}
        <circle cx="70" cy={isLong ? 80 : 40} r="4" fill={tradingColors.gold} />
        <text x="70" y={isLong ? 95 : 30} textAnchor="middle" fontSize="8" fill={tradingColors.gold}>
          Sweep
        </text>
        <circle cx="110" cy={isLong ? 55 : 65} r="4" fill={color} />
        <text x="110" y={isLong ? 45 : 80} textAnchor="middle" fontSize="8" fill={color}>
          Entry
        </text>
        {/* 09:30 / 09:45 markers */}
        <text x="50" y="115" textAnchor="middle" fontSize="7" fill="#555">09:30</text>
        <text x="110" y="115" textAnchor="middle" fontSize="7" fill="#555">09:45</text>
      </svg>

      <div className="text-[9px] font-black uppercase tracking-wider" style={{ color }}>
        {label}
      </div>
      <div className="text-[8px] text-zinc-600 leading-relaxed max-w-[160px]">
        {isLong
          ? 'Manipulation \u2192 SSL Sweep \u2192 Bullish MSS \u2192 FVG Entry'
          : 'Manipulation \u2192 BSL Sweep \u2192 Bearish MSS \u2192 FVG Entry'
        }
      </div>
    </div>
  );
}
