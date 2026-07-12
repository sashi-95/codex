# AI Agent OS

OSのメタファーでマルチエージェントAIシステムを設計・可視化する実験的プラットフォーム。
Next.js製ダッシュボードポータルに統合されており、`/agent-os` でミッションコントロールUIが動作します。

## コンセプト

| OSの概念 | AI Agent OSでの対応物 |
|---|---|
| プロセス (PCB) | エージェントインスタンス (状態: ready / running / waiting / terminated / failed) |
| CPUコア | 同時LLM推論スロット (デフォルト3コア) |
| スケジューラ | 優先度付きラウンドロビン (tick駆動) |
| fork / wait | `delegate` ツールによる子エージェントの並列起動と完了待機 |
| システムコール | ツールレジストリ (calculator / web_search / memory_search など) |
| IPC | メッセージバス (pub/sub) |
| 仮想メモリ | コンテキストマネージャ (トークン予算内でのRAG取得 + 履歴トランケーション) |
| ファイルシステム | ベクトル検索ベースの長期記憶 (TFコサイン類似度によるRAG) |
| セキュリティモジュール | ガードレールエンジン (ツールアロウリスト / トークン予算 / PIIリダクション / インジェクション検知) |
| syslog | カーネルイベントログ |

## アーキテクチャ

```
┌─────────────────────────────────────────────────────┐
│  Mission Control UI (/agent-os)                     │
│  プロセステーブル / イベントログ / IPC / 記憶 / 違反 │
└───────────────┬─────────────────────────────────────┘
                │ REST (1秒ポーリング)
┌───────────────▼─────────────────────────────────────┐
│  API Routes (/api/agent-os/{state,tasks,kill,reset})│
└───────────────┬─────────────────────────────────────┘
┌───────────────▼─────────────────────────────────────┐
│  Kernel (src/agent-os/kernel.ts)                    │
│  ┌──────────┐ ┌──────────┐ ┌───────────────┐        │
│  │Scheduler │ │Process   │ │Message Bus    │        │
│  │(tick駆動)│ │Table     │ │(IPC)          │        │
│  └──────────┘ └──────────┘ └───────────────┘        │
│  ┌──────────┐ ┌──────────┐ ┌───────────────┐        │
│  │Guardrails│ │Context   │ │Memory (RAG)   │        │
│  │Engine    │ │Manager   │ │Vector Store   │        │
│  └──────────┘ └──────────┘ └───────────────┘        │
│  ┌───────────────────────┐ ┌────────────────┐       │
│  │Tool Registry (syscall)│ │LLM Provider    │       │
│  └───────────────────────┘ │Mock / Anthropic│       │
│                            └────────────────┘       │
└─────────────────────────────────────────────────────┘
```

### 実行フロー

1. ユーザーがゴールを投入 → カーネルが **Orchestrator** プロセスを起動
2. Orchestrator が `delegate` で **Researcher** / **Analyst** を並列起動し、自身は `waiting` 状態へ
3. 子プロセスはRAG検索・Web検索・計算ツールを使ってサブゴールを遂行し、結果をIPCで報告して終了
4. スケジューラが親を `ready` に復帰させ、Orchestrator が **Writer** に統合レポートを委譲
5. 最終出力はPIIリダクションを通過してタスク結果として確定

すべてのステップでガードレール (ツールアロウリスト / トークン予算 / ステップ上限 / インジェクション検知) が適用され、違反はUIに記録されます。

## エージェント

| ID | 役割 | 許可ツール |
|---|---|---|
| orchestrator | タスク分解と委譲、結果統合 | delegate, memory_search, memory_save |
| researcher | ナレッジベース・Web調査 | memory_search, memory_save, web_search, get_time |
| analyst | 定量分析・計算 | calculator, memory_search, memory_save |
| writer | レポート執筆 | memory_search |
| critic | 品質レビュー | memory_search |

## セットアップ

```bash
npm install
npm run dev
# http://localhost:3000/agent-os を開く
```

APIキーなしでも動作します (決定論的モックLLMがエージェント動作をシミュレート)。
実際のClaudeで動かす場合:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
export ANTHROPIC_MODEL=claude-sonnet-5  # 省略可
npm run dev
```

## ディレクトリ構成

```
src/agent-os/
├── types.ts            # コア型定義 (PCB / タスク / IPC / ガードレール)
├── kernel.ts           # カーネル本体 (スケジューラ / プロセス管理 / tick)
├── agents.ts           # エージェント定義 (システムプロンプト / ケーパビリティ)
├── tools.ts            # ツールレジストリ (システムコール)
├── memory.ts           # ベクトル検索メモリ (RAG)
├── context-manager.ts  # コンテキストウィンドウ管理
├── guardrails.ts       # ガードレールエンジン
└── llm.ts              # LLMプロバイダ (Mock / Anthropic)

src/app/agent-os/page.tsx       # ミッションコントロールUI
src/app/api/agent-os/*/route.ts # カーネルAPI
```

## Support Ops — Zendesk自律型エージェント (プロトタイプ)

`docs/ZENDESK_AI_AGENT_DESIGN.md` の設計に基づくオーケストレーション層の実装。
`/support-ops` でデモUIが動作します。

- **Webhook受理** (`/api/support/webhook`): 冪等キーで重複配送を検出
- **L1 FAQ**: KBベクトル検索 → 出典付き自動回答。低確信度は推測せずエスカレーション
- **転記業務**: 住所変更 (L1) はCRMへ自動write + 読み戻し検証。返金 (L2) は金額をERPレコードから取得し、¥10,000超はHITL承認で一時停止
- **ガードレール**: 本人確認 (メール一致) をコードで強制、インテント別ツールアロウリスト、インジェクション検知、PIIリダクション
- **監査ログ**: 全ツール呼び出しの入出力を記録

```
src/support-agent/
├── types.ts         # チケット / Run / 承認 / 監査の型定義
├── engine.ts        # オーケストレーションエンジン (実行フロー / HITL / 検証)
├── policies.ts      # リスク階層・アロウリスト・金額上限 (コードで強制する層)
├── mock-systems.ts  # Mock Zendesk / CRM / ERP (本番では実APIに差し替え)
└── kb.ts            # ナレッジベース (Zendesk Guide相当)
```

## バックオフィスAI (SAP × M365 × Python)

実スタック (SAP BTP Joule / オンプレSAP / SharePoint / Power Apps / Power Automate)
向けの全体設計は `docs/BACKOFFICE_AI_ARCHITECTURE.md`、
Python製ランタイムのリファレンス実装は `python/` を参照
(`cd python && python3 demo.py` で請求書処理フローのデモが動く)。

## ダッシュボードポータル

このリポジトリには Next-Gen Dashboard & Reporting Portal (Finance / Sales / HR / Inventory 等) も含まれます。詳細は `DESIGN_SPECIFICATION.md` を参照。
