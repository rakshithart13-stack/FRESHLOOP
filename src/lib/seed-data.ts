// FreshLoop Benchmark Seed Data
// Reproducible scenario for Hackathon Demo & Acceptance Criteria
// Core Maxim: "A suggested match is not a completed donation. Only the quantity confirmed as collected can contribute to verified impact metrics."

import {
  Organisation,
  UserProfile,
  SurplusListing,
  KitchenRequirement,
  Collection,
  AuditLog,
} from '@/types';

// Anchor times around today's date for realistic display
const today = new Date();
const todayStr = today.toISOString().split('T')[0];

const createIsoTime = (hours: number, minutes: number = 0, dayOffset: number = 0) => {
  const d = new Date(today);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
};

export const INITIAL_ORGANISATIONS: Organisation[] = [
  {
    id: 'org_vendor_greenbistro',
    name: 'GreenBistro Farm Kitchen',
    type: 'vendor',
    contact_name: 'Elena Rostova',
    contact_email: 'elena@greenbistro.demo',
    phone: '+1 (555) 014-8832',
    address: '142 Market Street, Downtown District',
    service_area: 'Downtown',
    lat: 37.7891,
    lng: -122.4014,
    operating_hours: '08:00 - 18:00',
    verified_status: 'verified',
    created_at: createIsoTime(8, 0, -10),
    updated_at: createIsoTime(8, 0, -10),
  },
  {
    id: 'org_kitchen_hope',
    name: 'Hope Community Kitchen',
    type: 'kitchen',
    contact_name: 'Pastor Marcus Vance',
    contact_email: 'marcus@hopekitchen.demo',
    phone: '+1 (555) 018-9941',
    address: '88 Civic Center Plaza',
    service_area: 'Downtown',
    lat: 37.7794,
    lng: -122.4184, // ~2.1 km away
    operating_hours: '09:00 - 17:00',
    verified_status: 'verified',
    created_at: createIsoTime(9, 0, -15),
    updated_at: createIsoTime(9, 0, -15),
  },
  {
    id: 'org_kitchen_sunrise',
    name: 'Sunrise Night Shelter',
    type: 'kitchen',
    contact_name: 'Sarah Chen',
    contact_email: 'sarah@sunriseshelter.demo',
    phone: '+1 (555) 019-3320',
    address: '405 Mission Boulevard',
    service_area: 'Mission',
    lat: 37.7612,
    lng: -122.4199,
    operating_hours: '18:30 - 22:00', // Evening only
    verified_status: 'verified',
    created_at: createIsoTime(10, 0, -8),
    updated_at: createIsoTime(10, 0, -8),
  },
  {
    id: 'org_kitchen_city_youth',
    name: 'City Youth Center & Food Club',
    type: 'kitchen',
    contact_name: 'David Kim',
    contact_email: 'david@cityyouth.demo',
    phone: '+1 (555) 012-7744',
    address: '220 4th Street, SoMa',
    service_area: 'Downtown',
    lat: 37.7825,
    lng: -122.4055,
    operating_hours: '12:00 - 18:00',
    verified_status: 'verified',
    created_at: createIsoTime(11, 0, -12),
    updated_at: createIsoTime(11, 0, -12),
  },
  {
    id: 'org_admin_hexacore',
    name: 'HexaCore FreshLoop Operations',
    type: 'admin',
    contact_name: 'Admin Supervisor',
    contact_email: 'ops@freshloop.demo',
    phone: '+1 (555) 000-0001',
    address: '100 Innovation Way',
    service_area: 'Metro Area',
    operating_hours: '24/7',
    verified_status: 'verified',
    created_at: createIsoTime(0, 0, -30),
    updated_at: createIsoTime(0, 0, -30),
  },
];

