import { NextResponse } from 'next/server';
import { repository } from '@/lib/repository';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const collection = await repository.getCollectionById(id);
    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }
    return NextResponse.json(collection);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { action, collectedQuantity, role, notes, reason } = body;

    if (!role || (role !== 'vendor' && role !== 'kitchen')) {
      return NextResponse.json({ error: 'Valid role (vendor or kitchen) is required.' }, { status: 400 });
    }

    let updated;
    switch (action) {
      case 'record_handover': {
        if (collectedQuantity === undefined || collectedQuantity === null || collectedQuantity < 0) {
          return NextResponse.json({ error: 'Valid collected quantity is required.' }, { status: 400 });
        }
        updated = await repository.recordCollectionHandover(id, collectedQuantity, role, notes);
        break;
      }
      case 'confirm': {
        updated = await repository.confirmCollection(id, role);
        break;
      }
      case 'dispute': {
        if (!reason) {
          return NextResponse.json({ error: 'Dispute reason is required.' }, { status: 400 });
        }
        updated = await repository.disputeCollection(id, reason, role);
        break;
      }
      case 'cancel': {
        if (!reason) {
          return NextResponse.json({ error: 'Cancellation reason is required.' }, { status: 400 });
        }
        updated = await repository.cancelCollection(id, reason, role);
        break;
      }
      default:
        return NextResponse.json({ error: `Invalid action: ${action}` }, { status: 400 });
    }

    return NextResponse.json(updated);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
