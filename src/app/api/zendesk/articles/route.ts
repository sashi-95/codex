/**
 * API Route: /api/zendesk/articles
 * Handles article listing and creation
 */

import { NextRequest, NextResponse } from 'next/server';
import { getZendeskClient } from '@/lib/zendesk-client';
import { getAIEnhancer } from '@/lib/ai-content-enhancer';
import { ArticleCreateRequest, ZendeskAPIResponse } from '@/types/zendesk';

/**
 * GET /api/zendesk/articles
 * List or search articles
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sectionId = searchParams.get('section_id');
    const query = searchParams.get('query');
    const locale = searchParams.get('locale') || 'en-us';
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '30');

    const client = getZendeskClient();

    // If section_id is provided, list articles in that section
    if (sectionId) {
      const result = await client.listArticlesInSection(
        parseInt(sectionId),
        locale,
        page,
        perPage
      );

      return NextResponse.json({
        success: true,
        data: result,
      } as ZendeskAPIResponse<typeof result>);
    }

    // If query is provided, search articles
    if (query) {
      const result = await client.searchArticles({
        query,
        locale,
        page,
        per_page: perPage,
      });

      return NextResponse.json({
        success: true,
        data: result,
      } as ZendeskAPIResponse<typeof result>);
    }

    // Otherwise, return error
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Either section_id or query parameter is required',
        },
      } as ZendeskAPIResponse<never>,
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to fetch articles',
        },
      } as ZendeskAPIResponse<never>,
      { status: 500 }
    );
  }
}

/**
 * POST /api/zendesk/articles
 * Create a new article
 */
export async function POST(request: NextRequest) {
  try {
    const body: ArticleCreateRequest = await request.json();

    const {
      title,
      content,
      section_id,
      locale = 'en-us',
      draft = true,
      label_names = [],
      use_ai_enhancement = false,
    } = body;

    // Validate required fields
    if (!title || !content || !section_id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Missing required fields: title, content, and section_id are required',
          },
        } as ZendeskAPIResponse<never>,
        { status: 400 }
      );
    }

    const client = getZendeskClient();

    // Enhance content with AI if requested
    let finalContent = content;
    if (use_ai_enhancement) {
      try {
        const enhancer = getAIEnhancer();
        const enhanced = await enhancer.enhanceContent({
          content,
          enhancement_type: 'improve',
          target_audience: 'general',
          tone: 'professional',
        });
        finalContent = enhanced.enhanced_content;
      } catch (aiError) {
        console.warn('AI enhancement failed, using original content:', aiError);
        // Continue with original content if AI fails
      }
    }

    // Create article in Zendesk
    const article = await client.createArticle(
      section_id,
      {
        title,
        body: finalContent,
        locale,
        draft,
        label_names,
      },
      locale
    );

    return NextResponse.json(
      {
        success: true,
        data: article,
      } as ZendeskAPIResponse<typeof article>,
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to create article',
        },
      } as ZendeskAPIResponse<never>,
      { status: 500 }
    );
  }
}
