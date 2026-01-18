import React from 'react';
import type { KBArticle } from '../../types/article';
import { CATEGORIES } from '../../types/article';
import { Input, Select, MultiLangInput } from '../Common';

interface Step1BasicInfoProps {
  article: KBArticle;
  onUpdate: (article: KBArticle) => void;
}

/**
 * ステップ1: 基本情報
 * - 記事ID（自動生成 or 手動入力）
 * - 記事タイトル（3言語）
 * - カテゴリ選択
 * - システム名
 * - 関連チケット番号
 * - 最終更新日
 */
export const Step1BasicInfo: React.FC<Step1BasicInfoProps> = ({
  article,
  onUpdate,
}) => {
  const handleFieldChange = (field: keyof KBArticle, value: any) => {
    onUpdate({
      ...article,
      [field]: value,
    });
  };

  const generateNewId = () => {
    const randomId = `KB-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    handleFieldChange('id', randomId);
  };

  return (
    <div className="wizard-step">
      <h2 className="prada-header">Step 1: Basic Information</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <Input
            label="Article ID"
            value={article.id}
            onChange={(e) => handleFieldChange('id', e.target.value)}
            placeholder="KB-XXXXX-XXXXX"
            helpText="Format: KB-XXXXX-XXXXX"
            required
          />
          <button
            type="button"
            onClick={generateNewId}
            className="prada-button mt-2"
          >
            Generate New ID
          </button>
        </div>

        <Select
          label="Category"
          value={article.category}
          onChange={(e) => handleFieldChange('category', e.target.value)}
          options={CATEGORIES.map((cat) => ({ value: cat, label: cat }))}
          required
        />

        <Input
          label="System Name"
          value={article.system}
          onChange={(e) => handleFieldChange('system', e.target.value)}
          placeholder="MINTS-GBS"
          required
        />

        <Input
          label="Related Ticket Number"
          value={article.relatedTicket || ''}
          onChange={(e) => handleFieldChange('relatedTicket', e.target.value)}
          placeholder="Optional"
        />

        <Input
          label="Last Updated Date"
          type="date"
          value={article.lastUpdated}
          onChange={(e) => handleFieldChange('lastUpdated', e.target.value)}
          required
        />
      </div>

      <div className="prada-separator" />

      <MultiLangInput
        label="Article Title"
        value={article.title}
        onChange={(value) => handleFieldChange('title', value)}
        placeholder={{
          en: 'Enter English title',
          ja: '日本語のタイトルを入力',
          pt: 'Digite o título em português',
        }}
        required
      />
    </div>
  );
};
