# Schema Overview (verified live 2026-10-14)

Postgres 17, 11 tables. `id` is `text` everywhere (UUID strings or slugs).
`app_users.id` equals the Supabase Auth uid as text (see auth trigger).

## Writer matrix — who writes what (RLS must enforce this)

| Table | Writes | Reads |
|---|---|---|
| `branches` | super_admin / owner (portal) | public |
| `service_categories` | super_admin / owner (portal) | public |
| `services` | super_admin / owner (portal) | public |
| `packages` | super_admin / owner (portal) | public |
| `gallery` | super_admin / owner (portal) | public |
| `salon_settings` | super_admin (portal settings) | public |
| `loyalty_rewards` | super_admin / owner (portal CRUD) | public |
| `app_users` | auth trigger on signup; owner/staff edits (portal) | owner-only rows |
| `bookings` | any app (member insert); staff transitions (portal) | owner-only linked rows |
| `contact_messages` | any app (guest insert); staff replies (portal) | staff only |
| `loyalty_logs` | completion path / adjustments (portal side) | owner-only rows |

Interim exceptions (mobile writes today, must move server-side): welcome +50
grant and reward redemption inserts into `loyalty_logs` + balance updates.
Tracked in `reviews/integration-concerns.md` §9.1.

## Relations

- `bookings.branch_id → branches.id` (null on delete)
- `bookings.linked_user_id → app_users.id` (loose text link, nullable for guests)
- `loyalty_logs.user_id → app_users.id` (cascade delete)
- `contact_messages.branch_id → branches.id` (null on delete)
- `loyalty_rewards.service_id / package_id` are **informational only** —
  seeded values match no live service; do not join (see concerns §9.9).
- `salon_settings` is a singleton row (`id = 'primary'`, `settings_json`).

## Conventions

- Money: `numeric`, peso amounts. Points: `integer`, 1 pt = ₱1.
- Dates: `appointment_date` is a `date` (`yyyy-MM-dd`); times are text (`HH:mm`).
- Status enums live in `registry/CODES.md` — check constraints mirror them.
- Table detail pages: `schema/tables/*.md` (one per table).
