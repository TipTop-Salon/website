# Tiptop Shears & Nails — Mobile App Architecture & Integration Blueprint
**Framework**: Flutter (Dart)  
**Project Generator**: Very Good Ventures CLI (`vgv create flutter_app tiptop_mobile`)  
**Architecture Pattern**: Clean Architecture with BLoC State Management (`flutter_bloc`, `bloc_concurrency`)  
**Design System**: Tiptop Shears Atelier Aesthetic (Royal Plum, Champagne Gold, Warm Alabaster, Playfair Display & Plus Jakarta Sans)  
**Backend & Database**: Shared Supabase (PostgreSQL, Supabase Auth, Storage)

---

## 1. Executive Summary & Cross-Platform Alignment

This specification outlines the architecture, data schemas, BLoC structure, screen flows, and loyalty mechanics for the native **Tiptop Shears & Nails** Flutter mobile application, ensuring 100% parity and seamless real-time synchronization with the existing Web Atelier Management Portal and public website.

### Core Objectives
1. **Shared Supabase Data Store**: Seamless user account authentication, appointment bookings, branch listings, and loyalty ledgers are shared between web and mobile apps.
2. **Predictable Loyalty Loop**:
   - Customer books an appointment (web or mobile).
   - Admin/Staff confirms and marks the appointment as `completed` at the salon.
   - Points are automatically delivered: **10% of total appointment spend** (e.g. ₱750 spent = 75 points).
   - Points are redeemable at a **1:1 Peso rate** against dedicated service vouchers or complimentary treatments.
3. **Store Owner Governance**: Store owners can view real-time member balances, manually rectify/adjust points with tamper-evident audit reason logging, and configure claimable privileges.

---

## 2. Loyalty Points Architecture: Best Approach Recommendation

### Recommended Mechanics
| Mechanic | Implementation | Rationale |
| :--- | :--- | :--- |
| **Earning Model** | **Spend-Based (10% of total price)** | Spend-based earning directly reflects customer value. A customer booking a ₱4,200 Bridal package earns 420 points, whereas a ₱750 haircut earns 75 points. A flat "per-visit" point system fails to incentivize high-ticket treatments. |
| **Redemption Rate** | **1:1 Peso Equivalent (1 Point = ₱1.00)** | Completely transparent and frictionless for customers. No complicated fractions (e.g., 500 pts = ₱500 voucher). |
| **Reward Types** | **Dual Option: Vouchers & Full Treatments** | Customers can choose between fractional cash credits (e.g. ₱200 Privilege Credit) or saving up for 100% free treatments (e.g. 650 pts for Haute Glaze Manicure, 750 pts for Signature Shears Cut). |
| **Tier Progression** | **Automatic Tier Scaling** | • **Bronze**: 0 – 499 pts<br>• **Silver**: 500 – 999 pts<br>• **Gold**: 1,000 – 1,999 pts<br>• **Atelier VIP**: 2,000+ pts |
| **Points Disbursement Trigger** | **Admin / Staff Completion** | Points are **never** awarded immediately upon booking submission to prevent fraud or unfulfilled appointments. Points are credited precisely when the appointment transitions to `completed` in the atelier dashboard. |

---

## 3. Supabase Database Schema & Migration Script

Run the centralized schema script from the Web Portal **Admin > Supabase Sync** tab (or run this SQL snippet in **Supabase Project > SQL Editor**) to establish the lean schema:

