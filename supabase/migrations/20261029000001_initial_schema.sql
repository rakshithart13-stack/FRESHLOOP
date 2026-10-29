-- FreshLoop Database Schema Migration
-- Team: HexaCore
-- Core Principle: "A suggested match is not a completed donation. Only the quantity confirmed as collected can contribute to verified impact metrics."

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ORGANISATIONS TABLE
CREATE TABLE IF NOT EXISTS organisations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('vendor', 'kitchen', 'admin')),
    contact_name TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    phone TEXT,
    address TEXT NOT NULL,
    service_area TEXT,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    operating_hours TEXT,
    verified_status TEXT NOT NULL DEFAULT 'pending' CHECK (verified_status IN ('pending', 'verified', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. USER PROFILES TABLE (Supabase Auth reference)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organisation_id UUID REFERENCES organisations(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('vendor', 'kitchen', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. SURPLUS LISTINGS
CREATE TABLE IF NOT EXISTS surplus_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_org_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    food_category TEXT NOT NULL CHECK (food_category IN ('vegetables', 'fruit', 'bakery', 'packaged_food', 'prepared_food', 'dairy', 'beverages', 'other')),
    description TEXT,
    total_quantity NUMERIC(10, 2) NOT NULL CHECK (total_quantity > 0),
    available_quantity NUMERIC(10, 2) NOT NULL CHECK (available_quantity >= 0),
    reserved_quantity NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
    collected_quantity NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (collected_quantity >= 0),
    unit TEXT NOT NULL CHECK (unit IN ('kg', 'meals', 'boxes', 'litres', 'portions', 'units')),
    prepared_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL,
    pickup_start TIMESTAMPTZ NOT NULL,
    pickup_end TIMESTAMPTZ NOT NULL,
    pickup_address TEXT NOT NULL,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    storage_notes TEXT,
    allergens TEXT,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('draft', 'available', 'matched', 'accepted', 'partially_collected', 'collected', 'expired', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT valid_pickup_window CHECK (pickup_start <= pickup_end),
    CONSTRAINT valid_quantity_balance CHECK (available_quantity + reserved_quantity + collected_quantity = total_quantity)
);

-- 4. KITCHEN REQUIREMENTS
CREATE TABLE IF NOT EXISTS kitchen_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kitchen_org_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    accepted_categories TEXT[] NOT NULL,
    desired_quantity NUMERIC(10, 2) NOT NULL CHECK (desired_quantity > 0),
    min_quantity NUMERIC(10, 2) NOT NULL DEFAULT 1 CHECK (min_quantity > 0),
    max_quantity NUMERIC(10, 2) NOT NULL CHECK (max_quantity >= min_quantity),
    unit TEXT NOT NULL CHECK (unit IN ('kg', 'meals', 'boxes', 'litres', 'portions', 'units')),
    needed_by TIMESTAMPTZ NOT NULL,
    pickup_start TIMESTAMPTZ NOT NULL,
    pickup_end TIMESTAMPTZ NOT NULL,
    service_area TEXT,
    storage_capabilities TEXT,
    handling_restrictions TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT valid_kitchen_pickup_window CHECK (pickup_start <= pickup_end)
);

-- 5. MATCHES
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES surplus_listings(id) ON DELETE CASCADE,
    requirement_id UUID NOT NULL REFERENCES kitchen_requirements(id) ON DELETE CASCADE,
    vendor_org_id UUID NOT NULL REFERENCES organisations(id),
    kitchen_org_id UUID NOT NULL REFERENCES organisations(id),
    overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
    location_score INTEGER NOT NULL,
    quantity_score INTEGER NOT NULL,
    time_score INTEGER NOT NULL,
    demand_score INTEGER NOT NULL,
    explanations JSONB NOT NULL DEFAULT '[]'::jsonb,
    warnings JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'suggested' CHECK (status IN ('suggested', 'accepted', 'declined', 'superseded')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_listing_requirement_match UNIQUE (listing_id, requirement_id)
);

-- 6. COLLECTIONS
CREATE TABLE IF NOT EXISTS collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES surplus_listings(id) ON DELETE CASCADE,
    match_id UUID REFERENCES matches(id) ON DELETE SET NULL,
    vendor_org_id UUID NOT NULL REFERENCES organisations(id),
    kitchen_org_id UUID NOT NULL REFERENCES organisations(id),
    accepted_quantity NUMERIC(10, 2) NOT NULL CHECK (accepted_quantity > 0),
    collected_quantity NUMERIC(10, 2) CHECK (collected_quantity IS NULL OR collected_quantity >= 0),
    unit TEXT NOT NULL,
    pickup_deadline TIMESTAMPTZ NOT NULL,
    accepted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    collected_at TIMESTAMPTZ,
    vendor_confirmed BOOLEAN NOT NULL DEFAULT false,
    kitchen_confirmed BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL DEFAULT 'pending_pickup' CHECK (status IN ('pending_pickup', 'collected_pending_confirmation', 'confirmed', 'disputed', 'cancelled')),
    cancellation_reason TEXT,
    dispute_reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    actor_org_id UUID REFERENCES organisations(id),
    actor_role TEXT,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_listings_vendor ON surplus_listings(vendor_org_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON surplus_listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_category ON surplus_listings(food_category);
CREATE INDEX IF NOT EXISTS idx_requirements_kitchen ON kitchen_requirements(kitchen_org_id);
CREATE INDEX IF NOT EXISTS idx_requirements_active ON kitchen_requirements(is_active);
CREATE INDEX IF NOT EXISTS idx_matches_listing ON matches(listing_id);
CREATE INDEX IF NOT EXISTS idx_matches_requirement ON matches(requirement_id);
CREATE INDEX IF NOT EXISTS idx_collections_listing ON collections(listing_id);
CREATE INDEX IF NOT EXISTS idx_collections_status ON collections(status);
CREATE INDEX IF NOT EXISTS idx_collections_vendor ON collections(vendor_org_id);
CREATE INDEX IF NOT EXISTS idx_collections_kitchen ON collections(kitchen_org_id);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE surplus_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE kitchen_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: get user's org id
CREATE OR REPLACE FUNCTION auth_user_org_id()
RETURNS UUID AS $$
  SELECT organisation_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper function: get user's role
CREATE OR REPLACE FUNCTION auth_user_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Organisations: anyone authenticated can read verified organisations; users can read their own; admins can read all
CREATE POLICY "Public read verified organisations" ON organisations
  FOR SELECT USING (verified_status = 'verified' OR id = auth_user_org_id() OR auth_user_role() = 'admin');

CREATE POLICY "Admins manage organisations" ON organisations
  FOR ALL USING (auth_user_role() = 'admin');

-- Profiles: users read and update their own profile
CREATE POLICY "Users read own profile" ON profiles
  FOR SELECT USING (id = auth.uid() OR auth_user_role() = 'admin');

CREATE POLICY "Users update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- Listings: Vendors can manage only their own listings; all authenticated users can read available listings
CREATE POLICY "Read available listings" ON surplus_listings
  FOR SELECT USING (status != 'draft' OR vendor_org_id = auth_user_org_id() OR auth_user_role() = 'admin');

CREATE POLICY "Vendors manage own listings" ON surplus_listings
  FOR ALL USING (vendor_org_id = auth_user_org_id() AND auth_user_role() = 'vendor');

CREATE POLICY "Admins manage listings" ON surplus_listings
  FOR ALL USING (auth_user_role() = 'admin');

-- Kitchen Requirements: Kitchens manage only their own requirements; vendors/admins can read active
CREATE POLICY "Read active kitchen requirements" ON kitchen_requirements
  FOR SELECT USING (is_active = true OR kitchen_org_id = auth_user_org_id() OR auth_user_role() = 'admin');

CREATE POLICY "Kitchens manage own requirements" ON kitchen_requirements
  FOR ALL USING (kitchen_org_id = auth_user_org_id() AND auth_user_role() = 'kitchen');

-- Matches: Parties involved can read and update
CREATE POLICY "Parties read matches" ON matches
  FOR SELECT USING (vendor_org_id = auth_user_org_id() OR kitchen_org_id = auth_user_org_id() OR auth_user_role() = 'admin');

CREATE POLICY "Kitchens accept matches" ON matches
  FOR UPDATE USING (kitchen_org_id = auth_user_org_id() OR auth_user_role() = 'admin');

-- Collections: Only participants can read and update their collections
CREATE POLICY "Participants read collections" ON collections
  FOR SELECT USING (vendor_org_id = auth_user_org_id() OR kitchen_org_id = auth_user_org_id() OR auth_user_role() = 'admin');

CREATE POLICY "Participants update collections" ON collections
  FOR UPDATE USING (vendor_org_id = auth_user_org_id() OR kitchen_org_id = auth_user_org_id() OR auth_user_role() = 'admin');

CREATE POLICY "Admins manage collections" ON collections
  FOR ALL USING (auth_user_role() = 'admin');

-- Audit logs: Read by admins only
CREATE POLICY "Admins read audit logs" ON audit_logs
  FOR SELECT USING (auth_user_role() = 'admin');
