/**
 * トレーディング定数
 * Judas Swing Sniper で使用する静的データ・参照値
 */

import type {
  KeyLevels,
  OrderBlock,
  FVGZone,
  LiquidityPool,
  StructureEntry,
  SessionInfo,
  ExecutionStep,
  CandleSnapshot,
  MinuteDataPoint,
} from '@/types/trading';
import { tradingColors } from './design-tokens';

/* ── Key Reference Levels ── */

export const KEY_LEVELS: KeyLevels = {
  pdh: 18412,
  pdl: 18198,
  pwh: 18520,
  pwl: 18105,
  midnightOpen: 18245,
  asianHigh: 18310,
  asianLow: 18220,
  londonHigh: 18380,
  londonLow: 18190,
  nyOpen: 18298,
};

/* ── Order Blocks ── */

export const ORDER_BLOCKS: OrderBlock[] = [
  { type: 'BULL', tf: '15m', zone: '18,190 \u2013 18,210', dist: '-48' },
  { type: 'BEAR', tf: '15m', zone: '18,395 \u2013 18,420', dist: '+157' },
  { type: 'BULL', tf: '1H', zone: '18,105 \u2013 18,140', dist: '-133' },
  { type: 'BEAR', tf: '1H', zone: '18,480 \u2013 18,520', dist: '+242' },
];

/* ── Fair Value Gaps ── */

export const FVG_ZONES: FVGZone[] = [
  { dir: 'BULL', tf: '5m', range: '18,222 \u2013 18,238', filled: 0.35 },
  { dir: 'BEAR', tf: '5m', range: '18,340 \u2013 18,355', filled: 0.1 },
  { dir: 'BULL', tf: '15m', range: '18,180 \u2013 18,205', filled: 0 },
  { dir: 'BEAR', tf: '1H', range: '18,400 \u2013 18,435', filled: 0 },
];

/* ── Liquidity Pools ── */

export const LIQUIDITY: LiquidityPool[] = [
  { side: 'BSL', level: '18,412', ref: 'PDH', str: 0.92, swept: false },
  { side: 'BSL', level: '18,520', ref: 'PWH', str: 0.85, swept: false },
  { side: 'SSL', level: '18,198', ref: 'PDL', str: 0.88, swept: false },
  { side: 'SSL', level: '18,105', ref: 'PWL', str: 0.95, swept: false },
  { side: 'BSL', level: '18,310', ref: 'Asia H', str: 0.6, swept: true },
  { side: 'SSL', level: '18,220', ref: 'Asia L', str: 0.55, swept: false },
];

/* ── Market Structure ── */

export const STRUCTURE: StructureEntry[] = [
  { tf: '1m', bias: 'BEARISH', shift: 'MSS @ 18,270', conf: 0.7 },
  { tf: '5m', bias: 'BEARISH', shift: 'BOS @ 18,255', conf: 0.8 },
  { tf: '15m', bias: 'BULLISH', shift: 'MSS @ 18,310', conf: 0.65 },
  { tf: '1H', bias: 'BULLISH', shift: 'BOS @ 18,280', conf: 0.85 },
  { tf: '4H', bias: 'BULLISH', shift: 'BOS @ 18,150', conf: 0.9 },
];

/* ── Sessions ── */

export const SESSIONS: SessionInfo[] = [
  { name: 'ASIA', time: '19:00\u201300:00', status: 'CLOSED', range: '90', color: '#B933AD' },
  { name: 'LONDON', time: '03:00\u201305:00', status: 'CLOSED', range: '190', color: '#0039A6' },
  { name: 'NY AM', time: '09:30\u201311:00', status: 'ACTIVE', range: '\u2014', color: tradingColors.pink },
  { name: 'NY PM', time: '13:30\u201316:00', status: 'PENDING', range: '\u2014', color: tradingColors.gold },
];

/* ── 09:30 Execution Protocol Steps ── */

export const EXECUTION_CHECKLIST: readonly ExecutionStep[] = [
  { id: 'HTF', label: 'HTF Bias Confirmation', desc: '15\u5206\u8db3/1\u6642\u9593\u8db3\u3067\u306ePDH/PDL\u65b9\u5411\u78ba\u8a8d' },
  { id: 'SMT', label: 'DXY/SMT Divergence', desc: '\u30c9\u30eb\u6307\u6570\u3068\u9006\u76f8\u95a2\u3001NQ/ES\u306e\u76f8\u95a2\u5d29\u308c\u78ba\u8a8d' },
  { id: 'JSW', label: '09:30 Judas Swing', desc: '\u30aa\u30fc\u30d7\u30f3\u76f4\u5f8c\u306e\u9006\u65b9\u5411\u3078\u306eManipulation\u767a\u751f' },
  { id: 'FVG', label: '09:45 FVG / MSS', desc: '\u771f\u306e\u30c8\u30ec\u30f3\u30c9\u5f62\u6210\u3068Fair Value Gap\u306e\u767a\u751f' },
] as const;

/* ── Sample Candle Snapshots (09:30\u201309:45) ── */

export const CANDLE_SNAPSHOTS_0930: CandleSnapshot[] = [
  { time: '09:30', o: 18280, h: 18298, l: 18265, c: 18288 },
  { time: '09:35', o: 18288, h: 18305, l: 18280, c: 18292 },
  { time: '09:40', o: 18292, h: 18295, l: 18258, c: 18262 },
  { time: '09:45', o: 18262, h: 18298, l: 18255, c: 18290 },
];

/* ── Mock 1-Minute Chart Data (09:25\u201309:50) ── */

export const MOCK_MINUTE_DATA: MinuteDataPoint[] = (() => {
  const baseNq = 18250;
  const baseEs = 5120;
  const times = [
    '09:25', '09:26', '09:27', '09:28', '09:29', '09:30',
    '09:31', '09:32', '09:33', '09:34', '09:35', '09:36',
    '09:37', '09:38', '09:39', '09:40', '09:41', '09:42',
    '09:43', '09:44', '09:45', '09:46', '09:47', '09:48',
    '09:49', '09:50',
  ];
  let nq = baseNq;
  let es = baseEs;

  return times.map((time, i) => {
    const isOpen = time === '09:30';
    const isReversal = time >= '09:40' && time <= '09:45';
    const volatility = isOpen
      ? -35
      : isReversal && time === '09:45'
        ? 42
        : Math.sin(i * 0.4) * 8 + (i > 5 ? 5 : 0);
    nq += volatility + (i === 20 ? 25 : 0);
    es += volatility * 0.28 + (i === 20 ? 7 : 0);
    return { time, nq: Math.round(nq), es: Math.round(es * 10) / 10 };
  });
})();

/* ── Defaults ── */

export const FALLBACK_PRICE = 18263;
export const LIQUIDITY_TOUCH_THRESHOLD = 25;

export const DEFAULT_LEVELS = {
  pdh: KEY_LEVELS.pdh,
  pdl: KEY_LEVELS.pdl,
  sl: 18190,
  entryMin: 18222,
  entryMax: 18238,
} as const;
