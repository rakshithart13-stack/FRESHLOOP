import { NextResponse } from 'next/server';
import { repository } from '@/lib/repository';

export async function GET() {
  try {
    const matches = await repository.getAllMatches();
    return NextResponse.json(matches);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
