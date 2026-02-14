'use client';

import React from 'react';
import { TrendingUp, Target, Users, DollarSign } from 'lucide-react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { MetricCard } from '@/components/ui/MetricCard';
import { AnimatedLineChart } from '@/components/charts/AnimatedLineChart';
import { GlassCard } from '@/components/ui/GlassCard';

// サンプルデータ
const kpis = [
  {
    title: 'Today\'s Sales',
    value: 45000,
    change: 8.2,
    trend: 'up' as const,
    icon: <DollarSign className="w-6 h-6" />,
  },
  {
    title: 'Pipeline Value',
    value: 3500000,
    change: 15.3,
    trend: 'up' as const,
    icon: <Target className="w-6 h-6" />,
  },
  {
    title: 'Win Rate',
    value: 28,
    unit: '%',
    change: 2.1,
    trend: 'up' as const,
    icon: <TrendingUp className="w-6 h-6" />,
  },
  {
    title: 'Active Deals',
    value: 127,
    change: -3.5,
    trend: 'down' as const,
    icon: <Users className="w-6 h-6" />,
  },
];

const salesByRegion = [
  { region: 'Americas', value: 1200000, percentage: 40 },
  { region: 'EMEA', value: 800000, percentage: 27 },
  { region: 'APAC', value: 600000, percentage: 20 },
  { region: 'Japan', value: 200000, percentage: 7 },
];

const pipelineStages = [
  { stage: 'Prospecting', value: 500000, count: 45 },
  { stage: 'Qualified', value: 800000, count: 32 },
  { stage: 'Proposal', value: 1200000, count: 24 },
  { stage: 'Negotiation', value: 600000, count: 18 },
  { stage: 'Closed Won', value: 400000, count: 8 },
];

const topProducts = [
  { product: 'Product A', value: 800000, percentage: 33 },
  { product: 'Product B', value: 600000, percentage: 25 },
  { product: 'Product C', value: 500000, percentage: 21 },
  { product: 'Others', value: 300000, percentage: 21 },
];

const hourlySales = [
  { date: '8am', value: 3000 },
  { date: '9am', value: 5000 },
  { date: '10am', value: 8000 },
  { date: '11am', value: 7500 },
  { date: '12pm', value: 6000 },
  { date: '1pm', value: 4500 },
  { date: '2pm', value: 9000 },
  { date: '3pm', value: 7000 },
];

/**
 * Sales Dashboard
 */
export default function SalesPage() {
  return (
    <div>
      <DashboardHeader
        title="Sales Dashboard"
        subtitle="Track your sales performance and pipeline"
        onExport={() => console.log('Export')}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpis.map((kpi, index) => (
          <MetricCard
            key={index}
            title={kpi.title}
            value={kpi.value}
            unit={kpi.unit}
            change={kpi.change}
            trend={kpi.trend}
            icon={kpi.icon}
            format="currency"
            decimals={kpi.unit ? 1 : 0}
          />
        ))}
      </div>

      {/* Sales by Region Heat Map */}
      <GlassCard className="p-6 mb-8">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <span>🌍</span> Sales by Region
        </h3>

        <div className="grid grid-cols-4 gap-4">
          {salesByRegion.map((region, index) => (
            <div
              key={index}
              className="relative p-6 rounded-lg bg-gradient-to-br from-accent-primary/20 to-transparent border border-accent-primary/30 hover:border-accent-primary/50 transition-all cursor-pointer group"
            >
              <div className="mb-4">
                <div
                  className="h-2 rounded-full bg-accent-primary/30 overflow-hidden"
                >
                  <div
                    className="h-full bg-accent-primary transition-all duration-1000"
                    style={{ width: `${region.percentage}%` }}
                  />
                </div>
              </div>

              <h4 className="text-sm font-medium text-white/70 mb-2">{region.region}</h4>
              <p className="text-2xl font-bold text-white font-mono">
                ${(region.value / 1000000).toFixed(1)}M
              </p>
              <p className="text-xs text-white/50 mt-1">{region.percentage}% of total</p>

              {/* Hover effect */}
              <div className="absolute inset-0 bg-accent-primary/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Pipeline Status + Today's Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Pipeline Status */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>📊</span> Pipeline Status
          </h3>

          <div className="space-y-3">
            {pipelineStages.map((stage, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-white/70">{stage.stage}</span>
                  <span className="text-sm font-semibold text-white font-mono">
                    ${(stage.value / 1000).toFixed(0)}K
                  </span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary transition-all duration-1000"
                    style={{ width: `${(stage.value / 1200000) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-white/40 mt-1">{stage.count} deals</p>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/70">Win Rate</span>
              <span className="text-lg font-bold text-status-success">28%</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-white/70">Avg Deal Size</span>
              <span className="text-lg font-bold text-white">$125K</span>
            </div>
          </div>
        </GlassCard>

        {/* Today's Performance */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>📈</span> Today's Performance
          </h3>

          <div className="mb-6">
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-3xl font-bold text-white font-mono">$45K</span>
              <span className="text-sm text-white/60">/ $50K target</span>
            </div>

            <div className="h-3 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-status-success to-accent-primary transition-all duration-1000"
                style={{ width: '90%' }}
              />
            </div>

            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-status-success font-semibold">90% Achievement</span>
              <span className="text-xs text-white/50">$5K to go</span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-white/70 mb-3">Hourly Breakdown</h4>
            <AnimatedLineChart
              data={hourlySales}
              lines={[
                { dataKey: 'value', color: '#41E1A2', label: 'Sales' },
              ]}
              height={180}
              showGrid={false}
              showArea={true}
            />
          </div>
        </GlassCard>
      </div>

      {/* Top Products */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <span>🎯</span> Top Products
        </h3>

        <div className="space-y-4">
          {topProducts.map((product, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">{product.product}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono text-white">
                    ${(product.value / 1000).toFixed(0)}K
                  </span>
                  <span className="text-xs text-white/50 w-12 text-right">
                    ({product.percentage}%)
                  </span>
                </div>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${
                    index === 0 ? 'bg-accent-primary' :
                    index === 1 ? 'bg-accent-secondary' :
                    index === 2 ? 'bg-accent-tertiary' :
                    'bg-white/30'
                  }`}
                  style={{ width: `${product.percentage * 3}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
