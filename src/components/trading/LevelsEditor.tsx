'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { TradeLevels } from '@/types/trading';

interface LevelsEditorProps {
  levels: TradeLevels;
  expanded: boolean;
  onToggle: () => void;
  onChangeLevel: <K extends keyof TradeLevels>(key: K, value: number) => void;
}

const LEVEL_FIELDS: { key: keyof TradeLevels; label: string; colSpan?: number }[] = [
  { key: 'pdh', label: 'PDH' },
  { key: 'pdl', label: 'PDL' },
  { key: 'sl', label: 'SL' },
  { key: 'entryMin', label: 'Entry Min' },
  { key: 'entryMax', label: 'Entry Max', colSpan: 2 },
];

export function LevelsEditor({ levels, expanded, onToggle, onChangeLevel }: LevelsEditorProps) {
  return (
    <div className="hidden lg:block shrink-0 rounded-xl border border-glass-border bg-glass-card overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
      >
        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Levels</span>
        <span className="text-zinc-500 text-xs">{expanded ? '\u2212' : '+'}</span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 grid grid-cols-2 gap-2">
              {LEVEL_FIELDS.map(({ key, label, colSpan }) => (
                <div key={key} className={colSpan === 2 ? 'col-span-2' : ''}>
                  <label className="block text-[8px] text-zinc-500 uppercase font-bold mb-0.5">{label}</label>
                  <input
                    type="number"
                    value={levels[key]}
                    onChange={(e) => onChangeLevel(key, Number(e.target.value))}
                    className={cn(
                      'w-full bg-white/5 border border-glass-border rounded py-1 px-2',
                      'text-[10px] font-mono text-white',
                      'focus:border-[#D4AF37] outline-none transition-colors',
                    )}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
