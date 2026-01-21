/**
 * Zendesk API Client
 * Handles communication with Zendesk Knowledge Base API
 */

import {
  ZendeskArticle,
  ZendeskSection,
  ZendeskCategory,
  ArticleSearchQuery,
  ArticleSearchResult,
} from '@/types/zendesk';

export class ZendeskClient {
  private baseUrl: string;
  private email: string;
  private apiToken: string;
  private subdomain: string;

  constructor() {
    this.subdomain = process.env.ZENDESK_SUBDOMAIN || '';
    this.email = process.env.ZENDESK_EMAIL || '';
    this.apiToken = process.env.ZENDESK_API_TOKEN || '';
    this.baseUrl = `https://${this.subdomain}.zendesk.com/api/v2/help_center`;

    if (!this.subdomain || !this.email || !this.apiToken) {
      throw new Error('Zendesk credentials not configured. Please set ZENDESK_SUBDOMAIN, ZENDESK_EMAIL, and ZENDESK_API_TOKEN environment variables.');
    }
  }

  /**
   * Get authentication headers for Zendesk API
   */
  private getHeaders(): HeadersInit {
    const credentials = Buffer.from(`${this.email}/token:${this.apiToken}`).toString('base64');
    return {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  /**
   * Make authenticated request to Zendesk API
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Zendesk API error (${response.status}): ${errorText}`
      );
    }

    return response.json();
  }

  // ============= Categories =============

  /**
   * List all categories
   */
  async listCategories(locale: string = 'en-us'): Promise<ZendeskCategory[]> {
    const data = await this.request<{ categories: ZendeskCategory[] }>(
      `/${locale}/categories.json`
    );
    return data.categories;
  }

  /**
   * Get a specific category
   */
  async getCategory(categoryId: number, locale: string = 'en-us'): Promise<ZendeskCategory> {
    const data = await this.request<{ category: ZendeskCategory }>(
      `/${locale}/categories/${categoryId}.json`
    );
    return data.category;
  }

  // ============= Sections =============

  /**
   * List all sections in a category
   */
  async listSections(categoryId: number, locale: string = 'en-us'): Promise<ZendeskSection[]> {
    const data = await this.request<{ sections: ZendeskSection[] }>(
      `/${locale}/categories/${categoryId}/sections.json`
    );
    return data.sections;
  }

  /**
   * Get a specific section
   */
  async getSection(sectionId: number, locale: string = 'en-us'): Promise<ZendeskSection> {
    const data = await this.request<{ section: ZendeskSection }>(
      `/${locale}/sections/${sectionId}.json`
    );
    return data.section;
  }

  // ============= Articles =============

  /**
   * Create a new article
   */
  async createArticle(
    sectionId: number,
    article: Partial<ZendeskArticle>,
    locale: string = 'en-us'
  ): Promise<ZendeskArticle> {
    const data = await this.request<{ article: ZendeskArticle }>(
      `/${locale}/sections/${sectionId}/articles.json`,
      {
        method: 'POST',
        body: JSON.stringify({ article }),
      }
    );
    return data.article;
  }

  /**
   * Update an existing article
   */
  async updateArticle(
    articleId: number,
    updates: Partial<ZendeskArticle>,
    locale: string = 'en-us'
  ): Promise<ZendeskArticle> {
    const data = await this.request<{ article: ZendeskArticle }>(
      `/${locale}/articles/${articleId}.json`,
      {
        method: 'PUT',
        body: JSON.stringify({ article: updates }),
      }
    );
    return data.article;
  }

  /**
   * Delete an article
   */
  async deleteArticle(articleId: number): Promise<void> {
    await this.request<void>(`/articles/${articleId}.json`, {
      method: 'DELETE',
    });
  }

  /**
   * Get a specific article
   */
  async getArticle(articleId: number, locale: string = 'en-us'): Promise<ZendeskArticle> {
    const data = await this.request<{ article: ZendeskArticle }>(
      `/${locale}/articles/${articleId}.json`
    );
    return data.article;
  }

  /**
   * List articles in a section
   */
  async listArticlesInSection(
    sectionId: number,
    locale: string = 'en-us',
    page: number = 1,
    perPage: number = 30
  ): Promise<{ articles: ZendeskArticle[]; page: number; per_page: number }> {
    const data = await this.request<{
      articles: ZendeskArticle[];
      page: number;
      per_page: number;
      page_count: number;
      count: number;
    }>(`/${locale}/sections/${sectionId}/articles.json?page=${page}&per_page=${perPage}`);

    return {
      articles: data.articles,
      page: data.page,
      per_page: data.per_page,
    };
  }

  /**
   * Search articles
   */
  async searchArticles(query: ArticleSearchQuery): Promise<ArticleSearchResult> {
    const locale = query.locale || 'en-us';
    const page = query.page || 1;
    const perPage = query.per_page || 30;

    let endpoint = `/${locale}/articles/search.json?page=${page}&per_page=${perPage}`;

    if (query.query) {
      endpoint += `&query=${encodeURIComponent(query.query)}`;
    }

    if (query.section_id) {
      endpoint += `&section=${query.section_id}`;
    }

    if (query.category_id) {
      endpoint += `&category=${query.category_id}`;
    }

    if (query.labels && query.labels.length > 0) {
      endpoint += `&label_names=${query.labels.join(',')}`;
    }

    const data = await this.request<{
      results: ZendeskArticle[];
      count: number;
      page: number;
      per_page: number;
      page_count: number;
    }>(endpoint);

    return {
      articles: data.results,
      total_count: data.count,
      page: data.page,
      per_page: data.per_page,
      has_more: data.page < data.page_count,
    };
  }

  /**
   * Publish a draft article
   */
  async publishArticle(articleId: number, locale: string = 'en-us'): Promise<ZendeskArticle> {
    return this.updateArticle(articleId, { draft: false }, locale);
  }

  /**
   * Bulk create articles
   */
  async bulkCreateArticles(
    articles: Array<{ section_id: number; article: Partial<ZendeskArticle> }>,
    locale: string = 'en-us'
  ): Promise<Array<{ success: boolean; article?: ZendeskArticle; error?: string }>> {
    const results = await Promise.allSettled(
      articles.map(({ section_id, article }) =>
        this.createArticle(section_id, article, locale)
      )
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return { success: true, article: result.value };
      } else {
        return {
          success: false,
          error: result.reason?.message || 'Unknown error',
        };
      }
    });
  }

  /**
   * Test connection to Zendesk
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      await this.listCategories();
      return {
        success: true,
        message: 'Successfully connected to Zendesk',
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }
}

// Singleton instance
let zendeskClient: ZendeskClient | null = null;

export function getZendeskClient(): ZendeskClient {
  if (!zendeskClient) {
    zendeskClient = new ZendeskClient();
  }
  return zendeskClient;
}
