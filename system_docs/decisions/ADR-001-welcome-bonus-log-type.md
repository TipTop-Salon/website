# ADR-001 — Welcome +50 logged as `bonus_signup`

Status: ACCEPTED (mobile implements; portal to confirm).

The plan spec named the welcome ledger entry `welcome_bonus`, but the live
`loyalty_logs.type` check constraint only allows
`booking_completed | admin_adjustment | reward_redemption | bonus_signup`.
Adding a new enum value requires a coordinated migration across all apps'
validation, so the +50 is logged as `bonus_signup` with reason
"Welcome bonus for new atelier membership".

Alternatives considered: alter the constraint to add `welcome_bonus`
(rejected for now — churn with no behavioral gain).
