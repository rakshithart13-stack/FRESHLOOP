import { NextResponse } from 'next/server';
import { repository } from '@/lib/repository';

// In-memory demo session state (defaulting to GreenBistro vendor)
let currentUserId = 'user_vendor_greenbistro';

export async function GET() {
  const profiles = await repository.getProfiles();
  const currentProfile = profiles.find((p) => p.id === currentUserId) || profiles[0];
  const organisations = await repository.getOrganisations();
  const currentOrg = organisations.find((o) => o.id === currentProfile.organisation_id);

  return NextResponse.json({
    user: currentProfile,
    organisation: currentOrg,
    availableProfiles: profiles.map((p) => {
      const org = organisations.find((o) => o.id === p.organisation_id);
      return {
        ...p,
        organisation_name: org?.name,
      };
    }),
  });
}

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    const profiles = await repository.getProfiles();
    const found = profiles.find((p) => p.id === userId);
    if (!found) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }
    currentUserId = userId;
    return NextResponse.json({ success: true, currentUserId });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
