# Component Library - NextGen Analytics Portal

すべてのUIコンポーネントの完全なリファレンスガイド

---

## 📦 コアUIコンポーネント

### GlassCard

Glassmorphism デザインのカードコンポーネント。すべてのダッシュボードカードの基盤。

#### Props

```typescript
interface GlassCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'highlight' | 'alert';
  hoverable?: boolean;
  clickable?: boolean;
  className?: string;
}
```

#### 使用例

```tsx
import { GlassCard } from '@/components/ui/GlassCard';

// 基本的な使用
<GlassCard>
  <h3>カードタイトル</h3>
  <p>カードコンテンツ</p>
</GlassCard>

// バリアント指定
<GlassCard variant="highlight" hoverable>
  <p>重要な情報</p>
</GlassCard>

// アラート
<GlassCard variant="alert">
  <p>警告メッセージ</p>
</GlassCard>
```

---

### MetricCard

KPI数値を表示するカード。数値のカウントアップアニメーション付き。

#### Props

```typescript
interface MetricCardProps {
  title: string;
  value: number;
  unit?: string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  loading?: boolean;
  format?: 'number' | 'currency' | 'percent';
  decimals?: number;
  className?: string;
}
```

#### 使用例

```tsx
import { MetricCard } from '@/components/ui/MetricCard';
import { DollarSign } from 'lucide-react';

// 通貨フォーマット
<MetricCard
  title="Revenue"
  value={2400000}
  change={12.5}
  trend="up"
  format="currency"
  icon={<DollarSign />}
/>

// パーセンテージ
<MetricCard
  title="Margin"
  value={25.5}
  unit="%"
  change={3.2}
  trend="up"
  decimals={1}
/>

// シンプルな数値
<MetricCard
  title="Active Users"
  value={1234}
  trend="neutral"
/>
```

---

### Button

プライマリボタンコンポーネント。複数のバリアントとサイズをサポート。

#### Props

```typescript
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  onClick?: () => void;
}
```

#### 使用例

```tsx
import { Button } from '@/components/ui/Button';
import { Download, Send } from 'lucide-react';

// プライマリボタン
<Button variant="primary" size="lg">
  Submit
</Button>

// アイコン付き
<Button
  variant="secondary"
  icon={<Download />}
  iconPosition="left"
>
  Download
</Button>

// ローディング状態
<Button loading={isLoading}>
  Processing...
</Button>

// 全幅
<Button fullWidth>
  Continue
</Button>
```

---

## 📊 チャートコンポーネント

### AnimatedLineChart

線の描画アニメーション付きラインチャート。

#### Props

```typescript
interface AnimatedLineChartProps {
  data: ChartDataPoint[];
  lines: {
    dataKey: string;
    color: string;
    label: string;
  }[];
  title?: string;
  height?: number;
  showGrid?: boolean;
  showArea?: boolean;
  className?: string;
}
```

#### 使用例

```tsx
import { AnimatedLineChart } from '@/components/charts/AnimatedLineChart';

const trendData = [
  { date: 'Jan', revenue: 2000000, expenses: 1800000 },
  { date: 'Feb', revenue: 2200000, expenses: 1850000 },
  { date: 'Mar', revenue: 2400000, expenses: 1900000 },
];

<AnimatedLineChart
  title="Revenue vs Expense Trend"
  data={trendData}
  lines={[
    { dataKey: 'revenue', color: '#4A96FF', label: 'Revenue' },
    { dataKey: 'expenses', color: '#FF6B9D', label: 'Expenses' },
  ]}
  height={350}
  showArea={true}
  showGrid={true}
/>
```

---

### RadialProgress

円形のプログレスリング。達成率やパーセンテージの可視化に使用。

#### Props

```typescript
interface RadialProgressProps {
  percentage: number;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  label?: string;
  showPercentage?: boolean;
  className?: string;
}
```

#### 使用例

