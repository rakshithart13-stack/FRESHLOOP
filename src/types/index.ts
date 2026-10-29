// FreshLoop Type Definitions
// Core Maxim: "A suggested match is not a completed donation. Only the quantity confirmed as collected can contribute to verified impact metrics."

export type OrganisationRole = 'vendor' | 'kitchen' | 'admin';

export type VerifiedStatus = 'pending' | 'verified' | 'rejected';

export type FoodCategory =
  | 'vegetables'
  | 'fruit'
  | 'bakery'
  | 'packaged_food'
  | 'prepared_food'
  | 'dairy'
  | 'beverages'
  | 'other';

export type QuantityUnit = 'kg' | 'meals' | 'boxes' | 'litres' | 'portions' | 'units';

export type ListingStatus =
  | 'draft'
  | 'available'
  | 'matched'
  | 'accepted'
  | 'partially_collected'
  | 'collected'
  | 'expired'
  | 'cancelled';

export type CollectionStatus =
  | 'pending_pickup'
  | 'collected_pending_confirmation'
  | 'confirmed'
  | 'disputed'
  | 'cancelled';

export interface Organisation {
  id: string;
  name: string;
  type: OrganisationRole;
  contact_name: string;
  contact_email: string;
  phone?: string;
  address: string;
  service_area?: string;
  lat?: number;
  lng?: number;
  operating_hours?: string;
  verified_status: VerifiedStatus;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  organisation_id: string;
  full_name: string;
  email: string;
  role: OrganisationRole;
  created_at: string;
  updated_at: string;
}

export interface SurplusListing {
  id: string;
  vendor_org_id: string;
  title: string;
  food_category: FoodCategory;
  description?: string;
  total_quantity: number;
  available_quantity: number;
  reserved_quantity: number;
  collected_quantity: number;
  unit: QuantityUnit;
  prepared_at?: string;
  expires_at: string;
  pickup_start: string;
  pickup_end: string;
  pickup_address: string;
  lat?: number;
  lng?: number;
  storage_notes?: string;
  allergens?: string;
  status: ListingStatus;
  created_at: string;
  updated_at: string;
}

export interface KitchenRequirement {
  id: string;
  kitchen_org_id: string;
  accepted_categories: FoodCategory[];
  desired_quantity: number;
  min_quantity: number;
  max_quantity: number;
  unit: QuantityUnit;
  needed_by: string;
  pickup_start: string;
  pickup_end: string;
  service_area?: string;
  storage_capabilities?: string;
  handling_restrictions?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  kitchen_org?: Organisation;
}

export interface MatchScoreBreakdown {
  location_score: number; // 0 - 30
  quantity_score: number; // 0 - 25
  time_score: number;     // 0 - 25
  demand_score: number;   // 0 - 20
}

export interface MatchResult {
  id: string;
  listing_id: string;
  requirement_id: string;
  vendor_org_id: string;
  kitchen_org_id: string;
  overall_score: number; // 0 - 100
  score_breakdown: MatchScoreBreakdown;
  explanations: string[];
  warnings: string[];
  status: 'suggested' | 'accepted' | 'declined' | 'superseded';
  created_at: string;
  updated_at: string;
  // Joined convenience fields
  listing?: SurplusListing;
  kitchen_org?: Organisation;
  vendor_org?: Organisation;
}

export interface IneligibleCandidate {
  requirement: KitchenRequirement;
  kitchen_org?: Organisation;
  rejection_code: string;
  rejection_reason: string;
  rejectionReason?: string;
}

export interface Collection {
  id: string;
  listing_id: string;
  match_id?: string;
  vendor_org_id: string;
  kitchen_org_id: string;
  accepted_quantity: number;
  collected_quantity?: number | null;
  unit: QuantityUnit;
  pickup_deadline: string;
  accepted_at: string;
  collected_at?: string | null;
  vendor_confirmed: boolean;
  kitchen_confirmed: boolean;
  status: CollectionStatus;
  cancellation_reason?: string;
  dispute_reason?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  listing?: SurplusListing;
  vendor_org?: Organisation;
  kitchen_org?: Organisation;
}

export interface AuditLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  actor_org_id?: string;
  actor_role?: string;
  details: Record<string, unknown>;
  created_at: string;
}

export interface ImpactMetrics {
  total_verified_collected_kg: number;
  total_completed_collections: number;
  total_active_listings: number;
  match_acceptance_rate: number; // percentage
  collection_completion_rate: number; // percentage
  cancellation_rate: number; // percentage
  avg_hours_listing_to_collection: number;
  verified_by_category: { category: FoodCategory; quantity_kg: number; count: number }[];
  funnel: {
    listed_kg: number;
    accepted_kg: number;
    verified_collected_kg: number;
  };
}
