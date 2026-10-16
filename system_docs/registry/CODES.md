# Reserved Codes — use verbatim in all apps

## Roles (`app_users.role`)
`super_admin | owner | staff | customer`

## Tiers (`app_users.loyalty_tier`, `loyalty_rewards.min_tier`)
`bronze | silver | gold | atelier_vip` (rank 0–3)

## Booking status (`bookings.status`)
`pending | confirmed | completed | cancelled`

## Ledger types (`loyalty_logs.type`)
`booking_completed | admin_adjustment | reward_redemption | bonus_signup`
(Welcome +50 uses `bonus_signup` — ADR-001. There is NO `welcome_bonus`.)

## Promo
`welcome_20` — 20% first-visit code (`bookings.applied_promo`).
`promoEnabled` — global switch (`salon_settings#primary.settings_json`).

## Reward categories (`loyalty_rewards.category`)
`voucher | hair | nails | spa | package`

## Category slugs (`service_categories.slug`)
`hair | nails | spa | lashes | ambiance`

## Message status (`contact_messages.status`)
`new | read | replied | archived`

## Message inquiry vocabulary (recommended, column is free text)
`general | booking | loyalty | feedback | complaint`

## Branch ids (live)
`silang-premier | tagaytay-serin | dasmarinas-central` (`all` = global staff)
