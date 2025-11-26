# Next-Gen SAP × Snowflake Dashboard Portal
## Power BI を凌駕する AI ダッシュボード - 完全UI/UX設計書

---

## 📐 1. デザインシステム仕様

### 1.1 カラーパレット（ダークモード主体）

```typescript
const designTokens = {
  colors: {
    // Background Layers
    background: {
      primary: '#0D0E12',
      secondary: '#14151C',
      tertiary: '#1A1B24',
    },

    // Glass Morphism
    glass: {
      card: 'rgba(255, 255, 255, 0.08)',
      cardHover: 'rgba(255, 255, 255, 0.12)',
      border: 'rgba(255, 255, 255, 0.15)',
      borderHover: 'rgba(255, 255, 255, 0.25)',
    },

    // Accent Colors
    accent: {
      primary: '#4A96FF',
      secondary: '#00D1B2',
      tertiary: '#A78BFA',
    },

    // Semantic Colors
    status: {
      success: '#41E1A2',
      warning: '#FFB84D',
      error: '#FF5C5C',
      info: '#6EC5FF',
    },

    // Text
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255, 255, 255, 0.7)',
      tertiary: 'rgba(255, 255, 255, 0.5)',
      disabled: 'rgba(255, 255, 255, 0.3)',
    },

    // Chart Colors
    chart: {
      line1: '#4A96FF',
      line2: '#00D1B2',
      line3: '#A78BFA',
      line4: '#FF6B9D',
      area: 'rgba(74, 150, 255, 0.2)',
      grid: 'rgba(255, 255, 255, 0.1)',
    },
  },

  // Typography
  typography: {
    fontFamily: {
      primary: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      secondary: 'IBM Plex Sans, sans-serif',
      mono: 'Roboto Mono, monospace',
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },

  // Spacing
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
  },

  // Border Radius
  borderRadius: {
    sm: '0.375rem',  // 6px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
    full: '9999px',
  },

  // Shadows
  shadows: {
    glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
    cardHover: '0 12px 48px 0 rgba(74, 150, 255, 0.15)',
    neumorphism: `
      8px 8px 16px rgba(0, 0, 0, 0.4),
      -8px -8px 16px rgba(255, 255, 255, 0.05)
    `,
  },

  // Animations
  animations: {
    duration: {
      fast: '0.15s',
      normal: '0.25s',
      slow: '0.35s',
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      smooth: 'cubic-bezier(0.45, 0, 0.15, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },
};
```

---

## 🎨 2. コンポーネント設計

### 2.1 Core Components

#### GlassCard
```typescript
// 用途: すべてのダッシュボードカードの基盤
// 特徴: Glassmorphism, ホバーアニメーション, クリック展開

interface GlassCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'highlight' | 'alert';
  hoverable?: boolean;
  clickable?: boolean;
  className?: string;
}
```

**ビジュアル仕様:**
- 背景: `rgba(255, 255, 255, 0.08)` + backdrop-blur(20px)
- ボーダー: 1px solid `rgba(255, 255, 255, 0.15)`
- ホバー時: 上に4px浮上 + 影強化 + ボーダー明度上昇
- トランジション: 0.25s ease

#### MetricCard
```typescript
// 用途: KPI数値表示
// 特徴: 数値カウントアップアニメーション

interface MetricCardProps {
  title: string;
  value: number;
  unit?: string;
  change?: number; // パーセンテージ変化
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  loading?: boolean;
}
```

**アニメーション:**
- 数値: 0から目標値まで0.8秒でカウントアップ
- トレンド矢印: 上昇時は緑、下降時は赤、フェードイン
- アイコン: 軽いパルスアニメーション

#### AnimatedLineChart
```typescript
// 用途: 時系列データ可視化
// 特徴: 線の描画アニメーション、ツールチップ

interface AnimatedLineChartProps {
  data: Array<{ date: string; value: number }>;
  color?: string;
  showGrid?: boolean;
  showArea?: boolean;
  height?: number;
}
```

**アニメーション:**
- 初回ロード時: 左から右へ線が描かれる (1.2秒)
- ホバー時: ツールチップがスムーズに表示
- エリア: グラデーションで軽い透明感

