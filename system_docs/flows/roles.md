# Role Governance (canonical)

`super_admin` — global oversight, all branches/tabs. ONLY role that can add
or assign Salon Owners.
`owner` — back-office + store ops. Creates/manages Branch Staff and Customer
accounts; balance adjustments with audit reasons; rewards CRUD.
`staff` — branch-scoped operations (confirm/complete bookings, front-desk
verification). `branch_id` set, never `'all'`.
`customer` — member apps (mobile now, web accounts later). Reads own rows,
writes bookings/messages, earns/redeems per the flows above.

No `user_type` / `is_mobile_user` / `source` columns — removed (see schema).

## Unified Authentication Endpoint
- Web Portal canonical route: **`/login`** (with legacy `/admin` automatically aliased/redirected to `/login`).
- Serves authentication across all roles (`super_admin`, `owner`, `staff`, `customer`).
