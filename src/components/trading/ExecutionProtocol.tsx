'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Crosshair, CheckCircle2, AlertTriangle, Save, BrainCircuit, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { tradingColors } from '@/lib/design-tokens';
import { EXECUTION_CHECKLIST } from '@/lib/trading-constants';
import { LevelsEditor } from './LevelsEditor';
import { EntryConditions } from './EntryConditions';
import type { TradeLevels, EntryCheckItem } from '@/types/trading';

interface ExecutionProtocolProps {
  completedSteps: string[];
  onToggleStep: (id: string) => void;
  levels: TradeLevels;
  levelsExpanded: boolean;
  onToggleLevels: () => void;
  onChangeLevel: <K extends keyof TradeLevels>(key: K, value: number) => void;
  isSyncing: boolean;
  onSaveSetup: () => void;
  rrRatio: number;
  entryConditions: EntryCheckItem[];
  logFeedback: string | null;
  onLogEntry: () => void;
}

export function ExecutionProtocol({
  completedSteps,
  onToggleStep,
  levels,
  levelsExpanded,
  onToggleLevels,
  onChangeLevel,
  isSyncing,
  onSaveSetup,
  rrRatio,
  entryConditions,
  logFeedback,
  onLogEntry,
}: ExecutionProtocolProps) {
  return (
    <div className="col-span-12 lg:col-span-5 flex flex-col min-h-0 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-[#D4AF37]/30 pb-2 shrink-0 gap-4">
        <div className="flex items-center gap-2">
          <Crosshair className="text-[#D4AF37]" size={20} />
          <h2 className="text-xl font-bold tracking-widest uppercase">09:30 Execution Protocol</h2>
        </div>
        <button
          type="button"
          onClick={onSaveSetup}
          disabled={isSyncing}
          title="Save setup to local log. Future: Google Sheets."
          className={cn(
            'flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/20',
            'px-4 py-2 rounded-full text-xs transition-all shrink-0 disabled:opacity-60',
          )}
        >
          <Save size={14} className={isSyncing ? 'animate-pulse' : ''} />
          {isSyncing ? 'Saving...' : 'Save setup (log)'}
        </button>
      </div>

      {/* Levels Editor */}
      <LevelsEditor
        levels={levels}
        expanded={levelsExpanded}
        onToggle={onToggleLevels}
        onChangeLevel={onChangeLevel}
      />

      {/* Checklist */}
      <div className="p-4 space-y-0 rounded-xl border border-glass-border bg-glass-card shrink-0">
        <h3 className="text-[#D4AF37] text-sm font-mono mb-4 uppercase">Execution Protocol</h3>
        <motion.div variants={staggerContainer} initial="hidden" animate="visible">
          {EXECUTION_CHECKLIST.map((step) => {
            const checked = completedSteps.includes(step.id);
            return (
              <motion.label
                key={step.id}
                variants={staggerItem}
                className={cn(
                  'flex items-start gap-3 p-3 hover:bg-white/5 rounded-lg cursor-pointer transition-colors border-l-4',
                  checked ? 'bg-[#00C805]/5 border-[#00C805]' : 'border-transparent',
                )}
              >
                <input
                  type="checkbox"
                  className="mt-1 accent-[#D4AF37]"
                  checked={checked}
                  onChange={() => onToggleStep(step.id)}
                  aria-label={`Mark ${step.label} as complete`}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white">{step.label}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{step.desc}</div>
                </div>
                {checked && <CheckCircle2 size={16} className="text-[#00C805] shrink-0" />}
              </motion.label>
            );
          })}
        </motion.div>
      </div>

      {/* Wisdom Quote */}
      <div className="bg-[#D4AF37]/10 p-3 border border-[#D4AF37]/20 rounded italic text-xs shrink-0">
        <AlertTriangle size={14} className="inline mr-2 text-[#D4AF37] align-middle" />
        {'\u300C'}9:45\u306E\u78BA\u5B9A\u3092\u5F85\u3066\u300209:30\u306E\u521D\u52D5\u3092\u8FFD\u3046\u306E\u306F\u7D20\u4EBA\u3002\u6211\u3005\u306F\u30EA\u30D0\u30FC\u30B5\u30EB\u3092\u72E9\u308B\u3002{'\u300D'}
      </div>

      {/* Gemini Tactical Insight */}
      <motion.div
        className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-4 rounded-xl border border-blue-500/30 shrink-0"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <div className="flex items-center gap-2 mb-2 text-blue-400">
          <BrainCircuit size={18} />
          <span className="text-xs font-bold uppercase tracking-widest">Gemini Tactical Insight</span>
        </div>
        <p className="text-xs leading-relaxed text-blue-100/80">
          {'\u300C'}\u9AD8\u6A4B\u30E2\u30C7\u30EB\u306E\u6570\u91CF\u5206\u6790\u306B\u3088\u308C\u3070\u3001\u73FE\u5728\u306ENQ\u306F\u91D1\u5229\u611F\u5FDC\u5EA6\u306E\u95BE\u5024\u5185\u306B\u3042\u308A\u307E\u3059\u300209:30\u306ESwing\u304C\u524D\u65E5\u5B89\u5024\u3092Sweep\u3057\u305F\u5834\u5408\u3001\u5F37\u6C17\u306ESMT\u767A\u751F\u78BA\u7387\u304C82%\u307E\u3067\u4E0A\u6607\u3057\u307E\u3059\u300209:45\u306E\u78BA\u5B9A\u3092\u5F85\u3063\u3066\u57F7\u884C\u3092\u63A8\u5968\u3057\u307E\u3059\u3002{'\u300D'}
        </p>
      </motion.div>

      {/* Quick Levels Strip */}
      <div className="grid grid-cols-3 gap-2 shrink-0">
        <div className="bg-white/[0.03] border border-white/5 rounded-lg p-2 text-center">
          <span className="text-[8px] text-zinc-500 uppercase block">SL</span>
          <span className="text-sm font-black font-mono text-[#FF6AC1]">{levels.sl.toLocaleString()}</span>
        </div>
        <div className="bg-[#00C805]/5 border border-[#00C805]/20 rounded-lg p-2 text-center">
          <span className="text-[8px] text-[#00C805] uppercase block">Entry</span>
          <span className="text-sm font-black font-mono text-white">
            {levels.entryMin.toLocaleString()}\u2013{levels.entryMax.toLocaleString()}
          </span>
        </div>
        <div className="bg-white/[0.03] border border-white/5 rounded-lg p-2 text-center">
          <span className="text-[8px] text-zinc-500 uppercase block">R:R</span>
          <span className="text-sm font-black font-mono text-[#D4AF37]">1:{rrRatio.toFixed(1)}</span>
        </div>
      </div>

      {/* Entry Conditions */}
      <EntryConditions
        conditions={entryConditions}
        logFeedback={logFeedback}
        onLogEntry={onLogEntry}
      />
    </div>
  );
}
