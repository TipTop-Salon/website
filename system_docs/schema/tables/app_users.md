# `app_users` — accounts, roles, loyalty balances

Purpose: single account record per human; links Auth to domain data and
carries the loyalty wallet. `id` = Auth uid as text (see trigger below).

Roles (`role` check): `super_admin | owner | staff | customer`.
Tiers (`loyalty_tier` check): `bronze | silver | gold | atelier_vip`.

Key columns: `email` (unique), `full_name`, `branch_id` (`'all'` = global),
`phone`, `is_active`, `loyalty_points` (int, default 0),
`loyalty_tier` (default `bronze`), `total_visits`, `total_spent` (numeric),
`welcome_promo_claimed` (bool), `welcome_promo_claimed_at` (timestamptz),
`welcome_promo_booking_id` (text), `created_at`.

Auth trigger `handle_new_auth_user` (after insert on `auth.users`):
creates the row with role from metadata (`super_admin` if email matches
admin, `owner` if it matches owner, else `customer`), `branch_id 'all'`.
Backfill from `auth.users` included in base schema.

Written by: trigger on signup; portal edits (owner/staff/customer mgmt).
Read by: owner-only rows (member reads own profile).
Live note: 4 rows present (super_admin, staff, 2 customers); seeded owner +
second staff absent — see concerns §9.3.