#### AIInsightBubble
```typescript
// 用途: AI生成インサイト表示
// 特徴: タイピングアニメーション、吹き出しデザイン

interface AIInsightBubbleProps {
  insight: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  actionable?: {
    label: string;
    onClick: () => void;
  };
}
```

**アニメーション:**
- テキスト: タイピング風に1文字ずつ表示 (0.02s/char)
- 吹き出し: スケール + フェードイン
- アクションボタン: テキスト完了後にスライドイン

#### RadialProgressRing
```typescript
// 用途: 進捗率、達成率の可視化
// 特徴: 円形プログレス、パーセンテージ表示

interface RadialProgressRingProps {
  percentage: number;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  label?: string;
}
```

---

### 2.2 Layout Components

#### DashboardGrid
```typescript
// 用途: レスポンシブグリッドレイアウト
// 12カラムシステム、自動ブレークポイント

interface DashboardGridProps {
  children: React.ReactNode;
  gap?: 'sm' | 'md' | 'lg';
}
```

#### SidePanel
```typescript
// 用途: AI Insights、フィルタパネル
// 特徴: 右からスライドイン、背景ブラー

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: 'sm' | 'md' | 'lg';
}
```

---

## 📱 3. 画面別ワイヤーフレーム設計

### 3.1 Home (Executive Hub)

