/**
 * API Route: /api/zendesk/articles/[id]
 * Handles individual article operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { getZendeskClient } from '@/lib/zendesk-client';
import { getAIEnhancer } from '@/lib/ai-content-enhancer';
import { ArticleUpdateRequest, ZendeskAPIResponse } from '@/types/zendesk';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/zendesk/articles/[id]
 * Get a specific article
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const articleId = parseInt(params.id);
    const searchParams = request.nextUrl.searchParams;
    const locale = searchParams.get('locale') || 'en-us';

    if (isNaN(articleId)) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Invalid article ID' },
        } as ZendeskAPIResponse<never>,
        { status: 400 }
      );
    }

    const client = getZendeskClient();
    const article = await client.getArticle(articleId, locale);

    return NextResponse.json({
      success: true,
      data: article,
    } as ZendeskAPIResponse<typeof article>);
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to fetch article',
        },
      } as ZendeskAPIResponse<never>,
      { status: 500 }
    );
  }
}

/**
 * PUT /api/zendesk/articles/[id]
 * Update an existing article
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const articleId = parseInt(params.id);
    const body: ArticleUpdateRequest = await request.json();

    if (isNaN(articleId)) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Invalid article ID' },
        } as ZendeskAPIResponse<never>,
        { status: 400 }
      );
    }

    const {
      title,
      content,
      section_id,
      draft,
      label_names,
      use_ai_enhancement = false,
    } = body;

    const client = getZendeskClient();
    const locale = request.nextUrl.searchParams.get('locale') || 'en-us';

    // Prepare updates
    const updates: Record<string, unknown> = {};

    if (title !== undefined) updates.title = title;
    if (section_id !== undefined) updates.section_id = section_id;
    if (draft !== undefined) updates.draft = draft;
    if (label_names !== undefined) updates.label_names = label_names;

    // Handle content with optional AI enhancement
    if (content !== undefined) {
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
        }
      }

      updates.body = finalContent;
    }

    // Update article in Zendesk
    const article = await client.updateArticle(articleId, updates, locale);

    return NextResponse.json({
      success: true,
      data: article,
    } as ZendeskAPIResponse<typeof article>);
  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to update article',
        },
      } as ZendeskAPIResponse<never>,
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/zendesk/articles/[id]
 * Delete an article
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const articleId = parseInt(params.id);

    if (isNaN(articleId)) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Invalid article ID' },
        } as ZendeskAPIResponse<never>,
        { status: 400 }
      );
    }

    const client = getZendeskClient();
    await client.deleteArticle(articleId);

    return NextResponse.json({
      success: true,
      data: { message: 'Article deleted successfully' },
    } as ZendeskAPIResponse<{ message: string }>);
  } catch (error) {
    console.error('Error deleting article:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to delete article',
        },
      } as ZendeskAPIResponse<never>,
      { status: 500 }
    );
  }
}
