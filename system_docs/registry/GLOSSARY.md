# Glossary — one definition per term

- **Points**: loyalty currency, integer, 1 pt = ₱1. Never "credits".
- **Earn**: +10% of final paid spend on `completed`, floored.
- **Tier**: status band derived from balance (never stored independently of it).
- **Welcome suite**: 50 pts (wallet) + 20% first-visit discount (checkout).
- **Claimed**: `welcome_promo_claimed = true` after first completion.
- **Ledger**: `loyalty_logs` — append-only evidence of every movement.
- **Reward / privilege**: a `loyalty_rewards` row (not "voucher" unless category).
- **Member**: a `customer`-role account. **Guest**: unlinked booking identity.
- **Completion path**: whatever code moves a booking to `completed` (must run
  the earn steps — currently portal-side, untriggered; see concerns §9.1).
- **Promo switch**: `promoEnabled` global kill-switch for new discounts.
