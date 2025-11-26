import React from 'react';
import { Package } from 'lucide-react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { GlassCard } from '@/components/ui/GlassCard';

/**
 * Inventory Dashboard
 * TODO: 実装予定
 */
export default function InventoryPage() {
  return (
    <div>
      <DashboardHeader
        title="Inventory Dashboard"
        subtitle="Stock levels, turnover, and warehouse analytics"
      />

      <GlassCard className="p-12 text-center">
        <Package className="w-16 h-16 text-accent-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Coming Soon</h2>
        <p className="text-white/60">
          Inventory Dashboard with stock levels, turnover rates, and safety stock alerts
        </p>
      </GlassCard>
    </div>
  );
}
