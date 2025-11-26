# NextGen Analytics Portal

**Power BI を凌駕する次世代ダッシュボード＆レポーティングポータル**

SAP × Snowflake 統合による美しいデータ可視化とAI搭載インサイト

---

## 🎯 プロジェクト概要

このプロジェクトは、従来のBIツール（Power BI）の制約を超えた、完全カスタムのダッシュボード＆レポーティングWebアプリケーションです。

### 主な特徴

✨ **デザイン特化**
- Apple Design System + SF映画調の美しいUI
- Glassmorphism + ダークモード主体
- 滑らかなアニメーション（Framer Motion）

🤖 **AI搭載**
- AIインサイト自動生成
- チャット形式での質問応答
- ワンクリックレポート生成

📊 **包括的なダッシュボード**
- Executive Dashboard（全体KPI）
- Finance Dashboard（財務分析）
- Sales Dashboard（営業パイプライン）
- AI Insights Center
- Auto Reporting Studio

⚡ **高性能**
- Next.js App Router
- サーバーサイドレンダリング
- 最適化されたアニメーション

---

## 🚀 クイックスタート

### 必要要件

- Node.js 18.17.0 以上
- npm 9.0.0 以上

### インストール

```bash
# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

### ビルド

```bash
# プロダクションビルド
npm run build

# プロダクションサーバー起動
npm start
```

---

## 📁 プロジェクト構造

```
src/
├── app/                          # Next.js App Router ページ
│   ├── page.tsx                  # Home (Executive Dashboard)
│   ├── finance/page.tsx          # Finance Dashboard
│   ├── sales/page.tsx            # Sales Dashboard
│   ├── insights/page.tsx         # AI Insights Center
│   └── reports/page.tsx          # Auto Reporting Studio
│
├── components/
│   ├── ui/                       # コアUIコンポーネント
│   │   ├── GlassCard.tsx         # Glassmorphism カード
│   │   ├── MetricCard.tsx        # KPI表示カード
│   │   └── Button.tsx            # ボタンコンポーネント
│   │
│   ├── charts/                   # チャートコンポーネント
│   │   ├── AnimatedLineChart.tsx # アニメーション付きラインチャート
│   │   └── RadialProgress.tsx    # 円形プログレス
│   │
│   ├── ai/                       # AI機能
│   │   ├── AIInsightBubble.tsx   # インサイト吹き出し
│   │   └── AIInsightPanel.tsx    # AIチャットパネル
│   │
│   └── layout/                   # レイアウトコンポーネント
│       ├── Sidebar.tsx           # サイドバーナビゲーション
│       └── DashboardHeader.tsx   # ダッシュボードヘッダー
│
├── lib/
│   ├── design-tokens.ts          # デザインシステムトークン
│   ├── animations.ts             # アニメーション設定
│   └── utils.ts                  # ユーティリティ関数
│
├── hooks/
│   ├── useCountUp.ts             # 数値カウントアップ
│   └── useTypewriter.ts          # タイピングアニメーション
│
└── types/
    ├── dashboard.ts              # ダッシュボード型定義
    └── charts.ts                 # チャート型定義
```

---

## 🎨 デザインシステム

### カラーパレット

**背景**
- Primary: `#0D0E12`
- Secondary: `#14151C`
- Tertiary: `#1A1B24`

**アクセント**
- Primary: `#4A96FF` (青)
- Secondary: `#00D1B2` (ティール)
- Tertiary: `#A78BFA` (紫)

**ステータス**
- Success: `#41E1A2` (緑)
- Warning: `#FFB84D` (オレンジ)
- Error: `#FF5C5C` (赤)
- Info: `#6EC5FF` (ライトブルー)

### タイポグラフィ

- **Primary**: Inter
- **Secondary**: IBM Plex Sans
- **Mono**: Roboto Mono

### アニメーション

