import { NextRequest, NextResponse } from 'next/server';
import { getSupportEngine } from '@/support-agent/engine';

export const dynamic = 'force-dynamic';

/** HITL承認の決裁 (本番ではSlackボタン/Zendeskサイドバーアプリから叩かれる) */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      approval_id?: string;
      approve?: boolean;
      decided_by?: string;
    };
    if (!body.approval_id || typeof body.approve !== 'boolean') {
      return NextResponse.json(
        { error: 'approval_id と approve (boolean) は必須です' },
        { status: 400 }
      );
    }
    const approval = await getSupportEngine().decideApproval(
      body.approval_id,
      body.approve,
      body.decided_by ?? 'operator'
    );
    return NextResponse.json({ approval });
  } catch (error) {
    const message = error instanceof Error ? error.message : '決裁処理に失敗しました';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
