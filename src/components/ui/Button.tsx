'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const variantStyles = {
  primary: 'bg-accent-primary hover:bg-accent-primary/90 text-white border-accent-primary/20',
  secondary: 'bg-glass-card hover:bg-glass-card-hover text-white border-glass-border',
  ghost: 'bg-transparent hover:bg-white/5 text-white border-transparent',
  danger: 'bg-status-error hover:bg-status-error/90 text-white border-status-error/20',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

/**
 * Button - プライマリボタンコンポーネント
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      className={cn(
        'relative inline-flex items-center justify-center gap-2',
        'font-medium rounded-lg border backdrop-blur-sm',
        'transition-all duration-250 ease-smooth',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        className
      )}
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <motion.div
          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      )}

      {!loading && icon && iconPosition === 'left' && icon}

      {children}

      {!loading && icon && iconPosition === 'right' && icon}
    </motion.button>
  );
}
