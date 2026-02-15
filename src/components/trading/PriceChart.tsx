'use client';

import React, { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { tradingColors } from '@/lib/design-tokens';
import { MOCK_MINUTE_DATA } from '@/lib/trading-constants';
import type { MarketTick, MinuteDataPoint } from '@/types/trading';

interface PriceChartProps {
  marketTicks?: Record<string, MarketTick>;
}

export function PriceChart({ marketTicks }: PriceChartProps) {
  const chartData: MinuteDataPoint[] = useMemo(() => {
    const base = [...MOCK_MINUTE_DATA];
    if (base.length === 0) return base;
    const last = base.length - 1;
    if (marketTicks?.['NQ1!']?.price != null) {
      base[last] = { ...base[last], nq: Math.round(marketTicks['NQ1!'].price) };
    }
    if (marketTicks?.['ES1!']?.price != null) {
      base[last] = { ...base[last], es: Math.round(marketTicks['ES1!'].price * 10) / 10 };
    }
    return base;
  }, [marketTicks]);

  return (
    <div className="h-[320px] lg:h-[380px] min-h-[240px] relative rounded-lg border border-glass-border bg-background-primary overflow-hidden shrink-0">
      {/* Legend */}
      <div className="absolute top-4 left-4 z-10 flex gap-4 text-[10px] font-mono">
        <span className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tradingColors.gold }} />
          NASDAQ (NQ)
        </span>
        <span className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tradingColors.blue }} />
          S&P500 (ES)
        </span>
      </div>

      {/* Demo Badge */}
      <div className="absolute top-4 right-4 z-10 px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-[9px] font-black text-amber-400 uppercase">
        Demo &mdash; not live
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 28, right: 12, bottom: 20, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#222" />
          <XAxis dataKey="time" stroke="#666" fontSize={10} tick={{ fill: '#888' }} />
          <YAxis domain={['auto', 'auto']} hide />
          <Tooltip
            contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }}
            labelStyle={{ color: tradingColors.gold }}
            formatter={(value: number) => [value.toLocaleString(), '']}
          />
          <ReferenceLine
            x="09:30"
            stroke={tradingColors.gold}
            strokeDasharray="5 5"
            label={{ value: 'OPEN', position: 'top', fill: tradingColors.gold, fontSize: 10 }}
          />
          <ReferenceLine
            x="09:35"
            stroke="#666"
            strokeDasharray="3 3"
            label={{ value: '09:35', position: 'top', fill: '#666', fontSize: 9 }}
          />
          <ReferenceLine
            x="09:45"
            stroke={tradingColors.cyan}
            strokeDasharray="5 5"
            label={{ value: 'MACD REVERSAL', position: 'top', fill: tradingColors.cyan, fontSize: 10 }}
          />
          <Line type="monotone" dataKey="nq" stroke={tradingColors.gold} strokeWidth={2} dot={false} name="NQ" />
          <Line type="monotone" dataKey="es" stroke={tradingColors.blue} strokeWidth={1} dot={false} strokeDasharray="3 3" name="ES" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
