// FreshLoop Deterministic Matching Engine
// Pure TypeScript Implementation
// Rule: Deterministic, explainable, transparent, no black-box AI hallucination.

import {
  SurplusListing,
  KitchenRequirement,
  Organisation,
  MatchResult,
  MatchScoreBreakdown,
  IneligibleCandidate,
} from '@/types';

// Haversine distance calculator in kilometers
export function calculateDistanceKm(
  lat1?: number,
  lon1?: number,
  lat2?: number,
  lon2?: number
): number | null {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) {
    return null;
  }
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export interface EligibilityResult {
  isEligible: boolean;
  rejectionCode?: string;
  rejectionReason?: string;
}

/**
 * Gate 1: Strict Eligibility Filter
 */
export function checkEligibility(
  listing: SurplusListing,
  requirement: KitchenRequirement,
  now: Date = new Date()
): EligibilityResult {
  // 1. Check listing status and quantity
  if (listing.status !== 'available' && listing.status !== 'matched') {
    return {
      isEligible: false,
      rejectionCode: 'LISTING_INACTIVE',
      rejectionReason: `Listing is currently ${listing.status} and cannot be matched.`,
    };
  }

  if (listing.available_quantity <= 0) {
    return {
      isEligible: false,
      rejectionCode: 'OUT_OF_STOCK',
      rejectionReason: 'No remaining available quantity for this listing.',
    };
  }

  // 2. Check kitchen requirement status
  if (!requirement.is_active) {
    return {
      isEligible: false,
      rejectionCode: 'REQUIREMENT_INACTIVE',
      rejectionReason: 'Kitchen requirement is marked inactive.',
    };
  }

  // 3. Category compatibility check
  if (!requirement.accepted_categories.includes(listing.food_category)) {
    return {
      isEligible: false,
      rejectionCode: 'CATEGORY_MISMATCH',
      rejectionReason: `Kitchen accepts [${requirement.accepted_categories.join(', ')}], but listing is ${listing.food_category}.`,
    };
  }

  // 4. Unit compatibility (no arbitrary auto-conversion)
  if (listing.unit !== requirement.unit) {
    return {
      isEligible: false,
      rejectionCode: 'UNIT_MISMATCH',
      rejectionReason: `Incompatible units: listing is in '${listing.unit}' while kitchen requires '${requirement.unit}'.`,
    };
  }

  // 5. Quantity minimum threshold
  if (listing.available_quantity < requirement.min_quantity) {
    return {
      isEligible: false,
      rejectionCode: 'BELOW_MIN_QUANTITY',
      rejectionReason: `Available quantity (${listing.available_quantity} ${listing.unit}) is below kitchen minimum batch requirement (${requirement.min_quantity} ${requirement.unit}).`,
    };
  }

  // 6. Expiry and pickup timing checks
  const expiresAt = new Date(listing.expires_at);
  const listingPickupStart = new Date(listing.pickup_start);
  const listingPickupEnd = new Date(listing.pickup_end);
  const kitchenPickupStart = new Date(requirement.pickup_start);
  const kitchenPickupEnd = new Date(requirement.pickup_end);
  const neededBy = new Date(requirement.needed_by);

  if (now > expiresAt) {
    return {
      isEligible: false,
      rejectionCode: 'LISTING_EXPIRED',
      rejectionReason: 'Listing use-by/expiry deadline has already passed.',
    };
  }

  if (now > listingPickupEnd) {
    return {
      isEligible: false,
      rejectionCode: 'PICKUP_WINDOW_PASSED',
      rejectionReason: 'Vendor pickup window has closed.',
    };
  }

  // Food must be ready before kitchen needed-by deadline
  if (listingPickupStart > neededBy) {
    return {
      isEligible: false,
      rejectionCode: 'PAST_KITCHEN_DEADLINE',
      rejectionReason: `Listing pickup starts after the kitchen's needed-by deadline (${neededBy.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}).`,
    };
  }

  // Window overlap check:
  // Overlap exists if max(start1, start2) < min(end1, end2)
  const effectiveStart = new Date(Math.max(listingPickupStart.getTime(), kitchenPickupStart.getTime()));
  const effectiveEnd = new Date(Math.min(listingPickupEnd.getTime(), kitchenPickupEnd.getTime()));

  if (effectiveStart >= effectiveEnd) {
    return {
      isEligible: false,
      rejectionCode: 'TIMING_WINDOW_MISMATCH',
      rejectionReason: `Vendor window (${listingPickupStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${listingPickupEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}) does not overlap with kitchen availability (${kitchenPickupStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${kitchenPickupEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}).`,
    };
  }

  return { isEligible: true };
}

