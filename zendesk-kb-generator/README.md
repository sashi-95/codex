# Zendesk Knowledge Base Article Generator

プロフェッショナルな多言語対応のZendesk Knowledge Base記事を自動生成するWebアプリケーション

## 概要

このアプリケーションは、PRADAスタイルのミニマルデザインを採用した、英語・日本語・ポルトガル語の3言語対応のKnowledge Base記事生成ツールです。Schema.org構造化データを含むZendesk埋め込み可能なHTMLを出力します。

## 主な機能

### ✨ 6ステップウィザード

1. **基本情報** - 記事ID、タイトル、カテゴリ、システム名の設定
2. **サマリー** - 4カラムグリッドで結論、推奨事項、タイムライン、リスクレベルを入力
3. **プロセス/手順** - ドラッグ&ドロップで並び替え可能なアコーディオン形式の手順
4. **FAQ** - ドラッグ&ドロップで並び替え可能なQ&A
5. **追加リソース** - リンク、メールアドレス、関連記事IDの追加
6. **プレビュー & エクスポート** - リアルタイムプレビューとHTML出力

### 🌍 多言語対応

- 英語 (English)
- 日本語 (Japanese)
- ポルトガル語 (Português)
- 言語切り替えボタン付き（All/EN/JA/PT）
- localStorage による言語設定の永続化

### 🎨 PRADAスタイルデザイン

- モノクロカラーパレット（#000000, #FFFFFF, #F9F9F9, #EEEEEE）
- Helvetica Neue フォント
- 大文字とレタースペーシングによる洗練されたタイポグラフィ
- レスポンシブデザイン（デスクトップ/タブレット/モバイル対応）

### 🤖 AI最適化

- Schema.org TechArticle 構造化データ
- AI Agent向けエンティティ定義コメント
- キーワード、エンティティ、メンション管理

### 💾 自動保存

- localStorage による下書き自動保存（1秒デバウンス）
- セッション間で作業を継続可能
- リセット機能

### 📤 エクスポート機能

- クリップボードへのコピー
- HTMLファイルのダウンロード
- Zendeskに直接埋め込み可能な形式

## 技術スタック

- **React 18** - UIフレームワーク
- **TypeScript** - 型安全性
- **Vite** - 高速ビルドツール
- **Tailwind CSS** - ユーティリティファーストCSS
- **react-dnd** - ドラッグ&ドロップ機能
- **UUID** - ユニークID生成

## セットアップ

### 前提条件

- Node.js 18以上
- npm または yarn

### インストール

```bash
# リポジトリをクローン
git clone <repository-url>
cd zendesk-kb-generator

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

開発サーバーは http://localhost:5173 で起動します。

### ビルド

```bash
# プロダクションビルド
npm run build

# ビルドしたファイルをプレビュー
npm run preview
```

## 使用方法

### 1. 記事の作成

1. アプリケーションを開く
2. 6つのステップを順番に進む
3. 各ステップで必要な情報を3言語で入力
4. ドラッグ&ドロップでプロセスやFAQを並び替え
5. 下書きは自動的に保存される

### 2. プレビュー

- ステップ6で記事のプレビューを確認
- 言語切り替えボタンで各言語の表示を確認
- アコーディオンの動作を確認

### 3. エクスポート

**方法1: クリップボードにコピー**
```
1. "Copy to Clipboard" ボタンをクリック
2. Zendeskの記事編集画面を開く
3. "Source code" モードに切り替え
4. コピーしたHTMLをペースト
5. 保存して公開
```

**方法2: ファイルをダウンロード**
```
1. "Download HTML File" ボタンをクリック
2. KB_<記事ID>_<日付>.html がダウンロードされる
3. ファイルを開いてコンテンツを確認
4. Zendeskにアップロード
```

## プロジェクト構造

```
src/
├── components/
│   ├── Common/              # 共通コンポーネント
│   │   ├── Accordion.tsx    # アコーディオン
│   │   ├── Button.tsx       # ボタン
│   │   ├── Input.tsx        # 入力フィールド
│   │   └── MultiLangInput.tsx # 多言語入力
│   ├── Preview/             # プレビューコンポーネント
│   │   ├── ArticlePreview.tsx
│   │   └── LanguageToggle.tsx
│   └── Wizard/              # ウィザードステップ
│       ├── Wizard.tsx       # メインウィザード
│       ├── Step1BasicInfo.tsx
│       ├── Step2Summary.tsx
│       ├── Step3Processes.tsx
│       ├── Step4FAQs.tsx
│       ├── Step5Resources.tsx
│       └── Step6Preview.tsx
├── utils/
│   ├── htmlGenerator.ts     # HTML生成ユーティリティ
│   ├── schemaGenerator.ts   # Schema.org生成
│   └── localStorage.ts      # ストレージ管理
├── types/
│   └── article.ts           # TypeScript型定義
├── App.tsx                  # メインアプリ
├── main.tsx                 # エントリーポイント
└── index.css                # グローバルスタイル
```

## カスタマイズ

### カテゴリの追加

`src/types/article.ts` で `CATEGORIES` 配列を編集:

```typescript
export const CATEGORIES = [
  'Technical Support',
  'User Guide',
  'FAQ',
  // 新しいカテゴリを追加
  'Your Custom Category',
] as const;
```

### スタイルのカスタマイズ

`tailwind.config.js` で PRADAスタイルの色やフォントを変更:

```javascript
colors: {
  'prada-black': '#000000',
  'prada-white': '#FFFFFF',
  // カスタムカラーを追加
},
```

## 出力HTMLの特徴

生成されるHTMLには以下が含まれます:

- ✅ Schema.org TechArticle 構造化データ（JSON-LD）
- ✅ AI Agent向けメタデータコメント
- ✅ インラインCSS（Zendeskストリッピング対策）
- ✅ 言語切り替えJavaScript
- ✅ アコーディオントグルJavaScript
- ✅ localStorage による言語設定永続化
- ✅ レスポンシブデザイン
- ✅ アクセシビリティ対応

## トラブルシューティング

### 下書きが読み込まれない

```javascript
// ブラウザの開発者ツールで確認
localStorage.getItem('kb-article-draft');

// 手動でクリア
localStorage.removeItem('kb-article-draft');
```

### ドラッグ&ドロップが動かない

- ブラウザを最新版に更新
- react-dndが正しくインストールされているか確認
- HTML5Backendが使用されているか確認

### HTMLのコピーに失敗する

- HTTPSで接続されているか確認（localhostは除く）
- ブラウザのクリップボード権限を確認
- ダウンロード機能を代わりに使用

## ライセンス

MIT License

## 貢献

プルリクエストを歓迎します。大きな変更の場合は、まずissueを開いて変更内容を議論してください。

## サポート

問題が発生した場合は、GitHubのIssueを作成してください。

---

**作成者**: Zendesk KB Generator Team
**バージョン**: 1.0.0
**最終更新**: 2026-01-18
