# FreshLoop — Surplus Matching & Verified Impact
**Team HexaCore**  
**Tagline**: *Less Waste. More Meals.*  
**Mission**: *Match supply to need. Verify collection. Measure real impact.*

---

## 🌟 The Core Maxim
> **“A suggested match is not a completed donation. Only the quantity confirmed as collected can contribute to verified impact metrics.”**

FreshLoop is an enterprise-grade sustainability web application that bridges food vendors (restaurants, caterers, grocery stores) with community kitchens and shelters. Unlike conventional platforms that claim impact the moment a post is matched, FreshLoop introduces an immutable, physical two-party verification state machine that ensures only verified collected quantities contribute to true impact numbers.

---

## 🚀 Key Features

1. **Deterministic, Explainable Matching Engine**:
   - Zero black-box or non-deterministic LLM hallucination for eligibility.
   - **Gate 1**: Strict eligibility gating (category mismatch, pickup deadline expiration, minimum batch bounds, timing window overlap).
   - **Gate 2**: Transparent 0–100 ranking: Location proximity (30%), Quantity alignment (25%), Pickup window compatibility (25%), Urgency & freshness (20%).
   - **Gate 3**: Natural language explainability audit and confidence warnings.

2. **Concurrency-Safe Atomic Inventory Reservation**:
   - Transactional locks prevent double-booking or overselling between competing kitchens.

3. **Physical Handover & Two-Party Confirmation**:
   - Separate listed, accepted, and actual collected quantities.
   - Supports partial collections (e.g. 20 kg accepted $\rightarrow$ 18 kg confirmed collected).
   - Both vendor and receiving kitchen must confirm before status transitions to `confirmed`.
   - Disputed handovers are automatically held from impact metrics and routed to admin moderation.

4. **Verified Impact Dashboard**:
   - Funnel analytics tracking: **Listed kg $\rightarrow$ Accepted kg $\rightarrow$ Verified Collected kg**.
   - Strict segregation of verified impact from unverified estimates.

5. **Multi-Role RBAC & Interactive Hackathon Demo Bar**:
   - Role-specific experiences for `vendor`, `kitchen`, and `admin`.
   - Sticky top **HexaCore Demo Bar** allows judges to switch roles instantly and reset benchmark data with 1-click.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 15+ (App Router, Server Actions, Route Handlers)
- **Frontend**: React 19, TypeScript (Strict Mode), Tailwind CSS v4, Lucide Icons
- **State & Validation**: Zod, React Hook Form
- **Database & Storage**: PostgreSQL schema with Row Level Security (RLS) on Supabase + High-fidelity Local Demo Store fallback
- **Testing**: Vitest for unit & state machine verification

---

## ⚡ Quick Start & Development Setup

### 1. Prerequisites
- Node.js v18+ or v24+
- `pnpm` (or `npm`)

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
*(Remote Supabase credentials can be plugged into `.env.local`. When left empty, FreshLoop runs in high-fidelity local demo mode).*

### 4. Run Test Suite
```bash
pnpm test
```

### 5. Seed Benchmark Scenario
```bash
pnpm run seed
```

### 6. Start Development Server
```bash
pnpm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 7. Production Build
```bash
pnpm run build
```

---

## 📋 Hackathon 5-Minute Judge Demo Script

1. **Step 1 — The Problem & The Vendor Action**:
   - In Demo Bar, ensure role is `GreenBistro (Vendor)`.
   - Open `/surplus/new`, notice the 20 kg Vegetables listing with 6:00 PM deadline and food-safety checklist.
   - Click **Publish Listing**.

2. **Step 2 — The Explainable Matching Engine**:
   - Open `/surplus/listing_veg_20kg`.
   - View **Hope Community Kitchen** ranked #1 with **94% match score** (Location 28/30, Quantity 25/25, Time 23/25, Urgency 18/20).
   - Click **Filtered Out Candidates**:
     - See **Sunrise Shelter** rejected with `TIMING_WINDOW_MISMATCH` (needs pickup after 7:00 PM, vendor closes at 6:00 PM).
     - See **City Youth Center** rejected with `CATEGORY_MISMATCH` (accepts Bakery only).

3. **Step 3 — Acceptance & Inventory Lock**:
   - Switch role to `Hope Community Kitchen`.
   - Click **Accept Match & Reserve (20 kg)**.
   - Available quantity instantly drops to 0 kg; reserved quantity becomes 20 kg.

4. **Step 4 — Handover & Two-Party Confirmation**:
   - Navigate to `/collections`.
   - Input actual collection weight: **18 kg** (2 kg wilted produce discarded).
   - Click **Confirm as KITCHEN**.
   - Switch role to `GreenBistro (Vendor)` and click **Confirm as VENDOR**.
   - Status updates to `Confirmed`.

5. **Step 5 — Verified Impact Check**:
   - Navigate to `/impact`.
   - Notice Verified Collected increased by **exactly 18 kg** (not 20 kg!).
   - Review Funnel: 35 kg Listed $\rightarrow$ 35 kg Accepted $\rightarrow$ 33 kg Verified.

---

## 📚 Architectural Documentation

- **[System Architecture](file:///c:/Users/raksh/OneDrive/Desktop/FRESHLOOP/docs/ARCHITECTURE.md)**: Layered architecture, state machine, and data flow.
- **[Database & RLS Policies](file:///c:/Users/raksh/OneDrive/Desktop/FRESHLOOP/docs/DATABASE.md)**: Tables, relational keys, RLS security policies, and constraints.
- **[Matching Engine Specification](file:///c:/Users/raksh/OneDrive/Desktop/FRESHLOOP/docs/MATCHING.md)**: Eligibility gating, mathematical weight scoring, and fallback heuristics.
- **[Demo Walkthrough Guide](file:///c:/Users/raksh/OneDrive/Desktop/FRESHLOOP/docs/DEMO.md)**: Step-by-step presentation script and reset procedures.
- **[Security & Privacy](file:///c:/Users/raksh/OneDrive/Desktop/FRESHLOOP/docs/SECURITY.md)**: Role-based authorization, data minimisation, and checklist.
- **[Product Roadmap](file:///c:/Users/raksh/OneDrive/Desktop/FRESHLOOP/docs/ROADMAP.md)**: Future phases (PostGIS routing, automated SMS alerts, tax receipting).

---

## 👥 Team HexaCore
- Built for the 2026 Sustainability & Food Security Hackathon.
- *Less Waste. More Meals.*