```
┌─────────────────────────────────────────────────────────────┐
│  🏠 Executive Dashboard              [Day|Week|Month|Q] 🔍  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ Revenue  │ │ Expenses │ │Net Profit│ │ Cash Flow│      │
│  │ $2.4M ↑  │ │ $1.8M ↓  │ │ $600K ↑  │ │ $450K ↑  │      │
│  │ +12.5%   │ │ -5.2%    │ │ +18.3%   │ │ +8.1%    │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  📈 Revenue Trend (3-Month View)                      │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │                                  ╱╲            │  │  │
│  │  │                           ╱╲    ╱  ╲           │  │  │
│  │  │                    ╱╲    ╱  ╲  ╱    ╲          │  │  │
│  │  │             ╱╲    ╱  ╲  ╱    ╲╱      ╲         │  │  │
│  │  │      ╱╲    ╱  ╲  ╱    ╲╱              ╲        │  │  │
│  │  │─────╱──╲──╱────╲╱──────────────────────╲───────│  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌───────────────────────────────┐ ┌──────────────────────┐ │
│  │  🤖 AI Daily Brief            │ │  ⚠️ Alerts           │ │
│  │                                │ │                      │ │
│  │  "Revenue up 12.5% driven by  │ │  • AR Aging +15%     │ │
│  │   Q4 product launch.           │ │  • PO #1234 delayed  │ │
│  │   Watch: AR aging increased    │ │  • Low inventory     │ │
│  │   15% - action recommended."   │ │    in SKU-789        │ │
│  │                                │ │                      │ │
│  │  [View Full Insights →]       │ │  [View All →]        │ │
│  └───────────────────────────────┘ └──────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**レイアウト詳細:**
- トップバー: ナビゲーション + タイムレンジフィルタ + 検索
- KPIカード: 4カラムグリッド、各カードにアイコン + 数値 + トレンド
- メインチャート: 全幅、3ヶ月のトレンド、エリアチャート
- 下部2カラム: AIインサイト(左) + アラート(右)

**インタラクション:**
- KPIカードクリック → 詳細モーダル展開
- チャートホバー → ツールチップ表示
- AI Briefクリック → AI Insights Centerへ遷移

---

### 3.2 Finance Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│  💰 Finance Dashboard                    [Filter ▼] [Export]│
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│  │ Revenue │ │ Expenses│ │ Profit  │ │ Margin  │          │
│  │ $2.4M   │ │ $1.8M   │ │ $600K   │ │ 25.0%   │          │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘          │
│                                                               │
│  ┌─────────────────────┐ ┌─────────────────────────────┐   │
│  │ 📊 P&L Breakdown    │ │ 📈 Revenue vs Expense       │   │
│  │                     │ │                             │   │
│  │ Revenue     $2.4M   │ │  ┌───────────────────────┐ │   │
│  │ COGS       ($1.2M)  │ │  │     (Line Chart)      │ │   │
│  │ Gross Profit $1.2M  │ │  │                       │ │   │
│  │ OpEx       ($600K)  │ │  │   Revenue ────        │ │   │
│  │ EBITDA      $600K   │ │  │   Expense ----        │ │   │
│  │ Net Profit  $600K   │ │  └───────────────────────┘ │   │
│  └─────────────────────┘ └─────────────────────────────────┘   │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  📅 AP/AR Aging Analysis                              │  │
│  │                                                         │  │
│  │  AR: [====30d====][==60d==][=90d=][>90d]             │  │
│  │      $400K         $200K    $100K  $50K               │  │
│  │                                                         │  │
│  │  AP: [=======30d========][==60d==][90d]               │  │
│  │      $300K               $150K    $50K                │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  🎯 Key Metrics                                        │  │
│  │  Operating Margin: 25%  [█████████░] 75% of target   │  │
│  │  Cash Conversion: 32d   [████████░░] 80% of target   │  │
│  │  DSO: 45 days          [██████░░░░] 60% of target   │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**特殊UI要素:**
- Monthly Pulse Animation: 月次の伸び率を波紋エフェクトで表現
- AR/APセグメント: インタラクティブバー、クリックでドリルダウン
- Radial Progress: 目標達成率を円形で表示

---

### 3.3 Sales Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│  💼 Sales Dashboard              [Region▼] [Product▼] [Q4▼]│
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  🌍 Sales by Region (Heat Map)                        │   │
│  │                                                         │   │
│  │    Americas    EMEA       APAC      Japan             │   │
│  │    ████████   ██████     ████       ███               │   │
│  │    $1.2M      $800K      $600K      $200K             │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─────────────────────┐ ┌─────────────────────────────┐   │
│  │ 📊 Pipeline Status  │ │ 📈 Today's Performance      │   │
│  │                     │ │                             │   │
│  │ Prospecting  $500K  │ │ Today's Sales:    $45K      │   │
│  │ Qualified    $800K  │ │ Target:           $50K      │   │
│  │ Proposal     $1.2M  │ │ Achievement:      90%       │   │
│  │ Negotiation  $600K  │ │                             │   │
│  │ Closed Won   $400K  │ │ ┌───────────────────────┐ │   │
│  │                     │ │ │   Hourly Breakdown    │ │   │
│  │ Win Rate: 28%       │ │ │   (Sparkline Chart)   │ │   │
│  │ Avg Deal: $125K     │ │ └───────────────────────┘ │   │
│  └─────────────────────┘ └─────────────────────────────────┘   │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  🎯 Top Products                                       │  │
│  │                                                         │  │
│  │  Product A  [████████████████] $800K  (33%)           │  │
│  │  Product B  [████████████    ] $600K  (25%)           │  │
│  │  Product C  [██████████      ] $500K  (21%)           │  │
│  │  Others     [█████           ] $300K  (21%)           │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**インタラクティブ要素:**
- Heat Map: ホバーで詳細ツールチップ
- パイプラインバー: クリックで案件リスト表示
- フィルタ: トランジション付き即時更新

---

### 3.4 AI Insights Center (Side Panel)

```
┌─────────────────────────────────────────────────────────────┐
│  Dashboard Content                 ┃  🤖 AI Insights        │
│                                    ┃                        │
│  [Charts and Data]                 ┃  💬 Ask AI             │
│                                    ┃  ┌──────────────────┐ │
│                                    ┃  │ Why is AR aging  │ │
│                                    ┃  │ increasing?      │ │
│                                    ┃  └──────────────────┘ │
│                                    ┃  [Send →]            │
│                                    ┃                        │
│                                    ┃  ──────────────────   │
│                                    ┃                        │
│                                    ┃  💡 Latest Insights   │
│                                    ┃                        │
│                                    ┃  ┌─────────────────┐  │
│                                    ┃  │ AR aging up 15% │  │
│                                    ┃  │ due to:         │  │
│                                    ┃  │ • Customer X    │  │
│                                    ┃  │   delayed $50K  │  │
│                                    ┃  │ • 3 invoices    │  │
│                                    ┃  │   >90 days      │  │
│                                    ┃  │                 │  │
│                                    ┃  │ [View Details]  │  │
│                                    ┃  └─────────────────┘  │
│                                    ┃                        │
│                                    ┃  ┌─────────────────┐  │
│                                    ┃  │ Revenue trend   │  │
│                                    ┃  │ looks positive  │  │
│                                    ┃  │ for Q1 2024...  │  │
│                                    ┃  └─────────────────┘  │
│                                    ┃                        │
│                                    ┃  [×] Close           │
└─────────────────────────────────────────────────────────────┘
```

**パネル仕様:**
- 幅: 480px (lg breakpoint)
- アニメーション: 右からスライドイン 0.3s
- 背景: backdrop-blur(10px)
- チャット: タイピングアニメーション
- インサイトカード: スタック表示、スクロール可能

---

### 3.5 Auto Reporting Studio

```
┌─────────────────────────────────────────────────────────────┐
│  📄 Auto Reporting Studio                           [Help]  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  1️⃣ Select Report Type                              │   │
│  │                                                       │   │
│  │  [Monthly Executive] [Finance Deep Dive]            │   │
│  │  [Sales Performance] [Custom Report]                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  2️⃣ Configure Parameters                             │   │
│  │                                                       │   │
│  │  Period:     [November 2025 ▼]                      │   │
│  │  Sections:   ☑ KPI Summary                          │   │
│  │              ☑ Trend Analysis                       │   │
│  │              ☑ AI Insights                          │   │
│  │              ☑ Recommendations                      │   │
│  │  Language:   [English ▼]                            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  3️⃣ Generate                                         │   │
│  │                                                       │   │
│  │       [🚀 Generate Report]                          │   │
│  │                                                       │   │
│  │  Output: [HTML] [PDF] [PowerPoint]                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  📚 Recent Reports                                   │   │
│  │                                                       │   │
│  │  • October 2025 Executive Summary    [Download]     │   │
│  │  • Q3 2025 Finance Report            [Download]     │   │
│  │  • Sales Performance - Sept          [Download]     │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**生成フロー:**
1. ボタンクリック → ローディングアニメーション (3秒)
2. プレビューモーダル表示 (Story Mode)
3. スライド型で左右ナビゲーション
4. ダウンロードボタン表示

