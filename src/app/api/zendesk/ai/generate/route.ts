/**
 * API Route: /api/zendesk/ai/generate
 * AI-powered article generation from scratch
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAIEnhancer } from '@/lib/ai-content-enhancer';
import { ZendeskAPIResponse } from '@/types/zendesk';

interface GenerateArticleRequest {
  topic: string;
  target_audience?: string;
  tone?: string;
  sections?: string[];
}

/**
 * POST /api/zendesk/ai/generate
 * Generate a new article from a topic using AI
 */
export async function POST(request: NextRequest) {
  try {
    const body: GenerateArticleRequest = await request.json();

    const { topic, target_audience, tone, sections } = body;

    // Validate required fields
    if (!topic) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Missing required field: topic is required',
          },
        } as ZendeskAPIResponse<never>,
        { status: 400 }
      );
    }

    const enhancer = getAIEnhancer();
    const content = await enhancer.generateArticle(
      topic,
      target_audience,
      tone,
      sections
    );

    return NextResponse.json({
      success: true,
      data: {
        topic,
        content,
        word_count: content.split(/\s+/).length,
      },
    } as ZendeskAPIResponse<{
      topic: string;
      content: string;
      word_count: number;
    }>);
  } catch (error) {
    console.error('Error generating article:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to generate article',
        },
      } as ZendeskAPIResponse<never>,
      { status: 500 }
    );
  }
}
