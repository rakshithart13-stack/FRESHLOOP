import { NextResponse } from 'next/server';
import { repository } from '@/lib/repository';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const vendor_org_id = searchParams.get('vendor_org_id') || undefined;
    const kitchen_org_id = searchParams.get('kitchen_org_id') || undefined;
    const status = searchParams.get('status') || undefined;

    const collections = await repository.getCollections({ vendor_org_id, kitchen_org_id, status });
    return NextResponse.json(collections);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
