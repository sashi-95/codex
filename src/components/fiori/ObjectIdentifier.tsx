'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fioriDesignTokens } from '@/lib/fiori-design-tokens';

export interface ObjectIdentifierProps {
  title: string;
  text?: string;
  titleActive?: boolean;
  textActive?: boolean;
  onTitleClick?: () => void;
  onTextClick?: () => void;
  badgeAttachments?: React.ReactNode;
  badgeNotes?: React.ReactNode;
  badgePeople?: React.ReactNode;
  className?: string;
}

/**
 * ObjectIdentifier Component
 * Displays object title and optional text with active state (SAP Fiori pattern)
 *
 * Usage:
 * <ObjectIdentifier
 *   title="Asset #12345"
 *   text="Production Machine"
 *   titleActive
 *   onTitleClick={() => navigate('/asset/12345')}
 * />
 */
export function ObjectIdentifier({
  title,
  text,
  titleActive = false,
  textActive = false,
  onTitleClick,
  onTextClick,
  badgeAttachments,
  badgeNotes,
  badgePeople,
  className,
}: ObjectIdentifierProps) {
  const hasBadges = badgeAttachments || badgeNotes || badgePeople;

  return (
    <div className={cn('flex flex-col gap-0.5', className)}>
      <div className="flex items-center gap-2">
        <motion.h3
          className={cn(
            'text-base font-semibold',
            titleActive
              ? 'text-[#0070F2] cursor-pointer hover:underline hover:text-[#0854A0]'
              : 'text-[#32363A]'
          )}
          onClick={titleActive ? onTitleClick : undefined}
          whileHover={titleActive ? { x: 2 } : undefined}
          transition={{ duration: 0.2 }}
        >
          {title}
          {titleActive && <ExternalLink className="inline w-3 h-3 ml-1 opacity-60" />}
        </motion.h3>

        {hasBadges && (
          <div className="flex items-center gap-2">
            {badgeAttachments}
            {badgeNotes}
            {badgePeople}
          </div>
        )}
      </div>

      {text && (
        <motion.p
          className={cn(
            'text-sm',
            textActive
              ? 'text-[#0070F2] cursor-pointer hover:underline hover:text-[#0854A0]'
              : 'text-[#6A6D70]'
          )}
          onClick={textActive ? onTextClick : undefined}
          whileHover={textActive ? { x: 2 } : undefined}
          transition={{ duration: 0.2 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}
