import { NextResponse } from 'next/server';
import { repository } from '@/lib/repository';

export async function GET() {
  try {
    const organisations = await repository.getOrganisations();
    return NextResponse.json(organisations);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;
    if (!id || !status) {
      return NextResponse.json({ error: 'Organisation ID and status are required.' }, { status: 400 });
    }
    const updated = await repository.updateOrganisationStatus(id, status);
    return NextResponse.json(updated);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
