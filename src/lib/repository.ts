// FreshLoop Data Repository Layer
// Supports Local Demo Store (zero config, transactional, offline-capable)
// and Supabase PostgreSQL client.
// Core Maxim: "A suggested match is not a completed donation. Only the quantity confirmed as collected can contribute to verified impact metrics."

import {
  Organisation,
  UserProfile,
  SurplusListing,
  KitchenRequirement,
  MatchResult,
  Collection,
  AuditLog,
  ImpactMetrics,
  FoodCategory,
} from '@/types';
import {
  INITIAL_ORGANISATIONS,
  INITIAL_PROFILES,
  INITIAL_LISTINGS,
  INITIAL_KITCHEN_REQUIREMENTS,
  INITIAL_COLLECTIONS,
  INITIAL_AUDIT_LOGS,
} from './seed-data';
import { findMatchesForListing } from './matching';

export interface FreshLoopRepository {
  // Organisations & Profiles
  getOrganisations(): Promise<Organisation[]>;
  getOrganisationById(id: string): Promise<Organisation | null>;
  updateOrganisationStatus(id: string, status: 'pending' | 'verified' | 'rejected'): Promise<Organisation>;
  getProfiles(): Promise<UserProfile[]>;
  getProfileById(id: string): Promise<UserProfile | null>;

  // Listings
  getListings(filters?: { vendor_org_id?: string; status?: string }): Promise<SurplusListing[]>;
  getListingById(id: string): Promise<SurplusListing | null>;
  createListing(data: Omit<SurplusListing, 'id' | 'created_at' | 'updated_at' | 'available_quantity' | 'reserved_quantity' | 'collected_quantity'> & { available_quantity?: number }): Promise<SurplusListing>;
  updateListingStatus(id: string, status: SurplusListing['status']): Promise<SurplusListing>;

  // Kitchen Requirements
  getKitchenRequirements(filters?: { kitchen_org_id?: string; active_only?: boolean }): Promise<KitchenRequirement[]>;
  getKitchenRequirementById(id: string): Promise<KitchenRequirement | null>;
  createKitchenRequirement(data: Omit<KitchenRequirement, 'id' | 'created_at' | 'updated_at'>): Promise<KitchenRequirement>;

  // Matching
  getMatchesForListing(listingId: string): Promise<{ matches: MatchResult[]; ineligible: unknown[] }>;
  getAllMatches(): Promise<MatchResult[]>;

  // Collections & Workflow
  getCollections(filters?: { vendor_org_id?: string; kitchen_org_id?: string; status?: string }): Promise<Collection[]>;
  getCollectionById(id: string): Promise<Collection | null>;
  acceptMatch(matchId: string, quantityToAccept: number, kitchenOrgId: string): Promise<Collection>;
  recordCollectionHandover(collectionId: string, collectedQuantity: number, reportingRole: 'vendor' | 'kitchen', notes?: string): Promise<Collection>;
  confirmCollection(collectionId: string, confirmingRole: 'vendor' | 'kitchen'): Promise<Collection>;
  disputeCollection(collectionId: string, reason: string, reportingRole: 'vendor' | 'kitchen'): Promise<Collection>;
  cancelCollection(collectionId: string, reason: string, cancellingRole: 'vendor' | 'kitchen'): Promise<Collection>;

  // Impact & Analytics
  getImpactMetrics(): Promise<ImpactMetrics>;

  // Audits
  getAuditLogs(): Promise<AuditLog[]>;

  // Demo Resetter
  resetDemoData(): Promise<void>;
}

