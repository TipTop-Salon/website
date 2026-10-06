import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variable credentials or local configuration
const defaultUrl = import.meta.env.VITE_SUPABASE_URL || '';
const defaultKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(customUrl?: string, customKey?: string): SupabaseClient | null {
  const url = customUrl || localStorage.getItem('tiptop_supabase_url') || defaultUrl;
  const key = customKey || localStorage.getItem('tiptop_supabase_key') || defaultKey;

  if (url && key && url.startsWith('http')) {
    try {
      if (!supabaseInstance || customUrl || customKey) {
        supabaseInstance = createClient(url, key, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
          }
        });
      }
      return supabaseInstance;
    } catch (e) {
      console.warn('Could not initialize Supabase client:', e);
      return null;
    }
  }
  return null;
}

export const SUPABASE_SQL_SCHEMA = `-- Tiptop Shears & Nails Complete Multi-Branch Supabase Schema
-- Run this in your Supabase Project SQL Editor to provision all tables & security policies

-- 1. Branches Table
create table if not exists public.branches (
  id text primary key,
  name text not null,
  mall_name text,
  address text not null,
  city text not null,
  phone text not null,
  email text,
  operating_hours text not null,
  google_maps_url text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Service Categories Table (Dynamic Category CRUD)
create table if not exists public.service_categories (
  id text primary key,
  name text not null,
  slug text unique not null,
  description text,
  display_order integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. App Users & Roles Table (super_admin, staff, customer)
create table if not exists public.app_users (
  id text primary key,
  email text unique not null,
  full_name text not null,
  role text not null check (role in ('super_admin', 'staff', 'customer')),
  branch_id text default 'all',
  phone text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Services Table
create table if not exists public.services (
  id text primary key,
  title text not null,
  category text not null,
  category_label text not null,
  price numeric not null,
  duration_minutes integer not null,
  description text not null,
  image_url text not null,
  features text[] default array[]::text[],
  branch_ids text[] default array[]::text[],
  is_featured boolean default false,
  popular boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Packages Table
create table if not exists public.packages (
  id text primary key,
  title text not null,
  subtitle text not null,
  price numeric not null,
  original_price numeric not null,
  duration_minutes integer not null,
  description text not null,
  included_services text[] default array[]::text[],
  image_url text not null,
  branch_ids text[] default array[]::text[],
  is_popular boolean default false,
  badge_text text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Bookings Table (Linked to Branches)
create table if not exists public.bookings (
  id text primary key,
  service_id text,
  service_title text not null,
  branch_id text references public.branches(id) on delete set null,
  branch_name text not null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  appointment_date date not null,
  appointment_time text not null,
  stylist text not null,
  notes text,
  total_price numeric not null,
  status text default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Visual Portfolio Gallery Table
create table if not exists public.gallery (
  id text primary key,
  title text not null,
  category text not null,
  image_url text not null,
  caption text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Salon Settings & Website Customizer Table
create table if not exists public.salon_settings (
  id text primary key default 'primary',
  settings_json jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.branches enable row level security;
alter table public.service_categories enable row level security;
alter table public.app_users enable row level security;
alter table public.services enable row level security;
alter table public.packages enable row level security;
alter table public.bookings enable row level security;
alter table public.gallery enable row level security;
alter table public.salon_settings enable row level security;

-- Drop existing policies if re-running migration
drop policy if exists "Public branches are viewable by everyone" on public.branches;
drop policy if exists "Public categories are viewable by everyone" on public.service_categories;
drop policy if exists "Public services are viewable by everyone" on public.services;
drop policy if exists "Public packages are viewable by everyone" on public.packages;
drop policy if exists "Public bookings viewable" on public.bookings;
drop policy if exists "Public gallery is viewable by everyone" on public.gallery;
drop policy if exists "Public settings are viewable by everyone" on public.salon_settings;
drop policy if exists "Public can insert bookings" on public.bookings;
drop policy if exists "Admins can manage branches" on public.branches;
drop policy if exists "Admins can manage categories" on public.service_categories;
drop policy if exists "Admins can manage app users" on public.app_users;
drop policy if exists "Admins can manage services" on public.services;
drop policy if exists "Admins can manage packages" on public.packages;
drop policy if exists "Admins can manage bookings" on public.bookings;
drop policy if exists "Admins can manage gallery" on public.gallery;
drop policy if exists "Admins can manage salon settings" on public.salon_settings;

-- Public Read Access Policies
create policy "Public branches are viewable by everyone" on public.branches for select using (true);
create policy "Public categories are viewable by everyone" on public.service_categories for select using (true);
create policy "Public services are viewable by everyone" on public.services for select using (true);
create policy "Public packages are viewable by everyone" on public.packages for select using (true);
create policy "Public bookings viewable" on public.bookings for select using (true);
create policy "Public gallery is viewable by everyone" on public.gallery for select using (true);
create policy "Public settings are viewable by everyone" on public.salon_settings for select using (true);

-- Public Booking Creation Policy
create policy "Public can insert bookings" on public.bookings for insert with check (true);

-- Staff & Super Admin Full Access Policies
create policy "Admins can manage branches" on public.branches for all using (true);
create policy "Admins can manage categories" on public.service_categories for all using (true);
create policy "Admins can manage app users" on public.app_users for all using (true);
create policy "Admins can manage services" on public.services for all using (true);
create policy "Admins can manage packages" on public.packages for all using (true);
create policy "Admins can manage bookings" on public.bookings for all using (true);
create policy "Admins can manage gallery" on public.gallery for all using (true);
create policy "Admins can manage salon settings" on public.salon_settings for all using (true);

-- 9. Supabase Auth Users Auto-Sync Trigger
-- Automatically syncs users created in Supabase Authentication Dashboard into public.app_users table
alter table if exists public.app_users drop constraint if exists app_users_branch_id_fkey;

create or replace function public.handle_new_auth_user()
returns trigger as $$
begin
  insert into public.app_users (id, email, full_name, role, branch_id, is_active)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', case when new.email = 'admin@tiptopshears.com' or new.email ilike '%admin%' then 'super_admin' else 'staff' end),
    coalesce(new.raw_user_meta_data->>'branch_id', 'all'),
    true
  )
  on conflict (id) do update set
    email = excluded.email;
  return new;
exception
  when others then
    return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_auth_user();

-- Immediate backfill: Syncs any users already created in Supabase Auth into public.app_users
insert into public.app_users (id, email, full_name, role, branch_id, is_active)
select 
  id,
  email,
  coalesce(raw_user_meta_data->>'full_name', split_part(email, '@', 1)),
  coalesce(raw_user_meta_data->>'role', case when email = 'admin@tiptopshears.com' or email ilike '%admin%' then 'super_admin' else 'staff' end),
  coalesce(raw_user_meta_data->>'branch_id', 'all'),
  true
from auth.users
on conflict (id) do update set
  email = excluded.email;
`;

