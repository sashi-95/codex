import React, { useState } from 'react';
import type { KBArticle, Language } from '../../types/article';
import { LanguageToggle } from './LanguageToggle';
import { generateZendeskHTML } from '../../utils/htmlGenerator';

interface ArticlePreviewProps {
  article: KBArticle;
}

/**
 * 記事プレビューコンポーネント
 * リアルタイムでHTMLをレンダリング
 */
export const ArticlePreview: React.FC<ArticlePreviewProps> = ({ article }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('all');

  const html = generateZendeskHTML(article);

  return (
    <div className="preview-container">
      <div className="mb-4">
        <LanguageToggle
          currentLanguage={currentLanguage}
          onLanguageChange={setCurrentLanguage}
        />
      </div>
      <div
        dangerouslySetInnerHTML={{ __html: html }}
        className="bg-white"
      />
    </div>
  );
};
