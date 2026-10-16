# ADR-002: Supabase S3 Media Storage, Client-Side Compression & Mobile Image Caching

- Status: Accepted
- Date: 2026-10-16
- Deciders: Web Portal Lead, Mobile Agent, Salon Executive Director
- Consulted: System Architecture, Database Schema

## Context
1. **Broken Seeded Images on Mobile:** Initial database seeds used relative file paths (e.g. `/images/service_precision_shears_1790223342879.jpg`). While web servers can serve local relative static files, mobile clients (React Native / Flutter) fail to resolve relative URLs without an absolute HTTP(S) origin.
2. **Missing S3 Contents:** Store owners and admins previously had no image input or uploader when adding or editing Services and Packages in the admin portal.
3. **Bandwidth & Storage Overhead:** Uncompressed mobile phone camera uploads (often 4MB–10MB) rapidly consume storage quotas, increase latency, and degrade mobile performance.
4. **Caching & CDN:** Repeated fetching of salon service images over cellular networks without strong cache headers causes battery drain and sluggish browsing.

## Decision

### 1. Dedicated Public Storage Bucket
- All media is stored in the Supabase Storage bucket: **`salon-media`**.
- Storage bucket policy is configured as **Public (`public = true`)**, allowing anonymous read access for web and mobile apps.

### 2. Standardized Folder Taxonomy
| Entity | Storage Path | Example Object Name |
| :--- | :--- | :--- |
| **Services** | `services/` | `services/srv-japanese-shears-17290123.webp` |
| **Packages** | `packages/` | `packages/pkg-bridal-couturiere-17290124.webp` |
| **Gallery** | `gallery/` | `gallery/gal-dry-cuticle-art-17290125.webp` |
| **Avatars** | `avatars/` | `avatars/usr-maria-santos-17290126.webp` |

### 3. Client-Side Shrinking & Compression Standard
Before uploading to Supabase S3, the client application (Web Admin and Mobile App) must compress and downscale imagery:
- **Max Dimensions:** `1200px × 1200px` (preserving original aspect ratio).
- **Encoding Format:** `image/webp` (with high-quality JPEG fallback for legacy browsers).
- **Compression Quality:** `0.82` (yielding 80%–95% file size reduction, typically shrinking a 4MB camera photo down to 80KB–220KB without perceptible visual degradation).

### 4. 1-Year Immutable Caching
- Uploads specify HTTP Cache-Control header:
  ```http
  Cache-Control: 31536000, public, immutable
  ```
- This ensures that both Supabase/Cloudflare CDN edges and client devices cache the images aggressively without repeated validation round-trips.

### 5. Mobile Client Implementation Guidelines
- **Image Component:** Use cache-aware image loaders:
  - React Native / Expo: `expo-image` or `react-native-fast-image` with `cachePolicy: "disk"`.
  - Flutter: `cached_network_image`.
- **Resilient Fallback:** If a remote image fails to load or device is offline, mobile clients must display a curated category fallback asset (Hair, Nails, Spa, Lashes, Ambiance) rather than showing a broken icon.
- **Admin Backfill Tool:** The Web Portal includes a one-click batch backfill tool in the **Supabase Cloud Sync** tab that uploads all bundled default media to the `salon-media` bucket and patches legacy relative URLs in the database to absolute CDN URLs.

## Consequences
- **Positive:** Images load instantaneously on both web and mobile; bandwidth consumption is reduced by >85%; store owners have full control to upload, replace, or select luxury presets for any service or package.
- **Maintenance:** The `salon-media` bucket must be created in new Supabase environments (provided in `SUPABASE_CLEAN_SCHEMA_SQL`).
