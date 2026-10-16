# Welcome Suite — two-in-one new-member privilege (canonical)

## Benefit 1 — 50 welcome points (wallet credit, no expiry)
Credited at account creation (self-registration AND reception-created —
single grantor TBD, see concerns §9.9), logged as `bonus_signup` (+50).
Never expires while the account is active.

## Benefit 2 — 20% first-visit privilege (one-time checkout discount)
- Eligibility: `welcome_promo_claimed == false` AND `promoEnabled == true`
  (`salon_settings#primary`).
- Booking apps attach `applied_promo = 'welcome_20'`,
  `discount_amount = 20%`, `total_price` = discounted total.
- On first completion: portal stamps `welcome_promo_claimed = true`,
  `welcome_promo_claimed_at`, `welcome_promo_booking_id`, then awards earn
  points on the DISCOUNTED total on top of the 50.
- Single-use enforced at confirm/completion, not submit (two pre-completion
  bookings must not both discount). Owner retains a "Reset Promo" override.
- Scope question open: services only (cap?) or packages too — see §9.9.

Banner copy mirrors `promoBadge / promoTitle / discountPercentage` from settings.
