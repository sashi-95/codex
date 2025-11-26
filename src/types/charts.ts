/**
 * チャート コンポーネント型定義
 */

export interface ChartDataPoint {
  date: string;
  [key: string]: string | number;
}

export interface LineChartProps {
  data: ChartDataPoint[];
  lines: {
    dataKey: string;
    color: string;
    label: string;
  }[];
  height?: number;
  showGrid?: boolean;
  showArea?: boolean;
  animate?: boolean;
}

export interface AreaChartProps {
  data: ChartDataPoint[];
  areas: {
    dataKey: string;
    color: string;
    label: string;
  }[];
  height?: number;
  showGrid?: boolean;
  animate?: boolean;
}

export interface BarChartProps {
  data: Array<{
    label: string;
    value: number;
    [key: string]: string | number;
  }>;
  height?: number;
  horizontal?: boolean;
  color?: string;
  showGrid?: boolean;
  animate?: boolean;
}

export interface RadialProgressProps {
  percentage: number;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  label?: string;
  showPercentage?: boolean;
}

export interface HeatMapCell {
  x: string;
  y: string;
  value: number;
}

export interface HeatMapProps {
  data: HeatMapCell[];
  colorScale?: {
    min: string;
    max: string;
  };
  height?: number;
}

export interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
}
