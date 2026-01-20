'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { fioriDesignTokens } from '@/lib/fiori-design-tokens';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, Circle } from 'lucide-react';

export type ObjectStatusState = 'error' | 'warning' | 'success' | 'information' | 'none';

export interface ObjectStatusProps {
  text: string;
  state?: ObjectStatusState;
  icon?: boolean;
  inverted?: boolean;
  active?: boolean;
  className?: string;
}

const stateIcons = {
  error: AlertCircle,
  warning: AlertTriangle,
  success: CheckCircle2,
  information: Info,
  none: Circle,
};

const stateColors = {
  error: {
    text: '#BB0000',
    bg: '#FFEBEB',
    border: '#BB0000',
  },
  warning: {
    text: '#E76500',
    bg: '#FFF3E8',
    border: '#E76500',
  },
  success: {
    text: '#2B7D2B',
    bg: '#F1FAF5',
    border: '#2B7D2B',
  },
  information: {
    text: '#0070F2',
    bg: '#EBF5FF',
    border: '#0070F2',
  },
  none: {
    text: '#6A6D70',
    bg: '#F7F7F7',
    border: '#6A6D70',
  },
};

/**
 * ObjectStatus Component
 * Displays a text with semantic coloring (SAP Fiori pattern)
 *
 * Usage:
 * <ObjectStatus text="Active" state="success" icon />
 * <ObjectStatus text="Error" state="error" inverted />
 */
export function ObjectStatus({
  text,
  state = 'none',
  icon = false,
  inverted = false,
  active = false,
  className,
}: ObjectStatusProps) {
  const Icon = stateIcons[state];
  const colors = stateColors[state];

  return (
    <motion.div
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded text-sm font-medium',
        'transition-all duration-200',
        inverted ? 'text-white' : '',
        active && 'cursor-pointer hover:opacity-80',
        className
      )}
      style={{
        color: inverted ? '#FFFFFF' : colors.text,
        backgroundColor: inverted ? colors.text : colors.bg,
        border: `1px solid ${colors.border}`,
      }}
      whileHover={active ? { scale: 1.02 } : undefined}
      whileTap={active ? { scale: 0.98 } : undefined}
    >
      {icon && <Icon className="w-4 h-4" />}
      <span>{text}</span>
    </motion.div>
  );
}
