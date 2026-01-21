/**
 * API Route: /api/zendesk/articles/bulk
 * Handles bulk article operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { getZendeskClient } from '@/lib/zendesk-client';
import { getAIEnhancer } from '@/lib/ai-content-enhancer';
import { BulkArticleImport, ZendeskAPIResponse } from '@/types/zendesk';

/**
 * POST /api/zendesk/articles/bulk
 * Create multiple articles at once
 */
export async function POST(request: NextRequest) {
  try {
    const body: BulkArticleImport = await request.json();

    const {
      articles,
      default_section_id,
      publish_immediately = false,
    } = body;

    // Validate required fields
    if (!articles || articles.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Missing required field: articles array is required and must not be empty',
          },
        } as ZendeskAPIResponse<never>,
        { status: 400 }
      );
    }

    const client = getZendeskClient();
    const enhancer = getAIEnhancer();

    // Process each article
    const articlesToCreate = await Promise.all(
      articles.map(async (articleReq) => {
        const sectionId = articleReq.section_id || default_section_id;

        if (!sectionId) {
          throw new Error('section_id must be provided for each article or as default_section_id');
        }

        let content = articleReq.content;

        // Enhance content if requested
        if (articleReq.use_ai_enhancement) {
          try {
            const enhanced = await enhancer.enhanceContent({
              content,
              enhancement_type: 'improve',
              target_audience: 'general',
              tone: 'professional',
            });
            content = enhanced.enhanced_content;
          } catch (aiError) {
            console.warn('AI enhancement failed for article, using original content:', aiError);
          }
        }

        return {
          section_id: sectionId,
          article: {
            title: articleReq.title,
            body: content,
            locale: articleReq.locale || 'en-us',
            draft: publish_immediately ? false : (articleReq.draft ?? true),
            label_names: articleReq.label_names || [],
          },
        };
      })
    );

    // Create articles in bulk
    const results = await client.bulkCreateArticles(articlesToCreate);

    // Count successes and failures
    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    return NextResponse.json(
      {
        success: true,
        data: {
          total: results.length,
          successful: successCount,
          failed: failureCount,
          results,
        },
      } as ZendeskAPIResponse<{
        total: number;
        successful: number;
        failed: number;
        results: typeof results;
      }>,
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in bulk article creation:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to create articles in bulk',
        },
      } as ZendeskAPIResponse<never>,
      { status: 500 }
    );
  }
}
