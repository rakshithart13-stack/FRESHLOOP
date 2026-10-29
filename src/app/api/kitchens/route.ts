import { NextResponse } from 'next/server';
import { repository } from '@/lib/repository';
import { z } from 'zod';

const createRequirementSchema = z.object({
  kitchen_org_id: z.string().min(1, 'Kitchen organisation ID required'),
  accepted_categories: z.array(z.string()).min(1, 'Select at least one food category'),
  desired_quantity: z.number().positive('Desired quantity must be positive'),
  min_quantity: z.number().positive('Minimum quantity must be positive'),
  max_quantity: z.number().positive('Maximum quantity must be positive'),
  unit: z.enum(['kg', 'meals', 'boxes', 'litres', 'portions', 'units']),
  needed_by: z.string().min(1, 'Needed-by deadline required'),
  pickup_start: z.string().min(1, 'Pickup start time required'),
  pickup_end: z.string().min(1, 'Pickup end time required'),
  service_area: z.string().optional(),
  storage_capabilities: z.string().optional(),
  handling_restrictions: z.string().optional(),
  is_active: z.boolean().default(true),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const kitchen_org_id = searchParams.get('kitchen_org_id') || undefined;
    const active_only = searchParams.get('active_only') === 'true';

    const reqs = await repository.getKitchenRequirements({ kitchen_org_id, active_only });
    const orgs = await repository.getOrganisations();

    // Enrich with kitchen organisation details
    const enriched = reqs.map((r) => {
      const org = orgs.find((o) => o.id === r.kitchen_org_id);
      return {
        ...r,
        kitchen_org: org,
      };
    });

    return NextResponse.json(enriched);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = createRequirementSchema.parse(body);

    if (validated.min_quantity > validated.max_quantity) {
      return NextResponse.json(
        { error: 'Minimum quantity cannot exceed maximum quantity' },
        { status: 400 }
      );
    }

    if (new Date(validated.pickup_start) > new Date(validated.pickup_end)) {
      return NextResponse.json(
        { error: 'Pickup start time cannot be after pickup end time' },
        { status: 400 }
      );
    }

    // Cast accepted_categories to FoodCategory[]
    const created = await repository.createKitchenRequirement(validated as unknown as Parameters<typeof repository.createKitchenRequirement>[0]);
    return NextResponse.json(created, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message || 'Validation failed' }, { status: 400 });
    }
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
