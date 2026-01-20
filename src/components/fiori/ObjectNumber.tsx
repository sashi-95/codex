'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fioriDesignTokens } from '@/lib/fiori-design-tokens';
import type { ObjectStatusState } from './ObjectStatus';

export interface ObjectNumberProps {
  number: number | string;
  unit?: string;
  state?: ObjectStatusState;
  emphasized?: boolean;
  trend?: 'up' | 'down' | 'none';
  textAlign?: 'begin' | 'end';
  format?: 'number' | 'currency' | 'percent';
  decimals?: number;
  className?: string;
}

const stateColors = {
  error: '#BB0000',
  warning: '#E76500',
  success: '#2B7D2B',
  information: '#0070F2',
  none: '#32363A',
};

/**
 * ObjectNumber Component
 * Displays a numeric value with optional unit and semantic state (SAP Fiori pattern)
 *
 * Usage:
 * <ObjectNumber number={1234.56} unit="USD" state="success" emphasized />
 * <ObjectNumber number={85} unit="%" trend="up" />
 */
export function ObjectNumber({
  number,
  unit,
  state = 'none',
  emphasized = false,
  trend = 'none',
  textAlign = 'end',
  format = 'number',
  decimals = 0,
  className,
}: ObjectNumberProps) {
  const formatNumber = (value: number | string): string => {
    if (typeof value === 'string') return value;

    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(value);
      case 'percent':
        return `${value.toFixed(decimals)}%`;
      default:
        return value.toLocaleString('en-US', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        });
    }
  };

  const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown;
  const showTrend = trend !== 'none';

  return (
    <motion.div
      className={cn(
        'inline-flex items-center gap-2',
        textAlign === 'end' && 'justify-end',
        className
      )}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className={cn(
          'flex items-baseline gap-1',
          emphasized && 'font-bold text-2xl',
          !emphasized && 'font-semibold text-lg'
        )}
        style={{ color: stateColors[state] }}
      >
        <span className="font-mono">{formatNumber(number)}</span>
        {unit && (
          <span className="text-sm font-normal opacity-70">{unit}</span>
        )}
      </div>

      {showTrend && (
        <TrendIcon
          className={cn(
            'w-4 h-4',
            trend === 'up' && 'text-[#2B7D2B]',
            trend === 'down' && 'text-[#BB0000]'
          )}
        />
      )}
    </motion.div>
  );
}
