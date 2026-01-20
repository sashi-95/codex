'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Pin, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ObjectPageSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

export interface ObjectPageProps {
  children?: React.ReactNode;
  heading?: React.ReactNode;
  snappedHeading?: React.ReactNode;
  headerContent?: React.ReactNode;
  sections?: ObjectPageSection[];
  showTitleInHeaderContent?: boolean;
  upperCaseAnchorBar?: boolean;
  onClose?: () => void;
  className?: string;
}

/**
 * ObjectPage Component
 * SAP Fiori Object Page pattern for React/Next.js
 *
 * Provides detail view layout with:
 * - Dynamic header that snaps/expands
 * - Anchor bar for section navigation
 * - Multiple content sections
 *
 * Usage:
 * <ObjectPage
 *   heading={<h1>{assetName}</h1>}
 *   headerContent={<AssetMetadata />}
 *   sections={[
 *     { id: 'general', title: 'General Information', content: <GeneralForm /> },
 *     { id: 'valuation', title: 'Valuation', content: <ValuationData /> }
 *   ]}
 *   onClose={() => router.back()}
 * />
 */
export function ObjectPage({
  children,
  heading,
  snappedHeading,
  headerContent,
  sections = [],
  showTitleInHeaderContent = true,
  upperCaseAnchorBar = false,
  onClose,
  className,
}: ObjectPageProps) {
  const [headerExpanded, setHeaderExpanded] = useState(true);
  const [activeSection, setActiveSection] = useState(sections[0]?.id || '');

  const toggleHeader = () => {
    setHeaderExpanded(!headerExpanded);
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(`section-${sectionId}`);
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className={cn('flex flex-col h-full bg-white', className)}>
      {/* Header */}
      <div className="bg-white border-b border-[#D9D9D9] shadow-sm">
        {/* Title Area */}
        <div className="px-8 py-4 flex items-center justify-between bg-[#FAFAFA]">
          <div className="flex items-center gap-3">
            {headerExpanded ? heading : snappedHeading || heading}
            <button
              onClick={toggleHeader}
              className="p-1 hover:bg-white/50 rounded transition-colors"
            >
              <motion.div
                animate={{ rotate: headerExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-5 h-5 text-[#6A6D70]" />
              </motion.div>
            </button>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded transition-colors"
            >
              <X className="w-5 h-5 text-[#6A6D70]" />
            </button>
          )}
        </div>

        {/* Header Content - Collapsible */}
        <AnimatePresence>
          {headerExpanded && headerContent && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-8 py-6 bg-white">
                {headerContent}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Anchor Bar */}
        {sections.length > 0 && (
          <div className="px-8 bg-white border-t border-[#E5E5E5]">
            <div className="flex gap-4 overflow-x-auto">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={cn(
                    'px-4 py-3 text-sm font-medium whitespace-nowrap',
                    'border-b-2 transition-all duration-200',
                    upperCaseAnchorBar && 'uppercase',
                    activeSection === section.id
                      ? 'border-[#0070F2] text-[#0070F2]'
                      : 'border-transparent text-[#6A6D70] hover:text-[#32363A]'
                  )}
                >
                  {section.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto bg-[#EDEFF0]">
        {children || (
          <div className="max-w-6xl mx-auto p-8">
            {sections.map((section) => (
              <div
                key={section.id}
                id={`section-${section.id}`}
                className="mb-8 last:mb-0"
              >
                <div className="bg-white rounded-lg shadow-sm border border-[#D9D9D9] p-6">
                  <h2 className="text-xl font-semibold text-[#32363A] mb-4">
                    {section.title}
                  </h2>
                  <div>{section.content}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
