# `loyalty_logs` — tamper-evident points audit ledger

Purpose: every point movement, signed with reason + actor. Source of truth
for "why does this balance read X" — balances are derived, this table is evident.

Key columns: `user_id → app_users.id` (cascade), `user_email`, `user_name`,
`booking_id` (nullable), `points_delta` (int, signed), `balance_after`
(int, balance *after* this entry), `type` check
(`booking_completed | admin_adjustment | reward_redemption | bonus_signup`),
`reason` (human text, required), `performed_by` (default `system`),
`branch_id`, `branch_name`, `created_at`.

Rules: one row per movement, never update/delete. Welcome +50 uses
`bonus_signup` (ADR-001). Redemption rows carry negative deltas.

Written by: completion path / owner adjustments (portal side).
Read by: owner-only rows.
