/**
 * ダッシュボード データ型定義
 */

export type TrendDirection = 'up' | 'down' | 'neutral';

export interface KPI {
  id: string;
  title: string;
  value: number;
  unit?: string;
  change?: number; // パーセンテージ変化
  trend?: TrendDirection;
  icon?: string;
  description?: string;
}

export interface TrendDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface TrendData {
  id: string;
  title: string;
  data: TrendDataPoint[];
  color?: string;
  showArea?: boolean;
}

export interface AIInsight {
  id: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  title: string;
  content: string;
  actionable?: {
    label: string;
    action: string;
  };
  timestamp: string;
}

export interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error';
  title: string;
  description: string;
  link?: string;
  timestamp: string;
}

export interface DashboardData {
  kpis: KPI[];
  trends: TrendData[];
  insights: AIInsight[];
  alerts: Alert[];
}

// Finance Dashboard 固有の型
export interface PLItem {
  label: string;
  value: number;
  isSubtotal?: boolean;
  isTotal?: boolean;
}

export interface AgingBucket {
  range: string;
  value: number;
  percentage: number;
}

export interface ARAPData {
  ar: AgingBucket[];
  ap: AgingBucket[];
}

// Sales Dashboard 固有の型
export interface SalesRegion {
  region: string;
  value: number;
  percentage: number;
  trend: number;
}

export interface PipelineStage {
  stage: string;
  value: number;
  count: number;
}

export interface ProductSales {
  product: string;
  value: number;
  percentage: number;
}

// Report 関連の型
export interface ReportConfig {
  type: 'monthly-executive' | 'finance-deep-dive' | 'sales-performance' | 'custom';
  period: string;
  sections: {
    kpiSummary: boolean;
    trendAnalysis: boolean;
    aiInsights: boolean;
    recommendations: boolean;
  };
  language: 'en' | 'ja';
}

export interface ReportSlide {
  id: string;
  type: 'summary' | 'kpi' | 'chart' | 'insight' | 'recommendation';
  title: string;
  content: any; // スライドタイプに応じて異なる
}

export interface Report {
  id: string;
  title: string;
  createdAt: string;
  config: ReportConfig;
  slides: ReportSlide[];
}

// Time Range Filter
export type TimeRange = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

export interface TimeRangeFilter {
  range: TimeRange;
  startDate?: string;
  endDate?: string;
}