---

### 3.6 Report Story Mode (Generated Report View)

```
┌─────────────────────────────────────────────────────────────┐
│  November 2025 Executive Summary              [Download ▼] │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  [◀ Prev]          Slide 1 of 8          [Next ▶]          │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                                                         │  │
│  │               📊 Executive Summary                     │  │
│  │               November 2025                            │  │
│  │                                                         │  │
│  │   ┌──────────┐ ┌──────────┐ ┌──────────┐             │  │
│  │   │ Revenue  │ │ Expenses │ │ Profit   │             │  │
│  │   │ $2.4M    │ │ $1.8M    │ │ $600K    │             │  │
│  │   │ +12.5% ↑ │ │ -5.2% ↓  │ │ +18.3% ↑ │             │  │
│  │   └──────────┘ └──────────┘ └──────────┘             │  │
│  │                                                         │  │
│  │   🤖 AI Summary:                                       │  │
│  │   "Strong revenue growth driven by Q4 product          │  │
│  │    launch. Cost optimization efforts showing           │  │
│  │    results with expense reduction."                    │  │
│  │                                                         │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  ⚪⚪⚫⚪⚪⚪⚪⚪  (Slide indicator)                         │
│                                                               │
│  [⎙ Print] [📧 Email] [💾 Save PDF] [🔗 Share Link]       │
└─────────────────────────────────────────────────────────────┘
```

**Story Mode 特徴:**
- Scroll Snap: 水平スクロールでスライド切り替え
- キーボード対応: 矢印キーでナビゲーション
- トランジション: フェード + スライド 0.4s
- 自動番号: スライド番号とプログレスインジケーター

---

## 🎬 4. アニメーション詳細仕様

### 4.1 ページロードアニメーション

```typescript
// ステージング順序
1. Navigation Bar: Fade In (0.2s)
2. KPI Cards: Stagger Fade + Slide Up (0.3s, 0.1s delay each)
3. Main Chart: Fade In + Line Draw (0.5s)
4. Secondary Elements: Fade In (0.4s)
```

### 4.2 KPIカードホバー

```css
.kpi-card {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.kpi-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 48px 0 rgba(74, 150, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.25);
}
```

### 4.3 チャート描画アニメーション

```typescript
// Recharts Animation Config
<Line
  animationDuration={1200}
  animationEasing="ease-in-out"
  isAnimationActive={true}
/>

<Area
  animationDuration={1000}
  animationBegin={200}
/>
```

