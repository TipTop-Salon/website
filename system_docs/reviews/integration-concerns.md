# Integration Concerns — shared backlog (migrated from mobile MD §9)

Work top-down. `[NEEDS ADMIN]` = portal/superadmin decision or change.
`[MOBILE-WORKAROUND]` = interim mobile behavior until resolved.
`[AGREED]` = cross-app contract. ✅ = verified live 2026-10-14.

## First pass — schema mechanics
- **9.1 Loyalty writes ownership [AGREED ✅].** Confirmed: Web Portal atomically
  executes loyalty disbursement (10% of post-discount paid total), tier calculation,
  visit increment, and promo stamping (`welcome_promo_claimed = true`) on every
  appointment transition to `completed` in `SalonContext.tsx:updateBookingStatus`.
  Mobile remains read-only for points accrual on booking completions.
- **9.2 Welcome audit type [AGREED ✅].** Accepted per ADR-001: mobile and portal
  both use `bonus_signup` (+50) to respect the live database constraint.
- **9.3 Seed drift [NEEDS ADMIN].** Live `app_users` has 4 rows; seeded
  owner + second staff absent.
- **9.4 Availability [NEEDS ADMIN].** No slots table; reception prevents
  double-booking. Mobile cancellation not implemented (decision needed).
- **9.5 Media URLs [RESOLVED ✅].** Per ADR-002, Web portal implements direct S3 upload to
  bucket `salon-media` with automatic client-side compression (max 1200px WebP, 80–95%
  size reduction), 1-year immutable caching (`cacheControl: 31536000, public, immutable`),
  and full image editing & luxury presets on all Services and Packages. An in-portal batch
  backfill tool is available in the Supabase tab to upload default media to S3 and patch
  legacy database rows to absolute CDN URLs.
- **9.6 QR contract [AGREED ✅].** Payload = raw `app_users.id`; portal resolves
  to live balance, never trusts screenshots.
- **9.7 RLS [NEEDS ADMIN].** Permissive `using (true)` everywhere; Stage A
  proposal ready, Stage B after server-side points ownership.
- **9.8 Promo switch [AGREED ✅].** `promoEnabled: true` live; global kill-switch works.

## Second pass — portal-missed items
- **Reward→service links broken [DATA, verified live].** Seeded
  `service_id`s match no live service. Treat as informational (mobile does).
- **Points base ambiguous [RESOLVED ✅].** Ruled: Points are calculated on
  **post-discount final paid spend** (`floor(paidTotal * 0.10)`). Answered in
  `questions/2026-10-14-points-base.md`.
- **`welcome_20` single-use [RESOLVED ✅].** Enforced at completion: portal stamps
  `welcome_promo_claimed = true`, timestamp, and booking ID upon completion.
- **20% on packages [RULE].** ₱4,200 bridal → ₱840 off. Needs owner cap/scope.
- **Reception grants [FLOW].** Only mobile signup grants +50 today; needs one
  canonical grantor (extend the auth trigger recommended).
- **Guest history [FLOW].** Unlinked bookings can never earn; needs a
  link-by-email/phone flow if the salon wants it.
- **Redemption fulfillment [FLOW].** Open loop — staff eyeballs the ledger
  until voucher codes exist.
- **Email confirmation [AUTH].** Unknown if ON — decides whether mobile needs
  a verify screen (see `questions/2026-10-14-auth-confirmation.md`).
- **Mobile backlog.** Forgot-password, FCM pushes, vault realtime (built,
  unwired). **Data nit:** seeded owner tier inconsistent with 0 points.
