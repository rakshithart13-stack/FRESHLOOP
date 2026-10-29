# FreshLoop — Full System Architecture
**Team**: HexaCore  
**Product**: FreshLoop Surplus Matching  
**Tagline**: *Less Waste. More Meals.*  
**Supporting Message**: *Match supply to need. Verify collection. Measure real impact.*

---

## 1. System Overview & Core Philosophy

FreshLoop is an end-to-end surplus food redistribution platform engineered for trust, accountability, and operational reliability. 

### The Core Maxim
> **"A suggested match is not a completed donation. Only the quantity confirmed as collected can contribute to verified impact metrics."**

Unlike traditional donation boards that log impact at the moment an offer is listed or matched, FreshLoop introduces a physical verification state machine where impact numbers are generated solely from confirmed post-handover records.

```
       ┌────────────────────────┐
       │   Food Vendor Lists    │
       │   Surplus (20 kg)      │
       └───────────┬────────────┘
                   │
                   ▼
       ┌────────────────────────┐
       │ Deterministic Matching │
       │ Engine (Rules + Wt)    │
       └───────────┬────────────┘
                   │
                   ▼
       ┌────────────────────────┐
       │  Ranked & Explained    │
       │  Candidate Matches     │
       └───────────┬────────────┘
                   │
                   ▼
       ┌────────────────────────┐
       │ Kitchen Accepts Match  │
       │ Inventory Reserved     │
       └───────────┬────────────┘
                   │
                   ▼
       ┌────────────────────────┐
       │ Physical Handover      │
       │ Actual Qty Reported    │
       └───────────┬────────────┘
                   │
                   ▼
       ┌────────────────────────┐
       │ Dual-Party Confirmation│
       │ (Vendor + Kitchen)     │
       └───────────┬────────────┘
                   │
                   ▼
       ┌────────────────────────┐
       │ Verified Impact Engine │
       │ (Only confirmed kg)    │
       └────────────────────────┘
```

---

## 2. Component Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                          PRESENTATION LAYER                            │
│  Next.js 15 App Router | React 19 | Tailwind CSS | Lucide Icons        │
│                                                                        │
│  Public Routes:                                                        │
│  - /                     (Brand landing page, impact preview, CTAs)   │
│  - /how-it-works         (Transparent workflow walkthrough)           │
│  - /login & /register    (Supabase auth / Quick demo switcher)        │
│                                                                        │
│  Authenticated Routes:                                                 │
│  - /dashboard            (Role-customized live overview & tasks)       │
│  - /surplus & /surplus/* (Vendor surplus publishing & management)     │
│  - /kitchens             (Community kitchen demand specifications)     │
│  - /matches              (Explainable ranking, scores & acceptances)   │
│  - /collections          (Handover status & two-party confirmation)    │
│  - /impact               (Verified metrics, KPIs, audit log views)     │
│  - /profile              (Organisation verification & settings)        │
│                                                                        │
│  Administrative Routes:                                                │
│  - /admin                (Platform moderation, disputes & audit trail) │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                          APPLICATION LAYER                             │
│                                                                        │
│  Deterministic Matching Engine:                                        │
│  - Hard Eligibility Filter (Category, Timing, Quantity bounds)         │
│  - Transparent Weighted Scorer (Location 30%, Qty 25%, Time 25%, Urg)  │
│  - Natural Language Reason Generator & Warning Modifiers               │
│                                                                        │
│  State Machine & Inventory Manager:                                    │
│  - Atomic reservation lock (prevents double-booking / overselling)     │
│  - Two-party collection confirmation barrier                           │
│  - Partial collection reconciler                                       │
│                                                                        │
│  Verified Impact Engine:                                               │
│  - Strict segregation: Listed != Accepted != Collected                │
│  - Grouping by compatible physical units                               │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                            DATA LAYER                                  │
│                                                                        │
│  Production: Supabase Hosted PostgreSQL + Row Level Security (RLS)     │
│  Development / Demo Fallback: File-backed atomic relational store with  │
│  identical schemas, constraints, and audit logging                     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack Rationale

| Layer | Technology | Decision Rationale |
| :--- | :--- | :--- |
| **Framework** | Next.js 15 (App Router) | Unified SSR, Server Actions, API routes, fast client transitions. |
| **Language** | TypeScript (Strict) | Compile-time safety for critical state transitions and quantities. |
| **Styling** | Tailwind CSS v4 | Rapid design system execution with bespoke sustainability palette. |
| **Validation** | Zod + React Hook Form | Type-safe form validation matching server-side database constraints. |
| **Database** | PostgreSQL / Supabase | ACID transactions, foreign keys, row locking, and Row Level Security. |
| **Testing** | Vitest + React Testing Lib | Fast in-memory unit tests for matching rules and state transitions. |

---

## 4. State Transitions & Invariant Guarantees

```
[ draft ]
   │  publish
   ▼
[ available ] ────────┐
   │  match found      │  cancel
   ▼                   ▼
[ matched ]        [ cancelled ]
   │  accept
   ▼
[ accepted ]
   │  handover recorded
   ▼
[ collected_pending_confirmation ]
   │  vendor & kitchen confirm
   ▼
[ confirmed ] (verified impact logged)
   │
   └──► [ disputed ] (flagged for admin review if numbers conflict)
```

### Critical Invariants:
1. **No Overselling**: $\text{Available Quantity} + \text{Reserved Quantity} + \text{Collected Quantity} = \text{Total Quantity}$.
2. **Zero Unconfirmed Impact**: $\text{Verified Impact} = \sum_{\text{confirmed collections}} \text{collected\_quantity}$. Any collection in `pending_pickup`, `collected_pending_confirmation`, or `cancelled` contributes exactly **0.00**.