```tsx
import { RadialProgress } from '@/components/charts/RadialProgress';

// 基本的な使用
<RadialProgress
  percentage={75}
  color="#4A96FF"
  label="Target"
/>

// サイズ指定
<RadialProgress
  percentage={90}
  size="lg"
  color="#41E1A2"
  label="Achievement"
  showPercentage={true}
/>

// 小サイズ
<RadialProgress
  percentage={60}
  size="sm"
  color="#A78BFA"
/>
```

---

## 🤖 AI コンポーネント

### AIInsightBubble

AI生成インサイトを表示する吹き出しコンポーネント。タイピングアニメーション付き。

#### Props

```typescript
interface AIInsightBubbleProps {
  insight: string;
  type?: 'info' | 'warning' | 'success' | 'alert';
  actionable?: {
    label: string;
    onClick: () => void;
  };
  animate?: boolean;
  className?: string;
}
```

#### 使用例

```tsx
import { AIInsightBubble } from '@/components/ai/AIInsightBubble';

// 情報インサイト
<AIInsightBubble
  insight="Revenue increased 12.5% this month driven by Q4 product launch."
  type="info"
  animate={true}
/>

// 警告インサイト（アクション付き）
<AIInsightBubble
  insight="AR aging increased 15% - immediate action recommended."
  type="warning"
  actionable={{
    label: "View Details",
    onClick: () => console.log('Action clicked')
  }}
/>

// 成功インサイト
<AIInsightBubble
  insight="Expense reduction efforts showing strong results."
  type="success"
  animate={false}
/>
```

---

### AIInsightPanel

右からスライドインするAIチャットパネル。

#### Props

```typescript
interface AIInsightPanelProps {
  isOpen: boolean;
  onClose: () => void;
}
```

#### 使用例

```tsx
'use client';

import { useState } from 'react';
import { AIInsightPanel } from '@/components/ai/AIInsightPanel';
import { Button } from '@/components/ui/Button';

export default function MyComponent() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsPanelOpen(true)}>
        Ask AI
      </Button>

      <AIInsightPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
      />
    </>
  );
}
```

---

## 🎨 レイアウトコンポーネント

### DashboardHeader

ダッシュボード共通ヘッダー。タイトル、フィルター、エクスポートボタンを含む。

#### Props

```typescript
interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  onTimeRangeChange?: (range: TimeRange) => void;
  onExport?: () => void;
  className?: string;
}
```

#### 使用例

```tsx
import { DashboardHeader } from '@/components/layout/DashboardHeader';

<DashboardHeader
  title="Executive Dashboard"
  subtitle="Real-time overview of your business metrics"
  onTimeRangeChange={(range) => console.log('Range changed:', range)}
  onExport={() => console.log('Export clicked')}
/>
```

---

### Sidebar

メインナビゲーションサイドバー。

#### 使用例

```tsx
import { Sidebar } from '@/components/layout/Sidebar';

// app/layout.tsx で使用
<div className="flex min-h-screen">
  <Sidebar />
  <main className="flex-1 ml-64">
    {children}
  </main>
</div>
```

---

## 🔧 Hooks

### useCountUp

数値のカウントアップアニメーションフック。

#### Signature

```typescript
function useCountUp(
  end: number,
  options?: {
    duration?: number;
    start?: number;
    decimals?: number;
  }
): number
```

#### 使用例

```tsx
import { useCountUp } from '@/hooks/useCountUp';

function MyComponent() {
  const count = useCountUp(1000, {
    duration: 800,
    start: 0,
    decimals: 0,
  });

  return <div>{count}</div>;
}
```

---

### useTypewriter

タイピングアニメーションフック。

#### Signature

```typescript
function useTypewriter(
  text: string,
  options?: {
    speed?: number;
    delay?: number;
  }
): {
  displayText: string;
  isComplete: boolean;
}
```

#### 使用例