export const INITIAL_PROFILES: UserProfile[] = [
  {
    id: 'user_vendor_greenbistro',
    organisation_id: 'org_vendor_greenbistro',
    full_name: 'Elena Rostova (GreenBistro)',
    email: 'elena@greenbistro.demo',
    role: 'vendor',
    created_at: createIsoTime(8, 0, -10),
    updated_at: createIsoTime(8, 0, -10),
  },
  {
    id: 'user_kitchen_hope',
    organisation_id: 'org_kitchen_hope',
    full_name: 'Marcus Vance (Hope Kitchen)',
    email: 'marcus@hopekitchen.demo',
    role: 'kitchen',
    created_at: createIsoTime(9, 0, -15),
    updated_at: createIsoTime(9, 0, -15),
  },
  {
    id: 'user_admin_hexacore',
    organisation_id: 'org_admin_hexacore',
    full_name: 'HexaCore Moderator',
    email: 'ops@freshloop.demo',
    role: 'admin',
    created_at: createIsoTime(0, 0, -30),
    updated_at: createIsoTime(0, 0, -30),
  },
];

// The Primary Demo Listing: 20 kg Vegetables, must pickup before 6:00 PM today
export const INITIAL_LISTINGS: SurplusListing[] = [
  {
    id: 'listing_veg_20kg',
    vendor_org_id: 'org_vendor_greenbistro',
    title: 'Crisp Organic Farm Vegetables (Carrots, Greens, Squash)',
    food_category: 'vegetables',
    description:
      'Surplus harvest from morning farm deliveries. Fresh, washed, and pre-sorted. Ideal for soup kitchens, stews, and side dishes.',
    total_quantity: 20,
    available_quantity: 20,
    reserved_quantity: 0,
    collected_quantity: 0,
    unit: 'kg',
    prepared_at: createIsoTime(11, 30),
    expires_at: createIsoTime(22, 0), // Use-by late tonight
    pickup_start: createIsoTime(14, 0), // 2:00 PM
    pickup_end: createIsoTime(18, 0), // 6:00 PM deadline!
    pickup_address: '142 Market Street, Downtown District (Loading Dock B)',
    lat: 37.7891,
    lng: -122.4014,
    storage_notes: 'Chilled at 4°C. Packed in four reusable 5kg food-grade crates.',
    allergens: 'None (Raw unseasoned produce).',
    status: 'available',
    created_at: createIsoTime(12, 0),
    updated_at: createIsoTime(12, 0),
  },
  {
    id: 'listing_bakery_past',
    vendor_org_id: 'org_vendor_greenbistro',
    title: 'Artisan Whole Wheat Sourdough Loaves',
    food_category: 'bakery',
    description: 'Baked this morning. Surplus from corporate catering luncheon.',
    total_quantity: 15,
    available_quantity: 0,
    reserved_quantity: 0,
    collected_quantity: 15,
    unit: 'kg',
    prepared_at: createIsoTime(6, 0, -1),
    expires_at: createIsoTime(20, 0, -1),
    pickup_start: createIsoTime(15, 0, -1),
    pickup_end: createIsoTime(18, 0, -1),
    pickup_address: '142 Market Street, Downtown District',
    lat: 37.7891,
    lng: -122.4014,
    storage_notes: 'Ambient dry storage. Packaged in sealed food-safe paper bags.',
    allergens: 'Gluten, Wheat. Trace sesame seeds.',
    status: 'collected',
    created_at: createIsoTime(13, 0, -1),
    updated_at: createIsoTime(17, 30, -1),
  },
];

