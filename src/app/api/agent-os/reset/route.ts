import { NextResponse } from 'next/server';
import { resetKernel } from '@/agent-os/kernel';

export const dynamic = 'force-dynamic';

/** カーネルの再起動 (全プロセス・タスク・ログを初期化) */
export async function POST() {
  resetKernel();
  return NextResponse.json({ ok: true });
}
