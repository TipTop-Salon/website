# Tiptop Shears & Nails — Multi-Branch Atelier & Booking Platform

> **A high-craft, multi-branch luxury salon atelier web application built for Tiptop Shears & Nails. Features precision shears hair sculpting, bespoke Russian/Gel-X nail artistry, volcanic basalt foot rituals, Japanese scalp hydrotherapy, real-time branch-aware appointment scheduling, and Supabase cloud database synchronization.**

---

## 1. Project Concept & Atelier Identity

- **Brand Name:** Tiptop Shears & Nails
- **Brand Positioning:** An upscale, tranquil salon sanctuary delivering architectural hair sculpting, Haute couture nail extensions, and restorative spa rituals.
- **Atmosphere & Palette:** Deep atelier plum (`#1C1221`), royal imperial purple (`#7B2D97`), warm champagne gold accents (`#E5A93C`), pristine warm linen (`#FAFAFB`), and soft lavender borders (`#ECEBF0`).
- **Physical Salon Locations:**
  1. **Premier Mall Silang (Flagship):** 2nd Level, Premier Mall, Aguinaldo Hwy, Silang, Cavite *(10:00 AM – 9:00 PM Daily)*
  2. **Ayala Malls Serin Tagaytay:** Ground Floor, Tagaytay - Nasugbu Hwy, Tagaytay City, Cavite *(10:00 AM – 8:00 PM Weekdays, 9:00 PM Weekends)*
  3. **SM City Dasmariñas Suite:** Upper Ground Level, Wellness Zone, Governor's Dr, Dasmariñas, Cavite *(10:00 AM – 9:00 PM Daily)*

---

## 2. Tech Stack & Engineering Standards

- **Core Framework:** React 19 + TypeScript + Vite 8
- **Styling Engine:** Tailwind CSS v4 (`@import "tailwindcss";`) with serif & sans typographic hierarchy
- **Icons & Visuals:** `lucide-react`
- **Animation:** `motion`
- **Database & Auth:** Supabase PostgreSQL Client (`@supabase/supabase-js`), Row Level Security (RLS), Supabase Auth
- **Routing & State:** Single Page Application (SPA) architecture with browser History API + hash fallback (`/admin`, `#admin`), branch isolation context, and resilient local-cache persistence
- **Deployment Targets:** Vercel (`vercel.json` rewrite included) & Google Cloud Run / Docker

---

## 3. Directory Structure & Key Files

```
├── .env.example                     # Environment variables template
├── vercel.json                      # Vercel SPA rewrite configuration (prevents 404 on refresh)
├── package.json                     # Dependencies & build scripts (npm run build, npm run dev)
├── index.html                       # HTML entry point with synchronized metadata & Google Fonts
├── src/
│   ├── main.tsx                     # React application bootstrapping
│   ├── App.tsx                      # Root component, routing dispatcher, modals & navbar
│   ├── index.css                    # Tailwind CSS imports & global atelier typography
│   ├── assets/                      # Curated high-resolution atelier imagery
│   │   └── images/                  # Shears haircuts, manicures, pedicures, salon ambiance
│   ├── types/
│   │   └── salon.ts                 # TypeScript interfaces: Branch, ServiceItem, BeautyPackage,
│   │                                # Booking, CategoryItem, AppUser, GalleryItem, SalonSettings
│   ├── lib/
│   │   └── supabase.ts              # Supabase client singleton, DDL schema, and seed scripts
│   ├── data/
│   │   └── initialData.ts           # Initial baseline catalog, branch data, and demo bookings
│   ├── context/
│   │   └── SalonContext.tsx         # Central application state: branch-aware catalog,
│   │                                # bookings CRUD, Supabase sync engine, role-based auth
│   ├── components/
│   │   ├── Navbar.tsx               # Header navigation, active branch switcher, quick actions
│   │   ├── Footer.tsx               # Atelier footer, multi-branch addresses, operating hours
│   │   ├── HeroSection.tsx          # Dynamic hero banner, welcome privilege, booking CTA
│   │   ├── ServiceCard.tsx          # Treatment card with duration, price, and booking trigger
│   │   ├── PackageCard.tsx          # Curated ritual package card with valuation badge
│   │   └── BookingModal.tsx         # Multi-step guest reservation modal with branch selection
│   └── pages/
│       ├── HomePage.tsx             # Homepage showcase: signature cuts, packages, philosophy
│       ├── ServicesPage.tsx         # Full treatments menu filtered by dynamic categories
│       ├── PackagesPage.tsx         # Curated multi-service ritual packages
│       ├── GalleryPage.tsx          # Visual portfolio gallery with dynamic category filter
│       ├── BranchesPage.tsx         # Branch locations directory with maps & hours
│       ├── AboutPage.tsx            # Atelier craftsmanship, interior philosophy, standards
│       └── admin/
│           └── AdminPage.tsx        # Unified back-office portal: appointments, services,
│                                    # packages, categories, gallery, branches, users, Supabase
```

