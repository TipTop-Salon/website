# `loyalty_rewards` — claimable privileges catalog

Purpose: what points buy. Managed in portal Rewards CRUD; rendered in the
mobile vault carousel.

Key columns: `title`, `description`, `points_cost` (int),
`peso_equivalent_value` (numeric, 1:1 with points), `category`
(`voucher | hair | nails | spa | package`), `service_id`, `package_id`
(**informational only — seeded values match no live service; do not join**),
`min_tier` (default `bronze`), `badge_text`, `is_active`, `created_at`.

Live catalog (5 active): 50%-off cut 375 · stone foot spa 500 ·
gel manicure 650 · scalp detox 1200 · ₱1,500 VIP certificate 1500.

Written by: super_admin / owner (portal). Read by: public (active only).
