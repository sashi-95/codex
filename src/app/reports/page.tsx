'use client';

import React, { useState } from 'react';
import { FileText, Download, Calendar } from 'lucide-react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { motion } from 'framer-motion';

const reportTypes = [
  {
    id: 'monthly-executive',
    title: 'Monthly Executive',
    description: 'High-level KPIs and trends for executives',
    icon: '📊',
  },
  {
    id: 'finance-deep-dive',
    title: 'Finance Deep Dive',
    description: 'Comprehensive financial analysis and P&L breakdown',
    icon: '💰',
  },
  {
    id: 'sales-performance',
    title: 'Sales Performance',
    description: 'Pipeline, win rates, and regional performance',
    icon: '📈',
  },
  {
    id: 'custom',
    title: 'Custom Report',
    description: 'Build your own report with custom sections',
    icon: '🎨',
  },
];

const recentReports = [
  {
    id: '1',
    title: 'October 2025 Executive Summary',
    createdAt: '2025-10-31',
    type: 'monthly-executive',
  },
  {
    id: '2',
    title: 'Q3 2025 Finance Report',
    createdAt: '2025-09-30',
    type: 'finance-deep-dive',
  },
  {
    id: '3',
    title: 'Sales Performance - September',
    createdAt: '2025-09-30',
    type: 'sales-performance',
  },
];

/**
 * Auto Reporting Studio
 */
export default function ReportsPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    if (!selectedType) return;

    setIsGenerating(true);

    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false);
      alert('Report generated successfully! (Demo)');
    }, 3000);
  };

  return (
    <div>
      <DashboardHeader
        title="Auto Reporting Studio"
        subtitle="Generate beautiful reports with one click"
      />

      {/* Step 1: Select Report Type */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">1️⃣ Select Report Type</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {reportTypes.map((type) => (
            <motion.div
              key={type.id}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <GlassCard
                onClick={() => setSelectedType(type.id)}
                className={`p-6 cursor-pointer transition-all ${
                  selectedType === type.id
                    ? 'border-accent-primary bg-accent-primary/10'
                    : ''
                }`}
              >
                <div className="text-4xl mb-3">{type.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{type.title}</h3>
                <p className="text-sm text-white/60">{type.description}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Step 2: Configure Parameters */}
      {selectedType && (
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-semibold text-white mb-4">2️⃣ Configure Parameters</h2>

          <GlassCard className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Period Selection */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Period
                </label>
                <select className="w-full px-4 py-2 bg-glass-card border border-glass-border rounded-lg text-white focus:outline-none focus:border-accent-primary transition-colors">
                  <option>November 2025</option>
                  <option>October 2025</option>
                  <option>September 2025</option>
                  <option>Q4 2025</option>
                  <option>Q3 2025</option>
                </select>
              </div>

              {/* Language Selection */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Language
                </label>
                <select className="w-full px-4 py-2 bg-glass-card border border-glass-border rounded-lg text-white focus:outline-none focus:border-accent-primary transition-colors">
                  <option>English</option>
                  <option>日本語</option>
                </select>
              </div>
            </div>

            {/* Sections */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-white/70 mb-3">
                Sections to Include
              </label>

              <div className="grid grid-cols-2 gap-3">
                {['KPI Summary', 'Trend Analysis', 'AI Insights', 'Recommendations'].map(
                  (section) => (
                    <label key={section} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 rounded border-glass-border bg-glass-card checked:bg-accent-primary focus:ring-2 focus:ring-accent-primary"
                      />
                      <span className="text-sm text-white">{section}</span>
                    </label>
                  )
                )}
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Step 3: Generate */}
      {selectedType && (
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-xl font-semibold text-white mb-4">3️⃣ Generate</h2>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 mb-2">Ready to generate your report</p>
                <p className="text-sm text-white/50">
                  This will take approximately 5-10 seconds
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleGenerate}
                  loading={isGenerating}
                  icon={!isGenerating && <FileText className="w-5 h-5" />}
                >
                  {isGenerating ? 'Generating...' : 'Generate Report'}
                </Button>
              </div>
            </div>

            {/* Output Format */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <label className="block text-sm font-medium text-white/70 mb-3">
                Output Format
              </label>

              <div className="flex items-center gap-3">
                {['HTML', 'PDF', 'PowerPoint'].map((format) => (
                  <button
                    key={format}
                    className="px-4 py-2 bg-glass-card border border-glass-border rounded-lg text-sm font-medium text-white hover:bg-glass-card-hover hover:border-accent-primary transition-all"
                  >
                    {format}
                  </button>
                ))}
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Recent Reports */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">📚 Recent Reports</h2>

        <div className="space-y-3">
          {recentReports.map((report) => (
            <GlassCard key={report.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-accent-primary/20 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-accent-primary" />
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-white">{report.title}</h3>
                    <p className="text-xs text-white/50 mt-1">
                      Created on {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Download className="w-4 h-4" />}
                  >
                    Download
                  </Button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}
