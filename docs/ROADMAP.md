# FreshLoop — Product & Technical Roadmap
**Team**: HexaCore  
**Product**: FreshLoop Surplus Matching  

---

## 1. MVP (Delivered in this Hackathon)
- [x] Responsive Next.js 15 web application with custom sustainability design system.
- [x] Dual-mode data layer: Hosted Supabase PostgreSQL + zero-config local demo fallback.
- [x] Role-Based Access Control (`vendor`, `kitchen`, `admin`) and organisation management.
- [x] Surplus Listing creation with category, storage instructions, expiry warnings, and pickup windows.
- [x] Kitchen Requirements creation with category preferences, desired batch volumes, and operating hours.
- [x] Server-side deterministic explainable matching engine with transparent scoring (0-100) and clear rejection explanations.
- [x] Atomic quantity reservation preventing overselling or race conditions between multiple kitchens.
- [x] Two-party collection confirmation workflow with partial collection support (e.g. 20 kg listed $\rightarrow$ 18 kg collected).
- [x] Verified Impact Dashboard computing true impact solely from confirmed handovers.
- [x] Admin moderation dashboard for listings, organisations, and collection audits.
- [x] Seed data script and instant demo reset bar for 5-minute judge demonstration.
- [x] Vitest test suite verifying matching engine rules, rejection logic, and impact calculations.

---

## 2. Phase 2 (Near-Term Scaling: 3–6 Months)
1. **PostGIS Geolocation & Dynamic Routing**:
   - Transition from Haversine coordinates / service-area strings to PostGIS spatial queries (`ST_DWithin`, `ST_Distance`).
   - Integrate OpenStreetMap / Valhalla routing to compute true driving travel time for refrigerated vans rather than Euclidean distance.
2. **Automated Notification Dispatch**:
   - In-app notification center (WebSocket / Supabase Realtime).
   - Automated SMS / WhatsApp alerts via Twilio for emergency surplus expirations (<2 hours remaining).
3. **Recurring Surplus Schedules**:
   - Allow bakeries and supermarkets to set weekly recurring surplus distributions (e.g., "Every Tuesday & Friday at 8:00 PM").
4. **Cold Chain & Temperature Logging**:
   - Verification checklist for perishable goods requiring active refrigeration during transit ($< 5^\circ\text{C}$).

---

## 3. Phase 3 (Ecosystem & Institutional Partnerships: 6–12 Months)
1. **Donor Tax Invoicing & Regulatory Compliance**:
   - Automated generation of Good Samaritan Food Donation Act tax credit receipts upon verified dual confirmation.
2. **Logistics & Volunteer Driver Network**:
   - A third role (`courier` / `volunteer driver`) for kitchens without transport capacity, enabling crowd-sourced pickups.
3. **ERP & POS Integrations**:
   - Webhook integrations with inventory management systems (Toast POS, Square, Revel) to auto-list surplus at end of shift.
4. **Predictive Surplus Forecasting**:
   - Anonymized historical time-series modeling to suggest anticipated surpluses to community kitchens 24 hours in advance.
