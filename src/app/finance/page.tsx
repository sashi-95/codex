import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, Percent } from 'lucide-react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { MetricCard } from '@/components/ui/MetricCard';
import { AnimatedLineChart } from '@/components/charts/AnimatedLineChart';
import { RadialProgress } from '@/components/charts/RadialProgress';
import { GlassCard } from '@/components/ui/GlassCard';

// サンプルデータ
const kpis = [
  {
    title: 'Revenue',
    value: 2400000,
    change: 12.5,
    trend: 'up' as const,
    icon: <DollarSign className="w-6 h-6" />,
  },
  {
    title: 'Expenses',
    value: 1800000,
    change: -5.2,
    trend: 'down' as const,
    icon: <TrendingDown className="w-6 h-6" />,
  },
  {
    title: 'Net Profit',
    value: 600000,
    change: 18.3,
    trend: 'up' as const,
    icon: <TrendingUp className="w-6 h-6" />,
  },
  {
    title: 'Margin',
    value: 25.0,
    unit: '%',
    change: 3.2,
    trend: 'up' as const,
    icon: <Percent className="w-6 h-6" />,
  },
];

const revenueExpenseData = [
  { date: 'Jul', revenue: 2000000, expenses: 1900000 },
  { date: 'Aug', revenue: 2100000, expenses: 1850000 },
  { date: 'Sep', revenue: 2200000, expenses: 1820000 },
  { date: 'Oct', revenue: 2350000, expenses: 1790000 },
  { date: 'Nov', revenue: 2400000, expenses: 1800000 },
];

const plItems = [
  { label: 'Revenue', value: 2400000, isSubtotal: false },
  { label: 'COGS', value: -1200000, isSubtotal: false },
  { label: 'Gross Profit', value: 1200000, isSubtotal: true },
  { label: 'Operating Expenses', value: -600000, isSubtotal: false },
  { label: 'EBITDA', value: 600000, isSubtotal: true },
  { label: 'Net Profit', value: 600000, isSubtotal: false, isTotal: true },
];

const arAgingData = [
  { range: '0-30 days', value: 400000, percentage: 53 },
  { range: '31-60 days', value: 200000, percentage: 27 },
  { range: '61-90 days', value: 100000, percentage: 13 },
  { range: '>90 days', value: 50000, percentage: 7 },
];

const apAgingData = [
  { range: '0-30 days', value: 300000, percentage: 60 },
  { range: '31-60 days', value: 150000, percentage: 30 },
  { range: '61-90 days', value: 50000, percentage: 10 },
];

/**
 * Finance Dashboard
 */
export default function FinancePage() {
  return (
    <div>
      <DashboardHeader
        title="Finance Dashboard"
        subtitle="Comprehensive financial metrics and analysis"
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

      {/* P&L + Revenue vs Expense */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* P&L Breakdown */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>📊</span> P&L Breakdown
          </h3>

          <div className="space-y-2">
            {plItems.map((item, index) => (
              <div
                key={index}
                className={`flex items-center justify-between py-2 ${
                  item.isTotal ? 'border-t-2 border-accent-primary/30 pt-3 mt-3' :
                  item.isSubtotal ? 'border-t border-white/10 pt-2 mt-2 font-semibold' : ''
                }`}
              >
                <span className={`text-sm ${
                  item.isTotal ? 'text-white font-bold text-base' :
                  item.isSubtotal ? 'text-white/90' :
                  'text-white/70'
                }`}>
                  {item.label}
                </span>
                <span className={`font-mono text-sm ${
                  item.isTotal ? 'text-white font-bold text-base' :
                  item.isSubtotal ? 'text-white/90' :
                  item.value < 0 ? 'text-status-error' : 'text-white/70'
                }`}>
                  ${Math.abs(item.value).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Revenue vs Expense Chart */}
        <div className="lg:col-span-2">
          <AnimatedLineChart
            title="Revenue vs Expense (5-Month Trend)"
            data={revenueExpenseData}
            lines={[
              { dataKey: 'revenue', color: '#41E1A2', label: 'Revenue' },
              { dataKey: 'expenses', color: '#FF6B9D', label: 'Expenses' },
            ]}
            height={300}
            showArea={true}
          />
        </div>
      </div>

      {/* AR/AP Aging Analysis */}
      <GlassCard className="p-6 mb-8">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <span>📅</span> AP/AR Aging Analysis
        </h3>

        <div className="space-y-6">
          {/* AR Aging */}
          <div>
            <h4 className="text-sm font-medium text-white/70 mb-3">Accounts Receivable</h4>
            <div className="grid grid-cols-4 gap-4">
              {arAgingData.map((item, index) => (
                <div key={index} className="text-center">
                  <div className="mb-2">
                    <div className="h-24 bg-white/5 rounded-lg overflow-hidden">
                      <div
                        className="bg-accent-primary/50 transition-all duration-1000 ease-out"
                        style={{ height: `${item.percentage}%`, marginTop: `${100 - item.percentage}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-white/50 mb-1">{item.range}</p>
                  <p className="text-lg font-bold text-white font-mono">
                    ${(item.value / 1000).toFixed(0)}K
                  </p>
                  <p className="text-xs text-white/40">{item.percentage}%</p>
                </div>
              ))}
            </div>
          </div>

          {/* AP Aging */}
          <div>
            <h4 className="text-sm font-medium text-white/70 mb-3">Accounts Payable</h4>
            <div className="grid grid-cols-3 gap-4">
              {apAgingData.map((item, index) => (
                <div key={index} className="text-center">
                  <div className="mb-2">
                    <div className="h-24 bg-white/5 rounded-lg overflow-hidden">
                      <div
                        className="bg-status-warning/50 transition-all duration-1000 ease-out"
                        style={{ height: `${item.percentage}%`, marginTop: `${100 - item.percentage}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-white/50 mb-1">{item.range}</p>
                  <p className="text-lg font-bold text-white font-mono">
                    ${(item.value / 1000).toFixed(0)}K
                  </p>
                  <p className="text-xs text-white/40">{item.percentage}%</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Key Metrics Progress */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <span>🎯</span> Key Metrics
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <RadialProgress percentage={75} color="#4A96FF" label="Target" />
            <p className="mt-3 text-sm font-medium text-white">Operating Margin: 25%</p>
            <p className="text-xs text-white/50">75% of target</p>
          </div>

          <div className="text-center">
            <RadialProgress percentage={80} color="#00D1B2" label="Target" />
            <p className="mt-3 text-sm font-medium text-white">Cash Conversion: 32d</p>
            <p className="text-xs text-white/50">80% of target</p>
          </div>

          <div className="text-center">
            <RadialProgress percentage={60} color="#A78BFA" label="Target" />
            <p className="mt-3 text-sm font-medium text-white">DSO: 45 days</p>
            <p className="text-xs text-white/50">60% of target</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
