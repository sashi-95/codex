# JudasSniper V5 Upgrade — Cursor AI 指示書

> **目的**: モノリシックな JudasSniper コンポーネント (V4, ~450行) を、プロジェクトのデザインシステムに準拠した
> モジュラーアーキテクチャ (V5) にアップグレードする。
>
> **対象**: `src/components/trading/` 配下の全ファイル

---

## 0. アーキテクチャ概要

```
src/
├── types/trading.ts              ← 型定義 (MarketTick, SMTDivergence 等)  ✅ 作成済
├── lib/
│   ├── design-tokens.ts          ← tradingColors 追加済                   ✅ 更新済
│   └── trading-constants.ts      ← 全定数を外部化                         ✅ 作成済
├── stores/
│   └── useJudasStore.ts          ← Zustand ストア                         ✅ 作成済
├── hooks/
│   └── useEntryChecklist.ts      ← 判定ロジックフック                     ✅ 作成済
└── components/trading/
    ├── index.ts                  ← Barrel export                          ✅ 作成済
    ├── JudasSniper.tsx           ← V5 オーケストレーター                   ✅ 作成済
    ├── BiasHeader.tsx            ← LAYER 1: Verdict + Bias + Price        ✅ 作成済
    ├── ExecutionProtocol.tsx     ← 左カラム: チェックリスト全体            ✅ 作成済
    ├── EntryConditions.tsx       ← エントリー条件パネル                    ✅ 作成済
    ├── LevelsEditor.tsx          ← PDH/PDL/SL/Entry 編集                  ✅ 作成済
    ├── PriceChart.tsx            ← Recharts NQ/ES 1分足                   ✅ 作成済
    ├── CandleSnapshots.tsx       ← ローソク足スナップショット              ✅ 作成済
    ├── ContextPanel.tsx          ← LAYER 3: 折りたたみコンテキスト         ✅ 作成済
    └── JudasPatternRef.tsx       ← パターン参照図 (SVGスタブ)              ✅ 作成済
```

**全ファイルは作成済みです。以降のタスクは Cursor で各ファイルを「発展」させるためのものです。**

---

## 1. 次のステップ: Cursor で実装すべきタスク

### TASK 1: JudasPatternRef を本格的な SVG/Canvas パターン図に発展

**ファイル**: `src/components/trading/JudasPatternRef.tsx`

**現在**: 簡易 SVG プレースホルダー

**目標**: ICT Judas Swing の教科書的なパターン図を描画する

```
指示: JudasPatternRef.tsx を以下の仕様でアップグレードしてください。

1. Long Model:
   - 09:30 でフェイクアウト (Manipulation Phase): 下方向へのスイング
   - SSL (Sell-Side Liquidity) の Sweep を示す点線ゾーン
   - 09:45 でリバーサル: MSS (Market Structure Shift) のマーカー
   - FVG (Fair Value Gap) ゾーンのハイライト (半透明の矩形)
   - Entry, SL, TP のアノテーションライン

2. Short Model:
   - 09:30 でフェイクアウト: 上方向へのスイング
   - BSL (Buy-Side Liquidity) の Sweep
   - 09:45 で下方リバーサル
   - 同様に FVG, Entry, SL, TP マーカー

3. 技術要件:
   - SVG viewBox="0 0 300 200" でレスポンシブ
   - tradingColors (from @/lib/design-tokens) を使用
   - ホバー時にアノテーションをフェードイン (framer-motion)
   - ダークテーマ前提 (背景は透明)
```

---

### TASK 2: リアルタイムデータ接続 (WebSocket / SWR)

**ファイル**: 新規 `src/hooks/useMarketData.ts`

```
指示: TradingView や Alpaca のような WebSocket ベースのマーケットデータフックを作成してください。

1. SWR + WebSocket のハイブリッドパターン:
   - SWR で初期データフェッチ (REST)
   - WebSocket で価格更新をストリーム
   - 接続断時は自動再接続 (exponential backoff)

2. インターフェース:
   export function useMarketData(symbols: string[]): {
     ticks: Record<string, MarketTick>;
     isConnected: boolean;
     error: Error | null;
   }

3. 現段階では mock モードも用意:
   - USE_MOCK=true のとき、setInterval でランダム価格更新
   - 本番では WebSocket URL を環境変数から取得

4. @/types/trading.ts の MarketTick 型を使用
```

---

### TASK 3: Google Sheets 連携 (Setup Log 永続化)

**ファイル**: `src/stores/useJudasStore.ts` の `saveSetupLog` を拡張

