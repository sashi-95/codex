import React from 'react';
import type { KBArticle, Summary } from '../../types/article';
import { SUMMARY_FIELD_LABELS } from '../../types/article';
import { MultiLangInput } from '../Common';

interface Step2SummaryProps {
  article: KBArticle;
  onUpdate: (article: KBArticle) => void;
}

/**
 * ステップ2: サマリー情報（4カラムグリッド）
 * - 結論（Conclusion）
 * - 推奨事項（Recommendation）
 * - タイムライン（Timeline）
 * - リスクレベル（Risk Level）
 */
export const Step2Summary: React.FC<Step2SummaryProps> = ({
  article,
  onUpdate,
}) => {
  const handleSummaryChange = (field: keyof Summary, value: any) => {
    onUpdate({
      ...article,
      summary: {
        ...article.summary,
        [field]: value,
      },
    });
  };

  return (
    <div className="wizard-step">
      <h2 className="prada-header">Step 2: Summary Information</h2>
      <p className="text-prada mb-6">
        Provide key summary information in all three languages. This will be displayed in a 4-column grid format.
      </p>

      <div className="space-y-8">
        <MultiLangInput
          label={`${SUMMARY_FIELD_LABELS.conclusion.en} / ${SUMMARY_FIELD_LABELS.conclusion.ja} / ${SUMMARY_FIELD_LABELS.conclusion.pt}`}
          value={article.summary.conclusion}
          onChange={(value) => handleSummaryChange('conclusion', value)}
          type="textarea"
          placeholder={{
            en: 'Enter conclusion in English',
            ja: '日本語で結論を入力',
            pt: 'Digite a conclusão em português',
          }}
          required
        />

        <MultiLangInput
          label={`${SUMMARY_FIELD_LABELS.recommendation.en} / ${SUMMARY_FIELD_LABELS.recommendation.ja} / ${SUMMARY_FIELD_LABELS.recommendation.pt}`}
          value={article.summary.recommendation}
          onChange={(value) => handleSummaryChange('recommendation', value)}
          type="textarea"
          placeholder={{
            en: 'Enter recommendation in English',
            ja: '日本語で推奨事項を入力',
            pt: 'Digite a recomendação em português',
          }}
          required
        />

        <MultiLangInput
          label={`${SUMMARY_FIELD_LABELS.timeline.en} / ${SUMMARY_FIELD_LABELS.timeline.ja} / ${SUMMARY_FIELD_LABELS.timeline.pt}`}
          value={article.summary.timeline}
          onChange={(value) => handleSummaryChange('timeline', value)}
          type="textarea"
          placeholder={{
            en: 'Enter timeline in English',
            ja: '日本語でタイムラインを入力',
            pt: 'Digite o cronograma em português',
          }}
          required
        />

        <MultiLangInput
          label={`${SUMMARY_FIELD_LABELS.riskLevel.en} / ${SUMMARY_FIELD_LABELS.riskLevel.ja} / ${SUMMARY_FIELD_LABELS.riskLevel.pt}`}
          value={article.summary.riskLevel}
          onChange={(value) => handleSummaryChange('riskLevel', value)}
          type="textarea"
          placeholder={{
            en: 'Enter risk level in English (e.g., Low, Medium, High)',
            ja: '日本語でリスクレベルを入力（例：低、中、高）',
            pt: 'Digite o nível de risco em português (ex: Baixo, Médio, Alto)',
          }}
          required
        />
      </div>
    </div>
  );
};
