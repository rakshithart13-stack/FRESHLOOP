import { describe, it, expect, beforeEach } from 'vitest';
import { repository } from '../lib/repository';

describe('FreshLoop State Machine & Verified Impact', () => {
  beforeEach(async () => {
    await repository.resetDemoData();
  });

  it('prevents overselling and reserves inventory atomically upon acceptance', async () => {
    const listingBefore = await repository.getListingById('listing_veg_20kg');
    expect(listingBefore?.available_quantity).toBe(20);
    expect(listingBefore?.reserved_quantity).toBe(0);

    // Kitchen attempts to accept more than available
    await expect(
      repository.acceptMatch('match_listing_veg_20kg_req_kitchen_hope', 25, 'org_kitchen_hope')
    ).rejects.toThrow(/Oversell prevented/);

    // Accept valid 20 kg
    const collection = await repository.acceptMatch(
      'match_listing_veg_20kg_req_kitchen_hope',
      20,
      'org_kitchen_hope'
    );
    expect(collection.status).toBe('pending_pickup');
    expect(collection.accepted_quantity).toBe(20);
    expect(collection.collected_quantity).toBeNull();

    // Verify inventory state
    const listingAfter = await repository.getListingById('listing_veg_20kg');
    expect(listingAfter?.available_quantity).toBe(0);
    expect(listingAfter?.reserved_quantity).toBe(20);
    expect(listingAfter?.status).toBe('accepted');

    // Impact must NOT include this collection before physical confirmation
    const impactBeforeConfirmation = await repository.getImpactMetrics();
    // Only historical 15 kg bread is verified initially
    expect(impactBeforeConfirmation.total_verified_collected_kg).toBe(15);
  });

  it('handles partial collection and only counts actual confirmed quantity toward verified impact', async () => {
    // 1. Accept 20 kg
    const collection = await repository.acceptMatch(
      'match_listing_veg_20kg_req_kitchen_hope',
      20,
      'org_kitchen_hope'
    );

    // 2. Kitchen records handover with partial quantity: 18 kg (2 kg bruised lettuce discarded)
    const afterHandover = await repository.recordCollectionHandover(
      collection.id,
      18,
      'kitchen',
      '2 kg discarded at pickup due to bruising'
    );
    expect(afterHandover.status).toBe('collected_pending_confirmation');
    expect(afterHandover.collected_quantity).toBe(18);
    expect(afterHandover.kitchen_confirmed).toBe(true);
    expect(afterHandover.vendor_confirmed).toBe(false);

    // Still not confirmed until Vendor confirms!
    let impact = await repository.getImpactMetrics();
    expect(impact.total_verified_collected_kg).toBe(15); // unchanged!

    // 3. Vendor confirms the collection!
    const fullyConfirmed = await repository.confirmCollection(collection.id, 'vendor');
    expect(fullyConfirmed.status).toBe('confirmed');
    expect(fullyConfirmed.vendor_confirmed).toBe(true);
    expect(fullyConfirmed.kitchen_confirmed).toBe(true);

    // 4. Check verified impact: 15 kg historical + 18 kg confirmed = EXACTLY 33 kg (NOT 35 kg!)
    impact = await repository.getImpactMetrics();
    expect(impact.total_verified_collected_kg).toBe(33);
    expect(impact.funnel.listed_kg).toBe(35); // 20 + 15
    expect(impact.funnel.accepted_kg).toBe(35); // 20 + 15
    expect(impact.funnel.verified_collected_kg).toBe(33); // 18 + 15
  });

  it('releases reserved inventory when a collection is cancelled and logs audit event', async () => {
    const collection = await repository.acceptMatch(
      'match_listing_veg_20kg_req_kitchen_hope',
      20,
      'org_kitchen_hope'
    );

    const cancelled = await repository.cancelCollection(
      collection.id,
      'Driver vehicle breakdown',
      'kitchen'
    );
    expect(cancelled.status).toBe('cancelled');
    expect(cancelled.cancellation_reason).toContain('Driver vehicle breakdown');

    // Listing must have its inventory restored
    const listing = await repository.getListingById('listing_veg_20kg');
    expect(listing?.available_quantity).toBe(20);
    expect(listing?.reserved_quantity).toBe(0);
    expect(listing?.status).toBe('available');

    // Verify audit logs
    const logs = await repository.getAuditLogs();
    expect(logs.some((l) => l.action === 'COLLECTION_CANCELLED_INVENTORY_RELEASED')).toBe(true);
  });

  it('flags collection as disputed when dispute is reported', async () => {
    const collection = await repository.acceptMatch(
      'match_listing_veg_20kg_req_kitchen_hope',
      20,
      'org_kitchen_hope'
    );

    await repository.recordCollectionHandover(collection.id, 14, 'kitchen');
    const disputed = await repository.disputeCollection(
      collection.id,
      'Vendor claims 18kg was delivered, kitchen records 14kg.',
      'vendor'
    );

    expect(disputed.status).toBe('disputed');
    expect(disputed.dispute_reason).toContain('claims 18kg');

    // Disputed collection does NOT contribute to verified impact
    const impact = await repository.getImpactMetrics();
    expect(impact.total_verified_collected_kg).toBe(15);
  });
});