```
指示: saveSetupLog を Google Sheets API に接続してください。

1. Next.js API Route を作成: src/app/api/judas-log/route.ts
   - POST: SetupLogPayload を受け取り、Google Sheets にアペンド
   - GET: 直近50件のログを返す

2. Google Sheets API (googleapis) を使用:
   - サービスアカウント認証 (環境変数: GOOGLE_SHEETS_ID, GOOGLE_SERVICE_ACCOUNT_KEY)
   - シート名: "JudasSetups"
   - カラム: timestamp, completedSteps (JSON), pdh, pdl, sl, entryMin, entryMax, currentPrice, verdict

3. ストアの更新:
   - saveSetupLog で fetch('/api/judas-log', { method: 'POST', body }) を呼ぶ
   - localStorage はフォールバックとして残す
   - エラー時は localStorage にのみ保存 + トースト通知
```

---

### TASK 4: キーボードショートカット & アクセシビリティ

**ファイル**: `src/components/trading/JudasSniper.tsx` + 各サブコンポーネント

```
指示: キーボードショートカットとアクセシビリティを実装してください。

1. キーボードショートカット:
   - Ctrl+Shift+1〜4: EXECUTION_CHECKLIST の各項目をトグル
   - Ctrl+Shift+S: セットアップログ保存
   - Ctrl+Shift+E: エントリーログ
   - Ctrl+Shift+C: コンテキストパネルのトグル
   - useEffect + addEventListener('keydown') で実装

2. アクセシビリティ:
   - 全 button に role と aria-label
   - チェックボックスに aria-checked
   - ContextPanel に aria-expanded, aria-controls
   - チャートに role="img" と aria-label="NQ/ES 1分足チャート"
   - スクリーンリーダー向けの sr-only テキスト追加

3. フォーカス管理:
   - Tab キーで論理的な順序でフォーカス移動
   - フォーカスリングのスタイル: focus-visible:ring-2 focus-visible:ring-[#D4AF37]
```

---

### TASK 5: レスポンシブ対応 (モバイル / タブレット)

**ファイル**: 全 trading コンポーネント

```
指示: モバイル (< 768px) とタブレット (768px-1024px) に対応してください。

1. モバイル (< md):
   - BiasHeader: Verdict + Price のみ表示。Bias/Zone/Session は非表示
   - ExecutionProtocol + PriceChart: col-span-12 (縦積み)
   - ContextPanel: デフォルト非表示。ボタンタップで全画面モーダル
   - LevelsEditor: 常に非表示 (モバイルでは編集不可)
   - CandleSnapshots: 2列グリッド (grid-cols-2)

2. タブレット (md - lg):
   - 2カラムレイアウト (6:6)
   - ContextPanel: ハーフスクリーン

3. Tailwind のレスポンシブプレフィックスを使用:
   - sm:, md:, lg:, xl:
   - hidden md:block, md:col-span-6 lg:col-span-5 等
```

---

### TASK 6: テスト

**ファイル**: 新規 `src/components/trading/__tests__/`

```
指示: 各コンポーネントとフックのテストを作成してください。

1. セットアップ:
   - Jest + React Testing Library
   - package.json にテストスクリプトがなければ追加

2. テスト対象:

   useEntryChecklist.test.ts:
   - getEntryChecklist: 各条件の on/off を検証
   - useVerdict: score と protocolComplete の組み合わせ
   - usePDZone: PREMIUM, DISCOUNT, EQUILIBRIUM の境界値

   useJudasStore.test.ts:
   - toggleStep: 追加と削除
   - setLevel: 各キーの更新
   - isProtocolComplete: 全ステップ完了時に true
   - logEntry: localStorage への保存

   BiasHeader.test.tsx:
   - verdict テキストの表示
   - killzone active/inactive の状態

   ExecutionProtocol.test.tsx:
   - チェックボックスのトグル
   - Save ボタンの disabled 状態
```

---

### TASK 7: パフォーマンス最適化

```
指示: React DevTools Profiler で不要な再レンダリングを特定し、最適化してください。

1. React.memo の適用確認:
   - CandleSnapshots (静的データ → props なし → 自動的に1回のみレンダリング)
   - EntryConditions の各行項目

2. useCallback の追加:
   - JudasSniper.tsx の handleSaveSetup, handleLogEntry
   - ExecutionProtocol の onToggleStep コールバック

3. Recharts 最適化:
   - PriceChart: isAnimationActive={false} (リアルタイム更新時)
   - useMemo で chartData を確実にメモ化

4. Zustand セレクター:
   - useJudasStore を浅い選択 (shallow) で使用
   import { useShallow } from 'zustand/react/shallow';
   const { levels, completedSteps } = useJudasStore(useShallow(s => ({
     levels: s.levels,
     completedSteps: s.completedSteps,
   })));
```

