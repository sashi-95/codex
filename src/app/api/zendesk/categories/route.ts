/**
 * API Route: /api/zendesk/categories
 * Handles category operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { getZendeskClient } from '@/lib/zendesk-client';
import { ZendeskAPIResponse } from '@/types/zendesk';

/**
 * GET /api/zendesk/categories
 * List all categories
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const locale = searchParams.get('locale') || 'en-us';

    const client = getZendeskClient();
    const categories = await client.listCategories(locale);

    return NextResponse.json({
      success: true,
      data: categories,
    } as ZendeskAPIResponse<typeof categories>);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to fetch categories',
        },
      } as ZendeskAPIResponse<never>,
      { status: 500 }
    );
  }
}
