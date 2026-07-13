# GitHub Issues Backlog — 実装タスク分解

各項目はそのままGitHub Issueとして起票できる形式 (Title / Labels / 説明 / 受入条件)。
Milestone = ROADMAP.mdのMonth 1週次に対応。起票時はGitHub Projectsの
ボード (Backlog / This Week / In Progress / Done) に載せる。

**凡例** ラベル: `biz`=事業 / `sales`=営業資産 / `web`=サイト / `ops`=社内OS / `auto`=自動化

---

## Milestone: M1-W1 (事業基盤)

### #1 会社名の確定と可用性確認
`biz` — positioning.mdの候補10件について、商標DB (USPTO)・法人名 (NY州/DE州)・
.comドメイン・SNSハンドルを確認し1つに確定。
**AC**: 確定名でドメイン取得済み / 全ドキュメントの仮名を一括置換済み

### #2 法人設立・銀行・会計
`biz` — 法人形態の決定 (LLC/C-Corp、税理士に確認)、設立申請、EIN、事業銀行口座、
会計ソフト (QuickBooks等) 開設。
**AC**: 請求書を合法的に発行できる状態

### #3 E&O・サイバー保険の見積取得
`biz` — エンタープライズ契約の前提となる保険2種の見積を3社から取得。
**AC**: 加入判断に足る比較表 (`company/finance/insurance-comparison.md`)

---

## Milestone: M1-W2 (営業資産 = Phase 2)

### #4 ROI計算テンプレート
`sales` — 6問 (時間/回数/実行者/エラー/削減/回収) を入力すると回収期間を出す
スプレッドシート + 提案書貼付け用の計算ロジック。サイトのroi-calculatorの原型。
**AC**: Discovery Callの数値をその場で入力してROIを提示できる

### #5 Discovery Callスクリプト + 初回商談質問票
`sales` — sales-playbook §4の型を完全版スクリプトに展開。
**AC**: 30分の進行が1枚で見える / 失格判定基準を含む

### #6 提案書・見積書テンプレート
`sales` — 課題→解決→ROI→計画→価格→スコープ外の構成。EN/JA両版。
**AC**: Assessment結果を入れれば3時間で提案書が完成する状態

### #7 SOW・NDAドラフト・MSA構成案
`sales` — 支払条件 (50/50)・アクセス提供遅延の納期加算・データ取扱条項・
LLM利用合意を含む。**弁護士レビュー前ドラフトと明記**。
**AC**: 弁護士レビューに出せる完成度

### #8 会社紹介文・30秒/3分ピッチ・営業メール・LinkedInメッセージ
`sales` — playbookのメッセージング軸 (CFO/IT/現場/本社別) に沿ってEN/JA作成。
**AC**: コールド送信可能な文面3種 + フォローアップ2種

### #9 サービス紹介資料・FAQ・反論処理集
`sales` — 商談送付用PDF (10枚以内) + よくある質問と反論への標準回答。
**AC**: 商談後に「検討します」と言われた際に送る資料が揃う

### #10 ケーススタディ3件 (リファレンス実装ベース)
`sales` — ①Zendeskエージェント ②SAP請求書処理 ③レポート自動抽出。
「Reference implementation」明示、アーキテクチャ図+想定ROI形式。
**AC**: サイトCase Studiesページにそのまま掲載できる

---

## Milestone: M1-W2〜W3 (Webサイト = Phase 3)

### #11 websiteアプリの雛形と設計トークン
`web` — apps/website/ にNext.js14+TS+Tailwind独立アプリを作成。
WEBSITE_SPEC §3のデザイントークン・共通コンポーネント (Header/Footer/Card/CTA)。
**AC**: `npm run dev`で骨格が動く / トークンがtailwind.configに定義済み

### #12 i18n基盤 (EN/JA)
`web` — /en /ja ルーティング + 辞書ファイル + 言語トグル + hreflang。
**AC**: 全ページが両言語で表示でき、URLで言語が固定される

### #13 Home + Services + Pricing 実装
`web` — WEBSITE_SPEC §4.1/4.2/4.5。コピーはspec記載の確定文言。
**AC**: モバイル表示 / コントラストAA / CTAが/bookへ誘導

### #14 Use Cases + Case Studies + About 実装
`web` — §4.3/4.4/4.6。#10のケーススタディを組み込み。
**AC**: 13ユースケースがBefore/After形式で表示される

### #15 Contact + Book + Privacy/Terms 実装
`web` — フォーム (honeypot+rate limit) → メール通知、Calendly埋め込み。
**AC**: フォーム送信がテスト受信でき、Calendly予約が完了する

### #16 SEO・計測・デプロイ
`web` — メタ/OGP/sitemap/構造化データ/Plausible導入、Vercel本番デプロイ+独自ドメイン。
**AC**: Lighthouse 90+ / Search Console登録済み / 本番URL公開

---

## Milestone: M1-W3 (社内OS = Phase 4最小構成)

### #17 Notion CRMセットアップ
`ops` — リード/商談/顧客/保守契約のDB (operating-model §2)。ステージ・次アクション・金額。
**AC**: リード100社を投入できる状態 / パイプラインビューがある

### #18 Stripe請求 + Calendly + Slack通知の開通
`ops` — 請求書テンプレート (前金/残金/保守サブスク)、Calendly→Slack、Stripe入金→Slack。
**AC**: テスト請求書の送付と入金通知が動く

### #19 顧客案件用リポジトリテンプレート
`ops` — 案件開始時に複製するテンプレートリポジトリ (README/仕様書雛形/.env.example/
.gitignore/ログ設計/GitHub Actions雛形/納品物チェックリスト)。
**AC**: 新案件のリポジトリ準備が10分で終わる

### #20 knowledgeディレクトリ再編
`ops` — 既存資産 (src/python/sapgui-vbs/docs) への参照リンク集を/knowledge配下に作成
(物理移動はしない)。案件で使う際の流用手順を各1枚で。
**AC**: 「この案件はどの資産から始めるか」が5分で判断できる

---

## Milestone: M1-W4 (社内エージェント = Phase 4)

### #21 automation/lead-intake
`auto` — サイトフォーム→Notion CRM登録→Slack通知→Sales Agentの評価メモ下書き。
**AC**: フォーム送信から5分以内にSlackへ「格付け済みリード」が届く

### #22 Sales Agent v1
`auto` — リード情報→企業調査サマリ+課題仮説+アウトリーチメール草案 (人間レビュー必須)。
**AC**: リード1件あたりの準備時間が15分→5分に短縮

### #23 Discovery Agent v1
`auto` — 商談メモ/録音書き起こし→構造化Discoveryメモ+不明点リスト+ROI初期試算。
**AC**: 商談後30分でAssessment提案の材料が揃う

### #24 automation/status-report + invoice-preparation
`auto` — 保守顧客向け月次レポート草案の自動生成 / Stripe請求書の準備自動化。
**AC**: 月次ルーティンが顧客1社あたり30分以内

---

## Backlog (M2以降・順不同)

- #25 Solution Architect Agent / Proposal Agent (提案書・SOW自動ドラフト)
- #26 Delivery Agent (SOW→GitHub Issues自動分解) / QA Agent (リリース判定チェック)
- #27 apps/roi-calculator (サイト組込みのインタラクティブ版 → リード獲得装置)
- #28 apps/client-portal (保守顧客3社超で着手判断)
- #29 Support Agent (自社support-agentの自社運用転用、Zendesk導入と同時)
- #30 ケーススタディの実案件置き換え (顧客許可取得フロー含む)
