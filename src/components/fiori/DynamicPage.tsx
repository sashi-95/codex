'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Pin, PinOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DynamicPageTitleProps {
  heading: React.ReactNode;
  snappedContent?: React.ReactNode;
  expandedContent?: React.ReactNode;
  actions?: React.ReactNode[];
}

export interface DynamicPageHeaderProps {
  pinnable?: boolean;
  children: React.ReactNode;
}

export interface DynamicPageProps {
  title: DynamicPageTitleProps;
  header?: DynamicPageHeaderProps;
  content: React.ReactNode;
  footer?: React.ReactNode;
  toggleHeaderOnTitleClick?: boolean;
  headerInitiallyExpanded?: boolean;
  className?: string;
}

/**
 * DynamicPage Component
 * SAP Fiori Dynamic Page pattern for React/Next.js
 *
 * Provides flexible page layout with:
 * - Dynamic header that expands/snaps on scroll
 * - Pinnable header
 * - Customizable title and header content
 *
 * Usage:
 * <DynamicPage
 *   title={{
 *     heading: <h1>Dashboard</h1>,
 *     snappedContent: <KPISummary />,
 *     expandedContent: <DetailedKPIs />,
 *     actions: [<ExportButton />, <RefreshButton />]
 *   }}
 *   header={{
 *     pinnable: true,
 *     children: <FilterBar />
 *   }}
 *   content={<MainContent />}
 * />
 */
export function DynamicPage({
  title,
  header,
  content,
  footer,
  toggleHeaderOnTitleClick = true,
  headerInitiallyExpanded = true,
  className,
}: DynamicPageProps) {
  const [headerExpanded, setHeaderExpanded] = useState(headerInitiallyExpanded);
  const [headerPinned, setHeaderPinned] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      const scrollTop = target.scrollTop;

      if (!headerPinned && scrollTop > 100) {
        setHeaderExpanded(false);
        setScrolled(true);
      } else if (!headerPinned && scrollTop < 50) {
        setHeaderExpanded(true);
        setScrolled(false);
      }
    };

    const contentArea = document.getElementById('dynamic-page-content');
    contentArea?.addEventListener('scroll', handleScroll);

    return () => {
      contentArea?.removeEventListener('scroll', handleScroll);
    };
  }, [headerPinned]);

  const toggleHeader = () => {
    if (toggleHeaderOnTitleClick) {
      setHeaderExpanded(!headerExpanded);
    }
  };

  const togglePin = () => {
    setHeaderPinned(!headerPinned);
    if (!headerPinned) {
      setHeaderExpanded(true);
    }
  };

  return (
    <div className={cn('flex flex-col h-full bg-white', className)}>
      {/* Title Bar */}
      <div
        className={cn(
          'bg-white border-b border-[#D9D9D9] transition-shadow duration-200',
          scrolled && 'shadow-md'
        )}
      >
        <div
          className={cn(
            'px-8 py-4 flex items-center justify-between',
            toggleHeaderOnTitleClick && 'cursor-pointer hover:bg-[#F7F7F7] transition-colors'
          )}
          onClick={toggleHeader}
        >
          <div className="flex items-center gap-3 flex-1">
            {title.heading}
            {toggleHeaderOnTitleClick && (
              <motion.div
                animate={{ rotate: headerExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-5 h-5 text-[#6A6D70]" />
              </motion.div>
            )}
          </div>

          {/* Snapped Content (shown when collapsed) */}
          <AnimatePresence>
            {!headerExpanded && title.snappedContent && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-4 mr-4"
              >
                {title.snappedContent}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {title.actions?.map((action, index) => (
              <div key={index} onClick={(e) => e.stopPropagation()}>
                {action}
              </div>
            ))}

            {header?.pinnable && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePin();
                }}
                className={cn(
                  'p-2 rounded hover:bg-[#F7F7F7] transition-colors',
                  headerPinned && 'bg-[#EBF5FF] text-[#0070F2]'
                )}
                title={headerPinned ? 'Unpin header' : 'Pin header'}
              >
                {headerPinned ? (
                  <Pin className="w-4 h-4" />
                ) : (
                  <PinOff className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Expanded Title Content */}
        <AnimatePresence>
          {headerExpanded && title.expandedContent && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-8 py-4 bg-[#FAFAFA] border-t border-[#E5E5E5]">
                {title.expandedContent}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header Section */}
        {header && (
          <AnimatePresence>
            {headerExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-8 py-4 bg-white border-t border-[#E5E5E5]">
                  {header.children}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Content Area */}
      <div
        id="dynamic-page-content"
        className="flex-1 overflow-auto bg-[#EDEFF0]"
      >
        <div className="p-8">{content}</div>
      </div>

      {/* Footer */}
      {footer && (
        <div className="bg-white border-t border-[#D9D9D9] px-8 py-4 shadow-lg">
          {footer}
        </div>
      )}
    </div>
  );
}
