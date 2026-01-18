// 多言語テキストインターフェース
export interface MultiLangText {
  en: string;
  ja: string;
  pt: string;
}

// 言語タイプ
export type Language = 'en' | 'ja' | 'pt' | 'all';

// プロセス/手順インターフェース
export interface Process {
  id: string;
  order: number;
  title: MultiLangText;
  content: MultiLangText;
}

// FAQインターフェース
export interface FAQ {
  id: string;
  order: number;
  question: MultiLangText;
  answer: MultiLangText;
}

// リソースリンクインターフェース
export interface ResourceLink {
  label: MultiLangText;
  url: string;
}

// リソースインターフェース
export interface Resources {
  links: ResourceLink[];
  emails: string[];
  relatedArticles: string[];
}

// AI最適化エンティティインターフェース
export interface Entity {
  name: string;
  description: MultiLangText;
}

// AI最適化メンションインターフェース
export interface Mention {
  name: string;
  url?: string;
  description?: MultiLangText;
}

// AI最適化インターフェース
export interface AIOptimization {
  keywords: string[];
  entities: Entity[];
  mentions: Mention[];
}

// サマリーインターフェース
export interface Summary {
  conclusion: MultiLangText;
  recommendation: MultiLangText;
  timeline: MultiLangText;
  riskLevel: MultiLangText;
}

// メインKB記事インターフェース
export interface KBArticle {
  id: string;
  category: string;
  system: string;
  relatedTicket?: string;
  lastUpdated: string;
  title: MultiLangText;
  summary: Summary;
  processes: Process[];
  faqs: FAQ[];
  resources: Resources;
  aiOptimization: AIOptimization;
}

// 初期値用のヘルパー関数
export const createEmptyMultiLangText = (): MultiLangText => ({
  en: '',
  ja: '',
  pt: '',
});

export const createEmptyProcess = (order: number): Process => ({
  id: crypto.randomUUID(),
  order,
  title: createEmptyMultiLangText(),
  content: createEmptyMultiLangText(),
});

export const createEmptyFAQ = (order: number): FAQ => ({
  id: crypto.randomUUID(),
  order,
  question: createEmptyMultiLangText(),
  answer: createEmptyMultiLangText(),
});

export const createEmptyResourceLink = (): ResourceLink => ({
  label: createEmptyMultiLangText(),
  url: '',
});

export const createEmptyEntity = (): Entity => ({
  name: '',
  description: createEmptyMultiLangText(),
});

export const createEmptyMention = (): Mention => ({
  name: '',
  url: '',
  description: createEmptyMultiLangText(),
});

export const createEmptyKBArticle = (): KBArticle => {
  const today = new Date().toISOString().split('T')[0];
  const randomId = `KB-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  return {
    id: randomId,
    category: '',
    system: 'MINTS-GBS',
    relatedTicket: '',
    lastUpdated: today,
    title: createEmptyMultiLangText(),
    summary: {
      conclusion: createEmptyMultiLangText(),
      recommendation: createEmptyMultiLangText(),
      timeline: createEmptyMultiLangText(),
      riskLevel: createEmptyMultiLangText(),
    },
    processes: [],
    faqs: [],
    resources: {
      links: [],
      emails: [],
      relatedArticles: [],
    },
    aiOptimization: {
      keywords: [],
      entities: [],
      mentions: [],
    },
  };
};

// カテゴリーオプション
export const CATEGORIES = [
  'Technical Support',
  'User Guide',
  'FAQ',
  'Troubleshooting',
  'API Documentation',
  'Best Practices',
  'Release Notes',
  'Security',
  'Integration',
  'Configuration',
] as const;

export type Category = typeof CATEGORIES[number];

// 言語ラベル
export const LANGUAGE_LABELS: Record<Language, string> = {
  all: 'All Languages',
  en: 'English',
  ja: '日本語',
  pt: 'Português',
};

// サマリーフィールドラベル
export const SUMMARY_FIELD_LABELS: Record<keyof Summary, MultiLangText> = {
  conclusion: {
    en: 'Conclusion',
    ja: '結論',
    pt: 'Conclusão',
  },
  recommendation: {
    en: 'Recommendation',
    ja: '推奨事項',
    pt: 'Recomendação',
  },
  timeline: {
    en: 'Timeline',
    ja: 'タイムライン',
    pt: 'Cronograma',
  },
  riskLevel: {
    en: 'Risk Level',
    ja: 'リスクレベル',
    pt: 'Nível de Risco',
  },
};
