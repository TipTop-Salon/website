# Redemption Flow (canonical, v1 open loop)

1. Member picks an active reward gated by balance ≥ `points_cost` and tier
   rank ≥ `min_tier`.
2. Claim writes `loyalty_logs` (`reward_redemption`, negative delta,
   `balance_after`) and decrements `app_users.loyalty_points`.
3. Member presents identity at the counter (member-pass QR = `app_users.id`).
4. Staff verifies the redemption entry in the member ledger, then fulfills
   the treatment/voucher.

No voucher codes in v1 — QR identifies the MEMBER, not the redemption.
A code-based verify flow is the agreed upgrade (tracked in concerns).
