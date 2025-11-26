'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Search, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { TimeRange } from '@/types/dashboard';

export interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  onTimeRangeChange?: (range: TimeRange) => void;
  onExport?: () => void;
  className?: string;
}

const timeRanges: { value: TimeRange; label: string }[] = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'quarter', label: 'Quarter' },
];

/**
 * DashboardHeader - ダッシュボード共通ヘッダー
 */
export function DashboardHeader({
  title,
  subtitle,
  onTimeRangeChange,
  onExport,
  className,
}: DashboardHeaderProps) {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('month');

  const handleRangeChange = (range: TimeRange) => {
    setSelectedRange(range);
    onTimeRangeChange?.(range);
  };

  return (
    <motion.div
      className={cn('flex items-center justify-between mb-8', className)}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">{title}</h1>
        {subtitle && (
          <p className="text-sm text-white/60">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Time Range Filter */}
        <div className="flex items-center gap-1 bg-glass-card border border-glass-border rounded-lg p-1">
          {timeRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => handleRangeChange(range.value)}
              className={cn(
                'px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200',
                selectedRange === range.value
                  ? 'bg-accent-primary text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              )}
            >
              {range.label}
            </button>
          ))}
        </div>

        {/* Search Button */}
        <Button variant="ghost" size="md" icon={<Search className="w-4 h-4" />}>
          Search
        </Button>

        {/* Export Button */}
        {onExport && (
          <Button
            variant="secondary"
            size="md"
            onClick={onExport}
            icon={<Download className="w-4 h-4" />}
          >
            Export
          </Button>
        )}
      </div>
    </motion.div>
  );
}
