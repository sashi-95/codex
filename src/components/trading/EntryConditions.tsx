'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EntryCheckItem } from '@/types/trading';

interface EntryConditionsProps {
  conditions: EntryCheckItem[];
  logFeedback: string | null;
  onLogEntry: () => void;
}

export function EntryConditions({ conditions, logFeedback, onLogEntry }: EntryConditionsProps) {
  return (
    <div className="border-t border-white/5 pt-3 shrink-0">
      <div className="flex items-center gap-2 mb-2">
        <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
        <span className="text-[10px] font-black text-zinc-300 uppercase tracking-wider">Entry Conditions</span>
      </div>

      <div className="space-y-1.5">
        {conditions.map((item) => (
          <div
            key={item.id}
            className={cn(
              'flex items-center gap-2 px-2 py-1 rounded border text-[9px]',
              item.ok ? 'bg-[#00C805]/5 border-[#00C805]/20' : 'bg-white/[0.02] border-white/5',
            )}
          >
            <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', item.ok ? 'bg-[#00C805]' : 'bg-zinc-600')} />
            <span className={item.ok ? 'text-[#00C805] font-black' : 'text-zinc-500'}>{item.label}</span>
          </div>
        ))}
      </div>

      <p className="text-[8px] text-zinc-500 mt-2 leading-relaxed">
        FVG and Liquidity Sweep\u78BA\u8A8D\u5F8C\u306B\u30A8\u30F3\u30C8\u30EA\u30FC\u3002SMT at 9:45\u3067Macro Alignment\u3092\u78BA\u8A8D\u3002
      </p>

      {logFeedback && (
        <motion.p
          className="mt-2 text-[10px] font-bold text-[#00C805]"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {logFeedback}
        </motion.p>
      )}

      <button
        type="button"
        onClick={onLogEntry}
        aria-label="エントリーログを記録 (Ctrl+Shift+E)"
        className={cn(
          'mt-3 w-full py-2 rounded-lg bg-white/10 hover:bg-white/15',
          'border border-white/20 text-[10px] font-black uppercase text-white transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]',
        )}
      >
        Log entry (no order sent)
      </button>
    </div>
  );
}