/**
 * Gate 2 & 3: Transparent Scoring & Explanation Generation (0–100)
 */
export function scoreMatch(
  listing: SurplusListing,
  requirement: KitchenRequirement,
  vendorOrg?: Organisation,
  kitchenOrg?: Organisation,
  now: Date = new Date()
): {
  overall_score: number;
  score_breakdown: MatchScoreBreakdown;
  explanations: string[];
  warnings: string[];
} {
  const explanations: string[] = [];
  const warnings: string[] = [];

  // ==========================================
  // 1. Location Fit (Weight: 30%)
  // ==========================================
  let location_score = 0;
  const distance = calculateDistanceKm(
    listing.lat ?? vendorOrg?.lat,
    listing.lng ?? vendorOrg?.lng,
    kitchenOrg?.lat,
    kitchenOrg?.lng
  );

  if (distance !== null) {
    if (distance <= 3) {
      location_score = 30;
      explanations.push(`Excellent proximity: only ${distance} km away.`);
    } else if (distance <= 10) {
      location_score = Math.round(30 - (distance - 3) * 2.5);
      explanations.push(`Convenient transit distance: ${distance} km from facility.`);
    } else if (distance <= 25) {
      location_score = 12;
      warnings.push(`Moderate distance: ${distance} km may require coordinated transport.`);
    } else {
      location_score = 5;
      warnings.push(`Long distance: ${distance} km between donor and kitchen.`);
    }
  } else {
    // Explicit Fallback: Service area heuristic
    const vendorArea = (listing.pickup_address || vendorOrg?.service_area || '').toLowerCase();
    const kitchenArea = (requirement.service_area || kitchenOrg?.service_area || '').toLowerCase();

    if (vendorArea && kitchenArea && (vendorArea.includes(kitchenArea) || kitchenArea.includes(vendorArea))) {
      location_score = 24;
      explanations.push(`Matching service area: Both located in '${requirement.service_area || vendorOrg?.service_area}'.`);
      warnings.push('Service-area fallback score used: precise geospatial coordinates not verified.');
    } else {
      location_score = 15;
      warnings.push('Coordinates unverified; estimated average neighborhood score applied.');
    }
  }

  // ==========================================
  // 2. Quantity Alignment (Weight: 25%)
  // ==========================================
  let quantity_score = 0;
  const usableQuantity = Math.min(listing.available_quantity, requirement.max_quantity);
  const ratio = usableQuantity / requirement.desired_quantity;

  if (ratio >= 0.9 && ratio <= 1.1) {
    quantity_score = 25;
    explanations.push(`Optimal batch size: ${listing.available_quantity} ${listing.unit} satisfies ~100% of kitchen demand.`);
  } else if (ratio >= 0.6 && ratio < 0.9) {
    quantity_score = 20;
    explanations.push(`Strong volume match: covers ${Math.round(ratio * 100)}% of kitchen's target demand.`);
  } else if (ratio > 1.1) {
    quantity_score = 16;
    explanations.push(`Abundant surplus: offers ${listing.available_quantity} ${listing.unit} (kitchen max is ${requirement.max_quantity} ${requirement.unit}).`);
    warnings.push(`Surplus exceeds desired quantity by ${Math.round((ratio - 1) * 100)}%; kitchen must verify storage space.`);
  } else {
    quantity_score = 10;
    warnings.push(`Partial fulfillment: covers ${Math.round(ratio * 100)}% of desired demand.`);
  }

  // ==========================================
  // 3. Pickup-Time Compatibility (Weight: 25%)
  // ==========================================
  let time_score = 0;
  const listingPickupStart = new Date(listing.pickup_start).getTime();
  const listingPickupEnd = new Date(listing.pickup_end).getTime();
  const kitchenPickupStart = new Date(requirement.pickup_start).getTime();
  const kitchenPickupEnd = new Date(requirement.pickup_end).getTime();

  const overlapStart = Math.max(listingPickupStart, kitchenPickupStart);
  const overlapEnd = Math.min(listingPickupEnd, kitchenPickupEnd);
  const overlapHours = Math.max(0, (overlapEnd - overlapStart) / (1000 * 60 * 60));

  if (overlapHours >= 3) {
    time_score = 25;
    explanations.push(`Generous collection window: ${overlapHours.toFixed(1)} hours of overlapping availability.`);
  } else if (overlapHours >= 1.5) {
    time_score = 20;
    explanations.push(`Reliable collection window: ${overlapHours.toFixed(1)} hours overlap.`);
  } else if (overlapHours >= 0.5) {
    time_score = 12;
    warnings.push(`Tight pickup window: only ${Math.round(overlapHours * 60)} minutes overlap.`);
  } else {
    time_score = 6;
    warnings.push('Narrow pickup overlap; requires prompt driver dispatch.');
  }

  // ==========================================
  // 4. Urgency & Freshness (Weight: 20%)
  // ==========================================
  let demand_score = 0;
  const expiresAt = new Date(listing.expires_at).getTime();
  const hoursUntilExpiry = (expiresAt - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntilExpiry <= 4 && hoursUntilExpiry > 0) {
    demand_score = 20;
    explanations.push(`Critical rescue priority: ${hoursUntilExpiry.toFixed(1)} hours remaining before expiry.`);
  } else if (hoursUntilExpiry <= 12) {
    demand_score = 17;
    explanations.push(`High rescue priority: expires within ${hoursUntilExpiry.toFixed(1)} hours.`);
  } else if (hoursUntilExpiry <= 24) {
    demand_score = 14;
    explanations.push('Standard fresh surplus: collection today prevents waste tomorrow.');
  } else {
    demand_score = 10;
    explanations.push('Stable shelf-life: more than 24 hours remaining.');
  }

  const overall_score = Math.min(100, Math.max(0, location_score + quantity_score + time_score + demand_score));

  return {
    overall_score,
    score_breakdown: {
      location_score,
      quantity_score,
      time_score,
      demand_score,
    },
    explanations,
    warnings,
  };
}

