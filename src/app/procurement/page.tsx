import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { GlassCard } from '@/components/ui/GlassCard';

/**
 * Procurement Dashboard
 * TODO: 実装予定
 */
export default function ProcurementPage() {
  return (
    <div>
      <DashboardHeader
        title="Procurement Dashboard"
        subtitle="Purchase orders and supplier management"
      />

      <GlassCard className="p-12 text-center">
        <ShoppingCart className="w-16 h-16 text-accent-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Coming Soon</h2>
        <p className="text-white/60">
          Procurement Dashboard with PO tracking, supplier analytics, and spend management
        </p>
      </GlassCard>
    </div>
  );
}
