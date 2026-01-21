/**
 * API Route: /api/zendesk/sections
 * Handles section operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { getZendeskClient } from '@/lib/zendesk-client';
import { ZendeskAPIResponse } from '@/types/zendesk';

/**
 * GET /api/zendesk/sections
 * List sections in a category
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get('category_id');
    const locale = searchParams.get('locale') || 'en-us';

    if (!categoryId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Missing required parameter: category_id',
          },
        } as ZendeskAPIResponse<never>,
        { status: 400 }
      );
    }

    const client = getZendeskClient();
    const sections = await client.listSections(parseInt(categoryId), locale);

    return NextResponse.json({
      success: true,
      data: sections,
    } as ZendeskAPIResponse<typeof sections>);
  } catch (error) {
    console.error('Error fetching sections:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to fetch sections',
        },
      } as ZendeskAPIResponse<never>,
      { status: 500 }
    );
  }
}