/**
 * Main Deterministic Matching Algorithm
 * Evaluates a listing against a list of kitchen requirements.
 */
export function findMatchesForListing(
  listing: SurplusListing,
  requirements: KitchenRequirement[],
  organisationsMap: Record<string, Organisation>,
  now: Date = new Date()
): {
  eligibleMatches: MatchResult[];
  ineligibleCandidates: IneligibleCandidate[];
} {
  const eligibleMatches: MatchResult[] = [];
  const ineligibleCandidates: IneligibleCandidate[] = [];
  const vendorOrg = organisationsMap[listing.vendor_org_id];

  for (const req of requirements) {
    const kitchenOrg = organisationsMap[req.kitchen_org_id];
    const eligibility = checkEligibility(listing, req, now);

    if (!eligibility.isEligible) {
      ineligibleCandidates.push({
        requirement: req,
        kitchen_org: kitchenOrg,
        rejection_code: eligibility.rejectionCode || 'INELIGIBLE',
        rejection_reason: eligibility.rejectionReason || 'Failed eligibility criteria.',
        rejectionReason: eligibility.rejectionReason || 'Failed eligibility criteria.',
      });
      continue;
    }

    const scoreData = scoreMatch(listing, req, vendorOrg, kitchenOrg, now);

    eligibleMatches.push({
      id: `match_${listing.id}_${req.id}`,
      listing_id: listing.id,
      requirement_id: req.id,
      vendor_org_id: listing.vendor_org_id,
      kitchen_org_id: req.kitchen_org_id,
      overall_score: scoreData.overall_score,
      score_breakdown: scoreData.score_breakdown,
      explanations: scoreData.explanations,
      warnings: scoreData.warnings,
      status: 'suggested',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      listing,
      kitchen_org: kitchenOrg,
      vendor_org: vendorOrg,
    });
  }

  // Sort eligible candidates by overall_score descending (highest score first)
  eligibleMatches.sort((a, b) => b.overall_score - a.overall_score);

  return { eligibleMatches, ineligibleCandidates };
}
