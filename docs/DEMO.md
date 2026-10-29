# FreshLoop — 5-Minute Hackathon Demonstration Script & Guide
**Team**: HexaCore  
**Product**: FreshLoop Surplus Matching  
**Scenario**: The 20 kg Vegetable Rescue & Partial Collection Proof

---

## 1. Demo Objectives
Demonstrate the end-to-end operational flow of FreshLoop in under 5 minutes:
1. Vendor lists 20 kg of fresh vegetables with a 6:00 PM deadline.
2. The deterministic matching engine evaluates three candidate kitchens:
   - **Kitchen A (Hope Community Kitchen)**: Needs 15–20 kg, collects by 5:00 PM $\rightarrow$ **MATCH! (Score: 94%)**.
   - **Kitchen B (Sunrise Shelter)**: Requests vegetables, but available only after 7:00 PM $\rightarrow$ **REJECTED (TIMING_MISMATCH)**.
   - **Kitchen C (City Youth Center)**: Compatible pickup window, but only accepts Bakery/Dairy $\rightarrow$ **REJECTED (CATEGORY_MISMATCH)**.
3. Kitchen A reviews the transparent match explanation and accepts.
4. Transactional quantity reservation prevents double-booking.
5. In-person handover simulation: Upon inspection, 2 kg are wilted; actual collected quantity is **18 kg**.
6. Two-party confirmation: Both Vendor and Kitchen confirm 18 kg.
7. **Verified Impact Check**: The Verified Impact totals increase by **exactly 18 kg**, proving the core principle:
   > *“A suggested match is not a completed donation. Only the quantity confirmed as collected can contribute to verified impact metrics.”*

---

## 2. Interactive Role Switcher & Demo Control Bar
At the top of the FreshLoop UI, an interactive **Demo Control Bar** is available:
- **Switch Role**:
  - `GreenBistro Vendor`
  - `Hope Community Kitchen`
  - `Platform Admin`
- **Reset Demo Data Button**: Instantly reverts the database to the clean benchmark state for reproducible presentations.
- **Run Benchmark Match**: Forces an instant recalculation of all candidate matches with timing indicators.

---

## 3. Step-by-Step Script for Judges

### Minute 0:00 – 1:00 | The Problem & The Vendor Action
- **Narrative**: *"Every evening, commercial kitchens discard tons of high-grade surplus because coordination is too slow and chaotic. Meet GreenBistro."*
- **Action**:
  - Log in / select `GreenBistro (Vendor)` role.
  - Navigate to `/surplus/new`.
  - Enter:
    - Title: `"Crisp Organic Farm Vegetables"`
    - Category: `Vegetables`
    - Quantity: `20 kg`
    - Pickup Window: `Today 2:00 PM - 6:00 PM`
    - Safe Handling Notes: `"Chilled at 4°C, washed, packaged in 5kg crates."`
  - Click **"Publish Listing"**.
  - Show the newly active listing with countdown warning to 6:00 PM deadline.

### Minute 1:00 – 2:30 | The Explainable Matching Engine
- **Narrative**: *"Unlike black-box AI that hallucinate matches, FreshLoop uses a deterministic, rule-based matching engine with explainable scoring."*
- **Action**:
  - Click on the listing or navigate to `/matches`.
  - Point out **Kitchen A (Hope Community Kitchen)** ranked #1 with **94% score**:
    - Show breakdown: Location (28/30), Quantity (25/25), Pickup Window (23/25), Urgency (18/20).
    - Expand explainability pills: *"Category matched: Vegetables"*, *"Optimal batch size: 20 kg meets demand"*, *"Pickup window overlaps by 3h"*.
  - Point out the **Filtered Out / Ineligible Candidates tab**:
    - **Sunrise Shelter**: Tagged with red badge *"Rejected: Pickup window closed (needs after 7:00 PM, vendor closes 6:00 PM)"*.
    - **City Youth Center**: Tagged with red badge *"Rejected: Incompatible category (Kitchen accepts Bakery only)"*.

### Minute 2:30 – 3:30 | Acceptance & Concurrency Lock
- **Action**:
  - Switch role to `Hope Community Kitchen`.
  - Click **"Accept Match"**.
  - Observe instant state transition: Listing status moves to `accepted`, Available Quantity updates to `0 kg`, Reserved Quantity becomes `20 kg`.
  - Show that Sunrise Shelter can no longer claim this inventory.

### Minute 3:30 – 4:30 | Handover & Two-Party Collection Verification
- **Narrative**: *"Here is where most platforms fail: they claim impact at match time. FreshLoop enforces physical handover accountability."*
- **Action**:
  - Navigate to `/collections`.
  - Open collection agreement.
  - Kitchen reports actual collection: Enter **`18 kg`** (with note: *"2 kg bruised lettuce discarded at pickup"*).
  - Kitchen clicks **"Confirm Handover (Kitchen)"**.
  - Switch to `GreenBistro (Vendor)` and click **"Confirm Handover (Vendor)"**.
  - Status updates to **`Confirmed Collection`**.

### Minute 4:30 – 5:00 | Verified Impact Dashboard
- **Action**:
  - Navigate to `/impact`.
  - Highlight the KPI cards:
    - **Verified Quantity Collected**: Shows **18 kg** (clearly distinct from 20 kg listed).
    - **Listed vs Collected Funnel**: 20 kg Listed $\rightarrow$ 20 kg Accepted $\rightarrow$ 18 kg Verified.
    - Zero double-counting.
  - Show exportable audit log entry.
- **Closing**: *"FreshLoop turns surplus waste into verified nutrition with 100% accountability."*

---

## 4. Resetting the Demo
To reset the demonstration to pristine state at any point, click the **"Reset Demo Data"** button in the header bar or run:
```bash
npm run seed
```
