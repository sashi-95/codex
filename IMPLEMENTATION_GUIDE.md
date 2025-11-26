# Implementation Guide - NextGen Analytics Portal

このガイドでは、プロジェクトを本番環境に展開し、バックエンドAPIと統合する方法を説明します。

---

## 📋 目次

1. [環境セットアップ](#環境セットアップ)
2. [バックエンドAPI統合](#バックエンドapi統合)
3. [データフェッチング戦略](#データフェッチング戦略)
4. [AI機能の実装](#ai機能の実装)
5. [デプロイメント](#デプロイメント)
6. [パフォーマンス最適化](#パフォーマンス最適化)

---

## 🔧 環境セットアップ

### 1. 環境変数の設定

プロジェクトルートに `.env.local` ファイルを作成：

```env
# Snowflake API
SNOWFLAKE_API_URL=https://your-snowflake-instance.snowflakecomputing.com
SNOWFLAKE_API_KEY=your_api_key
SNOWFLAKE_ACCOUNT=your_account

# AI Services (OpenAI or Anthropic)
OPENAI_API_KEY=your_openai_key
# または
ANTHROPIC_API_KEY=your_anthropic_key

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 開発サーバー起動

```bash
npm run dev
```

---

## 🔌 バックエンドAPI統合

### API Routes の作成

Next.js API Routes を使用してバックエンドAPIを抽象化します。

#### 例: `/api/dashboard/executive/route.ts`

```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Snowflake APIからデータを取得
    const response = await fetch(
      `${process.env.SNOWFLAKE_API_URL}/api/v1/dashboards/executive`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.SNOWFLAKE_API_KEY}`,
        },
      }
    );

    const data = await response.json();

    return NextResponse.json({
      kpis: [
        {
          title: 'Revenue',
          value: data.revenue,
          change: data.revenue_change,
          trend: data.revenue_change > 0 ? 'up' : 'down',
        },
        // ... その他のKPI
      ],
      trends: data.trends,
      insights: data.insights,
      alerts: data.alerts,
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
```

#### クライアント側でのデータフェッチ

```typescript
// src/app/page.tsx

async function getData() {
  const res = await fetch('/api/dashboard/executive', {
    next: { revalidate: 60 }, // 60秒ごとに再検証
  });

  if (!res.ok) {
    throw new Error('Failed to fetch data');
  }

  return res.json();
}

export default async function HomePage() {
  const data = await getData();

  return (
    <div>
      {/* データを使用してコンポーネントをレンダリング */}
    </div>
  );
}
```

---

## 📊 データフェッチング戦略

### 1. Server Components（推奨）

```typescript
// デフォルトでServer Component
export default async function FinancePage() {
  // サーバー側でデータフェッチ
  const data = await fetch('/api/dashboard/finance').then(r => r.json());

  return <FinanceView data={data} />;
}
```

**メリット:**
- 初回ロードが高速
- SEO最適化
- サーバー側でシークレットを安全に扱える

### 2. Client Components with SWR

リアルタイム更新が必要な場合:

```typescript
'use client';

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function RealtimeDashboard() {
  const { data, error, isLoading } = useSWR(
    '/api/dashboard/realtime',
    fetcher,
    {
      refreshInterval: 5000, // 5秒ごとに更新
    }
  );

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage />;

  return <DashboardView data={data} />;
}
```

### 3. キャッシング戦略

```typescript
// 静的データ（1時間キャッシュ）
export const revalidate = 3600;

// または、個別のfetchで指定
fetch('/api/data', {
  next: { revalidate: 3600 },
});
```

---

## 🤖 AI機能の実装

### 1. AI Insights API

#### `/api/ai/insights/route.ts`

```typescript
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  const { question, context } = await request.json();

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a financial analyst AI assistant...',
        },
        {
          role: 'user',
          content: `Context: ${JSON.stringify(context)}\n\nQuestion: ${question}`,
        },
      ],
    });

    const insight = completion.choices[0].message.content;

    return NextResponse.json({ insight });
  } catch (error) {
    console.error('AI Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate insight' },
      { status: 500 }
    );
  }
}
```

### 2. Auto Report Generation

#### `/api/reports/generate/route.ts`

```typescript
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { type, period, sections } = await request.json();

  try {
    // 1. データを取得
    const data = await fetchDashboardData(period);

    // 2. AI でコンテンツ生成
    const content = await generateReportContent(data, sections);

    // 3. レポートIDを生成して保存
    const reportId = await saveReport({
      type,
      period,
      content,
    });

    return NextResponse.json({
      reportId,
      url: `/reports/${reportId}`,
    });
  } catch (error) {
    console.error('Report Generation Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}
```

---

## 🚀 デプロイメント

### Vercel へのデプロイ（推奨）

1. **Vercel CLI をインストール**

```bash
npm install -g vercel
```

2. **デプロイ**

```bash
vercel
```

3. **環境変数を設定**

Vercel Dashboard で環境変数を設定:
- `SNOWFLAKE_API_URL`
- `SNOWFLAKE_API_KEY`
- `OPENAI_API_KEY`

### その他のプラットフォーム

#### AWS (Amplify)

```bash
# amplify.yml を作成
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
```

#### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

---

## ⚡ パフォーマンス最適化

### 1. 画像最適化

```tsx
import Image from 'next/image';

<Image
  src="/chart-bg.png"
  width={800}
  height={400}
  priority // Above-the-fold images
  alt="Chart background"
/>
```

### 2. コード分割

```tsx
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'), {
  loading: () => <LoadingSpinner />,
  ssr: false, // クライアント側でのみレンダリング
});
```

### 3. フォント最適化

```tsx
// app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});
```

### 4. Bundle サイズの最適化

```bash
# Bundle analyzer をインストール
npm install @next/bundle-analyzer

# next.config.js に追加
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);

# 実行
ANALYZE=true npm run build
```

### 5. データベースクエリの最適化

```typescript
// 並列フェッチ
const [kpis, trends, insights] = await Promise.all([
  fetchKPIs(),
  fetchTrends(),
  fetchInsights(),
]);
```

---

## 🔒 セキュリティベストプラクティス

### 1. API キーの保護

```typescript
// ❌ 間違い
const apiKey = 'sk-1234567890';

// ✅ 正しい
const apiKey = process.env.SNOWFLAKE_API_KEY;
```

### 2. CORS の設定

```typescript
// middleware.ts
import { NextResponse } from 'next/server';

export function middleware(request: Request) {
  const response = NextResponse.next();

  response.headers.set('Access-Control-Allow-Origin', 'https://yourdomain.com');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');

  return response;
}
```

### 3. レート制限

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
```

---

## 📈 モニタリング

### Vercel Analytics

```bash
npm install @vercel/analytics
```

```tsx
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

---

## 🧪 テスト

### Unit Tests (Jest)

```bash
npm install -D jest @testing-library/react @testing-library/jest-dom
```

```typescript
// __tests__/MetricCard.test.tsx
import { render, screen } from '@testing-library/react';
import { MetricCard } from '@/components/ui/MetricCard';

describe('MetricCard', () => {
  it('renders correctly', () => {
    render(
      <MetricCard
        title="Revenue"
        value={2400000}
        change={12.5}
        trend="up"
      />
    );

    expect(screen.getByText('Revenue')).toBeInTheDocument();
  });
});
```

### E2E Tests (Playwright)

```bash
npm install -D @playwright/test
```

```typescript
// e2e/dashboard.spec.ts
import { test, expect } from '@playwright/test';

test('executive dashboard loads', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('Executive Dashboard');
});
```

---

## 📞 サポート

問題が発生した場合:

1. GitHub Issues で報告
2. ドキュメントを確認
3. コミュニティフォーラムで質問

---

**Happy Coding! 🚀**