---

### TASK 8: Tailwind クラスの design-tokens 統合

```
指示: ハードコードされた色をプロジェクトの Tailwind テーマに統合してください。

1. tailwind.config.ts に trading カラーを追加:

   colors: {
     trading: {
       green: '#00C805',
       pink: '#FF6AC1',
       gold: '#D4AF37',
       cyan: '#00f2ff',
     },
   }

2. コンポーネント内の style={{ color: '#00C805' }} を Tailwind クラスに置換:
   - text-trading-green, bg-trading-green/5, border-trading-green/20
   - text-trading-pink, text-trading-gold, text-trading-cyan

3. 例外: Recharts の stroke / fill は JSX props なので tradingColors を維持

4. 対象ファイル: BiasHeader, ExecutionProtocol, EntryConditions, ContextPanel
```

---

## 2. プロジェクト規約 (Cursor が守るべきルール)

| 規約 | 詳細 |
|------|------|
| `'use client'` | すべての trading コンポーネントに必須 |
| `cn()` | 条件付きクラス名には `@/lib/utils` の `cn()` を使用 |
| `GlassCard` | カードコンテナには `@/components/ui/GlassCard` を検討 |
| `framer-motion` | アニメーションは `@/lib/animations` のバリアントを再利用 |
| `designTokens` | ハードコードされた色は `@/lib/design-tokens` を参照 |
| `tradingColors` | トレーディング固有の色は `tradingColors` を参照 |
| 型 | `@/types/trading.ts` に定義済みの型を使用 |
| ストア | コンポーネント間で共有する状態は `useJudasStore` に集約 |
| パスエイリアス | `@/*` → `./src/*` |
| フォント | `font-mono` (数値), `font-sans` (テキスト) |

---

## 3. ファイル依存関係マップ

```
JudasSniper.tsx (orchestrator)
├── useJudasStore (Zustand)
├── useEntryChecklist / useHTFBias / usePDZone / useVerdict (hooks)
├── BiasHeader.tsx
│   └── tradingColors, cn()
├── ExecutionProtocol.tsx
│   ├── LevelsEditor.tsx
│   │   └── AnimatePresence (framer-motion)
│   └── EntryConditions.tsx
├── PriceChart.tsx
│   └── recharts (LineChart, ReferenceLine)
├── CandleSnapshots.tsx
│   └── tradingColors
└── ContextPanel.tsx
    └── AnimatePresence (framer-motion)
        └── JudasPatternRef.tsx (slot via patternRefSlot prop)
```

---

## 4. 実行順序の推奨

1. **TASK 8** (Tailwind 統合) — 基盤のスタイルを固める
2. **TASK 1** (JudasPatternRef) — ビジュアル的なインパクト大
3. **TASK 4** (アクセシビリティ) — 品質基盤
4. **TASK 5** (レスポンシブ) — UX 必須
5. **TASK 7** (パフォーマンス) — 実データ接続前に最適化
6. **TASK 2** (リアルタイムデータ) — 機能拡張
7. **TASK 3** (Google Sheets) — 永続化
8. **TASK 6** (テスト) — 全機能実装後にテスト

---

## 5. Cursor Composer 用クイックプロンプト集

以下をコピペして Cursor の Composer で使えます：

### Tailwind 統合
```
@src/components/trading を見て、ハードコードされた色 (#00C805, #FF6AC1, #D4AF37, #00f2ff) を
tailwind.config.ts の trading カラーに追加し、コンポーネント内で Tailwind クラスに置換してください。
tradingColors からインポートしている recharts 関連の props はそのまま維持。
```

### レスポンシブ対応
```
@src/components/trading の全コンポーネントにモバイル対応を追加してください。
md 未満: 縦積みレイアウト、BiasHeader は Verdict + Price のみ、ContextPanel はモーダル化。
md-lg: 2カラム。lg以上: 現状維持 (5:7)。Tailwind レスポンシブプレフィックスを使用。
```

### テスト追加
```
@src/components/trading と @src/hooks/useEntryChecklist.ts, @src/stores/useJudasStore.ts の
ユニットテストを作成してください。Jest + React Testing Library を使用。
テストファイルは __tests__ ディレクトリ内に配置。
```

### パフォーマンス
```
@src/components/trading/JudasSniper.tsx の useJudasStore 呼び出しを
zustand/react/shallow のセレクターパターンに変更してください。
また、handleSaveSetup と handleLogEntry を useCallback でラップ。
PriceChart の recharts に isAnimationActive={false} を追加。
```
