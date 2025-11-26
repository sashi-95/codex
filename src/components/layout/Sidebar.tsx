'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  DollarSign,
  ShoppingCart,
  Package,
  TrendingUp,
  Users,
  Sparkles,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Executive Hub', icon: LayoutDashboard },
  { href: '/finance', label: 'Finance', icon: DollarSign },
  { href: '/procurement', label: 'Procurement', icon: ShoppingCart },
  { href: '/inventory', label: 'Inventory', icon: Package },
  { href: '/sales', label: 'Sales', icon: TrendingUp },
  { href: '/hr', label: 'HR & Timesheet', icon: Users },
  { href: '/insights', label: 'AI Insights', icon: Sparkles },
  { href: '/reports', label: 'Auto Reports', icon: FileText },
];

/**
 * Sidebar - メインナビゲーション
 */
export function Sidebar() {
  const pathname = usePathname();

  return (
    <motion.aside
      className="fixed left-0 top-0 h-screen w-64 bg-background-secondary border-r border-glass-border p-6"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Logo */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">
          <span className="text-accent-primary">Next</span>Gen
        </h2>
        <p className="text-xs text-white/50 mt-1">Analytics Portal</p>
      </div>

      {/* Navigation */}
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-accent-primary text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                )}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-6 left-6 right-6">
        <div className="bg-glass-card border border-glass-border rounded-lg p-4">
          <p className="text-xs text-white/60 mb-2">Powered by</p>
          <p className="text-sm font-semibold text-white">SAP × Snowflake</p>
        </div>
      </div>
    </motion.aside>
  );
}
