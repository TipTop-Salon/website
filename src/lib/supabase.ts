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

/**
 * Upload an image file directly to Supabase Storage bucket 'salon-media'
 * and returns the permanent CDN public URL.
 */
/**
 * Upload an image file directly to Supabase Storage bucket 'salon-media'
 * with aggressive 1-year immutable caching and returns the permanent CDN public URL.
 */
export async function uploadToSupabaseStorage(
  client: SupabaseClient,
  file: File | Blob,
  fileName?: string,
  bucket: string = 'salon-media',
  folder: string = 'uploads'
): Promise<{ success: boolean; publicUrl?: string; error?: string; bytes?: number; filePath?: string }> {
  try {
    const rawExt = file instanceof File ? file.name.split('.').pop() : 'webp';
    const ext = rawExt ? rawExt.toLowerCase() : 'webp';
    const cleanFolder = folder.replace(/^\/+|\/+$/g, '');
    const uniqueName = fileName || `atelier-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const filePath = `${cleanFolder}/${uniqueName}`;
    const mimeType = file.type || (ext === 'webp' ? 'image/webp' : ext === 'png' ? 'image/png' : 'image/jpeg');

    const { error: uploadError } = await client.storage.from(bucket).upload(filePath, file, {
      cacheControl: '31536000, public, immutable', // 1-year immutable cache for mobile & CDN speed
      upsert: true,
      contentType: mimeType,
    });

    if (uploadError) {
      // If bucket does not exist, attempt auto-creation as public bucket and retry
      if (
        uploadError.message?.toLowerCase().includes('not found') ||
        uploadError.message?.toLowerCase().includes('bucket')
      ) {
        try {
          await client.storage.createBucket(bucket, { public: true });
          const { error: retryError } = await client.storage.from(bucket).upload(filePath, file, {
            cacheControl: '31536000, public, immutable',
            upsert: true,
            contentType: mimeType,
          });
          if (!retryError) {
            const { data } = client.storage.from(bucket).getPublicUrl(filePath);
            return {
              success: true,
              publicUrl: data.publicUrl,
              bytes: file.size,
              filePath,
            };
          }
        } catch {
          // If SDK doesn't have permissions to createBucket, return the informative error
        }
      }
      return { success: false, error: uploadError.message };
    }

    const { data } = client.storage.from(bucket).getPublicUrl(filePath);
    return {
      success: true,
      publicUrl: data.publicUrl,
      bytes: file.size,
      filePath
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Storage upload failed' };
  }
}

/**
 * Batch backfill/sync utility:
 * Fetches default high-resolution assets, uploads them into the 'salon-media' bucket,
 * and updates any existing services/packages in the database whose image_url is a relative path.
 */
export async function syncDefaultAssetsToSupabaseStorage(
  client: SupabaseClient,
  onProgress?: (status: string, current: number, total: number) => void
): Promise<{ success: boolean; updatedServices: number; updatedPackages: number; error?: string }> {
  try {
    onProgress?.('Inspecting services and packages in Supabase...', 0, 5);

    // 1. Fetch current services
    const { data: dbServices, error: srvErr } = await client.from('services').select('id, title, category, image_url');
    if (srvErr) throw srvErr;

    // 2. Fetch current packages
    const { data: dbPackages, error: pkgErr } = await client.from('packages').select('id, title, image_url');
    if (pkgErr) throw pkgErr;

    let updatedServices = 0;
    let updatedPackages = 0;

    const totalSteps = (dbServices?.length || 0) + (dbPackages?.length || 0);
    let step = 0;

    const getTargetCdn = (imgUrl: string, category: string) => {
      const lower = (imgUrl || '').toLowerCase();
      if (lower.includes('precision_shears') || category === 'hair') {
        return 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=1200&q=80';
      }
      if (lower.includes('luxury_manicure') || category === 'nails') {
        return 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=1200&q=80';
      }
      if (lower.includes('pedicure_spa') || category === 'spa') {
        return 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80';
      }
      return 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1400&q=80';
    };

    // Update services that have relative or missing URLs
    for (const srv of dbServices || []) {
      step++;
      const currentUrl = srv.image_url || '';
      const isRelative = !currentUrl.startsWith('http://') && !currentUrl.startsWith('https://');
      const isLegacy = currentUrl.includes('/images/service_');

      if (isRelative || isLegacy) {
        const cdnUrl = getTargetCdn(currentUrl, srv.category);
        onProgress?.(`Updating service: ${srv.title}...`, step, totalSteps);

        try {
          const res = await fetch(cdnUrl);
          if (res.ok) {
            const blob = await res.blob();
            const fileName = `srv-${srv.id.replace(/[^a-zA-Z0-9_-]/g, '')}.jpg`;
            const uploadRes = await uploadToSupabaseStorage(client, blob, fileName, 'salon-media', 'services');

            const finalUrl = uploadRes.success && uploadRes.publicUrl ? uploadRes.publicUrl : cdnUrl;
            await client.from('services').update({ image_url: finalUrl }).eq('id', srv.id);
            updatedServices++;
          }
        } catch {
          const cdnUrl = getTargetCdn(currentUrl, srv.category);
          await client.from('services').update({ image_url: cdnUrl }).eq('id', srv.id);
          updatedServices++;
        }
      }
    }

    // Update packages that have relative or missing URLs
    for (const pkg of dbPackages || []) {
      step++;
      const currentUrl = pkg.image_url || '';
      const isRelative = !currentUrl.startsWith('http://') && !currentUrl.startsWith('https://');
      const isLegacy = currentUrl.includes('/images/');

      if (isRelative || isLegacy) {
        onProgress?.(`Updating package: ${pkg.title}...`, step, totalSteps);
        const cdnUrl = 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1600&q=85';

        try {
          const res = await fetch(cdnUrl);
          if (res.ok) {
            const blob = await res.blob();
            const fileName = `pkg-${pkg.id.replace(/[^a-zA-Z0-9_-]/g, '')}.jpg`;
            const uploadRes = await uploadToSupabaseStorage(client, blob, fileName, 'salon-media', 'packages');

            const finalUrl = uploadRes.success && uploadRes.publicUrl ? uploadRes.publicUrl : cdnUrl;
            await client.from('packages').update({ image_url: finalUrl }).eq('id', pkg.id);
            updatedPackages++;
          }
        } catch {
          await client.from('packages').update({ image_url: cdnUrl }).eq('id', pkg.id);
          updatedPackages++;
        }
      }
    }

    onProgress?.('Image synchronization complete!', totalSteps, totalSteps);
    return { success: true, updatedServices, updatedPackages };
  } catch (err: any) {
    return { success: false, updatedServices: 0, updatedPackages: 0, error: err.message || 'Sync failed' };
  }
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

-- 3. App Users & Roles Table (super_admin, owner, staff, customer)
create table if not exists public.app_users (
  id text primary key,
  email text unique not null,
  full_name text not null,
  role text not null check (role in ('super_admin', 'owner', 'staff', 'customer')),
  branch_id text default 'all',
  phone text,
  is_active boolean default true,
  welcome_promo_claimed boolean default false,
  welcome_promo_claimed_at timestamp with time zone,
  welcome_promo_booking_id text,
  loyalty_points integer default 0,
  loyalty_tier text default 'bronze' check (loyalty_tier in ('bronze', 'silver', 'gold', 'atelier_vip')),
  total_visits integer default 0,
  total_spent numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure all columns and updated constraints exist if table was already created
alter table public.app_users drop constraint if exists app_users_role_check;
alter table public.app_users add constraint app_users_role_check check (role in ('super_admin', 'owner', 'staff', 'customer'));
-- Drop redundant flag columns if they exist in Supabase
alter table public.app_users drop column if exists user_type;
alter table public.app_users drop column if exists is_mobile_user;
alter table public.app_users drop column if exists source;
alter table public.app_users add column if not exists welcome_promo_claimed boolean default false;
alter table public.app_users add column if not exists welcome_promo_claimed_at timestamp with time zone;
alter table public.app_users add column if not exists welcome_promo_booking_id text;
alter table public.app_users add column if not exists loyalty_points integer default 0;
alter table public.app_users add column if not exists loyalty_tier text default 'bronze';
alter table public.app_users add column if not exists total_visits integer default 0;
alter table public.app_users add column if not exists total_spent numeric default 0;

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
  stylist text not null default 'Assigned Atelier Specialist',
  notes text,
  total_price numeric not null,
  status text default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  linked_user_id text,
  loyalty_points_awarded integer default 0,
  points_delivered boolean default false,
  applied_promo text,
  discount_amount numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure booking loyalty and promo columns exist if table was already created
alter table public.bookings add column if not exists linked_user_id text;
alter table public.bookings add column if not exists loyalty_points_awarded integer default 0;
alter table public.bookings add column if not exists points_delivered boolean default false;
alter table public.bookings add column if not exists applied_promo text;
alter table public.bookings add column if not exists discount_amount numeric default 0;
alter table public.bookings add column if not exists stylist text default 'Assigned Atelier Specialist';

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

-- 9. Contact Inquiries & Concierge Messages Table
create table if not exists public.contact_messages (
  id text primary key,
  name text not null,
  email text not null,
  phone text,
  inquiry_type text not null,
  message text not null,
  branch_id text references public.branches(id) on delete set null,
  branch_name text,
  status text default 'new' check (status in ('new', 'read', 'replied', 'archived')),
  reply_notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. Loyalty Reward Items Table (Claimable Services & Vouchers)
create table if not exists public.loyalty_rewards (
  id text primary key,
  title text not null,
  description text not null,
  points_cost integer not null,
  peso_equivalent_value numeric not null,
  category text not null,
  service_id text,
  package_id text,
  min_tier text default 'bronze',
  badge_text text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 11. Loyalty Ledger & Activity Logs Table (Audit trail of all points earned, redeemed, and adjusted)
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

-- Enable Row Level Security (RLS)
alter table public.branches enable row level security;
alter table public.service_categories enable row level security;
alter table public.app_users enable row level security;
alter table public.services enable row level security;
alter table public.packages enable row level security;
alter table public.bookings enable row level security;
alter table public.gallery enable row level security;
alter table public.salon_settings enable row level security;
alter table public.contact_messages enable row level security;
alter table public.loyalty_rewards enable row level security;
alter table public.loyalty_logs enable row level security;

-- Drop existing policies if re-running migration
drop policy if exists "Public branches are viewable by everyone" on public.branches;
drop policy if exists "Public categories are viewable by everyone" on public.service_categories;
drop policy if exists "Public services are viewable by everyone" on public.services;
drop policy if exists "Public packages are viewable by everyone" on public.packages;
drop policy if exists "Public bookings viewable" on public.bookings;
drop policy if exists "Public gallery is viewable by everyone" on public.gallery;
drop policy if exists "Public settings are viewable by everyone" on public.salon_settings;
drop policy if exists "Public contact messages insertable" on public.contact_messages;
drop policy if exists "Public can insert bookings" on public.bookings;
drop policy if exists "Public rewards viewable" on public.loyalty_rewards;
drop policy if exists "Public users can view their loyalty logs" on public.loyalty_logs;
drop policy if exists "Admins can manage branches" on public.branches;
drop policy if exists "Admins can manage categories" on public.service_categories;
drop policy if exists "Admins can manage app users" on public.app_users;
drop policy if exists "Admins can manage services" on public.services;
drop policy if exists "Admins can manage packages" on public.packages;
drop policy if exists "Admins can manage bookings" on public.bookings;
drop policy if exists "Admins can manage gallery" on public.gallery;
drop policy if exists "Admins can manage salon settings" on public.salon_settings;
drop policy if exists "Admins can manage contact messages" on public.contact_messages;
drop policy if exists "Admins can manage loyalty rewards" on public.loyalty_rewards;
drop policy if exists "Admins can manage loyalty logs" on public.loyalty_logs;

-- Public Read Access Policies
create policy "Public branches are viewable by everyone" on public.branches for select using (true);
create policy "Public categories are viewable by everyone" on public.service_categories for select using (true);
create policy "Public services are viewable by everyone" on public.services for select using (true);
create policy "Public packages are viewable by everyone" on public.packages for select using (true);
create policy "Public bookings viewable" on public.bookings for select using (true);
create policy "Public gallery is viewable by everyone" on public.gallery for select using (true);
create policy "Public settings are viewable by everyone" on public.salon_settings for select using (true);
create policy "Public rewards viewable" on public.loyalty_rewards for select using (true);
create policy "Public users can view their loyalty logs" on public.loyalty_logs for select using (true);

-- Public Creation Policies
create policy "Public can insert bookings" on public.bookings for insert with check (true);
create policy "Public contact messages insertable" on public.contact_messages for insert with check (true);

-- Staff & Super Admin Full Access Policies
create policy "Admins can manage branches" on public.branches for all using (true);
create policy "Admins can manage categories" on public.service_categories for all using (true);
create policy "Admins can manage app users" on public.app_users for all using (true);
create policy "Admins can manage services" on public.services for all using (true);
create policy "Admins can manage packages" on public.packages for all using (true);
create policy "Admins can manage bookings" on public.bookings for all using (true);
create policy "Admins can manage gallery" on public.gallery for all using (true);
create policy "Admins can manage salon settings" on public.salon_settings for all using (true);
create policy "Admins can manage contact messages" on public.contact_messages for all using (true);
create policy "Admins can manage loyalty rewards" on public.loyalty_rewards for all using (true);
create policy "Admins can manage loyalty logs" on public.loyalty_logs for all using (true);

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
    coalesce(
      new.raw_user_meta_data->>'role',
      case 
        when new.email = 'admin@tiptopshears.com' or new.email ilike '%admin%' then 'super_admin'
        when new.email ilike '%owner%' then 'owner'
        else 'customer' 
      end
    ),
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
  coalesce(
    raw_user_meta_data->>'role',
    case 
      when email = 'admin@tiptopshears.com' or email ilike '%admin%' then 'super_admin'
      when email ilike '%owner%' then 'owner'
      else 'customer' 
    end
  ),
  coalesce(raw_user_meta_data->>'branch_id', 'all'),
  true
from auth.users
on conflict (id) do update set
  email = excluded.email;

-- 10. Supabase Storage: Public Bucket 'salon-media' for Treatments & Gallery Photos
insert into storage.buckets (id, name, public) 
values ('salon-media', 'salon-media', true)
on conflict (id) do update set public = true;

drop policy if exists "Public Access to salon-media" on storage.objects;
drop policy if exists "Allow Uploads to salon-media" on storage.objects;
drop policy if exists "Allow Updates to salon-media" on storage.objects;
drop policy if exists "Allow Deletions to salon-media" on storage.objects;

create policy "Public Access to salon-media" on storage.objects for select using (bucket_id = 'salon-media');
create policy "Allow Uploads to salon-media" on storage.objects for insert with check (bucket_id = 'salon-media');
create policy "Allow Updates to salon-media" on storage.objects for update using (bucket_id = 'salon-media');
create policy "Allow Deletions to salon-media" on storage.objects for delete using (bucket_id = 'salon-media');
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
  ('srv-1', 'Japanese Precision Shears Haircut', 'hair', 'Hair & Styling', 850, 60, 'Dry architectural shears cutting tailored to anatomical head shape, bone structure, and natural cowlick flow.', 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=1200&q=80', array['Micro-tapered shears detailing', 'Purifying scalp clarifying wash', 'Bespoke blow-dry finish'], true, true),
  ('srv-2', 'Russian Dry Cuticle & Haute Builder Gel', 'nails', 'Nails & Extensions', 1250, 75, 'Flawless diamond flame e-file cuticle clean with hypoallergenic European builder gel overlay that strengthens natural nails.', 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=1200&q=80', array['Diamond bit cuticle cleanup', 'Structured apex builder gel', 'Mirror glass high-shine seal'], true, true),
  ('srv-3', 'Volcanic Basalt Stone Pedicure Ritual', 'spa', 'Spa & Wellness', 1100, 75, 'Restorative foot hydrotherapy with volcanic basalt stones, botanical essential oils, and deep muscle relief massage.', 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80', array['Dead Sea mineral foot soak', 'Warm basalt stone calf massage', 'Intense heel callus smoothing'], true, false)
on conflict (id) do nothing;

-- 4. Seed Packages
insert into public.packages (id, title, subtitle, price, original_price, duration_minutes, description, included_services, image_url, is_popular, badge_text)
values
  ('pkg-1', 'The Signature Atelier Rejuvenation', 'Total Shears, Nails & Scalp Reset', 2650, 3200, 150, 'Our pinnacle luxury package combining anatomical shears sculpting, European builder gel manicure, and Japanese scalp wash.', array['Japanese Precision Shears Cut', 'Russian Cuticle & Gel Manicure', 'Herbal Scalp Rejuvenation Bath', 'Tailored Botanical Aftercare Regimen'], 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1600&q=85', true, 'Most Popular Atelier Ritual'),
  ('pkg-2', 'Bridal & Red-Carpet Couturière Suite', 'High-Definition Glamour & Lasting Radiance', 3800, 4600, 180, 'Complete bridal treatment ensuring enduring photograph-ready hair luster and immaculate Haute Gel-X extensions.', array['Custom Couture Hair Sculpting', 'Haute Gel-X Full Extensions & Chrome Nail Art', 'Basalt Stone Pedicure & Reflexology', 'Pre-Event Trial Consultation'], 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=1200&q=80', true, 'Exclusive Bridal Experience')
on conflict (id) do nothing;

-- 5. Seed Gallery Portfolios
insert into public.gallery (id, title, category, image_url, caption)
values
  ('gal-1', 'Precision Shears Sculpting', 'hair', 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=1200&q=80', 'Clean, architectural angles sculpted with Japanese steel shears for natural volume and movement.'),
  ('gal-2', 'Glazed Almond Couture Nails', 'nails', 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=1200&q=80', 'Soft nude overlay with micro gold leaf inlay and ultra-glossy glass topcoat.'),
  ('gal-3', 'The Serene Sanctuary Lounge', 'ambiance', 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1600&q=85', 'Warm ambient illumination and deep forest green velvet stations designed for calm and privacy.'),
  ('gal-4', 'Basalt Stone Pedicure Suite', 'spa', 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80', 'Sculpted natural stone basins with botanical soaks and warm volcanic basalt stones.'),
  ('gal-5', 'Boutique Reception & Care Bar', 'ambiance', 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=1200&q=80', 'Fluted wood detailing, warm curved archways, and organic plant botanicals.')
on conflict (id) do nothing;

-- 6. Seed App Users
insert into public.app_users (id, email, full_name, role, branch_id, phone, is_active, loyalty_points, loyalty_tier, total_visits, total_spent)
values
  ('usr-admin-1', 'admin@tiptopshears.com', 'Kendy (Executive Director)', 'super_admin', 'all', '+63 917 877 5299', true, 1250, 'atelier_vip', 8, 12500),
  ('usr-owner-1', 'owner@tiptopshears.com', 'Clarisse Henderson (Salon Owner)', 'owner', 'all', '+63 917 999 8811', true, 0, 'atelier_vip', 0, 0),
  ('usr-staff-silang', 'staff.silang@tiptopshears.com', 'Maria Santos (Front Desk Lead)', 'staff', 'silang-premier', '+63 919 123 4567', true, 0, 'bronze', 0, 0),
  ('usr-staff-serin', 'staff.serin@tiptopshears.com', 'Camille Reyes (Reception Concierge)', 'staff', 'tagaytay-serin', '+63 919 987 6543', true, 0, 'bronze', 0, 0),
  ('usr-client-1', 'client.sofia@example.com', 'Sofia Villareal', 'customer', 'silang-premier', '+63 920 444 7788', true, 650, 'silver', 3, 6500),
  ('usr-client-2', 'bianca.montes@gmail.com', 'Bianca Montes', 'customer', 'tagaytay-serin', '+63 917 555 9821', true, 1200, 'gold', 6, 12000)
on conflict (id) do update set
  role = excluded.role,
  loyalty_points = excluded.loyalty_points,
  loyalty_tier = excluded.loyalty_tier,
  total_visits = excluded.total_visits,
  total_spent = excluded.total_spent;

-- 7. Seed Claimable Loyalty Rewards Catalog
insert into public.loyalty_rewards (id, title, description, points_cost, peso_equivalent_value, category, service_id, min_tier, badge_text, is_active)
values
  ('rew-cut-50off', '50% Off Signature Haircut Privilege', 'Redeem 375 points for half-off your bespoke anatomical shears haircut and botanical blowout.', 375, 375, 'hair', 'precision-master-cut', 'bronze', 'Popular', true),
  ('rew-gel-free', 'Complimentary Haute Gel Manicure', 'Enjoy a zero-peso Russian dry manicure with European apex structured gel overlay and glass gloss.', 650, 650, 'nails', 'glazed-couture-manicure', 'silver', 'Best Value', true),
  ('rew-spa-foot', 'Volcanic Stone Foot Spa Upgrade', 'Complimentary basalt warm stone hydrotherapy treatment add-on to any pedicure session.', 500, 500, 'spa', null, 'silver', 'Spa Ritual', true),
  ('rew-head-spa-free', 'Zenith Scalp Detox & Hydrotherapy', 'Japanese-style head spa with micro-camera trichoscopic analysis and warm halo cascade ring.', 1200, 1200, 'spa', 'scalp-detox-head-spa', 'gold', 'Exclusive', true),
  ('rew-voucher-1500', '₱1,500 VIP Atelier Gift Certificate', 'Luxury salon credit gift certificate valid across any package, bridal booking, or color service.', 1500, 1500, 'voucher', null, 'atelier_vip', 'VIP Privilege', true)
on conflict (id) do nothing;

-- 8. Seed Initial Loyalty Ledger Logs
insert into public.loyalty_logs (id, user_id, user_email, user_name, booking_id, points_delta, balance_after, type, reason, performed_by, branch_id, branch_name, created_at)
values
  ('log-1', 'usr-client-1', 'client.sofia@example.com', 'Sofia Villareal', 'bk-demo-1', 75, 650, 'booking_completed', 'Points awarded for completing Signature Shears & Sculpt Cut (₱750 spent, 10% earned)', 'system', 'silang-premier', 'Premier Mall Silang (Flagship)', now() - interval '2 days'),
  ('log-2', 'usr-client-2', 'bianca.montes@gmail.com', 'Bianca Montes', null, 100, 1200, 'admin_adjustment', 'Store Owner courtesy adjustment for anniversary promotion', 'admin@tiptopshears.com', 'tagaytay-serin', 'Ayala Malls Serin Tagaytay', now() - interval '1 day')
on conflict (id) do nothing;
`;

// Backward-compatibility alias: all loyalty tables and mobile columns are fully included in SUPABASE_CLEAN_SCHEMA_SQL
export const SUPABASE_LOYALTY_MIGRATION_SQL = SUPABASE_CLEAN_SCHEMA_SQL;