```tsx
import { useTypewriter } from '@/hooks/useTypewriter';

function MyComponent() {
  const { displayText, isComplete } = useTypewriter(
    'This text will be typed out character by character.',
    {
      speed: 20,
      delay: 100,
    }
  );

  return (
    <div>
      {displayText}
      {!isComplete && <span className="cursor">|</span>}
    </div>
  );
}
```

---

## 🎨 ユーティリティ関数

### cn (classNames merger)

Tailwind CSS クラス名をマージするユーティリティ。

```tsx
import { cn } from '@/lib/utils';

<div className={cn(
  'base-class',
  isActive && 'active-class',
  className
)} />
```

---

### formatCurrency

通貨フォーマット。

```typescript
import { formatCurrency } from '@/lib/utils';

formatCurrency(2400000); // "$2,400,000"
formatCurrency(1234.56, { minimumFractionDigits: 2 }); // "$1,234.56"
```

---

### formatPercent

パーセンテージフォーマット。

```typescript
import { formatPercent } from '@/lib/utils';

formatPercent(12.5); // "12.5%"
formatPercent(8, { minimumFractionDigits: 2 }); // "8.00%"
```

---

### getTrendColor

トレンドに基づいた色を取得。

```typescript
import { getTrendColor } from '@/lib/utils';

getTrendColor('up'); // "text-status-success"
getTrendColor('down'); // "text-status-error"
getTrendColor('neutral'); // "text-white/50"

// 逆転させる（下降が良い場合）
getTrendColor('down', true); // "text-status-success"
```

---

## 🎬 アニメーション Variants

### fadeIn

```typescript
import { fadeIn } from '@/lib/animations';

<motion.div variants={fadeIn} initial="hidden" animate="visible">
  Content
</motion.div>
```

### slideUp

```typescript
import { slideUp } from '@/lib/animations';

<motion.div variants={slideUp} initial="hidden" animate="visible">
  Content
</motion.div>
```

### staggerContainer & staggerItem

```typescript
import { staggerContainer, staggerItem } from '@/lib/animations';

<motion.div variants={staggerContainer} initial="hidden" animate="visible">
  {items.map((item) => (
    <motion.div key={item.id} variants={staggerItem}>
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

---

## 🎨 デザイントークン

### Colors

```typescript
import { designTokens } from '@/lib/design-tokens';

const primaryColor = designTokens.colors.accent.primary; // #4A96FF
const successColor = designTokens.colors.status.success; // #41E1A2
```

### Typography

```typescript
const fontSize = designTokens.typography.fontSize.xl; // 1.25rem
const fontFamily = designTokens.typography.fontFamily.primary; // Inter
```

### Spacing

```typescript
const spacing = designTokens.spacing.lg; // 1.5rem
```

---

## 📝 サンプルコード

### 完全なダッシュボードページ

```tsx
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { MetricCard } from '@/components/ui/MetricCard';
import { AnimatedLineChart } from '@/components/charts/AnimatedLineChart';
import { GlassCard } from '@/components/ui/GlassCard';
import { DollarSign, TrendingUp } from 'lucide-react';

export default function MyDashboard() {
  return (
    <div>
      <DashboardHeader
        title="My Dashboard"
        subtitle="Custom analytics dashboard"
      />

      {/* KPI Grid */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Revenue"
          value={2400000}
          change={12.5}
          trend="up"
          format="currency"
          icon={<DollarSign />}
        />
        {/* ... more metrics */}
      </div>

      {/* Chart */}
      <AnimatedLineChart
        title="Trend Analysis"
        data={data}
        lines={lines}
        height={350}
      />

      {/* Custom Content */}
      <GlassCard className="p-6 mt-8">
        <h3 className="text-lg font-semibold text-white mb-4">
          Custom Section
        </h3>
        <p className="text-white/70">
          Your custom content here...
        </p>
      </GlassCard>
    </div>
  );
}
```

---

**すべてのコンポーネントは TypeScript で型安全に実装されています。**