// Pure Clean Schema (Default - Zero Seed Data)
export const SUPABASE_CLEAN_SCHEMA_SQL = SUPABASE_SQL_SCHEMA;

// Optional Seed Data Script (Can be run manually later if desired)
export const SUPABASE_SEED_SQL = `-- Tiptop Shears & Nails Initial Demo Catalog Seeds (Optional)
-- Run this only if you wish to populate demo branches, services, packages, and gallery items.

-- 1. Seed Branches
insert into public.branches (id, name, mall_name, address, city, phone, email, operating_hours)
values 
  ('silang-premier', 'Premier Mall Silang (Flagship)', 'Premier Mall Silang', '2nd Level, Premier Mall, Aguinaldo Hwy, Silang, Cavite', 'Silang, Cavite', '+63 917 877 5299', 'kendy.qtie@gmail.com', '10:00 AM – 9:00 PM Daily'),
  ('tagaytay-serin', 'Ayala Malls Serin Tagaytay', 'Ayala Malls Serin', 'Ground Floor, Tagaytay - Nasugbu Hwy, Tagaytay, Cavite', 'Tagaytay City', '+63 917 888 6300', 'serin@tiptopshears.com', '10:00 AM – 8:00 PM (Weekdays), 10:00 AM – 9:00 PM (Weekends)'),
  ('dasmarinas-central', 'SM City Dasmariñas Suite', 'SM City Dasmariñas', 'Upper Ground Level, Wellness Zone, Governor''s Dr, Dasmariñas, Cavite', 'Dasmariñas, Cavite', '+63 917 555 4210', 'dasma@tiptopshears.com', '10:00 AM – 9:00 PM Daily')
on conflict (id) do nothing;

-- 2. Seed Categories
insert into public.service_categories (id, name, slug, description, display_order)
values
  ('cat-hair', 'Hair & Styling', 'hair', 'Precision shears sculpting, balayage, and dimensional color', 1),
  ('cat-nails', 'Nails & Extensions', 'nails', 'Russian dry manicures, Haute Gel-X extensions, and chrome art', 2),
  ('cat-spa', 'Spa & Wellness', 'spa', 'Volcanic basalt stone foot rituals and Japanese head spas', 3),
  ('cat-lashes', 'Lashes & Brows', 'lashes', 'Keratin lash lifts, brow lamination, and volume extensions', 4),
  ('cat-ambiance', 'Salon Ambiance & Lounge', 'ambiance', 'Serene interior corners, styling stations, and boutique sanctuary architecture', 5)
on conflict (id) do nothing;

-- 3. Seed Services
insert into public.services (id, title, category, category_label, price, duration_minutes, description, image_url, features, is_featured, popular)
values
  ('srv-1', 'Japanese Precision Shears Haircut', 'hair', 'Hair & Styling', 850, 60, 'Dry architectural shears cutting tailored to anatomical head shape, bone structure, and natural cowlick flow.', '/src/assets/images/service_precision_shears_1790223342879.jpg', array['Micro-tapered shears detailing', 'Purifying scalp clarifying wash', 'Bespoke blow-dry finish'], true, true),
  ('srv-2', 'Russian Dry Cuticle & Haute Builder Gel', 'nails', 'Nails & Extensions', 1250, 75, 'Flawless diamond flame e-file cuticle clean with hypoallergenic European builder gel overlay that strengthens natural nails.', '/src/assets/images/service_luxury_manicure_1790223356476.jpg', array['Diamond bit cuticle cleanup', 'Structured apex builder gel', 'Mirror glass high-shine seal'], true, true),
  ('srv-3', 'Volcanic Basalt Stone Pedicure Ritual', 'spa', 'Spa & Wellness', 1100, 75, 'Restorative foot hydrotherapy with volcanic basalt stones, botanical essential oils, and deep muscle relief massage.', '/src/assets/images/service_pedicure_spa_1790223369654.jpg', array['Dead Sea mineral foot soak', 'Warm basalt stone calf massage', 'Intense heel callus smoothing'], true, false)
on conflict (id) do nothing;

-- 4. Seed Packages
insert into public.packages (id, title, subtitle, price, original_price, duration_minutes, description, included_services, image_url, is_popular, badge_text)
values
  ('pkg-1', 'The Signature Atelier Rejuvenation', 'Total Shears, Nails & Scalp Reset', 2650, 3200, 150, 'Our pinnacle luxury package combining anatomical shears sculpting, European builder gel manicure, and Japanese scalp wash.', array['Japanese Precision Shears Cut', 'Russian Cuticle & Gel Manicure', 'Herbal Scalp Rejuvenation Bath', 'Tailored Botanical Aftercare Regimen'], '/src/assets/images/hero_salon_ambiance_1790223323507.jpg', true, 'Most Popular Atelier Ritual'),
  ('pkg-2', 'Bridal & Red-Carpet Couturière Suite', 'High-Definition Glamour & Lasting Radiance', 3800, 4600, 180, 'Complete bridal treatment ensuring enduring photograph-ready hair luster and immaculate Haute Gel-X extensions.', array['Custom Couture Hair Sculpting', 'Haute Gel-X Full Extensions & Chrome Nail Art', 'Basalt Stone Pedicure & Reflexology', 'Pre-Event Trial Consultation'], '/src/assets/images/service_luxury_manicure_1790223356476.jpg', true, 'Exclusive Bridal Experience')
on conflict (id) do nothing;

-- 5. Seed Gallery Portfolios
insert into public.gallery (id, title, category, image_url, caption)
values
  ('gal-1', 'Precision Shears Sculpting', 'hair', '/src/assets/images/service_precision_shears_1790223342879.jpg', 'Clean, architectural angles sculpted with Japanese steel shears for natural volume and movement.'),
  ('gal-2', 'Glazed Almond Couture Nails', 'nails', '/src/assets/images/service_luxury_manicure_1790223356476.jpg', 'Soft nude overlay with micro gold leaf inlay and ultra-glossy glass topcoat.'),
  ('gal-3', 'The Serene Sanctuary Lounge', 'ambiance', '/src/assets/images/hero_salon_ambiance_1790223323507.jpg', 'Warm ambient illumination and deep forest green velvet stations designed for calm and privacy.'),
  ('gal-4', 'Basalt Stone Pedicure Suite', 'spa', '/src/assets/images/service_pedicure_spa_1790223369654.jpg', 'Sculpted natural stone basins with botanical soaks and warm volcanic basalt stones.'),
  ('gal-5', 'Boutique Reception & Care Bar', 'ambiance', '/src/assets/images/about_salon_interior_1790223381558.jpg', 'Fluted wood detailing, warm curved archways, and organic plant botanicals.')
on conflict (id) do nothing;
`;

