import { NextResponse } from 'next/server';
import { repository } from '@/lib/repository';
import { z } from 'zod';

const acceptMatchSchema = z.object({
  matchId: z.string().min(1, 'Match ID is required'),
  quantityToAccept: z.number().positive('Quantity to accept must be positive'),
  kitchenOrgId: z.string().min(1, 'Kitchen organisation ID is required'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = acceptMatchSchema.parse(body);

    const collection = await repository.acceptMatch(
      validated.matchId,
      validated.quantityToAccept,
      validated.kitchenOrgId
    );

    return NextResponse.json({ success: true, collection });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message || 'Validation failed' }, { status: 400 });
    }
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
