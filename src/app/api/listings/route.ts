import { NextResponse } from 'next/server';
import { repository } from '@/lib/repository';
import { z } from 'zod';

const createListingSchema = z.object({
  vendor_org_id: z.string().min(1, 'Vendor organisation ID required'),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  food_category: z.enum([
    'vegetables',
    'fruit',
    'bakery',
    'packaged_food',
    'prepared_food',
    'dairy',
    'beverages',
    'other',
  ]),
  description: z.string().optional(),
  total_quantity: z.number().positive('Quantity must be greater than zero'),
  unit: z.enum(['kg', 'meals', 'boxes', 'litres', 'portions', 'units']),
  prepared_at: z.string().optional(),
  expires_at: z.string().min(1, 'Expiry/use-by date required'),
  pickup_start: z.string().min(1, 'Pickup start time required'),
  pickup_end: z.string().min(1, 'Pickup deadline required'),
  pickup_address: z.string().min(5, 'Pickup address required'),
  lat: z.number().optional(),
  lng: z.number().optional(),
  storage_notes: z.string().optional(),
  allergens: z.string().optional(),
  status: z.enum(['draft', 'available']).default('available'),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const vendor_org_id = searchParams.get('vendor_org_id') || undefined;
    const status = searchParams.get('status') || undefined;

    const listings = await repository.getListings({ vendor_org_id, status });
    return NextResponse.json(listings);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = createListingSchema.parse(body);

    // Validate that pickup_start <= pickup_end
    if (new Date(validated.pickup_start) > new Date(validated.pickup_end)) {
      return NextResponse.json(
        { error: 'Pickup start time cannot be after pickup deadline' },
        { status: 400 }
      );
    }

    const created = await repository.createListing(validated);
    return NextResponse.json(created, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message || 'Validation failed' }, { status: 400 });
    }
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