### 4.4 AI Insight タイピング

```typescript
const typewriterEffect = (text: string, speed: number = 20) => {
  // 1文字ずつ表示
  // speed: ミリ秒/文字
};
```

### 4.5 モーダル展開

```typescript
// Framer Motion Variants
const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};
```

---

## 📦 5. コンポーネントファイル構成

```
src/
├── app/
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Home (Executive Hub)
│   ├── finance/
│   │   └── page.tsx                  # Finance Dashboard
│   ├── sales/
│   │   └── page.tsx                  # Sales Dashboard
│   ├── procurement/
│   │   └── page.tsx                  # Procurement Dashboard
│   ├── inventory/
│   │   └── page.tsx                  # Inventory Dashboard
│   ├── insights/
│   │   └── page.tsx                  # AI Insights Center
│   └── reports/
│       ├── page.tsx                  # Auto Reporting Studio
│       └── [id]/
│           └── page.tsx              # Report Story View
│
├── components/
│   ├── ui/                           # Core UI Components
│   │   ├── GlassCard.tsx
│   │   ├── MetricCard.tsx
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   └── Modal.tsx
│   │
│   ├── charts/                       # Chart Components
│   │   ├── AnimatedLineChart.tsx
│   │   ├── AreaChart.tsx
│   │   ├── BarChart.tsx
│   │   ├── RadialProgress.tsx
│   │   └── HeatMap.tsx
│   │
│   ├── dashboard/                    # Dashboard-specific
│   │   ├── KPIGrid.tsx
│   │   ├── DashboardHeader.tsx
│   │   ├── TimeRangeFilter.tsx
│   │   └── DashboardGrid.tsx
│   │
│   ├── ai/                           # AI Features
│   │   ├── AIInsightPanel.tsx
│   │   ├── AIInsightBubble.tsx
│   │   ├── ChatInterface.tsx
│   │   └── TypewriterText.tsx
│   │
│   ├── reports/                      # Reporting Components
│   │   ├── ReportComposer.tsx
│   │   ├── StoryModeViewer.tsx
│   │   ├── SlideNavigator.tsx
│   │   └── ReportExporter.tsx
│   │
│   └── layout/                       # Layout Components
│       ├── Sidebar.tsx
│       ├── TopNav.tsx
│       ├── SidePanel.tsx
│       └── PageContainer.tsx
│
├── lib/
│   ├── design-tokens.ts              # Design system tokens
│   ├── animations.ts                 # Animation configurations
│   └── utils.ts                      # Utility functions
│
├── hooks/
│   ├── useCountUp.ts                 # Number animation
│   ├── useTypewriter.ts              # Typing animation
│   ├── useChart.ts                   # Chart data handling
│   └── useAI.ts                      # AI API integration
│
├── types/
│   ├── dashboard.ts                  # Dashboard types
│   ├── charts.ts                     # Chart types
│   └── api.ts                        # API response types
│
└── styles/
    └── globals.css                   # Global styles + Tailwind
```

---

## 🔌 6. API Integration 設計

### 6.1 Data Fetching Pattern

```typescript
// すべてのダッシュボードは同じパターンでデータ取得
interface DashboardData {
  kpis: KPI[];
  trends: TrendData[];
  insights: AIInsight[];
  alerts: Alert[];
}

// Server Component でデータ取得
async function getData(dashboard: string): Promise<DashboardData> {
  const res = await fetch(`/api/dashboard/${dashboard}`);
  return res.json();
}
```

### 6.2 API Routes (想定)

```
/api/dashboard/executive  → Executive Dashboard data
/api/dashboard/finance    → Finance Dashboard data
/api/dashboard/sales      → Sales Dashboard data
/api/insights/generate    → AI Insight generation
/api/reports/generate     → Report generation
/api/reports/export       → Report export (PDF/PPT)
```

### 6.3 レスポンス形式

```typescript
// KPI Response
interface KPIResponse {
  title: string;
  value: number;
  unit: string;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  icon: string;
}

// Trend Data Response
interface TrendDataResponse {
  period: string;
  data: Array<{
    date: string;
    value: number;
    label: string;
  }>;
}

// AI Insight Response
interface AIInsightResponse {
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
```

