/**
 * Judas Sniper Zustand Store
 * コンポーネント間の状態共有・ビジネスロジック集約
 */

import { create } from 'zustand';
import type { TradeLevels, Verdict, SetupLogPayload, EntryLogPayload } from '@/types/trading';
import { DEFAULT_LEVELS, EXECUTION_CHECKLIST } from '@/lib/trading-constants';

interface JudasState {
  // Execution Protocol
  completedSteps: string[];
  toggleStep: (id: string) => void;
  resetSteps: () => void;

  // Editable Levels
  levels: TradeLevels;
  setLevel: <K extends keyof TradeLevels>(key: K, value: TradeLevels[K]) => void;
  resetLevels: () => void;

  // UI State
  isContextExpanded: boolean;
  toggleContext: () => void;
  levelsExpanded: boolean;
  toggleLevels: () => void;
  isSyncing: boolean;
  logFeedback: string | null;

  // Derived
  isProtocolComplete: () => boolean;

  // Actions
  saveSetupLog: (currentPrice: number, verdict: Verdict) => Promise<void>;
  logEntry: (currentPrice: number) => void;
}

const STORAGE_KEYS = {
  setups: 'whalehunter_judas_setups',
  entries: 'whalehunter_judas_entries',
} as const;

export const useJudasStore = create<JudasState>((set, get) => ({
  // ── Execution Protocol ──
  completedSteps: [],

  toggleStep: (id) =>
    set((state) => ({
      completedSteps: state.completedSteps.includes(id)
        ? state.completedSteps.filter((s) => s !== id)
        : [...state.completedSteps, id],
    })),

  resetSteps: () => set({ completedSteps: [] }),

  // ── Levels ──
  levels: { ...DEFAULT_LEVELS },

  setLevel: (key, value) =>
    set((state) => ({
      levels: { ...state.levels, [key]: value },
    })),

  resetLevels: () => set({ levels: { ...DEFAULT_LEVELS } }),

  // ── UI State ──
  isContextExpanded: false,
  toggleContext: () => set((state) => ({ isContextExpanded: !state.isContextExpanded })),

  levelsExpanded: false,
  toggleLevels: () => set((state) => ({ levelsExpanded: !state.levelsExpanded })),

  isSyncing: false,
  logFeedback: null,

  // ── Derived ──
  isProtocolComplete: () => get().completedSteps.length >= EXECUTION_CHECKLIST.length,

  // ── Actions ──
  saveSetupLog: async (currentPrice, verdict) => {
    set({ isSyncing: true });

    const { completedSteps, levels } = get();
    const payload: SetupLogPayload = {
      timestamp: new Date().toISOString(),
      completedSteps,
      levels,
      currentPrice,
      verdict,
    };

    console.log('Judas Tactical Log (local)', payload);

    try {
      const existing = localStorage.getItem(STORAGE_KEYS.setups);
      const arr: SetupLogPayload[] = existing ? JSON.parse(existing) : [];
      arr.push(payload);
      localStorage.setItem(STORAGE_KEYS.setups, JSON.stringify(arr.slice(-50)));
    } catch {
      // localStorage unavailable
    }

    await new Promise((r) => setTimeout(r, 400));
    set({ isSyncing: false });
  },

  logEntry: (currentPrice) => {
    const { levels } = get();
    const entryMid = (levels.entryMin + levels.entryMax) / 2;
    const direction = currentPrice >= entryMid ? 'LONG' : 'SHORT';

    const entry: EntryLogPayload = {
      direction,
      price: currentPrice,
      sl: levels.sl,
      target: levels.pdh,
      time: new Date().toISOString(),
    };

    console.log('Judas Entry Log (no order sent)', entry);

    try {
      const existing = localStorage.getItem(STORAGE_KEYS.entries);
      const arr: EntryLogPayload[] = existing ? JSON.parse(existing) : [];
      arr.push(entry);
      localStorage.setItem(STORAGE_KEYS.entries, JSON.stringify(arr.slice(-100)));
    } catch {
      // localStorage unavailable
    }

    const feedback = `Logged: ${direction} @ ${currentPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    set({ logFeedback: feedback });
    setTimeout(() => set({ logFeedback: null }), 3000);
  },
}));
