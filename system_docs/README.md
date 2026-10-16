# Tiptop-System-Docs — Single Source of Truth

Shared architecture, API contracts, business rules, system workflows, and
technical documentation for the TipTop Salon Management System.

Three apps implement against these docs natively (no shared code):
`windows` (.NET C# MAUI) · `frontend` (website) · `flutter` (mobile).
Supabase project `Tiptop Salon` (`ggtlorbmskmcorpnyftl`) is the shared data
plane; **this repo is the shared truth plane** — what the data means, who may
write it, and how the flows work.

## Map

- `schema/` — tables, relations, writer matrix, versioned migrations, seeds.
  Generated from / verified against live Supabase on every review.
- `flows/` — loyalty, welcome suite, booking, redemption, roles. The ideal
  end-to-end behavior all apps implement.
- `registry/` — reserved strings (`CODES.md`) and `GLOSSARY.md`. Use verbatim.
- `decisions/` — ADRs + `CHANGELOG.md`. Every schema/rule change lands here.
- `reviews/` — shared integration-concerns backlog (superadmin works top-down).
- `questions/` — open cross-platform questions any team can file. Template
  included; answered questions graduate into `decisions/` or `flows/`.

## Rules of the road

1. Docs describe, apps obey. Table/column names, enum values, promo codes,
   and flow transitions come from here verbatim — never invented per app.
2. Change ritual: PR to the relevant file + `decisions/CHANGELOG.md` entry →
   superadmin approves/applies (migrations) → each app adopts on its own
   release cadence, pinning the doc version it implements.
3. `reviews/integration-concerns.md` is the shared inbox. Mobile audits feed
   it; portal/Windows teams answer inline or via `questions/`.
