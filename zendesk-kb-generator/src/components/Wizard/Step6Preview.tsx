import React, { useState } from 'react';
import type { KBArticle } from '../../types/article';
import { Button } from '../Common';
import { ArticlePreview } from '../Preview';
import { generateZendeskHTML, generateFileName } from '../../utils/htmlGenerator';

interface Step6PreviewProps {
  article: KBArticle;
}

/**
 * ステップ6: プレビュー & エクスポート
 * - リアルタイムプレビュー
 * - HTMLエクスポート
 * - コピー&ペースト機能
 * - ファイルダウンロード機能
 */
export const Step6Preview: React.FC<Step6PreviewProps> = ({ article }) => {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [viewMode, setViewMode] = useState<'preview' | 'html'>('preview');

  const html = generateZendeskHTML(article);
  const fileName = generateFileName(article);

  /**
   * クリップボードにコピー
   */
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(html);
      setCopyStatus('success');
      setTimeout(() => setCopyStatus('idle'), 3000);
    } catch (error) {
      console.error('Failed to copy:', error);
      setCopyStatus('error');
      setTimeout(() => setCopyStatus('idle'), 3000);
    }
  };

  /**
   * ファイルとしてダウンロード
   */
  const handleDownload = () => {
    try {
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download:', error);
      alert('Failed to download file');
    }
  };

  return (
    <div className="wizard-step">
      <h2 className="prada-header">Step 6: Preview & Export</h2>
      <p className="text-prada mb-6">
        Preview your article and export it for Zendesk Knowledge Base.
      </p>

      {/* ビューモード切り替え */}
      <div className="flex gap-4 mb-6">
        <Button
          variant={viewMode === 'preview' ? 'primary' : 'default'}
          onClick={() => setViewMode('preview')}
        >
          Preview
        </Button>
        <Button
          variant={viewMode === 'html' ? 'primary' : 'default'}
          onClick={() => setViewMode('html')}
        >
          View HTML
        </Button>
      </div>

      {/* エクスポートアクション */}
      <div className="flex gap-4 mb-6">
        <Button onClick={handleCopy}>
          {copyStatus === 'success' ? '✓ Copied!' : copyStatus === 'error' ? '✗ Failed' : 'Copy to Clipboard'}
        </Button>
        <Button onClick={handleDownload}>
          Download HTML File
        </Button>
      </div>

      {copyStatus === 'success' && (
        <div className="bg-green-100 border border-green-600 text-green-600 px-4 py-3 mb-6 text-sm">
          HTML successfully copied to clipboard! You can now paste it into Zendesk.
        </div>
      )}

      {copyStatus === 'error' && (
        <div className="bg-red-100 border border-red-600 text-red-600 px-4 py-3 mb-6 text-sm">
          Failed to copy to clipboard. Please try the download option instead.
        </div>
      )}

      {/* プレビュー / HTMLコード表示 */}
      {viewMode === 'preview' ? (
        <ArticlePreview article={article} />
      ) : (
        <div className="preview-container">
          <pre className="text-xs overflow-auto p-4 bg-gray-100 border border-prada-border">
            <code>{html}</code>
          </pre>
        </div>
      )}

      <div className="prada-separator" />

      <div className="bg-prada-light border border-prada-border p-4 text-sm">
        <h3 className="prada-label mb-2">How to use this HTML in Zendesk</h3>
        <ol className="list-decimal list-inside space-y-2">
          <li>Click "Copy to Clipboard" button above</li>
          <li>Go to your Zendesk Knowledge Base</li>
          <li>Create a new article or edit an existing one</li>
          <li>Switch to "Source code" mode (HTML editor)</li>
          <li>Paste the copied HTML</li>
          <li>Save and publish your article</li>
        </ol>
        <p className="mt-4 text-xs text-gray-600">
          Note: The language toggle and accordion features will work automatically once published.
        </p>
      </div>
    </div>
  );
};
