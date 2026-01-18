import type { KBArticle } from '../types/article';

/**
 * Schema.org構造化データ（TechArticle）を生成
 */
export const generateSchemaOrg = (article: KBArticle): string => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: article.title.en || article.title.ja || article.title.pt,
    articleBody: [
      article.summary.conclusion.en,
      ...article.processes.map((p) => p.content.en),
    ].join(' '),
    dateModified: article.lastUpdated,
    inLanguage: ['en', 'ja', 'pt'],
    about: {
      '@type': 'Thing',
      name: article.category,
    },
    mainEntity: {
      '@type': 'FAQPage',
      mainEntity: article.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question.en || faq.question.ja || faq.question.pt,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer.en || faq.answer.ja || faq.answer.pt,
        },
      })),
    },
  };

  return JSON.stringify(schema, null, 2);
};

/**
 * AI Agent向けエンティティ定義コメントを生成
 */
export const generateEntityComments = (article: KBArticle): string => {
  const entities = article.aiOptimization.entities
    .map((entity) => `${entity.name}: ${entity.description.en}`)
    .join(', ');

  const mentions = article.aiOptimization.mentions
    .map((mention) => {
      if (mention.url) {
        return `${mention.name} (${mention.url})`;
      }
      return mention.name;
    })
    .join(', ');

  const keywords = article.aiOptimization.keywords.join(', ');

  return `
<!--
AI AGENT METADATA
=================
Article ID: ${article.id}
Category: ${article.category}
System: ${article.system}
Keywords: ${keywords}
Entities: ${entities}
Mentions: ${mentions}
-->
  `.trim();
};