- **Duration**: 150ms (fast), 250ms (normal), 350ms (slow)
- **Easing**: `cubic-bezier(0.4, 0, 0.2, 1)`

---

## 🧩 主要コンポーネント

### GlassCard

Glassmorphism デザインのカードコンポーネント

```tsx
import { GlassCard } from '@/components/ui/GlassCard';

<GlassCard variant="default" hoverable>
  <h3>カードタイトル</h3>
  <p>カードコンテンツ</p>
</GlassCard>
```

### MetricCard

KPI数値表示カード（カウントアップアニメーション付き）

```tsx
import { MetricCard } from '@/components/ui/MetricCard';

<MetricCard
  title="Revenue"
  value={2400000}
  change={12.5}
  trend="up"
  format="currency"
/>
```

### AnimatedLineChart

線の描画アニメーション付きチャート

```tsx
import { AnimatedLineChart } from '@/components/charts/AnimatedLineChart';

<AnimatedLineChart
  title="Revenue Trend"
  data={trendData}
  lines={[
    { dataKey: 'revenue', color: '#4A96FF', label: 'Revenue' }
  ]}
  showArea={true}
/>
```

### AIInsightBubble

AI生成インサイト表示（タイピングアニメーション付き）

```tsx
import { AIInsightBubble } from '@/components/ai/AIInsightBubble';

<AIInsightBubble
  insight="Revenue increased 12.5% this month..."
  type="success"
  animate={true}
/>
```

---

## 📊 ダッシュボード

### Executive Dashboard (`/`)

- 全体KPIカード（Revenue, Expenses, Profit, Cash Flow）
- 3ヶ月トレンドチャート
- AIデイリーブリーフ
- アラート一覧

### Finance Dashboard (`/finance`)

- P&L Breakdown
- Revenue vs Expense トレンド
- AR/AP Aging Analysis
- Key Metrics（円形プログレス）

### Sales Dashboard (`/sales`)

- Sales by Region ヒートマップ
- Pipeline Status
- Today's Performance
- Top Products

### AI Insights Center (`/insights`)

- AIチャットインターフェース
- インサイト履歴
- カテゴリフィルタ
- アクション追跡

### Auto Reporting Studio (`/reports`)

- レポートタイプ選択
- パラメータ設定
- ワンクリック生成
- 過去のレポート一覧

---

## 🔧 カスタマイズ

### デザイントークンの変更

`src/lib/design-tokens.ts` を編集してカラー、フォント、スペーシングなどを変更できます。

```typescript
export const designTokens = {
  colors: {
    accent: {
      primary: '#YOUR_COLOR', // ここを変更
    },
  },
};
```

### 新しいダッシュボードの追加

1. `src/app/your-dashboard/page.tsx` を作成
2. `src/components/layout/Sidebar.tsx` にナビゲーションアイテムを追加
3. 必要に応じて新しいコンポーネントを作成

---

## 🎯 次のステップ

### Phase 1: バックエンド統合
- [ ] Snowflake API統合
- [ ] データフェッチング実装
- [ ] キャッシング戦略

### Phase 2: AI機能強化
- [ ] LLM API統合（OpenAI / Anthropic）
- [ ] インサイト自動生成
- [ ] レポート自動生成

### Phase 3: 追加ダッシュボード
- [ ] Procurement Dashboard
- [ ] Inventory Dashboard
- [ ] HR & Timesheet Dashboard
- [ ] Workflow Analytics

### Phase 4: 最適化
- [ ] パフォーマンスチューニング
- [ ] SEO最適化
- [ ] アクセシビリティ対応
- [ ] E2Eテスト

---

## 📚 参考資料

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [Recharts](https://recharts.org/)

---

## 📄 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。

---

## 🤝 貢献

プルリクエストは大歓迎です！

バグ報告や機能リクエストは Issues でお知らせください。

---

**Built with ❤️ using Next.js, Tailwind CSS, and Framer Motion**
