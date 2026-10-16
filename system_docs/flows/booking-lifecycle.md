# Booking Lifecycle (canonical)

`pending` (any app inserts) → `confirmed` (staff) → `completed` (staff,
triggers earn path) · `cancelled` (staff/counter; mobile cannot cancel in v1).

- Member bookings always carry `linked_user_id`; guests leave it null.
- `applied_promo` / `discount_amount` set by the booking app MUST be honored
  at completion — the portal must not recompute them away.
- Availability: no slots table exists; salon-hour display + reception-side
  double-booking prevention until an availability source or unique partial
  index on `(branch_id, appointment_date, appointment_time)` lands.
- History/invoices surface per member via `linked_user_id` in every app.