export const INITIAL_KITCHEN_REQUIREMENTS: KitchenRequirement[] = [
  // Kitchen A: Matches GreenBistro!
  {
    id: 'req_kitchen_hope',
    kitchen_org_id: 'org_kitchen_hope',
    accepted_categories: ['vegetables', 'fruit', 'bakery'],
    desired_quantity: 20,
    min_quantity: 10,
    max_quantity: 30,
    unit: 'kg',
    needed_by: createIsoTime(18, 30),
    pickup_start: createIsoTime(13, 0),
    pickup_end: createIsoTime(17, 0), // Can pickup between 1:00 PM and 5:00 PM -> Overlaps with GreenBistro (14:00 - 17:00)!
    service_area: 'Downtown',
    storage_capabilities: 'Walk-in refrigeration (3°C) and pantry shelves.',
    handling_restrictions: 'Staffed collection van available until 5:30 PM.',
    is_active: true,
    created_at: createIsoTime(10, 0, -2),
    updated_at: createIsoTime(10, 0, -2),
  },
  // Kitchen B: Rejection expected: Timing Mismatch (available only after 19:00, vendor closes at 18:00)
  {
    id: 'req_kitchen_sunrise',
    kitchen_org_id: 'org_kitchen_sunrise',
    accepted_categories: ['vegetables', 'prepared_food'],
    desired_quantity: 15,
    min_quantity: 5,
    max_quantity: 20,
    unit: 'kg',
    needed_by: createIsoTime(22, 0),
    pickup_start: createIsoTime(19, 0), // 7:00 PM!
    pickup_end: createIsoTime(21, 0),   // 9:00 PM!
    service_area: 'Mission',
    storage_capabilities: 'Commercial reach-in chillers.',
    handling_restrictions: 'Evening intake volunteer crew only.',
    is_active: true,
    created_at: createIsoTime(11, 0, -1),
    updated_at: createIsoTime(11, 0, -1),
  },
  // Kitchen C: Rejection expected: Incompatible Food Category (accepts Bakery / Dairy, not Vegetables)
  {
    id: 'req_kitchen_city_youth',
    kitchen_org_id: 'org_kitchen_city_youth',
    accepted_categories: ['bakery', 'packaged_food', 'dairy'],
    desired_quantity: 20,
    min_quantity: 10,
    max_quantity: 25,
    unit: 'kg',
    needed_by: createIsoTime(18, 0),
    pickup_start: createIsoTime(14, 0),
    pickup_end: createIsoTime(17, 0),
    service_area: 'Downtown',
    storage_capabilities: 'Dry bakery racks and small reach-in fridge.',
    handling_restrictions: 'After-school snack program requirements.',
    is_active: true,
    created_at: createIsoTime(9, 30, -3),
    updated_at: createIsoTime(9, 30, -3),
  },
];

// One benchmark verified collection from yesterday (15 kg artisan bread)
export const INITIAL_COLLECTIONS: Collection[] = [
  {
    id: 'col_hist_01',
    listing_id: 'listing_bakery_past',
    vendor_org_id: 'org_vendor_greenbistro',
    kitchen_org_id: 'org_kitchen_hope',
    accepted_quantity: 15,
    collected_quantity: 15, // Confirmed 15 kg
    unit: 'kg',
    pickup_deadline: createIsoTime(18, 0, -1),
    accepted_at: createIsoTime(14, 30, -1),
    collected_at: createIsoTime(17, 15, -1),
    vendor_confirmed: true,
    kitchen_confirmed: true,
    status: 'confirmed',
    notes: 'Smooth handover. Distributed to 45 families at evening meal service.',
    created_at: createIsoTime(14, 30, -1),
    updated_at: createIsoTime(17, 20, -1),
  },
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log_01',
    action: 'SEED_INITIALIZATION',
    entity_type: 'system',
    actor_role: 'admin',
    details: { message: 'Initialized FreshLoop with deterministic benchmark scenario.' },
    created_at: createIsoTime(0, 0),
  },
  {
    id: 'log_02',
    action: 'COLLECTION_VERIFIED',
    entity_type: 'collection',
    entity_id: 'col_hist_01',
    actor_org_id: 'org_vendor_greenbistro',
    actor_role: 'vendor',
    details: {
      listing_id: 'listing_bakery_past',
      verified_quantity_kg: 15,
      note: 'Dual confirmation achieved. Added to verified impact.',
    },
    created_at: createIsoTime(17, 20, -1),
  },
];
