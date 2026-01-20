'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fioriDesignTokens } from '@/lib/fiori-design-tokens';

export interface SemanticPageProps {
  children: React.ReactNode;
  titleHeading?: React.ReactNode;
  titleBreadcrumbs?: React.ReactNode;
  headerContent?: React.ReactNode;
  headerPinnable?: boolean;
  toggleHeaderOnTitleClick?: boolean;
  showFooter?: boolean;
  positiveAction?: {
    text: string;
    icon?: React.ReactNode;
    onClick: () => void;
  };
  negativeAction?: {
    text: string;
    icon?: React.ReactNode;
    onClick: () => void;
    enabled?: boolean;
  };
  customHeaderActions?: React.ReactNode[];
  footerCustomActions?: React.ReactNode[];
  className?: string;
}

/**
 * SemanticPage Component
 * SAP Fiori Semantic Page pattern for React/Next.js
 *
 * Provides standardized page layout with:
 * - Collapsible header with title and KPIs
 * - Semantic actions (positive/negative)
 * - Custom header actions
 * - Footer with custom actions
 *
 * Usage:
 * <SemanticPage
 *   titleHeading={<h1>Manage Assets</h1>}
 *   headerContent={<ObjectNumber number={150} unit="Assets" />}
 *   positiveAction={{ text: "Create", onClick: handleCreate }}
 *   negativeAction={{ text: "Delete", onClick: handleDelete, enabled: hasSelection }}
 * >
 *   <Table ... />
 * </SemanticPage>
 */
export function SemanticPage({
  children,
  titleHeading,
  titleBreadcrumbs,
  headerContent,
  headerPinnable = true,
  toggleHeaderOnTitleClick = true,
  showFooter = false,
  positiveAction,
  negativeAction,
  customHeaderActions = [],
  footerCustomActions = [],
  className,
}: SemanticPageProps) {
  const [headerExpanded, setHeaderExpanded] = useState(true);
  const [headerPinned, setHeaderPinned] = useState(false);

  const toggleHeader = () => {
    if (!headerPinned) {
      setHeaderExpanded(!headerExpanded);
    }
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="bg-white border-b border-[#D9D9D9] shadow-sm">
        {/* Title Area */}
        <div
          className={cn(
            'px-8 py-4 flex items-center justify-between',
            toggleHeaderOnTitleClick && 'cursor-pointer hover:bg-[#F7F7F7] transition-colors'
          )}
          onClick={toggleHeaderOnTitleClick ? toggleHeader : undefined}
        >
          <div className="flex flex-col gap-1">
            {titleBreadcrumbs && (
              <div className="text-sm text-[#6A6D70]">{titleBreadcrumbs}</div>
            )}
            <div className="flex items-center gap-3">
              {titleHeading}
              {toggleHeaderOnTitleClick && (
                <motion.div
                  animate={{ rotate: headerExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-5 h-5 text-[#6A6D70]" />
                </motion.div>
              )}
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2">
            {customHeaderActions.map((action, index) => (
              <div key={index}>{action}</div>
            ))}

            {positiveAction && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  positiveAction.onClick();
                }}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded',
                  'bg-[#0070F2] text-white font-medium text-sm',
                  'hover:bg-[#0854A0] transition-colors',
                  'shadow-sm'
                )}
              >
                {positiveAction.icon || <Plus className="w-4 h-4" />}
                {positiveAction.text}
              </button>
            )}

            {negativeAction && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (negativeAction.enabled !== false) {
                    negativeAction.onClick();
                  }
                }}
                disabled={negativeAction.enabled === false}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded',
                  'border border-[#BB0000] text-[#BB0000] font-medium text-sm',
                  'hover:bg-[#FFEBEB] transition-colors',
                  negativeAction.enabled === false && 'opacity-40 cursor-not-allowed'
                )}
              >
                {negativeAction.icon || <Trash2 className="w-4 h-4" />}
                {negativeAction.text}
              </button>
            )}
          </div>
        </div>

        {/* Header Content (KPIs, etc.) - Collapsible */}
        <AnimatePresence>
          {headerExpanded && headerContent && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <div className="px-8 py-6 bg-[#FAFAFA] border-t border-[#E5E5E5]">
                <div className="flex items-center gap-6 flex-wrap">
                  {headerContent}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto bg-[#EDEFF0] p-8">
        {children}
      </div>

      {/* Footer */}
      {showFooter && (
        <div className="bg-white border-t border-[#D9D9D9] px-8 py-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {footerCustomActions.map((action, index) => (
                <div key={index}>{action}</div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {positiveAction && (
                <button
                  onClick={positiveAction.onClick}
                  className={cn(
                    'px-4 py-2 rounded text-sm font-medium',
                    'bg-[#0070F2] text-white',
                    'hover:bg-[#0854A0] transition-colors'
                  )}
                >
                  {positiveAction.text}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
