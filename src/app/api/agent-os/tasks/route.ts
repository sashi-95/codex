import { NextRequest, NextResponse } from 'next/server';
import { getKernel } from '@/agent-os/kernel';

export const dynamic = 'force-dynamic';

/** タスク投入: ゴールを受け取りオーケストレータープロセスを起動する */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { goal?: string };
    const task = getKernel().submitTask(body.goal ?? '');
    return NextResponse.json({ task });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'タスク投入に失敗しました';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
