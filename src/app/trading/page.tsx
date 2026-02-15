'use client';

/**
 * Trading Page — Judas Swing Sniper ダッシュボード
 *
 * useMarketData → useCurrentTime → useDerivedMarketState の流れで
 * Mock 価格データを生成し、JudasSniper に渡す。
 */

import React from 'react';
import { useMarketData } from '@/hooks/useMarketData';
import { useCurrentTime } from '@/hooks/useCurrentTime';
import { useDerivedMarketState } from '@/hooks/useDerivedMarketState';
import { JudasSniper } from '@/components/trading';

const SYMBOLS = ['NQ1!', 'ES1!', 'BTC', 'XAU', 'DXY', 'VIX'];

export default function TradingPage() {
  const { ticks, isConnected, error } = useMarketData(SYMBOLS);
  const currentTime = useCurrentTime();
  const { smtDivergence, isKillzoneActive, vixRegime } = useDerivedMarketState(ticks, currentTime);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Connection Status Bar */}
      <div className="flex items-center gap-3 px-4 py-1.5 bg-black/40 border-b border-white/5 text-[9px] font-mono shrink-0">
        <div className="flex items-center gap-1.5">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isConnected ? 'bg-[#00C805] shadow-[0_0_4px_#00C805]' : 'bg-red-500'
            }`}
          />
          <span className="text-zinc-500">
            {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
          </span>
        </div>

        {error && (
          <span className="text-red-400">
            {error.message}
          </span>
        )}

        <div className="ml-auto flex items-center gap-4 text-zinc-600">
          <span>VIX Regime: <span className={
            vixRegime === 'LOW' ? 'text-[#00C805]' :
            vixRegime === 'NORMAL' ? 'text-zinc-400' :
            vixRegime === 'ELEVATED' ? 'text-amber-400' :
            'text-red-400'
          }>{vixRegime}</span></span>
          <span>{currentTime.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour12: false })}</span>
        </div>
      </div>

      {/* Main Sniper View */}
      <div className="flex-1 min-h-0">
        <JudasSniper
          isKillzoneActive={isKillzoneActive}
          smtDivergence={smtDivergence}
          marketTicks={ticks}
        />
      </div>
    </div>
  );
}
