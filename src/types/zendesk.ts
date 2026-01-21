/**
 * Zendesk Knowledge Base Types
 * Type definitions for Zendesk API integration
 */

export interface ZendeskArticle {
  id?: number;
  title: string;
  body: string;
  locale: string;
  author_id?: number;
  permission_group_id?: number;
  section_id: number;
  draft?: boolean;
  promoted?: boolean;
  position?: number;
  label_names?: string[];
  created_at?: string;
  updated_at?: string;
  html_url?: string;
  user_segment_id?: number | null;
}

export interface ZendeskSection {
  id: number;
  name: string;
  description?: string;
  locale: string;
  category_id: number;
  position?: number;
  created_at?: string;
  updated_at?: string;
  html_url?: string;
}

export interface ZendeskCategory {
  id: number;
  name: string;
  description?: string;
  locale: string;
  position?: number;
  created_at?: string;
  updated_at?: string;
  html_url?: string;
}

export interface ArticleCreateRequest {
  title: string;
  content: string;
  section_id: number;
  locale?: string;
  draft?: boolean;
  label_names?: string[];
  use_ai_enhancement?: boolean;
}

export interface ArticleUpdateRequest {
  id: number;
  title?: string;
  content?: string;
  section_id?: number;
  draft?: boolean;
  label_names?: string[];
  use_ai_enhancement?: boolean;
}

export interface AIEnhancementRequest {
  content: string;
  enhancement_type: 'improve' | 'expand' | 'summarize' | 'format';
  target_audience?: 'technical' | 'general' | 'beginner';
  tone?: 'professional' | 'friendly' | 'formal';
}

export interface AIEnhancementResponse {
  original_content: string;
  enhanced_content: string;
  suggestions?: string[];
  word_count_change?: number;
}

export interface ZendeskAPIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

export interface BulkArticleImport {
  articles: ArticleCreateRequest[];
  default_section_id?: number;
  publish_immediately?: boolean;
}

export interface ArticleSearchQuery {
  query?: string;
  section_id?: number;
  category_id?: number;
  labels?: string[];
  locale?: string;
  draft?: boolean;
  sort_by?: 'created_at' | 'updated_at' | 'position' | 'title';
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

export interface ArticleSearchResult {
  articles: ZendeskArticle[];
  total_count: number;
  page: number;
  per_page: number;
  has_more: boolean;
}
