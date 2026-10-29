import { describe, it, expect } from 'vitest';
import {
  checkEligibility,
  scoreMatch,
  findMatchesForListing,
  calculateDistanceKm,
} from '../lib/matching';
import { SurplusListing, KitchenRequirement, Organisation } from '../types';

describe('Deterministic Matching Engine', () => {
  const baseListing: SurplusListing = {
    id: 'test_listing_1',
    vendor_org_id: 'org_vendor_1',
    title: 'Fresh Vegetables',
    food_category: 'vegetables',
    total_quantity: 20,
    available_quantity: 20,
    reserved_quantity: 0,
    collected_quantity: 0,
    unit: 'kg',
    expires_at: '2026-10-29T22:00:00Z',
    pickup_start: '2026-10-29T14:00:00Z',
    pickup_end: '2026-10-29T18:00:00Z',
    pickup_address: '142 Market St, Downtown',
    lat: 37.7891,
    lng: -122.4014,
    status: 'available',
    created_at: '2026-10-29T12:00:00Z',
    updated_at: '2026-10-29T12:00:00Z',
  };

  const eligibleKitchenReq: KitchenRequirement = {
    id: 'req_kitchen_1',
    kitchen_org_id: 'org_kitchen_1',
    accepted_categories: ['vegetables', 'fruit'],
    desired_quantity: 20,
    min_quantity: 10,
    max_quantity: 25,
    unit: 'kg',
    needed_by: '2026-10-29T18:30:00Z',
    pickup_start: '2026-10-29T13:00:00Z',
    pickup_end: '2026-10-29T17:00:00Z',
    service_area: 'Downtown',
    is_active: true,
    created_at: '2026-10-29T10:00:00Z',
    updated_at: '2026-10-29T10:00:00Z',
  };

  const testNow = new Date('2026-10-29T13:30:00Z');

  it('correctly qualifies an eligible candidate and assigns high match score', () => {
    const eligibility = checkEligibility(baseListing, eligibleKitchenReq, testNow);
    expect(eligibility.isEligible).toBe(true);

    const score = scoreMatch(baseListing, eligibleKitchenReq, undefined, undefined, testNow);
    expect(score.overall_score).toBeGreaterThan(70);
    expect(score.explanations.length).toBeGreaterThan(0);
    expect(score.explanations.some((e) => e.includes('100% of kitchen demand'))).toBe(true);
  });

  it('rejects candidate with incompatible food category', () => {
    const bakeryReq: KitchenRequirement = {
      ...eligibleKitchenReq,
      id: 'req_bakery_only',
      accepted_categories: ['bakery', 'dairy'],
    };

    const eligibility = checkEligibility(baseListing, bakeryReq, testNow);
    expect(eligibility.isEligible).toBe(false);
    expect(eligibility.rejectionCode).toBe('CATEGORY_MISMATCH');
    expect(eligibility.rejectionReason).toContain('Kitchen accepts [bakery, dairy]');
  });

  it('rejects candidate with non-overlapping pickup window', () => {
    const eveningOnlyReq: KitchenRequirement = {
      ...eligibleKitchenReq,
      id: 'req_evening_only',
      pickup_start: '2026-10-29T19:00:00Z',
      pickup_end: '2026-10-29T21:00:00Z',
    };

    const eligibility = checkEligibility(baseListing, eveningOnlyReq, testNow);
    expect(eligibility.isEligible).toBe(false);
    expect(eligibility.rejectionCode).toBe('TIMING_WINDOW_MISMATCH');
  });

  it('rejects candidate when listing pickup deadline has already passed', () => {
    const lateNow = new Date('2026-10-29T18:30:00Z'); // after 18:00
    const eligibility = checkEligibility(baseListing, eligibleKitchenReq, lateNow);
    expect(eligibility.isEligible).toBe(false);
    expect(eligibility.rejectionCode).toBe('PICKUP_WINDOW_PASSED');
  });

  it('rejects candidate when available quantity is below minimum requirement', () => {
    const smallListing: SurplusListing = {
      ...baseListing,
      available_quantity: 5,
    };
    const eligibility = checkEligibility(smallListing, eligibleKitchenReq, testNow);
    expect(eligibility.isEligible).toBe(false);
    expect(eligibility.rejectionCode).toBe('BELOW_MIN_QUANTITY');
  });

  it('applies explicit service area fallback when coordinates are missing without hallucinating distance', () => {
    const noCoordListing: SurplusListing = {
      ...baseListing,
      lat: undefined,
      lng: undefined,
      pickup_address: 'Downtown Hub',
    };
    const noCoordOrg: Organisation = {
      id: 'org_kitchen_1',
      name: 'Hope Kitchen',
      type: 'kitchen',
      contact_name: 'Marcus',
      contact_email: 'marcus@hope.demo',
      address: 'Civic Plaza',
      service_area: 'Downtown',
      verified_status: 'verified',
      created_at: '2026-10-29T00:00:00Z',
      updated_at: '2026-10-29T00:00:00Z',
    };

    const score = scoreMatch(noCoordListing, eligibleKitchenReq, undefined, noCoordOrg, testNow);
    expect(score.score_breakdown.location_score).toBe(24);
    expect(score.warnings.some((w) => w.includes('fallback'))).toBe(true);
  });

  it('findMatchesForListing sorts eligible matches descending and tags ineligibles with reasons', () => {
    const orgsMap: Record<string, Organisation> = {
      org_vendor_1: {
        id: 'org_vendor_1',
        name: 'GreenBistro',
        type: 'vendor',
        contact_name: 'Elena',
        contact_email: 'elena@demo.com',
        address: '142 Market',
        service_area: 'Downtown',
        verified_status: 'verified',
        created_at: '2026-10-29T00:00:00Z',
        updated_at: '2026-10-29T00:00:00Z',
      },
      org_kitchen_1: {
        id: 'org_kitchen_1',
        name: 'Hope Kitchen',
        type: 'kitchen',
        contact_name: 'Marcus',
        contact_email: 'marcus@demo.com',
        address: '88 Civic',
        service_area: 'Downtown',
        lat: 37.7794,
        lng: -122.4184,
        verified_status: 'verified',
        created_at: '2026-10-29T00:00:00Z',
        updated_at: '2026-10-29T00:00:00Z',
      },
    };

    const reqs: KitchenRequirement[] = [
      eligibleKitchenReq,
      {
        ...eligibleKitchenReq,
        id: 'req_ineligible_cat',
        accepted_categories: ['packaged_food'],
      },
    ];

    const result = findMatchesForListing(baseListing, reqs, orgsMap, testNow);
    expect(result.eligibleMatches.length).toBe(1);
    expect(result.ineligibleCandidates.length).toBe(1);
    expect(result.eligibleMatches[0].kitchen_org_id).toBe('org_kitchen_1');
    expect(result.ineligibleCandidates[0].rejection_code).toBe('CATEGORY_MISMATCH');
  });

  it('computes accurate Haversine distance', () => {
    // SF Civic Center (37.7794, -122.4184) to Market St (37.7891, -122.4014) is approx 1.8 - 2.2 km
    const dist = calculateDistanceKm(37.7794, -122.4184, 37.7891, -122.4014);
    expect(dist).toBeGreaterThan(1.5);
    expect(dist).toBeLessThan(2.5);
  });
});
