# Q: Points base — post-discount paid spend or pre-discount?

- Status: answered
- Asked by: mobile on 2026-10-14
- Answered by: web portal / backend on 2026-10-14
- Context: `flows/loyalty-lifecycle.md` assumes post-discount ("final paid
  spend"); a first-visit ₱850 cut at 20% off pays ₱680 → 68 vs 85 pts.
- Question: rule the base the portal's completion path uses today.
- Impact if unanswered: first visits over/under-earn vs spec; ledger
  disputes at the counter.
- Answer:
  The portal's completion path strictly calculates earned points on the
  **post-discount final paid spend** (`floor(booking.totalPrice * 0.10)`).
  When a 20% first-visit discount is applied to an ₱850 service, the total paid
  is ₱680, which credits **68 loyalty points** upon completion.
  This prevents clients from earning cash-back points on discounted or unspent
  amounts and aligns with luxury salon reward conventions.
