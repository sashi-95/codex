# Operating Model — 1人会社の業務システムと社内AIエージェント

関連: [../delivery/delivery-methodology.md](../delivery/delivery-methodology.md) /
[../security/security-principles.md](../security/security-principles.md)

## 1. 原則

- 最初から大規模なシステムを作らない。**既製ツール + 薄い自動化**で回す
- 創業者の時間は「顧客との会話」と「納品」にのみ使う。それ以外はエージェント化・自動化・テンプレート化の対象
- すべての社内業務も「自社が顧客だったら」の品質で自動化する = 営業デモを兼ねる

## 2. ツールスタック (最小構成)

| 業務 | ツール | 補足 |
|---|---|---|
| リード/商談/顧客管理 | Notion (CRMデータベース1つ) | ステージ・次アクション・金額。HubSpot Free移行はM4以降に判断 |
| 案件/タスク/要件管理 | GitHub Issues + Projects | 顧客ごとにprivateリポジトリ。要件=Issue、進捗=Project board |
| コード/デプロイ管理 | GitHub + GitHub Actions | テンプレート資産はモノレポ、顧客案件は分離 (データ分離原則) |
| 契約管理 | Google Drive (Workspace) + 電子署名 (Dropbox Sign等) | `/legal` テンプレートから生成 |
| 請求管理 | Stripe (Invoicing) | 前金・残金・保守サブスクリプション。入金確認をSlack通知 |
| 日程調整 | Calendly | Discovery Call予約をサイトのCTAに直結 |
| ナレッジ管理 | 本リポジトリ `/knowledge` + Notion | 技術=Git、営業・顧客メモ=Notion |
| 顧客サポート | メール→Zendesk (保守顧客3社超えたら導入) | 自社のsupport-agentを自社運用に使う (ドッグフーディング) |
| 社内連絡/通知 | Slack (自分用ワークスペース) | 全自動化の通知ハブ |
| KPI管理 | Notionダッシュボード (月次手動更新から開始) | §5のKPIのみ。作り込まない |

## 3. ディレクトリ構造 (本リポジトリ)

```
/company    ← 事業基盤 (Phase 1で作成中)
  /strategy /brand /sales /services /legal /finance /operations /delivery /security /templates
/apps
  /website        ← 会社サイト (Phase 3)
  /client-portal  ← 顧客ポータル (M4以降、保守顧客3社超で着手)
  /roi-calculator ← ROI計算機 (サイト組込み・リード獲得装置)
/automation       ← 社内業務の自動化 (§4のエージェント実装)
  /lead-intake /proposal-generator /project-setup /status-report
  /invoice-preparation /support-triage
/knowledge        ← 再利用可能な技術資産
  /sap /zendesk /power-automate /ai-agents /security /case-studies
(既存: /src /python /sapgui-vbs /docs = 納品テンプレート資産。/knowledge配下へは
 参照リンクで統合し、物理移動はビルド影響のない時期に実施)
```

## 4. 社内AIエージェント構成 (7エージェント)

実装方針: 各エージェントは Claude API + 定義プロンプト + ツール (Notion/GitHub/Gmail
API) の薄い構成。`/automation` 配下に1エージェント1ディレクトリ。
**すべて人間 (創業者) のレビューを経て外部送信する** — 顧客に無断でAI出力を送らない。

| エージェント | 責務 | 入力 → 出力 | 実装時期 |
|---|---|---|---|
| **Sales Agent** | リード整理 / 企業調査 / 課題仮説 / 営業メール草案 / 商談準備 / フォローアップ草案 | リード情報 → 評価メモ+メール草案 (Notionへ) | M1 |
| **Discovery Agent** | ヒアリング結果の構造化 / 要件抽出 / 不明点列挙 / スコープ定義 / ROI初期試算 | 商談メモ・録音書き起こし → Discoveryメモ+質問リスト | M1 |
| **Solution Architect Agent** | 技術構成提案 / API・RPA・AI・RAG使い分け判断 / セキュリティリスク分析 / 構成図元データ / 非機能要件 | Discoveryメモ → ソリューション概要ドラフト | M2 |
| **Proposal Agent** | 提案書 / 見積 / スコープ内外 / 前提条件 / マイルストーン / SOW生成 | ソリューション概要+ROI → 提案書・SOWドラフト | M2 |
| **Delivery Agent** | タスク分解 / 計画 / リスク登録 / 決定事項記録 / テストケース / ステータスレポート | SOW → GitHub Issues一式+週次レポート草案 | M2-3 |
| **QA Agent** | コード/セキュリティ/テストレビュー / エラー処理・ログ・ドキュメント確認 / リリース判定チェックリスト | PR/納品物 → レビュー結果+判定 | M2-3 |
| **Support Agent** | 問い合わせ分類 / FAQ検索 / 既知障害照合 / 初期回答草案 / エスカレーション判定 / 保守レポート | 問い合わせ → 分類+回答草案 (自社製support-agentを転用) | M4-6 |

エージェント間の受け渡しはファイル (Markdown) 経由のシンプル構成。
オーケストレーションが必要になったら `src/agent-os/` の基盤を転用する。

## 5. KPI (毎月1日に更新、Notionダッシュボード)

| 分類 | KPI | 目標参照 |
|---|---|---|
| 営業 | 新規リード数 / 商談数 / Assessment受注 / Sprint受注 | sales-playbook §1 |
| 財務 | 月商 / MRR / 入金残 | business-plan §5 |
| 納品 | 納期遵守率 (14日以内) / UAT一発合格率 | 100% / 80% |
| 継続 | 保守更新率 / 顧客ごとのROI実測 | 90%以上 |
| IP | 再利用テンプレート数 / 2社目以降への流用件数 | 毎四半期+2 |

## 6. 週次リズム (創業者のカレンダー)

```
月: 営業日 (アウトリーチ20件 / フォローアップ / パイプライン更新)
火-木: 納品日 (Sprint実装。会議を入れない)
金: 納品日AM / 社内日PM (KPI更新・テンプレート還流・コンテンツ1本)
毎日30分: サポート・保守対応枠 (Hypercare期間は別枠)
```
