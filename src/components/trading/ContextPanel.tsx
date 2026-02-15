'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Target, Zap, Layers, Crosshair, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { KEY_LEVELS, STRUCTURE, LIQUIDITY, ORDER_BLOCKS } from '@/lib/trading-constants';
import type { SMTDivergence } from '@/types/trading';

interface ContextPanelProps {
  isExpanded: boolean;
  onToggle: () => void;
  smtDivergence: SMTDivergence;
  patternRefSlot?: React.ReactNode;
}

export function ContextPanel({ isExpanded, onToggle, smtDivergence, patternRefSlot }: ContextPanelProps) {
  return (
    <div
      className={cn(
        'shrink-0 border-t border-glass-border bg-background-primary transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] flex flex-col',
        isExpanded ? 'h-[55%]' : 'h-12',
      )}
    >
      {/* Toggle Bar */}
      <button
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-controls="judas-context-panel"
        aria-label="コンテキストパネルを開閉 (Ctrl+Shift+C)"
        className="h-12 w-full flex items-center px-6 hover:bg-white/[0.02] transition-colors group relative z-30 bg-background-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
      >
        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mr-8 group-hover:text-zinc-300 transition-colors">
          Context Logic
        </span>

        {/* Summary Strip */}
        <div className={cn('flex items-center gap-8 transition-opacity duration-300', isExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100')}>
          <div className="flex items-center gap-2.5">
            <span className={cn('w-1.5 h-1.5 rounded-full', smtDivergence.detected ? 'bg-[#FF6AC1] shadow-[0_0_6px_#FF6AC1]' : 'bg-zinc-700')} />
            <span className="text-[10px] font-mono font-bold text-zinc-400">SMT: {smtDivergence.detected ? 'YES' : 'NO'}</span>
          </div>
          <div className="w-px h-3 bg-white/10" />
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00C805]" />
            <span className="text-[10px] font-mono font-bold text-zinc-400">Sweep: Asia High</span>
          </div>
          <div className="w-px h-3 bg-white/10" />
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
            <span className="text-[10px] font-mono font-bold text-zinc-400">MSS: 1m Confirmed</span>
          </div>
        </div>

        <div className="ml-auto text-zinc-600 transition-transform duration-300 group-hover:text-zinc-400">
          {isExpanded ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            id="judas-context-panel"
            className="flex-1 overflow-hidden p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="grid grid-cols-4 gap-6 h-full">
              {/* Col 1: Structure & Levels */}
              <div className="space-y-6">
                <div className="bg-glass-card border border-glass-border rounded-xl p-3">
                  <h4 className="text-[9px] font-black text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Layers className="w-3 h-3" /> Market Structure
                  </h4>
                  {STRUCTURE.map((ms) => (
                    <div key={ms.tf} className="flex justify-between items-center text-[10px] font-mono py-1 border-b border-white/[0.04] last:border-0">
                      <span className="text-zinc-500 font-bold w-8">{ms.tf}</span>
                      <span className={cn('font-black tracking-wide', ms.bias === 'BULLISH' ? 'text-[#00C805]' : 'text-[#FF6AC1]')}>
                        {ms.bias}
                      </span>
                      <div className="w-12 h-1 bg-zinc-800 rounded-full overflow-hidden ml-2">
                        <div className="h-full bg-white/20" style={{ width: `${ms.conf * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-glass-card border border-glass-border rounded-xl p-3">
                  <h4 className="text-[9px] font-black text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Crosshair className="w-3 h-3" /> Key Levels
                  </h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                    {Object.entries(KEY_LEVELS).slice(0, 8).map(([k, v]) => (
                      <div key={k} className="flex justify-between text-[9px] font-mono items-center">
                        <span className="text-zinc-600 uppercase font-bold">{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="text-zinc-300">{v.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Col 2: Liquidity & Order Flow */}
              <div className="space-y-6">
                <div className="bg-glass-card border border-glass-border rounded-xl p-3">
                  <h4 className="text-[9px] font-black text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Target className="w-3 h-3" /> Liquidity Pools
                  </h4>
                  {LIQUIDITY.map((l, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px] font-mono py-1 last:mb-0">
                      <span className={cn('w-1.5 h-1.5 rounded-full', l.swept ? 'bg-zinc-600' : l.side === 'BSL' ? 'bg-[#FF6AC1]' : 'bg-[#00C805]')} />
                      <span className={cn('flex-1', l.swept ? 'text-zinc-600 line-through decoration-zinc-700' : 'text-zinc-300')}>{l.ref}</span>
                      <span className="text-zinc-500">{l.level}</span>
                      {l.swept && <span className="text-[8px] text-[#D4AF37] font-black bg-[#D4AF37]/10 px-1 rounded ml-1">SWEPT</span>}
                    </div>
                  ))}
                </div>

                <div className="bg-glass-card border border-glass-border rounded-xl p-3">
                  <h4 className="text-[9px] font-black text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <BarChart3 className="w-3 h-3" /> Confluence Blocks
                  </h4>
                  {ORDER_BLOCKS.slice(0, 3).map((ob, i) => (
                    <div key={i} className="text-[10px] font-mono text-zinc-400 mb-1.5 flex items-center gap-2">
                      <span className={cn('px-1.5 py-0.5 rounded text-[9px] font-black', ob.type === 'BULL' ? 'bg-[#00C805]/10 text-[#00C805]' : 'bg-[#FF6AC1]/10 text-[#FF6AC1]')}>
                        {ob.tf} {ob.type}
                      </span>
                      <span>{ob.zone}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Col 3 & 4: Pattern Reference (slot) */}
              <div className="col-span-2 bg-[#080a0f] rounded-xl border border-glass-border p-3 overflow-hidden flex flex-col relative">
                <div className="flex items-center justify-between mb-3 z-10 relative">
                  <div className="flex items-center gap-2">
                    <Zap className="w-3 h-3 text-[#D4AF37]" />
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Pattern Reference</span>
                  </div>
                  <span className="text-[9px] text-zinc-600 font-mono">Judas Swing Long vs Short</span>
                </div>
                {patternRefSlot ?? (
                  <div className="flex-1 flex items-center justify-center text-zinc-600 text-xs">
                    JudasPatternRef placeholder
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
