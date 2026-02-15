'use client';

/**
 * JudasPatternRef — ICT Judas Swing 教科書パターン図
 * 09:30 に「今の動きがどのモデルか」を 2 秒で判断するための視覚リファレンス。
 *
 * SVG viewBox="0 0 320 200"
 * ホバーで Entry / SL / TP アノテーションをフェードイン (framer-motion)
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tradingColors } from '@/lib/design-tokens';

interface JudasPatternRefProps {
  type: 'long' | 'short';
  showAnnotations?: boolean;
}

/* ── Coordinate helpers ── */

// X axis: 09:25 → 09:50 mapped to 32..288
const TIME_START = 32;
const TIME_END = 288;
const TIME_RANGE = TIME_END - TIME_START;

// Time marks (in minutes from 09:25)
const timeToX = (minutesFromStart: number) =>
  TIME_START + (minutesFromStart / 25) * TIME_RANGE;

const T_0925 = timeToX(0);   // 32
const T_0930 = timeToX(5);   // ~83
const T_0935 = timeToX(10);  // ~134
const T_0940 = timeToX(15);  // ~186
const T_0945 = timeToX(20);  // ~237
const T_0950 = timeToX(25);  // 288

// Y axis: conceptual price 0..1 mapped to 180..20 (inverted for SVG)
const Y_TOP = 20;
const Y_BOT = 180;
const priceToY = (p: number) => Y_BOT - p * (Y_BOT - Y_TOP);

/* ── Long Model data points ── */

const LONG_MANIP = [
  [T_0925, priceToY(0.65)],
  [T_0930, priceToY(0.55)],
  [T_0935, priceToY(0.35)],
  [T_0940, priceToY(0.15)],  // SSL Sweep point
] as const;

const LONG_REVERSAL = [
  [T_0940, priceToY(0.15)],
  [timeToX(17), priceToY(0.35)],
  [T_0945, priceToY(0.50)],  // MSS point
] as const;

const LONG_EXPANSION = [
  [T_0945, priceToY(0.50)],
  [timeToX(22), priceToY(0.70)],
  [T_0950, priceToY(0.85)],
] as const;

/* ── Short Model data points (mirror) ── */

const SHORT_MANIP = [
  [T_0925, priceToY(0.35)],
  [T_0930, priceToY(0.45)],
  [T_0935, priceToY(0.65)],
  [T_0940, priceToY(0.85)],  // BSL Sweep point
] as const;

const SHORT_REVERSAL = [
  [T_0940, priceToY(0.85)],
  [timeToX(17), priceToY(0.65)],
  [T_0945, priceToY(0.50)],  // MSS point
] as const;

const SHORT_EXPANSION = [
  [T_0945, priceToY(0.50)],
  [timeToX(22), priceToY(0.30)],
  [T_0950, priceToY(0.15)],
] as const;

const toPath = (pts: readonly (readonly [number, number])[]) =>
  pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');

/* ── Component ── */

