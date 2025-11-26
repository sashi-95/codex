'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Info, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useTypewriter } from '@/hooks/useTypewriter';

export interface AIInsightBubbleProps {
  insight: string;
  type?: 'info' | 'warning' | 'success' | 'alert';
  actionable?: {
    label: string;
    onClick: () => void;
  };
  animate?: boolean;
  className?: string;
}

const typeConfig = {
  info: {
    icon: Info,
    color: 'text-status-info',
    borderColor: 'border-status-info/30',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-status-warning',
    borderColor: 'border-status-warning/30',
  },
  success: {
    icon: CheckCircle,
    color: 'text-status-success',
    borderColor: 'border-status-success/30',
  },
  alert: {
    icon: AlertCircle,
    color: 'text-status-error',
    borderColor: 'border-status-error/30',
  },
};

/**
 * AIInsightBubble - AI生成インサイト表示
 * タイピングアニメーション付き吹き出し
 */
export function AIInsightBubble({
  insight,
  type = 'info',
  actionable,
  animate = true,
  className,
}: AIInsightBubbleProps) {
  const config = typeConfig[type];
  const Icon = config.icon;

  const { displayText, isComplete } = useTypewriter(insight, {
    speed: animate ? 20 : 0,
    delay: 100,
  });

  return (
    <GlassCard
      className={cn('p-4 border-l-4', config.borderColor, className)}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex gap-3">
        <motion.div
          className={cn('flex-shrink-0', config.color)}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Icon className="w-5 h-5" />
        </motion.div>

        <div className="flex-1 min-w-0">
          <p className="text-sm text-white/90 leading-relaxed">
            {animate ? displayText : insight}
            {animate && !isComplete && (
              <motion.span
                className="inline-block w-0.5 h-4 bg-accent-primary ml-0.5"
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
            )}
          </p>

          {actionable && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={isComplete ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={actionable.onClick}
                className="mt-3"
              >
                {actionable.label}
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
