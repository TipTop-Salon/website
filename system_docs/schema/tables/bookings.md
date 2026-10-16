# `bookings` — appointments across all channels

Purpose: every appointment (web, mobile, walk-in) in one ledger.

Key columns: `service_id` (text, nullable for packages), `service_title`,
`branch_id → branches.id` (null on delete), `branch_name`,
`customer_name/email/phone`, `appointment_date` (date), `appointment_time`
(text `HH:mm`), `stylist` (default `Assigned Atelier Specialist`), `notes`,
`total_price` (numeric, final charged amount), `status` check
(`pending | confirmed | completed | cancelled`, default `pending`),
`linked_user_id` (text, nullable — null = guest/walk-in),
`loyalty_points_awarded`, `points_delivered` (bool guard), `applied_promo`
(text, e.g. `welcome_20`), `discount_amount` (numeric), `created_at`.

Rules: apps insert `pending` with `linked_user_id` when the member is known;
staff move status in the portal. Points logic keys off the transition to
`completed` (see `flows/loyalty-lifecycle.md`). `applied_promo` set by the
booking app must be honored at completion — do not recompute away.

Written by: any app (insert); staff transitions (portal).
Read by: owner-only linked rows.
