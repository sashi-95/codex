import { NextResponse } from 'next/server';
import { resetSupportEngine } from '@/support-agent/engine';

export const dynamic = 'force-dynamic';

/** デモ環境の初期化 (チケット・Run・承認・監査ログをリセット) */
export async function POST() {
  resetSupportEngine();
  return NextResponse.json({ ok: true });
}
