'use client';

import React from 'react';
import { tradingColors } from '@/lib/design-tokens';
import { CANDLE_SNAPSHOTS_0930 } from '@/lib/trading-constants';

export function CandleSnapshots() {
  return (
    <div className="grid grid-cols-4 gap-2 shrink-0">
      <div className="col-span-4 text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
        Sample candle snapshots
      </div>

      {CANDLE_SNAPSHOTS_0930.map((c) => {
        const bull = c.c >= c.o;
        const range = c.h - c.l || 1;
        const y = (p: number) => 26 - ((p - c.l) / range) * 24;
        const bodyTopY = y(Math.max(c.o, c.c));
        const bodyBotY = y(Math.min(c.o, c.c));
        const bodyH = Math.max(2, bodyBotY - bodyTopY);
        const color = bull ? tradingColors.green : tradingColors.pink;
        const wickTopY = 2;
        const wickBotY = 26;

        return (
          <div key={c.time} className="bg-white/5 p-2 rounded border border-white/5 text-center">
            <div className="text-[10px] text-gray-500 font-mono mb-1">{c.time}</div>
            <svg width="28" height="32" viewBox="0 0 28 32" className="mx-auto overflow-visible">
              <line x1="14" y1={wickTopY} x2="14" y2={bodyTopY} stroke={color} strokeWidth="1" />
              <rect
                x={10}
                y={bodyTopY}
                width="8"
                height={bodyH}
                fill={bull ? color : tradingColors.bgDeep}
                stroke={color}
                strokeWidth="1"
              />
              <line x1="14" y1={bodyBotY} x2="14" y2={wickBotY} stroke={color} strokeWidth="1" />
            </svg>
            <div className="text-[10px] mt-1 font-bold text-zinc-400">SET-UP</div>
          </div>
        );
      })}
    </div>
  );
}
