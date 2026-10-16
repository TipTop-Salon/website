# `contact_messages` — concierge inbox

Purpose: guest/member inquiries from any app, triaged in the portal.

Key columns: `name`, `email`, `phone`, `inquiry_type` (free text —
recommended vocabulary in `registry/CODES.md`), `message`,
`branch_id → branches.id` (nullable), `branch_name`, `status` check
(`new | read | replied | archived`, default `new`), `reply_notes`,
`created_at`.

Written by: any app (guest insert); staff replies (portal).
Read by: staff only. Replies live in the portal (no in-app thread in v1).