export function JudasPatternRef({ type, showAnnotations = true }: JudasPatternRefProps) {
  const [hovered, setHovered] = useState(false);
  const isLong = type === 'long';

  const manipPath = isLong ? LONG_MANIP : SHORT_MANIP;
  const reversalPath = isLong ? LONG_REVERSAL : SHORT_REVERSAL;
  const expansionPath = isLong ? LONG_EXPANSION : SHORT_EXPANSION;

  const sweepPt = manipPath[manipPath.length - 1];
  const mssPt = reversalPath[reversalPath.length - 1];
  const dirColor = isLong ? tradingColors.long : tradingColors.short;

  // FVG zone: between sweep and MSS vertically
  const fvgX = timeToX(16);
  const fvgW = T_0945 - fvgX;
  const fvgY = isLong ? mssPt[1] : sweepPt[1];
  const fvgH = Math.abs(sweepPt[1] - mssPt[1]) * 0.4;

  // Annotation levels
  const entryY = isLong ? priceToY(0.38) : priceToY(0.62);
  const slY = isLong ? priceToY(0.08) : priceToY(0.92);
  const tpY = isLong ? priceToY(0.80) : priceToY(0.20);

  // Sweep line Y
  const sweepLineY = sweepPt[1];
  const sweepLabel = isLong ? 'SSL Sweep' : 'BSL Sweep';
  const refLineLabel = isLong ? 'PDL' : 'PWH';

  return (
    <svg
      viewBox="0 0 320 200"
      className="w-full h-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      role="img"
      aria-label={`Judas Swing ${isLong ? 'Long' : 'Short'} Model パターン図`}
    >
      {/* Grid lines */}
      {[0.2, 0.4, 0.6, 0.8].map((p) => (
        <line
          key={p}
          x1={TIME_START}
          y1={priceToY(p)}
          x2={TIME_END}
          y2={priceToY(p)}
          stroke={tradingColors.grid}
          strokeWidth="0.5"
        />
      ))}

      {/* Time axis markers */}
      {[
        { x: T_0925, label: '09:25' },
        { x: T_0930, label: '09:30' },
        { x: T_0940, label: '09:40' },
        { x: T_0945, label: '09:45' },
        { x: T_0950, label: '09:50' },
      ].map(({ x, label }) => (
        <g key={label}>
          <line x1={x} y1={Y_TOP} x2={x} y2={Y_BOT} stroke={tradingColors.grid} strokeWidth="0.5" />
          <text x={x} y={194} textAnchor="middle" fontSize="7" fill={tradingColors.axis} fontFamily="monospace">
            {label}
          </text>
        </g>
      ))}

      {/* Reference line (PDL / PWH) */}
      <line
        x1={TIME_START}
        y1={sweepLineY}
        x2={TIME_END}
        y2={sweepLineY}
        stroke={tradingColors.pdl}
        strokeWidth="1"
        strokeDasharray="4 3"
      />
      <text
        x={TIME_END + 2}
        y={sweepLineY + 3}
        fontSize="7"
        fill={tradingColors.pdl}
        fontFamily="monospace"
        fontWeight="bold"
      >
        {refLineLabel}
      </text>

      {/* Phase 1: Manipulation (grey dashed) */}
      <path
        d={toPath(manipPath)}
        fill="none"
        stroke={tradingColors.manipulation}
        strokeWidth="2"
        strokeDasharray="5 3"
      />

      {/* Sweep marker (gold circle) */}
      <circle cx={sweepPt[0]} cy={sweepPt[1]} r="5" fill={tradingColors.gold} />
      <text
        x={sweepPt[0]}
        y={isLong ? sweepPt[1] + 14 : sweepPt[1] - 8}
        textAnchor="middle"
        fontSize="7"
        fill={tradingColors.gold}
        fontWeight="bold"
        fontFamily="monospace"
      >
        {sweepLabel}
      </text>

      {/* FVG Zone (semi-transparent rectangle) */}
      <rect
        x={fvgX}
        y={isLong ? fvgY - fvgH : fvgY}
        width={fvgW}
        height={fvgH}
        fill={isLong ? tradingColors.entryZoneFill : tradingColors.entryZoneFillShort}
        stroke={isLong ? tradingColors.entryZoneStroke : tradingColors.entryZoneStrokeShort}
        strokeWidth="0.5"
        rx="2"
      />
      <text
        x={fvgX + fvgW / 2}
        y={isLong ? fvgY - fvgH / 2 + 3 : fvgY + fvgH / 2 + 3}
        textAnchor="middle"
        fontSize="6"
        fill={dirColor}
        fontFamily="monospace"
        opacity="0.8"
      >
        FVG Entry Zone
      </text>

      {/* Phase 2: Reversal (solid color line) */}
      <path
        d={toPath(reversalPath)}
        fill="none"
        stroke={dirColor}
        strokeWidth="2"
      />

      {/* MSS marker */}
      <circle cx={mssPt[0]} cy={mssPt[1]} r="4" fill={dirColor} />
      <line
        x1={mssPt[0] - 15}
        y1={mssPt[1]}
        x2={mssPt[0] + 15}
        y2={mssPt[1]}
        stroke={dirColor}
        strokeWidth="1.5"
      />
      <text
        x={mssPt[0] + 18}
        y={mssPt[1] + 3}
        fontSize="7"
        fill={dirColor}
        fontWeight="bold"
        fontFamily="monospace"
      >
        MSS
      </text>

      {/* Phase 3: Expansion (thick color line) */}
      <path
        d={toPath(expansionPath)}
        fill="none"
        stroke={dirColor}
        strokeWidth="3"
      />

      {/* ── Hover Annotations (Entry / SL / TP) ── */}
      {showAnnotations && (
        <AnimatePresence>
          {hovered && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Entry line */}
              <line
                x1={TIME_START + 20}
                y1={entryY}
                x2={TIME_END - 20}
                y2={entryY}
                stroke={tradingColors.tpLine}
                strokeWidth="1"
              />
              <text
                x={TIME_START + 18}
                y={entryY - 3}
                fontSize="7"
                fill={tradingColors.tpLine}
                fontWeight="bold"
                fontFamily="monospace"
                textAnchor="end"
              >
                Entry
              </text>

              {/* SL line */}
              <line
                x1={TIME_START + 20}
                y1={slY}
                x2={TIME_END - 20}
                y2={slY}
                stroke={tradingColors.slLine}
                strokeWidth="1"
              />
              <text
                x={TIME_START + 18}
                y={slY - 3}
                fontSize="7"
                fill={tradingColors.slLine}
                fontWeight="bold"
                fontFamily="monospace"
                textAnchor="end"
              >
                SL
              </text>

              {/* TP line (dashed) */}
              <line
                x1={TIME_START + 20}
                y1={tpY}
                x2={TIME_END - 20}
                y2={tpY}
                stroke={tradingColors.tpLine}
                strokeWidth="1"
                strokeDasharray="4 2"
              />
              <text
                x={TIME_START + 18}
                y={tpY - 3}
                fontSize="7"
                fill={tradingColors.tpLine}
                fontWeight="bold"
                fontFamily="monospace"
                textAnchor="end"
              >
                TP
              </text>

              {/* R:R ratio */}
              <text
                x={TIME_END - 10}
                y={(entryY + tpY) / 2}
                fontSize="8"
                fill={tradingColors.gold}
                fontWeight="bold"
                fontFamily="monospace"
                textAnchor="end"
              >
                R:R 1:2
              </text>
            </motion.g>
          )}
        </AnimatePresence>
      )}
    </svg>
  );
}
