'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface RadialProgressProps {
  percentage: number;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  label?: string;
  showPercentage?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: { width: 80, strokeWidth: 6, fontSize: 'text-sm' },
  md: { width: 120, strokeWidth: 8, fontSize: 'text-base' },
  lg: { width: 160, strokeWidth: 10, fontSize: 'text-lg' },
};

/**
 * RadialProgress - 円形プログレスリング
 */
export function RadialProgress({
  percentage,
  size = 'md',
  color = '#4A96FF',
  label,
  showPercentage = true,
  className,
}: RadialProgressProps) {
  const config = sizeConfig[size];
  const radius = (config.width - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={config.width} height={config.width} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={config.width / 2}
          cy={config.width / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={config.strokeWidth}
          fill="none"
        />

        {/* Progress circle */}
        <motion.circle
          cx={config.width / 2}
          cy={config.width / 2}
          r={radius}
          stroke={color}
          strokeWidth={config.strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showPercentage && (
          <motion.span
            className={cn('font-bold text-white font-mono', config.fontSize)}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {Math.round(percentage)}%
          </motion.span>
        )}
        {label && (
          <span className="text-xs text-white/60 mt-1">{label}</span>
        )}
      </div>
    </div>
  );
}