---

## 📱 7. レスポンシブ対応

### ブレークポイント

```typescript
const breakpoints = {
  sm: '640px',   // Mobile
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large Desktop
  '2xl': '1536px' // Extra Large
};
```

### レスポンシブ戦略

**Mobile (< 768px):**
- KPIカード: 1カラム、縦スタック
- チャート: 全幅、高さ調整
- サイドパネル: フルスクリーンモーダル
- ナビゲーション: ハンバーガーメニュー

**Tablet (768px - 1024px):**
- KPIカード: 2カラムグリッド
- チャート: 1カラムまたは2カラム
- サイドパネル: 360px幅

**Desktop (> 1024px):**
- KPIカード: 4カラムグリッド
- チャート: フレキシブルグリッド
- サイドパネル: 480px幅

---

## 🎯 8. パフォーマンス最適化

### 8.1 コード分割

```typescript
// 遅延ロード
const AIInsightPanel = dynamic(() => import('@/components/ai/AIInsightPanel'));
const StoryModeViewer = dynamic(() => import('@/components/reports/StoryModeViewer'));
```

### 8.2 画像最適化

```typescript
// Next.js Image Component
import Image from 'next/image';

<Image
  src="/chart-bg.png"
  width={800}
  height={400}
  priority // Above-the-fold images
/>
```

### 8.3 データキャッシング

```typescript
// Server Component caching
export const revalidate = 300; // 5分ごとに再検証

// Client-side SWR
import useSWR from 'swr';
const { data } = useSWR('/api/dashboard/finance', fetcher, {
  refreshInterval: 60000, // 1分
});
```

---

## 🧪 9. 実装ステップ

### Phase 1: 基盤構築 (Week 1)
1. ✅ Next.js プロジェクト初期化
2. ✅ デザイントークン実装
3. ✅ コアUI コンポーネント構築
4. ✅ レイアウトシステム構築

### Phase 2: ダッシュボード構築 (Week 2-3)
1. ✅ Home Dashboard
2. ✅ Finance Dashboard
3. ✅ Sales Dashboard
4. ✅ チャートコンポーネント統合

### Phase 3: AI機能 (Week 4)
1. ✅ AI Insight Panel
2. ✅ チャット インターフェース
3. ✅ タイピングアニメーション

### Phase 4: レポーティング (Week 5)
1. ✅ Report Composer UI
2. ✅ Story Mode Viewer
3. ✅ Export 機能

### Phase 5: 最適化 & テスト (Week 6)
1. ✅ パフォーマンス最適化
2. ✅ レスポンシブ調整
3. ✅ アニメーション微調整
4. ✅ ユーザーテスト

---

## 📊 10. 成功指標

### UX メトリクス
- ✅ ページロード時間: < 1.5秒
- ✅ インタラクション応答: < 100ms
- ✅ アニメーション FPS: 60fps
- ✅ モバイルスコア: > 90

### ビジネスメトリクス
- ✅ ダッシュボード作成時間: 0分 (テンプレート化)
- ✅ レポート生成時間: < 5秒
- ✅ ユーザー学習時間: < 10分
- ✅ データ理解時間: 50%削減 (vs Power BI)

---

## 🎨 11. Figma デザインファイル構成

### ページ構成
1. **🎨 Design System**
   - Color Palette
   - Typography Scale
   - Component Library
   - Icon Set

2. **📱 Wireframes**
   - Home Dashboard
   - Finance Dashboard
   - Sales Dashboard
   - AI Insights Panel
   - Report Studio

3. **✨ High-Fidelity Mockups**
   - Desktop Views (1920x1080)
   - Tablet Views (768x1024)
   - Mobile Views (375x812)

4. **🎬 Prototype**
   - Interactive Flows
   - Animation Specs
   - Transition Demos

---

## 🚀 即座に実装可能な Next.js スターターコード

次セクションで、以下を提供します:

1. ✅ 完全な `package.json`
2. ✅ デザイントークン TypeScript ファイル
3. ✅ 主要コンポーネント実装
4. ✅ サンプルダッシュボードページ
5. ✅ Tailwind設定
6. ✅ アニメーション設定

---

**これで、デザイナーもエンジニアも即座に作業開始できます。**

次のステップ: 実装コードを生成しますか? 🚀
