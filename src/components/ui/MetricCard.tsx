'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { cn, formatCurrency, formatPercent, getTrendColor } from '@/lib/utils';
import { useCountUp } from '@/hooks/useCountUp';
import type { TrendDirection } from '@/types/dashboard';

export interface MetricCardProps {
  title: string;
  value: number;
  unit?: string;
  change?: number;
  trend?: TrendDirection;
  icon?: React.ReactNode;
  loading?: boolean;
  format?: 'number' | 'currency' | 'percent';
  decimals?: number;
  className?: string;
}

/**
 * MetricCard - KPI数値表示カード
 * カウントアップアニメーション付き
 */
export function MetricCard({
  title,
  value,
  unit,
  change,
  trend,
  icon,
  loading = false,
  format = 'number',
  decimals = 0,
  className,
}: MetricCardProps) {
  const animatedValue = useCountUp(value, { decimals });

  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return formatCurrency(val);
      case 'percent':
        return formatPercent(val);
      default:
        return val.toLocaleString('en-US', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        });
    }
  };

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  return (
    <GlassCard className={cn('p-6', className)} hoverable>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-white/60 mb-2">{title}</p>

          <div className="flex items-baseline gap-2 mb-3">
            <motion.h3
              className="text-3xl font-bold text-white font-mono"
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {loading ? '...' : formatValue(animatedValue)}
              {unit && <span className="text-lg text-white/60 ml-1">{unit}</span>}
            </motion.h3>
          </div>

          {change !== undefined && trend && (
            <motion.div
              className="flex items-center gap-1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <TrendIcon
                className={cn('w-4 h-4', getTrendColor(trend))}
              />
              <span className={cn('text-sm font-semibold', getTrendColor(trend))}>
                {Math.abs(change)}%
              </span>
              <span className="text-xs text-white/50 ml-1">vs last period</span>
            </motion.div>
          )}
        </div>

        {icon && (
          <motion.div
            className="p-3 rounded-lg bg-white/5"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="text-accent-primary w-6 h-6">{icon}</div>
          </motion.div>
        )}
      </div>
    </GlassCard>
  );
}