---

## 4. User Journey & Feature Overview

### Public Guest Experience
1. **Dynamic Branch Switcher:** Guests can switch between Silang Flagship, Tagaytay Serin, and Dasmariñas Suite from anywhere on the site.
2. **Treatment Catalog:** Categorized list of hair sculpting, Russian cuticle gels, volcanic basalt pedicures, and Japanese scalp treatments.
3. **Curated Packages:** Multi-service bundles with original valuation savings.
4. **Visual Portfolio:** Dynamic gallery tagged by category (Hair & Styling, Nails & Extensions, Salon Ambiance, etc.) with device file upload support in admin.
5. **Instant Online Booking:** Step-by-step reservation wizard allowing date, time, preferred stylist, and special notes.

### Back-Office Portal (`/admin` or `Alt + A`)
1. **Appointments & Reservations:** Filter bookings by branch, change statuses (`pending`, `confirmed`, `completed`, `cancelled`).
2. **Service Catalog Manager:** Add, edit, toggle signature featured status, or delete treatments.
3. **Curated Packages Manager:** Manage promotional packages, pricing, and included treatments.
4. **Category Manager:** Dynamically organize categories that automatically propagate to both services and gallery portfolios.
5. **Visual Portfolio Manager:** Upload images from device or enter URL, set dynamic tags, write captions, edit or delete photos.
6. **Branch Manager:** Configure operating hours, phone numbers, addresses, and online booking availability per location.
7. **User Accounts & RBAC:** Super Admin accounts manage staff accounts and assign branch scopes.
8. **Supabase Cloud Sync:** Real-time database status, live cloud row counters, one-click catalog seed, and DDL schema viewer.
9. **Website Customizer:** Dynamically customize homepage promo banners, About philosophy text, and Atelier standards.

---

## 5. Supabase Database Schema & Architecture

The application connects directly to Supabase via `@supabase/supabase-js`. The database schema comprises **8 relational tables**:

```
 ┌─────────────┐       ┌────────────────────┐
 │  branches   │◄──────┤     app_users      │ (branch_id reference)
 └──────┬──────┘       └────────────────────┘
        │
        ├──────────────►┌────────────────────┐
        │               │      bookings      │ (branch_id reference)
        │               └────────────────────┘
        │
        ├──────────────►┌────────────────────┐
        │               │      services      │ (branch_ids text[])
        │               └────────────────────┘
        │
        └──────────────►┌────────────────────┐
                        │      packages      │ (branch_ids text[])
                        └────────────────────┘

 ┌────────────────────┐ ┌────────────────────┐ ┌────────────────────┐
 │ service_categories │ │      gallery       │ │   salon_settings   │
 └────────────────────┘ └────────────────────┘ └────────────────────┘
```

### Table Definitions:
1. **`branches`**: Branch locations, mall name, city, address, operating hours, phone, email, and active status.
2. **`service_categories`**: Dynamic category items with slug, display order, description, and active status.
3. **`services`**: Service items with title, category, price, duration, image URL, features, and branch availability.
4. **`packages`**: Ritual packages with price, original price, included services, badge text, and branch availability.
5. **`bookings`**: Client appointments with service title, branch ID, customer contact info, stylist, date, time, and status.
6. **`gallery`**: Visual portfolio images with title, dynamic category, image URL, and caption.
7. **`salon_settings`**: Global website customization (hero copy, promotional banners, about philosophy).
8. **`app_users`**: Staff and administrator profiles linked to Supabase Auth.

---

## 6. Authentication & Super Admin Setup

### How Authentication Works
The application supports **hybrid cloud + local authentication**:
1. When Supabase is connected, sign-in attempts first authenticate against **Supabase Auth** (`supabase.auth.signInWithPassword`).
2. When a user signs in via Supabase Auth, the system checks `public.app_users` for their role (`super_admin` vs `staff`) and assigned `branch_id`.
3. If Supabase is offline or not yet connected, it falls back to the configured local admin accounts (`admin@tiptopshears.com` / `tiptop2026!`).

### Setting Up a Super Admin in Supabase:
1. Open your **Supabase Dashboard** ➔ **Authentication** ➔ **Users**.
2. Click **"Add user"** ➔ **"Create user"**.
3. Enter email: `admin@tiptopshears.com` and a secure password.
4. Under User Metadata, you can optionally include:
   ```json
   {
     "full_name": "Kendy (Executive Director)",
     "role": "super_admin",
     "branch_id": "all"
   }
   ```
