/**
 * API Route: /api/zendesk/test
 * Test connections to Zendesk and AI services
 */

import { NextRequest, NextResponse } from 'next/server';
import { getZendeskClient } from '@/lib/zendesk-client';
import { getAIEnhancer } from '@/lib/ai-content-enhancer';
import { ZendeskAPIResponse } from '@/types/zendesk';

/**
 * GET /api/zendesk/test
 * Test connections to required services
 */
export async function GET(request: NextRequest) {
  const results = {
    zendesk: {
      success: false,
      message: '',
      error: null as string | null,
    },
    ai: {
      success: false,
      message: '',
      provider: '',
      error: null as string | null,
    },
  };

  // Test Zendesk connection
  try {
    const zendeskClient = getZendeskClient();
    const zendeskTest = await zendeskClient.testConnection();
    results.zendesk = {
      success: zendeskTest.success,
      message: zendeskTest.message,
      error: null,
    };
  } catch (error) {
    results.zendesk = {
      success: false,
      message: 'Failed to initialize Zendesk client',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // Test AI connection
  try {
    const aiEnhancer = getAIEnhancer();
    const aiTest = await aiEnhancer.testConnection();
    results.ai = {
      success: aiTest.success,
      message: aiTest.message,
      provider: aiTest.provider,
      error: null,
    };
  } catch (error) {
    results.ai = {
      success: false,
      message: 'Failed to initialize AI service',
      provider: '',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // Determine overall success
  const overallSuccess = results.zendesk.success && results.ai.success;
  const statusCode = overallSuccess ? 200 : 503;

  return NextResponse.json(
    {
      success: overallSuccess,
      data: results,
    } as ZendeskAPIResponse<typeof results>,
    { status: statusCode }
  );
}
