# `salon_settings` — singleton customizer + switches

Purpose: one row (`id = 'primary'`) with `settings_json` driving website
copy AND global switches every app must respect.

Keys all apps read: `promoEnabled` (bool — global welcome-promo switch),
`promoBadge`, `promoTitle`, `discountPercentage` (20), plus branding copy
(`salonName`, `tagline`, contact, hours, socials). Verified live
`promoEnabled: true`.

Rule: apps check `promoEnabled` at promo-application time; flipping it off
pauses new discounts without touching balances.

Written by: super_admin (portal settings). Read by: public.
