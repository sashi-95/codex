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

## ダッシュボードポータル

このリポジトリには Next-Gen Dashboard & Reporting Portal (Finance / Sales / HR / Inventory 等) も含まれます。詳細は `DESIGN_SPECIFICATION.md` を参照。
