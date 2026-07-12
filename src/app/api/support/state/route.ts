import { NextResponse } from 'next/server';
import { getSupportEngine } from '@/support-agent/engine';

export const dynamic = 'force-dynamic';

/** オーケストレーション層の全状態 (UIが1秒間隔でポーリング) */
export async function GET() {
  return NextResponse.json(getSupportEngine().snapshot());
}