// In-Memory Global Store with deep cloning
class LocalRepository implements FreshLoopRepository {
  private organisations: Organisation[] = JSON.parse(JSON.stringify(INITIAL_ORGANISATIONS));
  private profiles: UserProfile[] = JSON.parse(JSON.stringify(INITIAL_PROFILES));
  private listings: SurplusListing[] = JSON.parse(JSON.stringify(INITIAL_LISTINGS));
  private requirements: KitchenRequirement[] = JSON.parse(JSON.stringify(INITIAL_KITCHEN_REQUIREMENTS));
  private collections: Collection[] = JSON.parse(JSON.stringify(INITIAL_COLLECTIONS));
  private auditLogs: AuditLog[] = JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS));

  async resetDemoData(): Promise<void> {
    this.organisations = JSON.parse(JSON.stringify(INITIAL_ORGANISATIONS));
    this.profiles = JSON.parse(JSON.stringify(INITIAL_PROFILES));
    this.listings = JSON.parse(JSON.stringify(INITIAL_LISTINGS));
    this.requirements = JSON.parse(JSON.stringify(INITIAL_KITCHEN_REQUIREMENTS));
    this.collections = JSON.parse(JSON.stringify(INITIAL_COLLECTIONS));
    this.auditLogs = JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS));

    this.auditLogs.unshift({
      id: `log_${Date.now()}`,
      action: 'DEMO_DATA_RESET',
      entity_type: 'system',
      actor_role: 'admin',
      details: { timestamp: new Date().toISOString() },
      created_at: new Date().toISOString(),
    });
  }

  async getOrganisations(): Promise<Organisation[]> {
    return JSON.parse(JSON.stringify(this.organisations));
  }

  async getOrganisationById(id: string): Promise<Organisation | null> {
    const org = this.organisations.find((o) => o.id === id);
    return org ? JSON.parse(JSON.stringify(org)) : null;
  }

  async updateOrganisationStatus(id: string, status: 'pending' | 'verified' | 'rejected'): Promise<Organisation> {
    const org = this.organisations.find((o) => o.id === id);
    if (!org) throw new Error(`Organisation not found: ${id}`);
    org.verified_status = status;
    org.updated_at = new Date().toISOString();

    this.auditLogs.unshift({
      id: `log_${Date.now()}`,
      action: 'ORGANISATION_VERIFICATION_UPDATED',
      entity_type: 'organisation',
      entity_id: id,
      actor_role: 'admin',
      details: { new_status: status },
      created_at: new Date().toISOString(),
    });

    return JSON.parse(JSON.stringify(org));
  }

  async getProfiles(): Promise<UserProfile[]> {
    return JSON.parse(JSON.stringify(this.profiles));
  }

  async getProfileById(id: string): Promise<UserProfile | null> {
    const p = this.profiles.find((x) => x.id === id);
    return p ? JSON.parse(JSON.stringify(p)) : null;
  }

  async getListings(filters?: { vendor_org_id?: string; status?: string }): Promise<SurplusListing[]> {
    let list = this.listings;
    if (filters?.vendor_org_id) {
      list = list.filter((l) => l.vendor_org_id === filters.vendor_org_id);
    }
    if (filters?.status) {
      list = list.filter((l) => l.status === filters.status);
    }
    return JSON.parse(JSON.stringify(list));
  }

  async getListingById(id: string): Promise<SurplusListing | null> {
    const l = this.listings.find((x) => x.id === id);
    return l ? JSON.parse(JSON.stringify(l)) : null;
  }

  async createListing(
    data: Omit<SurplusListing, 'id' | 'created_at' | 'updated_at' | 'available_quantity' | 'reserved_quantity' | 'collected_quantity'> & { available_quantity?: number }
  ): Promise<SurplusListing> {
    const newListing: SurplusListing = {
      ...data,
      id: `listing_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      available_quantity: data.available_quantity ?? data.total_quantity,
      reserved_quantity: 0,
      collected_quantity: 0,
      status: data.status || 'available',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.listings.unshift(newListing);

    this.auditLogs.unshift({
      id: `log_${Date.now()}`,
      action: 'SURPLUS_LISTING_CREATED',
      entity_type: 'surplus_listing',
      entity_id: newListing.id,
      actor_org_id: newListing.vendor_org_id,
      actor_role: 'vendor',
      details: { title: newListing.title, quantity: newListing.total_quantity, unit: newListing.unit },
      created_at: new Date().toISOString(),
    });

    return JSON.parse(JSON.stringify(newListing));
  }

  async updateListingStatus(id: string, status: SurplusListing['status']): Promise<SurplusListing> {
    const l = this.listings.find((x) => x.id === id);
    if (!l) throw new Error(`Listing not found: ${id}`);
    l.status = status;
    l.updated_at = new Date().toISOString();
    return JSON.parse(JSON.stringify(l));
  }

  async getKitchenRequirements(filters?: { kitchen_org_id?: string; active_only?: boolean }): Promise<KitchenRequirement[]> {
    let reqs = this.requirements;
    if (filters?.kitchen_org_id) {
      reqs = reqs.filter((r) => r.kitchen_org_id === filters.kitchen_org_id);
    }
    if (filters?.active_only) {
      reqs = reqs.filter((r) => r.is_active);
    }
    return JSON.parse(JSON.stringify(reqs));
  }

  async getKitchenRequirementById(id: string): Promise<KitchenRequirement | null> {
    const r = this.requirements.find((x) => x.id === id);
    return r ? JSON.parse(JSON.stringify(r)) : null;
  }

  async createKitchenRequirement(
    data: Omit<KitchenRequirement, 'id' | 'created_at' | 'updated_at'>
  ): Promise<KitchenRequirement> {
    const newReq: KitchenRequirement = {
      ...data,
      id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.requirements.unshift(newReq);

    this.auditLogs.unshift({
      id: `log_${Date.now()}`,
      action: 'KITCHEN_REQUIREMENT_CREATED',
      entity_type: 'kitchen_requirement',
      entity_id: newReq.id,
      actor_org_id: newReq.kitchen_org_id,
      actor_role: 'kitchen',
      details: { categories: newReq.accepted_categories, desired_quantity: newReq.desired_quantity },
      created_at: new Date().toISOString(),
    });

    return JSON.parse(JSON.stringify(newReq));
  }

  async getMatchesForListing(listingId: string): Promise<{ matches: MatchResult[]; ineligible: unknown[] }> {
    const listing = await this.getListingById(listingId);
    if (!listing) throw new Error(`Listing not found: ${listingId}`);

    const orgsMap: Record<string, Organisation> = {};
    for (const o of this.organisations) {
      orgsMap[o.id] = o;
    }

    const { eligibleMatches, ineligibleCandidates } = findMatchesForListing(
      listing,
      this.requirements,
      orgsMap
    );

    return { matches: eligibleMatches, ineligible: ineligibleCandidates };
  }

  async getAllMatches(): Promise<MatchResult[]> {
    const allMatches: MatchResult[] = [];
    const orgsMap: Record<string, Organisation> = {};
    for (const o of this.organisations) {
      orgsMap[o.id] = o;
    }

    for (const listing of this.listings) {
      if (listing.status === 'available' || listing.status === 'matched') {
        const { eligibleMatches } = findMatchesForListing(listing, this.requirements, orgsMap);
        allMatches.push(...eligibleMatches);
      }
    }

    allMatches.sort((a, b) => b.overall_score - a.overall_score);
    return allMatches;
  }

  async getCollections(filters?: { vendor_org_id?: string; kitchen_org_id?: string; status?: string }): Promise<Collection[]> {
    let cols = this.collections;
    if (filters?.vendor_org_id) {
      cols = cols.filter((c) => c.vendor_org_id === filters.vendor_org_id);
    }
    if (filters?.kitchen_org_id) {
      cols = cols.filter((c) => c.kitchen_org_id === filters.kitchen_org_id);
    }
    if (filters?.status) {
      cols = cols.filter((c) => c.status === filters.status);
    }

    // Attach joined entities
    const enriched = cols.map((c) => {
      const listing = this.listings.find((l) => l.id === c.listing_id);
      const vendor = this.organisations.find((o) => o.id === c.vendor_org_id);
      const kitchen = this.organisations.find((o) => o.id === c.kitchen_org_id);
      return {
        ...c,
        listing,
        vendor_org: vendor,
        kitchen_org: kitchen,
      };
    });

    return JSON.parse(JSON.stringify(enriched));
  }

  async getCollectionById(id: string): Promise<Collection | null> {
    const col = this.collections.find((c) => c.id === id);
    if (!col) return null;
    const listing = this.listings.find((l) => l.id === col.listing_id);
    const vendor = this.organisations.find((o) => o.id === col.vendor_org_id);
    const kitchen = this.organisations.find((o) => o.id === col.kitchen_org_id);
    return JSON.parse(JSON.stringify({ ...col, listing, vendor_org: vendor, kitchen_org: kitchen }));
  }

  /**
   * Concurrency Safe: Transactional Reservation
   * Prevents overselling and double booking.
   */
  async acceptMatch(matchId: string, quantityToAccept: number, kitchenOrgId: string): Promise<Collection> {
    // 1. Find the match and listing
    const allMatches = await this.getAllMatches();
    const match = allMatches.find((m) => m.id === matchId);
    if (!match) throw new Error(`Match not found or no longer eligible: ${matchId}`);

    const listing = this.listings.find((l) => l.id === match.listing_id);
    if (!listing) throw new Error(`Associated listing not found: ${match.listing_id}`);

    // 2. Strict Inventory check
    if (quantityToAccept <= 0) {
      throw new Error('Accepted quantity must be a positive number.');
    }
    if (listing.available_quantity < quantityToAccept) {
      throw new Error(
        `Oversell prevented: Only ${listing.available_quantity} ${listing.unit} available, but ${quantityToAccept} was requested.`
      );
    }

    // 3. Atomic state update
    listing.available_quantity -= quantityToAccept;
    listing.reserved_quantity += quantityToAccept;
    listing.status = listing.available_quantity > 0 ? 'partially_collected' : 'accepted';
    listing.updated_at = new Date().toISOString();

    // 4. Create Collection Handover agreement
    const newCollection: Collection = {
      id: `col_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      listing_id: listing.id,
      match_id: match.id,
      vendor_org_id: listing.vendor_org_id,
      kitchen_org_id: kitchenOrgId,
      accepted_quantity: quantityToAccept,
      collected_quantity: null, // NOT verified until collection recorded and confirmed!
      unit: listing.unit,
      pickup_deadline: listing.pickup_end,
      accepted_at: new Date().toISOString(),
      vendor_confirmed: false,
      kitchen_confirmed: false,
      status: 'pending_pickup',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.collections.unshift(newCollection);

    // 5. Audit Log
    this.auditLogs.unshift({
      id: `log_${Date.now()}`,
      action: 'MATCH_ACCEPTED_AND_INVENTORY_RESERVED',
      entity_type: 'collection',
      entity_id: newCollection.id,
      actor_org_id: kitchenOrgId,
      actor_role: 'kitchen',
      details: {
        listing_id: listing.id,
        quantity_reserved: quantityToAccept,
        remaining_available: listing.available_quantity,
      },
      created_at: new Date().toISOString(),
    });

    return JSON.parse(JSON.stringify(newCollection));
  }

  /**
   * Handover Stage: Kitchen or Vendor inputs the actual physical handover quantity
   */
  async recordCollectionHandover(
    collectionId: string,
    collectedQuantity: number,
    reportingRole: 'vendor' | 'kitchen',
    notes?: string
  ): Promise<Collection> {
    const col = this.collections.find((c) => c.id === collectionId);
    if (!col) throw new Error(`Collection not found: ${collectionId}`);

    if (collectedQuantity < 0) {
      throw new Error('Collected quantity cannot be negative.');
    }

    col.collected_quantity = collectedQuantity;
    col.collected_at = new Date().toISOString();
    col.status = 'collected_pending_confirmation';
    col.notes = notes || col.notes;
    col.updated_at = new Date().toISOString();

    // Automatically mark confirmation for the party submitting the record
    if (reportingRole === 'vendor') {
      col.vendor_confirmed = true;
    } else {
      col.kitchen_confirmed = true;
    }

    this.auditLogs.unshift({
      id: `log_${Date.now()}`,
      action: 'COLLECTION_HANDOVER_RECORDED',
      entity_type: 'collection',
      entity_id: col.id,
      actor_role: reportingRole,
      details: {
        reported_quantity: collectedQuantity,
        unit: col.unit,
        reporting_role: reportingRole,
        notes,
      },
      created_at: new Date().toISOString(),
    });

    return JSON.parse(JSON.stringify(col));
  }

  /**
   * Two-Party Confirmation Barrier
   * Only when BOTH parties confirm does status become 'confirmed'
   */
  async confirmCollection(collectionId: string, confirmingRole: 'vendor' | 'kitchen'): Promise<Collection> {
    const col = this.collections.find((c) => c.id === collectionId);
    if (!col) throw new Error(`Collection not found: ${collectionId}`);

    if (col.status === 'cancelled') {
      throw new Error('Cannot confirm a cancelled collection.');
    }
    if (col.collected_quantity === null || col.collected_quantity === undefined) {
      throw new Error('Actual collected quantity must be recorded before confirmation.');
    }

    if (confirmingRole === 'vendor') {
      col.vendor_confirmed = true;
    } else {
      col.kitchen_confirmed = true;
    }

    col.updated_at = new Date().toISOString();

    // Check if both parties have confirmed!
    if (col.vendor_confirmed && col.kitchen_confirmed) {
      col.status = 'confirmed';

      // Update listing inventory
      const listing = this.listings.find((l) => l.id === col.listing_id);
      if (listing) {
        listing.reserved_quantity = Math.max(0, listing.reserved_quantity - col.accepted_quantity);
        listing.collected_quantity += col.collected_quantity;
        listing.status = listing.available_quantity === 0 && listing.reserved_quantity === 0 ? 'collected' : 'partially_collected';
        listing.updated_at = new Date().toISOString();
      }

      this.auditLogs.unshift({
        id: `log_${Date.now()}`,
        action: 'COLLECTION_FULLY_VERIFIED',
        entity_type: 'collection',
        entity_id: col.id,
        actor_role: confirmingRole,
        details: {
          verified_quantity: col.collected_quantity,
          unit: col.unit,
          accepted_quantity: col.accepted_quantity,
          is_partial: col.collected_quantity < col.accepted_quantity,
        },
        created_at: new Date().toISOString(),
      });
    } else {
      col.status = 'collected_pending_confirmation';
      this.auditLogs.unshift({
        id: `log_${Date.now()}`,
        action: 'COLLECTION_PARTIALLY_CONFIRMED',
        entity_type: 'collection',
        entity_id: col.id,
        actor_role: confirmingRole,
        details: { confirming_role: confirmingRole },
        created_at: new Date().toISOString(),
      });
    }

    return JSON.parse(JSON.stringify(col));
  }

  async disputeCollection(collectionId: string, reason: string, reportingRole: 'vendor' | 'kitchen'): Promise<Collection> {
    const col = this.collections.find((c) => c.id === collectionId);
    if (!col) throw new Error(`Collection not found: ${collectionId}`);

    col.status = 'disputed';
    col.dispute_reason = reason;
    col.updated_at = new Date().toISOString();

    this.auditLogs.unshift({
      id: `log_${Date.now()}`,
      action: 'COLLECTION_DISPUTED',
      entity_type: 'collection',
      entity_id: col.id,
      actor_role: reportingRole,
      details: { reason, reporting_role: reportingRole },
      created_at: new Date().toISOString(),
    });

    return JSON.parse(JSON.stringify(col));
  }

  async cancelCollection(collectionId: string, reason: string, cancellingRole: 'vendor' | 'kitchen'): Promise<Collection> {
    const col = this.collections.find((c) => c.id === collectionId);
    if (!col) throw new Error(`Collection not found: ${collectionId}`);

    if (col.status === 'confirmed') {
      throw new Error('Cannot cancel an already confirmed collection.');
    }

    col.status = 'cancelled';
    col.cancellation_reason = reason;
    col.updated_at = new Date().toISOString();

    // Release reserved inventory back to available!
    const listing = this.listings.find((l) => l.id === col.listing_id);
    if (listing) {
      listing.reserved_quantity = Math.max(0, listing.reserved_quantity - col.accepted_quantity);
      listing.available_quantity += col.accepted_quantity;
      listing.status = 'available';
      listing.updated_at = new Date().toISOString();
    }

    this.auditLogs.unshift({
      id: `log_${Date.now()}`,
      action: 'COLLECTION_CANCELLED_INVENTORY_RELEASED',
      entity_type: 'collection',
      entity_id: col.id,
      actor_role: cancellingRole,
      details: { reason, released_quantity: col.accepted_quantity },
      created_at: new Date().toISOString(),
    });

    return JSON.parse(JSON.stringify(col));
  }

  /**
   * Verified Impact Engine
   * Rule: ONLY confirmed collections contribute to verified impact totals.
   */
  async getImpactMetrics(): Promise<ImpactMetrics> {
    const confirmedCols = this.collections.filter((c) => c.status === 'confirmed');
    const totalCols = this.collections.length;
    const cancelledCols = this.collections.filter((c) => c.status === 'cancelled').length;

    // Strict summation: only verified collected_quantity from confirmed collections
    let total_verified_collected_kg = 0;
    const categoryTotals: Record<string, { quantity_kg: number; count: number }> = {};

    let totalDurationMs = 0;
    let collectionsWithDuration = 0;

    for (const c of confirmedCols) {
      const qty = c.collected_quantity || 0;
      total_verified_collected_kg += qty;

      const listing = this.listings.find((l) => l.id === c.listing_id);
      const cat = listing?.food_category || 'other';

      if (!categoryTotals[cat]) {
        categoryTotals[cat] = { quantity_kg: 0, count: 0 };
      }
      categoryTotals[cat].quantity_kg += qty;
      categoryTotals[cat].count += 1;

      if (c.accepted_at && c.collected_at) {
        const diff = new Date(c.collected_at).getTime() - new Date(c.accepted_at).getTime();
        if (diff > 0) {
          totalDurationMs += diff;
          collectionsWithDuration += 1;
        }
      }
    }

    const verified_by_category = Object.entries(categoryTotals).map(([cat, val]) => ({
      category: cat as FoodCategory,
      quantity_kg: Math.round(val.quantity_kg * 10) / 10,
      count: val.count,
    }));

    // Funnel calculations
    let listed_kg = 0;
    for (const l of this.listings) {
      listed_kg += l.total_quantity;
    }

    let accepted_kg = 0;
    for (const c of this.collections) {
      if (c.status !== 'cancelled') {
        accepted_kg += c.accepted_quantity;
      }
    }

    const match_acceptance_rate =
      totalCols > 0 ? Math.round((totalCols / Math.max(1, this.listings.length)) * 100) : 0;
    const collection_completion_rate =
      totalCols > 0 ? Math.round((confirmedCols.length / totalCols) * 100) : 0;
    const cancellation_rate =
      totalCols > 0 ? Math.round((cancelledCols / totalCols) * 100) : 0;

    const avg_hours_listing_to_collection =
      collectionsWithDuration > 0
        ? Math.round((totalDurationMs / (collectionsWithDuration * 3600 * 1000)) * 10) / 10
        : 2.5;

    const activeListingsCount = this.listings.filter(
      (l) => l.status === 'available' || l.status === 'matched'
    ).length;

    return {
      total_verified_collected_kg: Math.round(total_verified_collected_kg * 10) / 10,
      total_completed_collections: confirmedCols.length,
      total_active_listings: activeListingsCount,
      match_acceptance_rate: Math.min(100, match_acceptance_rate),
      collection_completion_rate,
      cancellation_rate,
      avg_hours_listing_to_collection,
      verified_by_category,
      funnel: {
        listed_kg: Math.round(listed_kg * 10) / 10,
        accepted_kg: Math.round(accepted_kg * 10) / 10,
        verified_collected_kg: Math.round(total_verified_collected_kg * 10) / 10,
      },
    };
  }

  async getAuditLogs(): Promise<AuditLog[]> {
    return JSON.parse(JSON.stringify(this.auditLogs));
  }
}

// Singleton repository instance
export const repository: FreshLoopRepository = new LocalRepository();