```sql
-- ============================================================================
-- Tiptop Shears & Nails: Streamlined Role Architecture & Migration
-- ============================================================================

-- 1. Streamline public.app_users Role Architecture (No redundant user_type / flags)
-- User roles: 'super_admin' | 'owner' | 'staff' | 'customer'
alter table public.app_users drop constraint if exists app_users_role_check;
alter table public.app_users add constraint app_users_role_check check (role in ('super_admin', 'owner', 'staff', 'customer'));

-- Automatically drop deprecated flag columns if they exist in Supabase
alter table public.app_users drop column if exists user_type;
alter table public.app_users drop column if exists is_mobile_user;
alter table public.app_users drop column if exists source;

-- Ensure loyalty & promo tracking columns exist
alter table public.app_users add column if not exists loyalty_points integer default 0;
alter table public.app_users add column if not exists loyalty_tier text default 'bronze' check (loyalty_tier in ('bronze', 'silver', 'gold', 'atelier_vip'));
alter table public.app_users add column if not exists total_visits integer default 0;
alter table public.app_users add column if not exists total_spent numeric default 0;
alter table public.app_users add column if not exists welcome_promo_claimed boolean default false;
alter table public.app_users add column if not exists welcome_promo_claimed_at timestamp with time zone;
alter table public.app_users add column if not exists welcome_promo_booking_id text;

-- 2. Linkage Columns to public.bookings
alter table public.bookings add column if not exists linked_user_id text;
alter table public.bookings add column if not exists loyalty_points_awarded integer default 0;
alter table public.bookings add column if not exists points_delivered boolean default false;

-- 3. Create Loyalty Reward Items Catalog Table
create table if not exists public.loyalty_rewards (
  id text primary key,
  title text not null,
  description text not null,
  points_cost integer not null,
  peso_equivalent_value numeric not null,
  category text not null, -- 'voucher', 'hair', 'nails', 'spa', 'package'
  service_id text,
  package_id text,
  min_tier text default 'bronze',
  badge_text text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create Loyalty Activity Audit Ledger Table
create table if not exists public.loyalty_logs (
  id text primary key,
  user_id text references public.app_users(id) on delete cascade,
  user_email text not null,
  user_name text not null,
  booking_id text,
  points_delta integer not null,
  balance_after integer not null,
  type text not null check (type in ('booking_completed', 'admin_adjustment', 'reward_redemption', 'bonus_signup')),
  reason text not null,
  performed_by text not null default 'system',
  branch_id text,
  branch_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Row Level Security (RLS) Policies
alter table public.loyalty_rewards enable row level security;
alter table public.loyalty_logs enable row level security;

drop policy if exists "Public rewards viewable" on public.loyalty_rewards;
create policy "Public rewards viewable" on public.loyalty_rewards for select using (true);

drop policy if exists "Admins can manage loyalty rewards" on public.loyalty_rewards;
create policy "Admins can manage loyalty rewards" on public.loyalty_rewards for all using (true);

drop policy if exists "Users can view their own loyalty logs" on public.loyalty_logs;
create policy "Users can view their own loyalty logs" on public.loyalty_logs for select using (true);

drop policy if exists "Admins can manage loyalty logs" on public.loyalty_logs;
create policy "Admins can manage loyalty logs" on public.loyalty_logs for all using (true);
```

---

## 4. Flutter Project Generation with Very Good Ventures (VGV) CLI

### 4.1 CLI Setup & Generation
```bash
# 1. Install Very Good CLI globally
dart pub global activate very_good_cli

# 2. Generate production Flutter app with Wingspan & opinionated best practices
very_good create flutter_app tiptop_mobile \
  --desc "Tiptop Shears & Nails Client Concierge & Loyalty App" \
  --org "com.tiptopshears" \
  --application-id "com.tiptopshears.mobile"
```

### 4.2 Recommended `pubspec.yaml` Dependencies
```yaml
name: tiptop_mobile
description: Tiptop Shears & Nails Client Concierge & Loyalty App
version: 1.0.0+1

environment:
  sdk: ">=3.3.0 <4.0.0"
  flutter: ">=3.19.0"

dependencies:
  flutter:
    sdk: flutter

  # State Management & Concurrency
  flutter_bloc: ^8.1.5
  bloc_concurrency: ^0.2.5

  # Supabase Client & Auth
  supabase_flutter: ^2.3.4

  # Networking & Caching
  cached_network_image: ^3.3.1
  dio: ^5.4.2

  # Routing & Deep Linking
  go_router: ^13.2.0

  # Typography & Icons
  google_fonts: ^6.2.0
  lucide_icons: ^0.257.0

  # UI Polish & Animation
  flutter_animate: ^4.5.0
  intl: ^0.19.0
  qr_flutter: ^4.1.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  mocktail: ^1.0.3
  very_good_analysis: ^5.1.0
  bloc_test: ^9.1.7
```

---

## 5. Design System & Theming Tokens

To align with the website design:

```dart
// lib/core/theme/atelier_colors.dart
import 'package:flutter/material.dart';

class AtelierColors {
  // Brand Primary & Accents
  static const Color royalPlum = Color(0xFF7B2D97);
  static const Color royalPlumDark = Color(0xFF140D18);
  static const Color champagneGold = Color(0xFFE5A93C);
  static const Color champagneGoldLight = Color(0xFFFBF4E6);
  
  // Backgrounds & Neutrals
  static const Color warmAlabaster = Color(0xFFF6F4F8);
  static const Color cardSurface = Colors.white;
  static const Color borderSubtle = Color(0xFFECEBF0);
  static const Color textHeadline = Color(0xFF1C1221);
  static const Color textMuted = Color(0xFF6B6175);
}
```

```dart
// lib/core/theme/atelier_theme.dart
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'atelier_colors.dart';

ThemeData createAtelierTheme() {
  return ThemeData(
    useMaterial3: true,
    scaffoldBackgroundColor: AtelierColors.warmAlabaster,
    colorScheme: ColorScheme.light(
      primary: AtelierColors.royalPlum,
      secondary: AtelierColors.champagneGold,
      surface: AtelierColors.cardSurface,
      onPrimary: Colors.white,
      onSecondary: AtelierColors.textHeadline,
    ),
    textTheme: TextTheme(
      displayLarge: GoogleFonts.playfairDisplay(
        color: AtelierColors.textHeadline,
        fontSize: 32,
        fontWeight: FontWeight.w600,
      ),
      headlineMedium: GoogleFonts.playfairDisplay(
        color: AtelierColors.textHeadline,
        fontSize: 22,
        fontWeight: FontWeight.w500,
      ),
      bodyLarge: GoogleFonts.plusJakartaSans(
        color: AtelierColors.textHeadline,
        fontSize: 16,
      ),
      bodyMedium: GoogleFonts.plusJakartaSans(
        color: AtelierColors.textMuted,
        fontSize: 14,
      ),
    ),
  );
}
```

