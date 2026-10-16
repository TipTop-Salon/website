# Contract Changelog

## 2026-10-16 — v0.2.0 (ADR-002: S3 Media Storage, Compression & Caching)
- Adopted ADR-002: Standardized public Supabase Storage bucket `salon-media` with standard folders (`services/`, `packages/`, `gallery/`, `avatars/`).
- Mandated client-side image shrinking (max 1200px WebP at 0.82 quality) before upload to save bandwidth and storage.
- Enforced 1-year immutable caching (`cacheControl: 31536000, public, immutable`) on S3 assets.
- Resolved §9.5: Portal admin provides live image uploading, preset selection, and batch backfill to convert legacy relative paths into permanent public CDN URLs for mobile.

## 2026-10-14 — v0.1.0 (docs repo initialized as SSOT)
- Canonical schema reference generated from live Supabase (11 tables).
- Flows (loyalty, welcome, booking, redemption, roles) + codes registry +
  glossary published. Mobile implements this version.
- Migrated mobile MD §9 integration concerns → `reviews/`.
- Known open items: reception-grantor for +50, points base ruling,
  `welcome_20` scope/cap, broken reward→service links, email-confirmation
  setting, RLS Stage A/B, media URL migration.
