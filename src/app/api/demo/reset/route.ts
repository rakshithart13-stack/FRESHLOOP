import { NextResponse } from 'next/server';
import { repository } from '@/lib/repository';

export async function POST() {
  try {
    await repository.resetDemoData();
    return NextResponse.json({ success: true, message: 'Demo data successfully reset to benchmark state.' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
