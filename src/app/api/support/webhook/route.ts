import { NextRequest, NextResponse } from 'next/server';
import { getSupportEngine } from '@/support-agent/engine';

export const dynamic = 'force-dynamic';

/**
 * Zendesk風Webhookの受け口 (本番ではZendeskのWebhook/Triggerから叩かれる)。
 * 重複配送は冪等キーで検出し、同一Runを返す。
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      subject?: string;
      comment?: string;
      requester_email?: string;
    };
    if (!body.subject || !body.comment || !body.requester_email) {
      return NextResponse.json(
        { error: 'subject, comment, requester_email は必須です' },
        { status: 400 }
      );
    }
    const { run, duplicate } = getSupportEngine().handleInquiry(
      body.subject,
      body.comment,
      body.requester_email
    );
    return NextResponse.json({ run_id: run.id, ticket_id: run.ticketId, duplicate });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Webhook処理に失敗しました';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
