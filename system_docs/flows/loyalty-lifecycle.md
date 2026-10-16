# Loyalty Lifecycle (canonical)

## Earn — 10% of final paid spend, on completion only
1. Member books (any app) → `bookings` row, `status = pending`,
   `linked_user_id` set when the member is known, `points_delivered = false`.
2. Staff confirms → `confirmed`; service happens.
3. Staff marks `completed` → the completion path (portal) MUST atomically:
   - compute `floor(total_price × 0.10)` on the **post-discount paid amount**,
   - add to `app_users.loyalty_points`, recompute `loyalty_tier`,
     bump `total_visits` / `total_spent`,
   - insert `loyalty_logs` (`booking_completed`, delta, balance_after, reason),
   - set `bookings.loyalty_points_awarded`, `points_delivered = true`.
4. Points are NEVER awarded at submit time (fraud guard).

Tiers: bronze 0–499 · silver 500–999 · gold 1000–1999 · atelier_vip 2000+.
Rate: 1 pt = ₱1 on redemption.

## Redeem
Member claims a `loyalty_rewards` item (balance + `min_tier` gated) →
negative `reward_redemption` ledger entry + balance update → staff honors at
the counter after checking the member ledger (open-loop verification until a
voucher-code flow exists — see concerns §9.7/§9.9).

## Adjust
Owner/portal writes `admin_adjustment` with a reason; never edits rows.
