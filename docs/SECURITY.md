# FreshLoop — Security & Access Control Architecture
**Team**: HexaCore  
**Scope**: Authentication, Authorization, RLS, Input Validation, and Data Privacy

---

## 1. Authentication & Role-Based Access Control (RBAC)

### 1.1 Roles
FreshLoop supports three explicit roles:
1. `vendor`: Food donors (restaurants, caterers, groceries, bakeries). Permitted to create, view, edit, and cancel their own surplus listings, and confirm handovers for collections involving their surplus.
2. `kitchen`: Receiving community kitchens, shelters, and food banks. Permitted to configure food requirements, browse eligible matches, accept matches, and confirm handovers.
3. `admin`: Platform operational coordinators and moderators. Permitted to review organisation verifications, moderate flagged listings, resolve collection disputes, and inspect audit logs.

### 1.2 Principle of Least Privilege
- **No Client Privilege Escalation**: A user's role is stored in the server-governed `profiles` table and verified through JWT claims and server-side session lookup. Users cannot escalate their role by tampering with frontend state, localStorage, or API parameters.
- **Service-Role Key Protection**: The Supabase service-role secret is strictly restricted to server-side Route Handlers / Server Actions and is never embedded in client bundles or public environment variables.

---

## 2. Row Level Security (RLS) Implementation

All database tables have RLS enabled. Even if an attacker crafts malicious SQL queries or direct API requests:
- Vendors can NEVER view drafts or edit listings belonging to another vendor (`vendor_org_id = auth_user_org_id()`).
- Kitchens can NEVER edit another kitchen's requirements or accept matches reserved for another kitchen.
- Collections can only be updated/confirmed by the specific `vendor_org_id` and `kitchen_org_id` assigned to that collection.

---

## 3. Data Privacy & Minimisation

- **Personal Information**: Only business contact details (organisation name, designated contact name, work email, business phone) are collected. No sensitive personal consumer data is gathered.
- **Physical Addresses & Geolocation**: In public demo mode, all physical addresses are simulated anonymised commercial districts (e.g., "120 Market Street, Central City"). No private residential addresses are ever stored or exposed.

---

## 4. Input Validation & Safe Handover Rules

- **Zod Schemas**: Every client submission and server route handler strictly validates all types, numeric ranges (positive quantities, min <= max), date formats, and allowed enum values before execution.
- **Food Safety Reminder**: FreshLoop explicitly presents clear food safety reminders: *FreshLoop facilitates coordination; donors and recipients remain legally and operationally responsible for verifying compliance with applicable food safety standards, temperature controls, and allergen labeling.*

---

## 5. Security Checklist & Known Limitations

- [x] Zero hardcoded API keys or service role secrets in code or repository.
- [x] Parameterised queries and ORM methods used to prevent SQL injection.
- [x] RLS policies applied to all exposed tables.
- [x] CSRF protection enforced through Next.js server actions / route handler headers.
- [x] Rate limiting configured on sensitive authentication and collection confirmation endpoints.
- [!] *MVP Limitation*: For local zero-config hackathon execution, an in-memory/file-backed secure repository runs when remote Supabase credentials are not provided. When remote Supabase is configured in `.env.local`, the app seamlessly connects to hosted Supabase PostgreSQL.
