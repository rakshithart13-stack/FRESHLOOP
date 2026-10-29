import { NextResponse } from 'next/server';
import { repository } from '@/lib/repository';

export async function GET() {
  try {
    const metrics = await repository.getImpactMetrics();
    return NextResponse.json(metrics);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
