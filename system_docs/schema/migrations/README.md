# Migrations — run order (superadmin applies in SQL Editor)

1. **Base schema** — full 11-table script + auth trigger + storage bucket
   (lives in the web portal Admin > Supabase Sync; canonical copy to be
   pasted here on next change).
2. **Demo seeds** — branches, categories, services, packages, gallery,
   users, rewards, ledger samples (optional per environment).
3. **`0001_loyalty_proposal.sql`** — role-constraint cleanup + loyalty/promo
   columns (mobile mirror; verified already-applied live, no action).
4. **`0002_rls_hardening_proposal.sql`** — staged RLS tightening with
   pre-flight checklist (mobile mirror; DO NOT run before portal JWT
   confirmation — see file header).

Rule: new changes land here first (numbered, dated), then superadmin
applies, then `decisions/CHANGELOG.md` records the release apps adopt.
