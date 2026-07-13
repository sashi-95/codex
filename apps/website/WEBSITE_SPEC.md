# Website Specification — 会社Webサイト仕様書

ステータス: 実装前仕様 (コードはこの仕様の承認後に着手)
参照: [../../company/strategy/positioning.md](../../company/strategy/positioning.md) /
[../../company/services/pricing.md](../../company/services/pricing.md)

## 1. 目的と成功指標

| 目的 | 指標 |
|---|---|
| Discovery Call予約の獲得 (最重要) | 予約数 / 訪問→予約率 2%以上 |
| 高価格帯サービスとしての信頼獲得 | 商談での「サイトを見た」言及、直帰率 |
| ICPの自己選別 | 問い合わせのICP合致率 |

## 2. 技術構成

| 項目 | 決定 | 理由 |
|---|---|---|
| フレームワーク | Next.js 14 (App Router) + TypeScript + Tailwind CSS | 指定通り。既存リポジトリと同系で保守容易 |
| 配置 | `apps/website/` に**独立アプリ** (自前のpackage.json) | ルートの既存Next.jsアプリ (ダッシュボード) と依存を分離 |
| レンダリング | 全ページ静的生成 (SSG) | 高速・安価・SEO。動的要素はフォームとCalendly埋め込みのみ |
| ホスティング | Vercel | 独自ドメイン + プレビューデプロイ |
| i18n | Next.js標準のルーティング (`/en` `/ja`、デフォルト `/en`) | 辞書ファイル方式 (en.json / ja.json)。言語トグルをヘッダに常設 |
| フォーム | API Route → メール通知 + Notion CRM連携 (automation/lead-intake) | 送信内容はスパム対策 (honeypot + rate limit) |
| 予約 | Calendly埋め込み (`/book`) | Assessment予約に直結 |
| 分析 | Plausible (Cookieレス) | エンタープライズ配慮 + Cookieバナー不要化 |

## 3. デザインシステム

**方針**: エンタープライズ・信頼・シンプル。監査法人/金融の落ち着き。
**禁止**: 紫 / グラデーション多用 / AI感のあるロボット・脳イラスト / ダークテーマ既定。

| トークン | 値 | 用途 |
|---|---|---|
| `--background` | #FFFFFF | 基調 (白) |
| `--surface` | #F7F9F9 | カード・セクション交互背景 |
| `--ink` | #10201F | 見出し・本文 (純黒を避けた墨色) |
| `--ink-muted` | #5A6B6A | 補足テキスト |
| `--accent` | #0E7C7B (深いティファニーブルー/ティール) | CTA・リンク・アイコン |
| `--accent-strong` | #0A5F5E | CTA hover |
| `--border` | #E2E8E8 | カード枠・区切り |
| フォント | Inter (EN) / Noto Sans JP (JA) | 見出しはsemibold。装飾フォント不使用 |
| 角丸 | 8px (カード12px) | 過度な丸みを避ける |
| 影 | ごく薄い1段のみ | フラット基調 |

コンポーネント: Header (ロゴ/ナビ/言語トグル/CTAボタン) / Footer / Card /
StatBlock (数値強調) / ProcessStep / PricingTable / FAQAccordion / CTASection /
LogoStrip (ツールロゴ: SAP, Zendesk, Power Automate等「対応技術」として)。

## 4. ページ仕様 (10ページ)

### 4.1 Home `/`
1. **Hero**: H1 "Automate one critical back-office process in 14 days."
   Sub: "We design and deploy practical AI and automation solutions for ERP,
   customer support, reporting, and repetitive operations."
   CTA (primary): **Book an Automation Assessment** → `/book`
   CTA (secondary): "See how it works" → `/services`
2. **数字で語るバー**: "14 business days" / "Fixed price" / "Production, not PoC" / "EN / 日本語"
3. **課題共感セクション**: 手作業の具体例3つ (請求書入力・月次レポート・問い合わせ対応) をカードで
4. **How it works**: Assessment → Sprint → Support の3ステップ
5. **対応領域カード6枚**: SAP/ERP・Zendesk/CS・レポーティング・RPA・ナレッジ検索・ワークフロー
6. **セキュリティ帯**: HITL承認・監査ログ・データ分離 (1行ずつ)
7. **CTA再掲**

### 4.2 Services `/services`
Assessment / Sprint / Enterprise Sprint / Monthly Support の4カード
(内容は service-catalog.md と完全同期)。各カードに「含まれるもの/含まれないもの」。
下部にデリバリープロセス15フェーズの簡略版タイムライン。

### 4.3 Use Cases `/use-cases`
対象業務13例 (service-catalog記載) をカテゴリ別カードで。各カードは
「Before (何分×月何回) → After (自動化後)」のフォーマット。

### 4.4 Case Studies `/case-studies`
リファレンス実装3件 (実顧客獲得まで):
①Zendesk自律サポートエージェント ②SAP請求書処理自動化 ③SAPレポート自動抽出+配信。
**「Reference implementation (リファレンス実装)」と明示し、実績と誤認させない。**
構成: 課題シナリオ / アーキテクチャ / ガードレール / 想定ROI試算。

### 4.5 Pricing `/pricing`
pricing.md §1の表 + 価格決定原則の要約 + ROIの考え方
(「月40時間×$50 = 年$24,000。Sprintは約8ヶ月で回収」の例)。
FAQ 5問 (前金・スコープ変更・保守・環境要件・LLMのデータ取扱)。

### 4.6 About `/about`
創業者プロフィール (SAP FI/S4HANA × Zendesk × 自動化 × 日英 / NY企業経験)、
会社の思想 ("Practical automation, delivered.")、セキュリティ原則の要約。

### 4.7 Contact `/contact`
フォーム (名前/会社/メール/相談内容/現在の手作業について1問)。
送信後: 24時間以内返信の明示 + `/book` への誘導。

### 4.8 Book a Discovery Call `/book`
Calendly埋め込み。**CTAラベルは全サイトで "Book an Automation Assessment" に統一**し、
このページで「まず30分の無料Discovery Call → 有償Assessment」の2段階を説明
(無料相談と有償サービスの線引きを明確化)。

### 4.9 Privacy Policy `/privacy` / 4.10 Terms `/terms`
標準的な内容 + データ取扱い (フォームデータの保存先・分析ツール)。
法務レビュー前はドラフトである旨をコミットメッセージに明記。

## 5. SEO / アクセシビリティ

- メタ: 各ページ固有のtitle/description、OGP画像1種、`hreflang` (en/ja)、sitemap.xml、robots.txt
- 構造化データ: Organization / Service / FAQPage (Pricing)
- ターゲットクエリ (EN): "SAP report automation", "Zendesk AI agent implementation",
  "back office automation consultant"、(JA): 「SAP 自動化 米国」「日系企業 業務自動化」
- a11y: セマンティックHTML / コントラスト比AA以上 (accent #0E7C7B on white = 4.9:1) /
  キーボード操作 / フォーカスリング / 画像alt / prefers-reduced-motion対応
- パフォーマンス: Lighthouse 90+ (画像はnext/image、フォントはself-host)

## 6. コンテンツ原則

- 一人称は "we"。ただし1人会社を偽らない (Aboutで "founder-led" と明示)
- 全数値は根拠があるもののみ。架空の顧客ロゴ・レビューを載せない
- 各ページ末尾に必ずCTA
- 日本語版は直訳でなく、日系企業向けメッセージ (本社報告・稟議対応) を織り込む

## 7. 実装タスク分解

`company/operations/issues-backlog.md` のMilestone W2-W3を参照。
