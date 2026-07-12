# backoffice_agent — バックオフィスAIランタイム (リファレンス実装)

`docs/BACKOFFICE_AI_ARCHITECTURE.md` の中核となるPython製オーケストレーション
ランタイムのプロトタイプ。標準ライブラリのみで動作する (Python 3.10+)。

```bash
cd python
python3 demo.py          # 請求書処理 (転記業務)
python3 demo_reports.py  # レポート抽出支援 + ルーティン自動化
```

## demo_reports.py (レポート抽出支援 + ルーティン)

- 自然言語依頼 → **レポートカタログ**マッピング (LLMは任意クエリを組み立てられない)
  → ロール別アクセス制御 → SAP抽出 → SharePoint保存 → Teamsリンク返信
- 権限外ロールの依頼はブロック、カタログ外の依頼は候補提示で聞き返し
- スケジューラ: 月次レポート (前月分) / 週次POリマインド / 日次のSAP×台帳突合。
  (job_id, 期間キー) の冪等性で二重起動でも重複実行しない。突合不一致は例外キューへ

## demo.py (請求書処理: SharePoint → SAP転記)

| シナリオ | 結果 |
|---|---|
| ¥55,000 / PO一致 | 承認レスで自動転記 + 読み戻し検証 |
| ¥275,000 / PO一致 | 上限超過 → 承認カード → 承認後に転記 |
| PO残額超過 | PO突合NGで有人対応へ |
| 明細合計の不一致 | LLM抽出値の再計算検証NGで有人対応へ |
| 重複配送 / 重複請求 | 冪等キー / 業務キーで遮断 |

## 本番への差し替えポイント

| モック | 本番実装 |
|---|---|
| `adapters/sap_mock.py` | PyRFC (BAPI_ACC_DOCUMENT_POST等)。過渡期はVBS/GUIスクリプトのラッパ + RFC読み戻し検証 |
| `adapters/sharepoint_mock.py` | Microsoft Graph (Sites.Selected 最小権限) |
| `adapters/approval_mock.py` | Power Automate 承認フロー (Teams承認カード + コールバック) |
| `llm_mock.py` | Claude API (vision + structured output) |
| `demo.py` の直接呼び出し | FastAPI等のWebhookエンドポイント + タスクキュー |

エンジン (`engine.py`) とポリシー (`policies.py`) は差し替え不要 —
「LLMは判断、実行はツール」「決定的検証」「読み戻し検証」「冪等性」の
制御構造はそのまま本番コードになる。
