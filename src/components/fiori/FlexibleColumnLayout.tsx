'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type LayoutType =
  | 'OneColumn'
  | 'TwoColumnsBeginExpanded'
  | 'TwoColumnsMidExpanded'
  | 'ThreeColumnsMidExpanded'
  | 'ThreeColumnsEndExpanded';

export interface FlexibleColumnLayoutProps {
  beginColumnPages?: React.ReactNode;
  midColumnPages?: React.ReactNode;
  endColumnPages?: React.ReactNode;
  layout?: LayoutType;
  onLayoutChange?: (layout: LayoutType) => void;
  backgroundDesign?: 'Solid' | 'Transparent';
  className?: string;
}

const layoutConfigs: Record<LayoutType, { begin: number; mid: number; end: number }> = {
  OneColumn: { begin: 100, mid: 0, end: 0 },
  TwoColumnsBeginExpanded: { begin: 67, mid: 33, end: 0 },
  TwoColumnsMidExpanded: { begin: 33, mid: 67, end: 0 },
  ThreeColumnsMidExpanded: { begin: 25, mid: 50, end: 25 },
  ThreeColumnsEndExpanded: { begin: 25, mid: 25, end: 50 },
};

/**
 * FlexibleColumnLayout Component
 * SAP Fiori Flexible Column Layout pattern for React/Next.js
 *
 * Provides master-detail-detail layout with:
 * - 1, 2, or 3 column layouts
 * - Responsive column sizing
 * - Smooth transitions between layouts
 *
 * Usage:
 * <FlexibleColumnLayout
 *   beginColumnPages={<AssetList />}
 *   midColumnPages={<AssetDetail />}
 *   endColumnPages={<AssetActions />}
 *   layout="TwoColumnsMidExpanded"
 *   onLayoutChange={(layout) => console.log(layout)}
 * />
 */
export function FlexibleColumnLayout({
  beginColumnPages,
  midColumnPages,
  endColumnPages,
  layout = 'OneColumn',
  onLayoutChange,
  backgroundDesign = 'Solid',
  className,
}: FlexibleColumnLayoutProps) {
  const [currentLayout, setCurrentLayout] = useState<LayoutType>(layout);

  const config = layoutConfigs[currentLayout];
  const showBegin = config.begin > 0;
  const showMid = config.mid > 0;
  const showEnd = config.end > 0;

  const changeLayout = (newLayout: LayoutType) => {
    setCurrentLayout(newLayout);
    onLayoutChange?.(newLayout);
  };

  const expandMid = () => {
    if (showEnd) {
      changeLayout('TwoColumnsMidExpanded');
    } else {
      changeLayout('TwoColumnsMidExpanded');
    }
  };

  const closeMid = () => {
    changeLayout('OneColumn');
  };

  const expandEnd = () => {
    changeLayout('ThreeColumnsEndExpanded');
  };

  const closeEnd = () => {
    changeLayout('TwoColumnsMidExpanded');
  };

  return (
    <div
      className={cn(
        'flex h-full overflow-hidden',
        backgroundDesign === 'Solid' ? 'bg-[#EDEFF0]' : 'bg-transparent',
        className
      )}
    >
      {/* Begin Column */}
      <AnimatePresence>
        {showBegin && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${config.begin}%` }}
            exit={{ width: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="relative border-r border-[#D9D9D9] bg-white overflow-hidden"
          >
            {beginColumnPages}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mid Column */}
      <AnimatePresence>
        {showMid && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${config.mid}%` }}
            exit={{ width: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="relative border-r border-[#D9D9D9] bg-white overflow-hidden"
          >
            {/* Mid Column Header Actions */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded shadow-md">
              {showBegin && (
                <button
                  onClick={closeMid}
                  className="p-2 hover:bg-[#F7F7F7] rounded transition-colors"
                  title="Close"
                >
                  <ChevronLeft className="w-4 h-4 text-[#6A6D70]" />
                </button>
              )}

              {endColumnPages && !showEnd && (
                <button
                  onClick={() => changeLayout('ThreeColumnsMidExpanded')}
                  className="p-2 hover:bg-[#F7F7F7] rounded transition-colors"
                  title="Expand"
                >
                  <ChevronRight className="w-4 h-4 text-[#6A6D70]" />
                </button>
              )}

              {showBegin && (
                <button
                  onClick={expandMid}
                  className="p-2 hover:bg-[#F7F7F7] rounded transition-colors"
                  title={config.mid === 67 ? 'Minimize' : 'Maximize'}
                >
                  {config.mid === 67 ? (
                    <Minimize2 className="w-4 h-4 text-[#6A6D70]" />
                  ) : (
                    <Maximize2 className="w-4 h-4 text-[#6A6D70]" />
                  )}
                </button>
              )}
            </div>

            {midColumnPages}
          </motion.div>
        )}
      </AnimatePresence>

      {/* End Column */}
      <AnimatePresence>
        {showEnd && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${config.end}%` }}
            exit={{ width: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="relative bg-white overflow-hidden"
          >
            {/* End Column Header Actions */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded shadow-md">
              <button
                onClick={closeEnd}
                className="p-2 hover:bg-[#F7F7F7] rounded transition-colors"
                title="Close"
              >
                <ChevronRight className="w-4 h-4 text-[#6A6D70]" />
              </button>

              <button
                onClick={expandEnd}
                className="p-2 hover:bg-[#F7F7F7] rounded transition-colors"
                title={config.end === 50 ? 'Minimize' : 'Maximize'}
              >
                {config.end === 50 ? (
                  <Minimize2 className="w-4 h-4 text-[#6A6D70]" />
                ) : (
                  <Maximize2 className="w-4 h-4 text-[#6A6D70]" />
                )}
              </button>
            </div>

            {endColumnPages}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
