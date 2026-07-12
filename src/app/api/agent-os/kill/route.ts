import { NextRequest, NextResponse } from 'next/server';
import { getKernel } from '@/agent-os/kernel';

export const dynamic = 'force-dynamic';

/** プロセスの強制終了 (SIGKILL相当) */
export async function POST(request: NextRequest) {
  const body = (await request.json()) as { pid?: number };
  if (typeof body.pid !== 'number') {
    return NextResponse.json({ error: 'pid が必要です' }, { status: 400 });
  }
  getKernel().kill(body.pid);
  return NextResponse.json({ ok: true });
}
