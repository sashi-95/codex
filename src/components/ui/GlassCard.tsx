'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: React.ReactNode;
  variant?: 'default' | 'highlight' | 'alert';
  hoverable?: boolean;
  clickable?: boolean;
  className?: string;
}

const variantStyles = {
  default: 'bg-glass-card border-glass-border',
  highlight: 'bg-glass-card-hover border-accent-primary/30',
  alert: 'bg-glass-card border-status-error/30',
};

/**
 * GlassCard - Glassmorphism デザインのカードコンポーネント
 * すべてのダッシュボードカードの基盤
 */
export function GlassCard({
  children,
  variant = 'default',
  hoverable = true,
  clickable = false,
  className,
  ...props
}: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        'relative rounded-xl border backdrop-blur-xl',
        'transition-all duration-250 ease-smooth',
        variantStyles[variant],
        hoverable && 'hover:border-glass-border-hover hover:shadow-card-hover',
        clickable && 'cursor-pointer',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hoverable ? { y: -4 } : undefined}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
