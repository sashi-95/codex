import { NextResponse } from 'next/server';
import { getKernel } from '@/agent-os/kernel';

export const dynamic = 'force-dynamic';

/** カーネルの現在状態スナップショットを返す (UIが1秒間隔でポーリング) */
export async function GET() {
  return NextResponse.json(getKernel().snapshot());
}