5. The included Postgres trigger (`on_auth_user_created`) will automatically insert this user into `public.app_users` with `super_admin` role.

### Backfilling Users Already Created in Supabase Auth
If you created users in Supabase Auth *before* running the trigger migration, run this one-time query in your **Supabase SQL Editor** to immediately copy them into `public.app_users`:

```sql
insert into public.app_users (id, email, full_name, role, branch_id, is_active)
select 
  id,
  email,
  coalesce(raw_user_meta_data->>'full_name', split_part(email, '@', 1)),
  coalesce(raw_user_meta_data->>'role', case when email = 'admin@tiptopshears.com' or email ilike '%admin%' then 'super_admin' else 'staff' end),
  'all',
  true
from auth.users
on conflict (id) do update set
  email = excluded.email;
```

### How to Manage User Profiles & Roles
All user types reside in the `public.app_users` table with standard roles:
- `super_admin`: Full back-office privileges across all branches and tabs.
- `staff`: Scoped operational access to view and manage appointments for their assigned branch.
- `customer`: Client profile for mobile / web bookings.

You can edit any user's role or assigned branch in two ways:
1. **In the Web App:** Go to `/admin` ➔ **Users** tab ➔ Click **Edit** on any user ➔ Change role / branch ➔ Save.
2. **In Supabase Dashboard:** Go to **Table Editor** ➔ `app_users` ➔ Edit the row directly.

---

## 7. Migration Scripts & Seeding Guide

In the Admin Portal under **Supabase Cloud Sync**, two scripts are provided:

1. **Clean Schema (Recommended - Zero Seed Data):**
   - Provisions all 8 tables, indexes, Row Level Security (RLS) policies, and the Auth auto-sync trigger.
   - Contains **no inserted data**, leaving your database completely fresh and clean.
2. **Optional Demo Seeds:**
   - Standalone SQL script that seeds demo branches, initial categories, services, packages, and gallery items.
3. **🌱 Seed Cloud From Current Catalog (One-Click UI):**
   - When connected to an empty Supabase database, admins can simply click the gold **"🌱 Seed Cloud From Current Catalog"** button in the Admin Portal to upload the entire atelier catalog directly from the application into Supabase!

---

## 8. Vercel Deployment Instructions

The application is 100% prepared for production deployment to **Vercel**:

### Step 1: Push Repository to GitHub / GitLab
Ensure all files, including `vercel.json`, are committed.

### Step 2: Import into Vercel
1. Log into [vercel.com](https://vercel.com) and click **"Add New Project"**.
2. Select your repository.
3. **Framework Preset:** Vite
4. **Build Command:** `npm run build`
5. **Output Directory:** `dist`

### Step 3: Configure Environment Variables (Optional)
In Vercel Project Settings ➔ **Environment Variables**, add:
- `VITE_SUPABASE_URL`: `https://your-project.supabase.co`
- `VITE_SUPABASE_ANON_KEY`: `your-anon-public-api-key`

*(Note: If not set in Vercel env vars, you can also connect dynamically at runtime by navigating to `/admin` and entering credentials in the Supabase tab.)*

### Step 4: SPA Routing Support
The included `vercel.json` ensures that deep links like `/services`, `/booking`, and `/admin` redirect cleanly to `/index.html`:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 9. Error Handling & Offline-First Resilience

- **Graceful Cloud Downtime:** If the Supabase API is momentarily slow or unreachable, `SalonContext` catches the network exception, serves the cached catalog without interruption, and presents a polite notice with a "Retry Sync" action in the back-office.
- **In-App Confirmation Modals:** All deletions (services, packages, categories, branches, photos, users) use custom in-app modal confirmation dialogs rather than browser `window.confirm()`, ensuring seamless operation within iframes and restricted browser environments.
- **Local Storage Continuity:** All appointments booked while temporarily offline are preserved in local storage and queued for synchronization.

---

## 10. Guidelines for AI Agents & Future Contributors

When extending or maintaining this project:
1. **Never use `window.confirm()` or `window.alert()`:** Modern browsers and iframes suppress native alert dialogs. Always use state-driven React modals.
2. **Preserve Branch Scoping:** Every booking and branch-specific service must respect `branchId`. Global items use `branchId: 'all'` or include all branch IDs in `branchIds: string[]`.
3. **Keep Database & Types Synchronized:** When modifying schema attributes in `src/types/salon.ts`, ensure corresponding columns in `src/lib/supabase.ts` (`SUPABASE_CLEAN_SCHEMA_SQL`) and mapper functions in `SalonContext.tsx` are updated simultaneously.
4. **Verify TypeScript & Builds:** Before submitting changes, always execute:
   ```bash
   npm run lint   # Verifies TypeScript types with zero errors
   npm run build  # Builds the production Vite bundle
   ```
