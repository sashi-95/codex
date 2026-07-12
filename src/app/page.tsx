'use client';

import React from 'react';
import { DollarSign, TrendingDown, TrendingUp, Activity } from 'lucide-react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { MetricCard } from '@/components/ui/MetricCard';
import { AnimatedLineChart } from '@/components/charts/AnimatedLineChart';
import { AIInsightBubble } from '@/components/ai/AIInsightBubble';
import { GlassCard } from '@/components/ui/GlassCard';

// サンプルデータ（実際はAPIから取得）
const kpis = [
  {
    title: 'Revenue',
    value: 2400000,
    change: 12.5,
    trend: 'up' as const,
    icon: <DollarSign className="w-6 h-6" />,
    format: 'currency' as const,
  },
  {
    title: 'Expenses',
    value: 1800000,
    change: -5.2,
    trend: 'down' as const,
    icon: <TrendingDown className="w-6 h-6" />,
    format: 'currency' as const,
  },
  {
    title: 'Net Profit',
    value: 600000,
    change: 18.3,
    trend: 'up' as const,
    icon: <TrendingUp className="w-6 h-6" />,
    format: 'currency' as const,
  },
  {
    title: 'Cash Flow',
    value: 450000,
    change: 8.1,
    trend: 'up' as const,
    icon: <Activity className="w-6 h-6" />,
    format: 'currency' as const,
  },
];

const trendData = [
  { date: 'Sep', revenue: 2100000, expenses: 1900000 },
  { date: 'Oct', revenue: 2200000, expenses: 1850000 },
  { date: 'Nov', revenue: 2400000, expenses: 1800000 },
];

const insights = [
  {
    insight: 'Revenue up 12.5% driven by Q4 product launch. Watch: AR aging increased 15% - action recommended.',
    type: 'info' as const,
  },
  {
    insight: 'Expense reduction efforts showing strong results with 5.2% decrease vs last month.',
    type: 'success' as const,
  },
];

const alerts = [
  { title: 'AR Aging +15%', type: 'warning' as const, description: 'Customer X delayed $50K payment' },
  { title: 'PO #1234 delayed', type: 'info' as const, description: 'Expected delivery pushed to next week' },
  { title: 'Low inventory in SKU-789', type: 'error' as const, description: 'Stock level below safety threshold' },
];

/**
 * Executive Dashboard - Home Page
 */
export default function HomePage() {
  return (
    <div>
      <DashboardHeader
        title="Executive Dashboard"
        subtitle="Real-time overview of your business metrics"
        onExport={() => console.log('Export')}
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpis.map((kpi, index) => (
          <MetricCard
            key={index}
            title={kpi.title}
            value={kpi.value}
            change={kpi.change}
            trend={kpi.trend}
            icon={kpi.icon}
            format={kpi.format}
          />
        ))}
      </div>

      {/* Main Chart */}
      <div className="mb-8">
        <AnimatedLineChart
          title="Revenue Trend (3-Month View)"
          data={trendData}
          lines={[
            { dataKey: 'revenue', color: '#4A96FF', label: 'Revenue' },
            { dataKey: 'expenses', color: '#FF6B9D', label: 'Expenses' },
          ]}
          height={350}
          showArea={true}
        />
      </div>

      {/* Bottom Row: AI Insights + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Daily Brief */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-accent-primary/20 flex items-center justify-center">
              <span className="text-xl">🤖</span>
            </div>
            <h3 className="text-lg font-semibold text-white">AI Daily Brief</h3>
          </div>

          <div className="space-y-3">
            {insights.map((item, index) => (
              <AIInsightBubble
                key={index}
                insight={item.insight}
                type={item.type}
              />
            ))}
          </div>

          <button className="mt-4 text-sm text-accent-primary hover:text-accent-primary/80 transition-colors">
            View Full Insights →
          </button>
        </GlassCard>

        {/* Alerts */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-status-warning/20 flex items-center justify-center">
              <span className="text-xl">⚠️</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Alerts</h3>
          </div>

          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  alert.type === 'error' ? 'bg-status-error' :
                  alert.type === 'warning' ? 'bg-status-warning' :
                  'bg-status-info'
                }`} />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-white mb-1">{alert.title}</h4>
                  <p className="text-xs text-white/60">{alert.description}</p>
                </div>
              </div>
            ))}
          </div>

          <button className="mt-4 text-sm text-accent-primary hover:text-accent-primary/80 transition-colors">
            View All →
          </button>
        </GlassCard>
      </div>
    </div>
  );
}
