# FreshLoop — Explainable Matching Engine Specification
**Team**: HexaCore  
**Design Paradigm**: Deterministic, Rule-Based, Transparent, Auditable

---

## 1. Core Principles

1. **Deterministic Execution**: The algorithm is 100% reproducible and server-side. No black-box or non-deterministic LLM hallucination is used for eligibility or score calculation.
2. **Strict Eligibility Filter (Gate 1)**: Any hard incompatibility (expired deadline, mismatched food category, insufficient quantity, zero overlapping pickup window) results in an immediate rejection with explicit, documented reasons.
3. **Calibrated Weighted Scoring (Gate 2)**: Eligible candidates are assigned a transparent score from **0 to 100 points**.
4. **Transparent Explainability (Gate 3)**: Every match output includes an array of human-readable explanations (positive factors) and warnings (penalties or missing optional fields).

---

## 2. Gate 1: Hard Eligibility Filters

A candidate pair `(Listing L, Kitchen Requirement K)` is rejected immediately if any of the following conditions hold:

| Filter | Rule | Rejection Code & Explanation |
| :--- | :--- | :--- |
| **Listing Status** | `L.status` is not in `['available', 'matched']` or `L.available_quantity <= 0` | `LISTING_UNAVAILABLE`: Listing is cancelled, expired, or fully reserved. |
| **Kitchen Active** | `K.is_active != true` | `REQUIREMENT_INACTIVE`: Kitchen requirement is currently paused or fulfilled. |
| **Category Compatibility** | `L.food_category` NOT IN `K.accepted_categories` | `CATEGORY_MISMATCH`: The kitchen does not accept the food category (`L.food_category`). |
| **Quantity Bounds** | `L.available_quantity < K.min_quantity` OR `L.unit != K.unit` (without conversion) | `QUANTITY_INCOMPATIBLE`: Available quantity is below the kitchen's minimum batch threshold. |
| **Pickup Window Expiry** | `NOW() > L.pickup_end` OR `NOW() > L.expires_at` | `EXPIRED`: The pickup deadline or food expiry timestamp has already passed. |
| **Pickup Window Overlap** | `MAX(L.pickup_start, K.pickup_start) >= MIN(L.pickup_end, K.pickup_end)` | `TIMING_MISMATCH`: No overlapping pickup window between vendor availability and kitchen operating hours. |
| **Deadline Compatibility** | `L.pickup_start > K.needed_by` | `PAST_KITCHEN_DEADLINE`: Food cannot be collected before the kitchen's needed-by deadline. |

---

## 3. Gate 2: Weighted Ranking Formula (0–100)

If a candidate passes all Gate 1 filters, a composite score is computed:

$$\text{Overall Score} = S_{\text{location}} + S_{\text{quantity}} + S_{\text{time}} + S_{\text{urgency}}$$

### 3.1 Location Fit ($S_{\text{location}}$, Max 30 pts)
- **Exact Coordinates Available**: Haversine distance $D$ (in km):
  - $D \le 3\text{ km}$: **30 pts**
  - $3\text{ km} < D \le 10\text{ km}$: $30 - (D - 3) \times 2.5$ pts
  - $10\text{ km} < D \le 25\text{ km}$: **10 pts**
  - $D > 25\text{ km}$: **5 pts**
- **Coordinates Missing (Service Area Fallback)**:
  - Exact service area string match (e.g., both "Downtown"): **24 pts** (with note: *Service area matched; exact coordinates not provided*).
  - Cross-neighborhood service area: **15 pts**.

### 3.2 Quantity Fit ($S_{\text{quantity}}$, Max 25 pts)
Measures how closely the available surplus satisfies the kitchen's desired demand without overwhelming capacity.
$$\text{Ratio} = \frac{\min(L.\text{available\_quantity}, K.\text{max\_quantity})}{K.\text{desired\_quantity}}$$
- If $\text{Ratio} \in [0.9, 1.1]$: **25 pts** (Perfect batch size)
- If $\text{Ratio} \in [0.6, 0.9)$: **20 pts**
- If $\text{Ratio} > 1.1$: $\max(12, 25 - (\text{Ratio} - 1.1) \times 15)$ pts (Excess capacity penalty)
- If $\text{Ratio} < 0.6$: $\max(8, \text{Ratio} \times 30)$ pts (Partial batch)

### 3.3 Pickup Window Compatibility ($S_{\text{time}}$, Max 25 pts)
$$\text{Overlap Duration} = \min(L.\text{pickup\_end}, K.\text{pickup\_end}) - \max(L.\text{pickup\_start}, K.\text{pickup\_start})$$
- Overlap $\ge 3$ hours: **25 pts** (Ample collection buffer)
- Overlap $\in [1, 3)$ hours: **18 pts**
- Overlap $< 1$ hour: **10 pts** (Tight collection window warning added)

### 3.4 Demand Urgency & Freshness ($S_{\text{urgency}}$, Max 20 pts)
$$\text{Hours Until Expiry} = \frac{L.\text{expires\_at} - \text{NOW()}}{3600}$$
- Critical urgency ($\le 4$ hours remaining): **20 pts** (Prioritizes saving perishable food imminent to waste)
- High urgency ($4 - 12$ hours): **16 pts**
- Medium urgency ($12 - 24$ hours): **12 pts**
- Standard shelf-life ($> 24$ hours): **10 pts**

---

## 4. Gate 3: Human-Readable Explanations

Each scored match includes structured feedback:
- **Explanations**:
  - *"High category alignment: Kitchen urgently accepts Fresh Vegetables."*
  - *"Optimal batch size: 20 kg satisfies 100% of desired demand."*
  - *"Proximity: Located within 2.4 km of kitchen facility."*
  - *"Comfortable window: 2 hours and 30 minutes of overlapping pickup time."*
- **Warnings & Confidence Modifiers**:
  - *"Short pickup window remaining: only 45 minutes before vendor closes."*
  - *"Service area heuristic used: vendor or kitchen coordinates are unverified."*
  - *"Large quantity surplus: exceeds kitchen desired volume by 25%."*
