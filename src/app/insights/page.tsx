'use client';

import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { AIInsightPanel } from '@/components/ai/AIInsightPanel';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { AIInsightBubble } from '@/components/ai/AIInsightBubble';

const recentInsights = [
  {
    id: '1',
    insight: 'Revenue increased 12.5% this month driven by Q4 product launch. Strong performance in Americas region.',
    type: 'success' as const,
    timestamp: '2 hours ago',
  },
  {
    id: '2',
    insight: 'AR aging up 15% - Customer X delayed $50K payment. 3 invoices now >90 days. Recommended action: Contact customer for payment plan.',
    type: 'warning' as const,
    timestamp: '4 hours ago',
  },
  {
    id: '3',
    insight: 'Expense reduction efforts showing results with 5.2% decrease. COGS optimization and procurement efficiency improvements are key drivers.',
    type: 'info' as const,
    timestamp: '1 day ago',
  },
  {
    id: '4',
    insight: 'Sales pipeline velocity increased 18% compared to last quarter. Win rate improved from 24% to 28%.',
    type: 'success' as const,
    timestamp: '1 day ago',
  },
  {
    id: '5',
    insight: 'Inventory turnover for SKU-789 below optimal. Current: 4.2x, Target: 6x. Consider adjusting reorder points.',
    type: 'warning' as const,
    timestamp: '2 days ago',
  },
];

const categories = [
  { id: 'all', label: 'All Insights', count: 24 },
  { id: 'financial', label: 'Financial', count: 8 },
  { id: 'sales', label: 'Sales', count: 6 },
  { id: 'operations', label: 'Operations', count: 5 },
  { id: 'alerts', label: 'Alerts', count: 5 },
];

/**
 * AI Insights Center
 */
export default function InsightsPage() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  return (
    <div>
      <DashboardHeader
        title="AI Insights Center"
        subtitle="AI-powered insights and recommendations for your business"
      />

      {/* Action Bar */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="primary"
          size="lg"
          onClick={() => setIsPanelOpen(true)}
          icon={<Sparkles className="w-5 h-5" />}
        >
          Ask AI
        </Button>

        <Button variant="secondary" size="lg">
          Generate Report
        </Button>
      </div>

      {/* Category Filters */}
      <div className="flex items-center gap-2 mb-8">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedCategory === category.id
                ? 'bg-accent-primary text-white'
                : 'bg-glass-card text-white/60 hover:text-white hover:bg-glass-card-hover'
            }`}
          >
            {category.label}
            <span className="ml-2 text-xs opacity-70">({category.count})</span>
          </button>
        ))}
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        {recentInsights.map((insight) => (
          <GlassCard key={insight.id} className="p-6">
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs text-white/40">{insight.timestamp}</span>
            </div>

            <AIInsightBubble
              insight={insight.insight}
              type={insight.type}
              animate={false}
            />

            <div className="flex items-center gap-2 mt-4">
              <Button variant="ghost" size="sm">
                View Details
              </Button>
              <Button variant="ghost" size="sm">
                Dismiss
              </Button>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6">
          <h3 className="text-sm font-medium text-white/70 mb-2">Insights This Week</h3>
          <p className="text-3xl font-bold text-white">24</p>
          <p className="text-xs text-status-success mt-1">+6 from last week</p>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-sm font-medium text-white/70 mb-2">Active Alerts</h3>
          <p className="text-3xl font-bold text-white">5</p>
          <p className="text-xs text-status-warning mt-1">Requires attention</p>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-sm font-medium text-white/70 mb-2">Actions Taken</h3>
          <p className="text-3xl font-bold text-white">18</p>
          <p className="text-xs text-white/50 mt-1">Based on AI recommendations</p>
        </GlassCard>
      </div>

      {/* AI Insight Panel */}
      <AIInsightPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
      />
    </div>
  );
}
