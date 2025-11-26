'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { designTokens } from '@/lib/design-tokens';
import type { ChartDataPoint } from '@/types/charts';

export interface AnimatedLineChartProps {
  data: ChartDataPoint[];
  lines: {
    dataKey: string;
    color: string;
    label: string;
  }[];
  title?: string;
  height?: number;
  showGrid?: boolean;
  showArea?: boolean;
  className?: string;
}

/**
 * AnimatedLineChart - 線の描画アニメーション付きラインチャート
 */
export function AnimatedLineChart({
  data,
  lines,
  title,
  height = 300,
  showGrid = true,
  showArea = false,
  className,
}: AnimatedLineChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <motion.div
          className="bg-background-secondary/95 backdrop-blur-xl border border-glass-border rounded-lg p-3 shadow-glass"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.15 }}
        >
          <p className="text-xs text-white/60 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 mb-1">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-white font-medium">
                {entry.name}: {entry.value.toLocaleString()}
              </span>
            </div>
          ))}
        </motion.div>
      );
    }
    return null;
  };

  const ChartComponent = showArea ? AreaChart : LineChart;

  return (
    <GlassCard className={className}>
      {title && (
        <div className="px-6 pt-6 pb-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
      )}

      <div className="px-6 pb-6">
        <ResponsiveContainer width="100%" height={height}>
          <ChartComponent
            data={data}
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          >
            {showGrid && (
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={designTokens.colors.chart.grid}
                vertical={false}
              />
            )}

            <XAxis
              dataKey="date"
              stroke={designTokens.colors.text.tertiary}
              tick={{ fill: designTokens.colors.text.tertiary, fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: designTokens.colors.chart.grid }}
            />

            <YAxis
              stroke={designTokens.colors.text.tertiary}
              tick={{ fill: designTokens.colors.text.tertiary, fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
            />

            <Tooltip content={<CustomTooltip />} />

            {lines.map((line, index) => {
              if (showArea) {
                return (
                  <Area
                    key={line.dataKey}
                    type="monotone"
                    dataKey={line.dataKey}
                    stroke={line.color}
                    fill={line.color}
                    fillOpacity={0.2}
                    strokeWidth={2}
                    animationDuration={1200}
                    animationBegin={index * 100}
                    dot={false}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                );
              }

              return (
                <Line
                  key={line.dataKey}
                  type="monotone"
                  dataKey={line.dataKey}
                  stroke={line.color}
                  strokeWidth={2}
                  animationDuration={1200}
                  animationBegin={index * 100}
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              );
            })}
          </ChartComponent>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
