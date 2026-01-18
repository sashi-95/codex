import React from 'react';
import type { KBArticle, ResourceLink } from '../../types/article';
import { createEmptyResourceLink } from '../../types/article';
import { Button, Input, MultiLangInput } from '../Common';

interface Step5ResourcesProps {
  article: KBArticle;
  onUpdate: (article: KBArticle) => void;
}

/**
 * ステップ5: 追加リソース
 * - リンク追加（ラベル3言語 + URL）
 * - メールアドレス追加
 * - 関連記事ID追加
 */
export const Step5Resources: React.FC<Step5ResourcesProps> = ({
  article,
  onUpdate,
}) => {
  // リンク管理
  const addLink = () => {
    onUpdate({
      ...article,
      resources: {
        ...article.resources,
        links: [...article.resources.links, createEmptyResourceLink()],
      },
    });
  };

  const updateLink = (index: number, updatedLink: ResourceLink) => {
    const newLinks = [...article.resources.links];
    newLinks[index] = updatedLink;
    onUpdate({
      ...article,
      resources: {
        ...article.resources,
        links: newLinks,
      },
    });
  };

  const deleteLink = (index: number) => {
    const newLinks = article.resources.links.filter((_, i) => i !== index);
    onUpdate({
      ...article,
      resources: {
        ...article.resources,
        links: newLinks,
      },
    });
  };

  // メールアドレス管理
  const addEmail = () => {
    onUpdate({
      ...article,
      resources: {
        ...article.resources,
        emails: [...article.resources.emails, ''],
      },
    });
  };

  const updateEmail = (index: number, email: string) => {
    const newEmails = [...article.resources.emails];
    newEmails[index] = email;
    onUpdate({
      ...article,
      resources: {
        ...article.resources,
        emails: newEmails,
      },
    });
  };

  const deleteEmail = (index: number) => {
    const newEmails = article.resources.emails.filter((_, i) => i !== index);
    onUpdate({
      ...article,
      resources: {
        ...article.resources,
        emails: newEmails,
      },
    });
  };

  // 関連記事管理
  const addRelatedArticle = () => {
    onUpdate({
      ...article,
      resources: {
        ...article.resources,
        relatedArticles: [...article.resources.relatedArticles, ''],
      },
    });
  };

  const updateRelatedArticle = (index: number, articleId: string) => {
    const newArticles = [...article.resources.relatedArticles];
    newArticles[index] = articleId;
    onUpdate({
      ...article,
      resources: {
        ...article.resources,
        relatedArticles: newArticles,
      },
    });
  };

  const deleteRelatedArticle = (index: number) => {
    const newArticles = article.resources.relatedArticles.filter((_, i) => i !== index);
    onUpdate({
      ...article,
      resources: {
        ...article.resources,
        relatedArticles: newArticles,
      },
    });
  };

  return (
    <div className="wizard-step">
      <h2 className="prada-header">Step 5: Additional Resources</h2>
      <p className="text-prada mb-6">
        Add links, email addresses, and related article IDs to provide additional resources.
      </p>

      {/* リンク */}
      <div className="mb-8">
        <h3 className="prada-subheader">Links</h3>
        {article.resources.links.map((link, index) => (
          <div key={index} className="prada-card mb-4">
            <div className="flex justify-between items-center mb-4">
              <span className="prada-label">Link {index + 1}</span>
              <button
                type="button"
                onClick={() => deleteLink(index)}
                className="text-red-600 text-xs hover:underline"
              >
                Delete
              </button>
            </div>
            <MultiLangInput
              label="Link Label"
              value={link.label}
              onChange={(value) => updateLink(index, { ...link, label: value })}
              placeholder={{
                en: 'Enter link label in English',
                ja: '日本語でリンクラベルを入力',
                pt: 'Digite o rótulo do link em português',
              }}
            />
            <Input
              label="URL"
              type="url"
              value={link.url}
              onChange={(e) => updateLink(index, { ...link, url: e.target.value })}
              placeholder="https://example.com"
            />
          </div>
        ))}
        {article.resources.links.length === 0 && (
          <div className="text-center py-8 border border-prada-border bg-prada-light mb-4">
            <p className="text-gray-500 text-sm">No links added yet</p>
          </div>
        )}
        <Button onClick={addLink}>
          + Add Link
        </Button>
      </div>

      {/* メールアドレス */}
      <div className="mb-8">
        <h3 className="prada-subheader">Email Addresses</h3>
        {article.resources.emails.map((email, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <Input
              label={`Email ${index + 1}`}
              type="email"
              value={email}
              onChange={(e) => updateEmail(index, e.target.value)}
              placeholder="email@example.com"
            />
            <button
              type="button"
              onClick={() => deleteEmail(index)}
              className="text-red-600 text-xs hover:underline self-end mb-3"
            >
              Delete
            </button>
          </div>
        ))}
        {article.resources.emails.length === 0 && (
          <div className="text-center py-8 border border-prada-border bg-prada-light mb-4">
            <p className="text-gray-500 text-sm">No email addresses added yet</p>
          </div>
        )}
        <Button onClick={addEmail}>
          + Add Email
        </Button>
      </div>

      {/* 関連記事 */}
      <div className="mb-8">
        <h3 className="prada-subheader">Related Articles</h3>
        {article.resources.relatedArticles.map((articleId, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <Input
              label={`Article ${index + 1}`}
              value={articleId}
              onChange={(e) => updateRelatedArticle(index, e.target.value)}
              placeholder="KB-XXXXX-XXXXX"
            />
            <button
              type="button"
              onClick={() => deleteRelatedArticle(index)}
              className="text-red-600 text-xs hover:underline self-end mb-3"
            >
              Delete
            </button>
          </div>
        ))}
        {article.resources.relatedArticles.length === 0 && (
          <div className="text-center py-8 border border-prada-border bg-prada-light mb-4">
            <p className="text-gray-500 text-sm">No related articles added yet</p>
          </div>
        )}
        <Button onClick={addRelatedArticle}>
          + Add Related Article
        </Button>
      </div>
    </div>
  );
};
