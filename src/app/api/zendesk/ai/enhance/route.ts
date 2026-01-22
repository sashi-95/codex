/**
 * API Route: /api/zendesk/ai/enhance
 * AI-powered content enhancement
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAIEnhancer } from '@/lib/ai-content-enhancer';
import { AIEnhancementRequest, ZendeskAPIResponse } from '@/types/zendesk';

/**
 * POST /api/zendesk/ai/enhance
 * Enhance content using AI
 */
export async function POST(request: NextRequest) {
  try {
    const body: AIEnhancementRequest = await request.json();

    const { content, enhancement_type, target_audience, tone } = body;

    // Validate required fields
    if (!content || !enhancement_type) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Missing required fields: content and enhancement_type are required',
          },
        } as ZendeskAPIResponse<never>,
        { status: 400 }
      );
    }

    // Validate enhancement type
    const validTypes = ['improve', 'expand', 'summarize', 'format'];
    if (!validTypes.includes(enhancement_type)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: `Invalid enhancement_type. Must be one of: ${validTypes.join(', ')}`,
          },
        } as ZendeskAPIResponse<never>,
        { status: 400 }
      );
    }

    const enhancer = getAIEnhancer();
    const result = await enhancer.enhanceContent({
      content,
      enhancement_type,
      target_audience,
      tone,
    });

    return NextResponse.json({
      success: true,
      data: result,
    } as ZendeskAPIResponse<typeof result>);
  } catch (error) {
    console.error('Error enhancing content:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to enhance content',
        },
      } as ZendeskAPIResponse<never>,
      { status: 500 }
    );
  }
}
