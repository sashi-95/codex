'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { AIInsightBubble } from './AIInsightBubble';
import { sidePanelVariants, overlayVariants } from '@/lib/animations';

export interface AIInsightPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// サンプルインサイト
const sampleInsights = [
  {
    insight: 'AR aging increased by 15% this month. Key driver: Customer X delayed a $50K payment. 3 invoices are now >90 days overdue.',
    type: 'warning' as const,
  },
  {
    insight: 'Revenue trend looks positive for Q1 2024. Based on current pipeline velocity, you\'re on track to exceed targets by 8%.',
    type: 'success' as const,
  },
  {
    insight: 'Inventory turnover for SKU-789 is below optimal levels. Consider adjusting reorder points to improve cash flow.',
    type: 'info' as const,
  },
];

/**
 * AIInsightPanel - AI インサイトサイドパネル
 * 右からスライドインするAIチャットパネル
 */
export function AIInsightPanel({ isOpen, onClose }: AIInsightPanelProps) {
  const [question, setQuestion] = useState('');
  const [insights, setInsights] = useState(sampleInsights);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    // TODO: 実際のAI APIコール
    console.log('Question:', question);

    // サンプル応答を追加
    setInsights([
      ...insights,
      {
        insight: `I'm analyzing "${question}"... Based on the data, I can see that this metric is trending upward with a 12% increase over the last quarter.`,
        type: 'info' as const,
      },
    ]);

    setQuestion('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          {/* Side Panel */}
          <motion.div
            className="fixed right-0 top-0 h-screen w-[480px] bg-background-secondary border-l border-glass-border z-50 flex flex-col"
            variants={sidePanelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-glass-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent-primary/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-accent-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">AI Insights</h2>
                  <p className="text-xs text-white/50">Ask anything about your data</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            {/* Chat Input */}
            <div className="p-6 border-b border-glass-border">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Why is AR aging increasing?"
                  className="flex-1 px-4 py-2 bg-glass-card border border-glass-border rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-accent-primary transition-colors"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  icon={<Send className="w-4 h-4" />}
                >
                  Send
                </Button>
              </form>
            </div>

            {/* Insights List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              <h3 className="text-sm font-semibold text-white/70 mb-4">💡 Latest Insights</h3>

              <div className="space-y-4">
                {insights.map((insight, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <AIInsightBubble
                      insight={insight.insight}
                      type={insight.type}
                      animate={index === insights.length - 1}
                    />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-glass-border">
              <p className="text-xs text-white/40 text-center">
                Powered by AI · Results may vary
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