---

## 6. Comprehensive Mobile App Navigation & Screen Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     APP NAVIGATION SHELL                        │
├─────────────────┬──────────────────┬──────────────┬─────────────┤
│ 1. Home / Feed  │ 2. Book & Menu   │ 3. Loyalty   │ 4. Profile  │
└─────────────────┴──────────────────┴──────────────┴─────────────┘
```

### Detailed Feature Screens:
1. **Authentication Flow**:
   - `SplashView`: Atelier branding animation with token validation.
   - `LoginView`: Email + Password or 1-tap Social Sign-Up (Google / Apple).
   - `RegisterView`: New user registration with automatic 50 Welcome Bonus Points.
2. **Dashboard / Atelier Feed**:
   - **Exclusive Welcome Banner (20% Off)**: Mirroring website `promoBadge` and `discountPercentage`.
   - **Quick Member Card**: User tier (Bronze, Silver, Gold, Atelier VIP) and real-time points balance.
   - **Salon Highlights Carousel**: Latest balayage transformations and Russian nail art.
   - **Active Appointment Card**: Real-time status tracker (Pending, Confirmed, Completed).
3. **Services & Packages Catalog**:
   - Branch selector tab (Premier Mall Silang, Ayala Malls Serin, SM City Dasmariñas).
   - Filterable categories (Hair, Nails, Spa, Lashes).
   - Detailed treatment sheet with duration, features, and pricing.
4. **Interactive Booking Stepper**:
   - Treatment & specialist selection.
   - Date picker & synchronized salon time slots.
   - Automatic loyalty linkage (attaches `linkedUserId` to appointment).
5. **Loyalty Tracker & Privileges Vault**:
   - Digital Member Pass (QR code for staff scanning at front desk).
   - Points ledger history (Earned from bookings, store owner adjustments, redeemed vouchers).
   - Claimable Rewards Carousel: 1-tap redemption of ₱200 voucher, Free Gel Manicure, or Stone Pedicure.
6. **Guest Profile & Concierge**:
   - Account settings & branch preferences.
   - Contact Concierge direct note inquiry.
   - Booking history & invoices.

---

## 7. BLoC State Management Plan

```
lib/
├── app/
│   ├── app.dart
│   └── routes/
├── features/
│   ├── auth/
│   │   ├── bloc/ (AuthBloc, AuthEvent, AuthState)
│   │   └── view/
│   ├── home/
│   │   ├── bloc/ (HomeFeedBloc)
│   │   └── view/
│   ├── booking/
│   │   ├── bloc/ (BookingBloc)
│   │   └── view/
│   ├── loyalty/
│   │   ├── bloc/ (LoyaltyBloc: LoadBalance, RedeemReward, RefreshLedger)
│   │   └── view/
│   └── profile/
└── core/
    ├── network/ (SupabaseClientProvider)
    └── theme/
```

---

## 8. Summary of Web Admin Integration Ready Today

The website portal is updated and configured for this mobile architecture:
- ✅ **Clean Role-Only Schema**: Relying solely on `role in ('super_admin', 'owner', 'staff', 'customer')`. No redundant `user_type`, `is_mobile_user`, or `source` columns needed in the database.
- ✅ **Clear Role Governance**:
  - **Super Admin**: Full global oversight across all branches and tabs. Only Super Admins can add or assign new **Salon Owners**.
  - **Salon Owner**: Back-office management and store operations. Owners can create and manage **Branch Staff** and **Customer** accounts.
  - **Customer**: Mobile application users who register through the mobile app or via reception registration with automatic welcome points and 20% first-visit privilege tracking.
- ✅ **Centralized Supabase Sync**: All 11 tables (`branches`, `service_categories`, `app_users`, `services`, `packages`, `gallery`, `bookings`, `contact_messages`, `salon_settings`, `loyalty_rewards`, `loyalty_logs`) are included in the **Full Cloud Sync** and clean SQL schema generator with 1-click copy.
- ✅ **Automatic Points Disbursement**: When staff mark a booking as `completed`, the system calculates 10% points, updates the customer balance, tags the attending specialist/staff, and writes to `loyalty_logs`.
- ✅ **Store Owner Adjustments**: The admin panel has a dedicated **Loyalty & Rewards** tab with member balance management, manual point adjustments with audit notes, and claimable reward item CRUD.
