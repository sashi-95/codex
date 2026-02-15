'use client';

/**
 * JudasSniper V5 - Upgraded Orchestrator
 *
 * 分割されたサブコンポーネントを組み合わせる統括コンポーネント。
 * ビジネスロジックは useJudasStore / useEntryChecklist に集約。
 * 旧モノリシック版 (V4) からの主な改善点：
 *
 * - コンポーネント分割 (BiasHeader, ExecutionProtocol, PriceChart, ContextPanel 等)
 * - Zustand による状態管理
 * - Framer Motion アニメーション統合
 * - design-tokens / GlassCard / cn() によるデザインシステム準拠
 * - TypeScript 型の厳密化
 * - アクセシビリティ (aria-expanded, aria-label 等)
 */

import React, { memo } from 'react';
import { Crosshair } from 'lucide-react';

import { useJudasStore } from '@/stores/useJudasStore';
import { useEntryChecklist, useHTFBias, usePDZone, useVerdict } from '@/hooks/useEntryChecklist';
import { KEY_LEVELS, FALLBACK_PRICE, EXECUTION_CHECKLIST } from '@/lib/trading-constants';
import type { SMTDivergence, MarketTick } from '@/types/trading';

import { BiasHeader } from './BiasHeader';
import { ExecutionProtocol } from './ExecutionProtocol';
import { PriceChart } from './PriceChart';
import { CandleSnapshots } from './CandleSnapshots';
import { ContextPanel } from './ContextPanel';
import { JudasPatternRef } from './JudasPatternRef';

export interface JudasSniperProps {
  isKillzoneActive: boolean;
  smtDivergence: SMTDivergence;
  marketTicks?: Record<string, MarketTick>;
}

export const JudasSniper = memo<JudasSniperProps>(({ isKillzoneActive, smtDivergence, marketTicks }) => {
  // ── Store ──
  const {
    completedSteps,
    toggleStep,
    levels,
    setLevel,
    isContextExpanded,
    toggleContext,
    levelsExpanded,
    toggleLevels,
    isSyncing,
    logFeedback,
    isProtocolComplete,
    saveSetupLog,
    logEntry,
  } = useJudasStore();

  // ── Derived Data ──
  const currentPrice = marketTicks?.['NQ1!']?.price ?? FALLBACK_PRICE;
  const htfBias = useHTFBias();
  const pdZone = usePDZone(currentPrice, KEY_LEVELS.pwh, KEY_LEVELS.pwl);
  const { entryConditions, score, total } = useEntryChecklist({
    smtDetected: smtDivergence.detected,
    currentPrice,
    levels,
    isKillzoneActive,
  });

  const protocolComplete = isProtocolComplete();
  const { verdict, color: verdictColor } = useVerdict(score, protocolComplete);

  // ── R:R Calc ──
  const entryMid = (levels.entryMin + levels.entryMax) / 2;
  const riskPts = entryMid - levels.sl;
  const rrRatio = riskPts > 0 ? (levels.pdh - entryMid) / riskPts : 0;

  // ── Handlers ──
  const handleSaveSetup = () => saveSetupLog(currentPrice, verdict);
  const handleLogEntry = () => logEntry(currentPrice);

  // ── Pattern Ref Slot ──
  const patternRefSlot = (
    <div className="flex-1 grid grid-cols-2 gap-4 min-h-0 overflow-hidden relative z-0">
      <div className="relative group overflow-hidden rounded-lg border border-white/5 hover:border-white/10 transition-colors">
        <div className="absolute top-2 left-2 z-10 px-2 py-0.5 bg-black/50 backdrop-blur rounded border border-white/10">
          <span className="text-[8px] font-black text-[#00C805] uppercase">Long Model</span>
        </div>
        <div className="scale-90 origin-top-left w-[111%] h-[111%] p-2">
          <JudasPatternRef type="long" />
        </div>
      </div>
      <div className="relative group overflow-hidden rounded-lg border border-white/5 hover:border-white/10 transition-colors">
        <div className="absolute top-2 left-2 z-10 px-2 py-0.5 bg-black/50 backdrop-blur rounded border border-white/10">
          <span className="text-[8px] font-black text-[#FF6AC1] uppercase">Short Model</span>
        </div>
        <div className="scale-90 origin-top-left w-[111%] h-[111%] p-2">
          <JudasPatternRef type="short" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col min-h-0 bg-background-primary overflow-hidden font-sans">
      {/* LAYER 1: BIAS & CONTEXT HEADER */}
      <BiasHeader
        score={score}
        total={total}
        verdict={verdict}
        verdictColor={verdictColor}
        htfBias={htfBias}
        pdZone={pdZone}
        isKillzoneActive={isKillzoneActive}
        currentPrice={currentPrice}
      />

      {/* Protocol Strip */}
      <div className="shrink-0 px-6 py-2 border-b border-glass-border bg-background-primary/80 flex items-center gap-3">
        <Crosshair className="w-4 h-4 text-[#D4AF37]" />
        <span className="text-[10px] font-black text-zinc-300 uppercase tracking-wider">09:30 Execution Protocol</span>
        <span className="text-[9px] text-zinc-500">
          {'\u57F7\u884C\u5B98\u306E\u30B3\u30C3\u30AF\u30D4\u30C3\u30C8'} &mdash; {'\u5DE6'}: {'\u30C1\u30A7\u30C3\u30AF\u30EA\u30B9\u30C8'} / {'\u53F3'}: NQ{'\u30FBES'} 1{'\u5206\u8DB3\u76E3\u8996'}
        </span>
      </div>

      {/* LAYER 2: EXECUTION COCKPIT */}
      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0 p-4 overflow-auto bg-background-primary text-zinc-100">
        {/* Left: Execution Protocol */}
        <ExecutionProtocol
          completedSteps={completedSteps}
          onToggleStep={toggleStep}
          levels={levels}
          levelsExpanded={levelsExpanded}
          onToggleLevels={toggleLevels}
          onChangeLevel={setLevel}
          isSyncing={isSyncing}
          onSaveSetup={handleSaveSetup}
          rrRatio={rrRatio}
          entryConditions={entryConditions}
          logFeedback={logFeedback}
          onLogEntry={handleLogEntry}
        />

        {/* Right: Chart & Candles */}
        <div className="col-span-12 lg:col-span-7 flex flex-col min-h-0 space-y-4">
          <PriceChart marketTicks={marketTicks} />
          <CandleSnapshots />
        </div>
      </div>

      {/* LAYER 3: CONTEXT (Collapsible) */}
      <ContextPanel
        isExpanded={isContextExpanded}
        onToggle={toggleContext}
        smtDivergence={smtDivergence}
        patternRefSlot={patternRefSlot}
      />
    </div>
  );
});

JudasSniper.displayName = 'JudasSniper';
