import React from 'react';

/**
 * Curated high-resolution CDN images for luxury salon, nail couture, spa, and ambiance.
 * These ensure crystal-clear visual delivery across Vercel, Supabase, mobile devices, and local previews.
 */
export const CDN_IMAGES = {
  ambiance: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1400&q=80',
  hero: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1600&q=85',
  hairShears: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=1200&q=80',
  hairBalayage: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1200&q=80',
  nailsCouture: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=1200&q=80',
  nailsGelX: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1200&q=80',
  pedicureSpa: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
  scalpHydro: 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?auto=format&fit=crop&w=1200&q=80',
  interiorReception: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=1200&q=80',
};

/**
 * Luxury Preset Options for One-Click Image Selection in Admin
 */
export const SALON_IMAGE_PRESETS = [
  {
    id: 'hair-shears',
    category: 'hair',
    title: 'Japanese Precision Shears & Sculpt',
    url: CDN_IMAGES.hairShears,
    badge: 'Hair & Styling',
  },
  {
    id: 'hair-balayage',
    category: 'hair',
    title: 'Haute Balayage & Gloss Finish',
    url: CDN_IMAGES.hairBalayage,
    badge: 'Hair & Color',
  },
  {
    id: 'nails-couture',
    category: 'nails',
    title: 'Russian Dry Cuticle & Builder Gel',
    url: CDN_IMAGES.nailsCouture,
    badge: 'Nails & Gel',
  },
  {
    id: 'nails-gelx',
    category: 'nails',
    title: 'Haute Gel-X Chrome Extensions',
    url: CDN_IMAGES.nailsGelX,
    badge: 'Nail Extensions',
  },
  {
    id: 'spa-pedicure',
    category: 'spa',
    title: 'Volcanic Basalt Stone Pedicure',
    url: CDN_IMAGES.pedicureSpa,
    badge: 'Spa & Wellness',
  },
  {
    id: 'spa-head',
    category: 'spa',
    title: 'Japanese Halo Scalp Detox Spa',
    url: CDN_IMAGES.scalpHydro,
    badge: 'Head Spa',
  },
  {
    id: 'ambiance-lounge',
    category: 'ambiance',
    title: 'Sanctuary Lounge & Styling Stations',
    url: CDN_IMAGES.hero,
    badge: 'Atelier Ambiance',
  },
  {
    id: 'interior-reception',
    category: 'ambiance',
    title: 'Boutique Care Bar & Reception',
    url: CDN_IMAGES.interiorReception,
    badge: 'Reception Suite',
  },
];

/**
 * Universal fallback image when any image fails to load.
 */
export const FALLBACK_IMAGE = CDN_IMAGES.ambiance;

export type ImageSourceType = 'supabase' | 'cdn' | 'data' | 'local_relative' | 'empty';

/**
 * Detect the storage provenance of an image URL.
 * Helps store owners spot relative paths that need S3 upload for mobile compatibility.
 */
export function detectImageSource(url?: string): {
  type: ImageSourceType;
  isMobileCompatible: boolean;
  label: string;
} {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return { type: 'empty', isMobileCompatible: false, label: 'No Image Set' };
  }
  const trimmed = url.trim();

  if (trimmed.includes('supabase.co/storage') || trimmed.includes('/salon-media/')) {
    return { type: 'supabase', isMobileCompatible: true, label: 'Supabase S3 Bucket' };
  }

  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return { type: 'data', isMobileCompatible: false, label: 'Local Memory Data URL' };
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return { type: 'cdn', isMobileCompatible: true, label: 'Cloud CDN' };
  }

  return { type: 'local_relative', isMobileCompatible: false, label: 'Local Relative Asset (Upload to S3 for Mobile)' };
}

/**
 * Normalizes image paths to ensure seamless loading across:
 * 1. Supabase Storage & S3 CDN URLs (https://...)
 * 2. Static public assets (/images/...)
 * 3. Base64 Data URLs (data:image/...)
 * 4. Automatic CDN fallback if a legacy or missing relative asset is provided
 */
export function getImageUrl(url?: string): string {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return CDN_IMAGES.hero;
  }

  const trimmed = url.trim();

  // If already absolute URL (Supabase Storage, AWS S3, Cloudinary, Unsplash, etc.) or Data/Blob URL
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  // If relative seeded image path like "/images/service_precision_shears_1790223342879.jpg"
  // Map to reliable high-resolution CDN luxury assets so mobile and web never display broken images
  if (trimmed.includes('precision_shears')) return CDN_IMAGES.hairShears;
  if (trimmed.includes('luxury_manicure')) return CDN_IMAGES.nailsCouture;
  if (trimmed.includes('pedicure_spa')) return CDN_IMAGES.pedicureSpa;
  if (trimmed.includes('about_salon') || trimmed.includes('interior')) return CDN_IMAGES.interiorReception;
  if (trimmed.includes('hero_salon') || trimmed.includes('ambiance')) return CDN_IMAGES.hero;

  // Normalize legacy Vite source asset paths to public static paths
  if (trimmed.startsWith('/src/assets/images/')) {
    return trimmed.replace('/src/assets/images/', '/images/');
  }
  if (trimmed.startsWith('src/assets/images/')) {
    return '/' + trimmed.replace('src/assets/images/', 'images/');
  }
  if (trimmed.startsWith('/src/assets/')) {
    return trimmed.replace('/src/assets/', '/');
  }

  // Ensure leading slash for static assets
  if (!trimmed.startsWith('/')) {
    return '/' + trimmed;
  }

  return trimmed;
}

/**
 * Returns a tailored luxury CDN image based on the category or title
 */
export function getCategoryFallback(category?: string): string {
  const cat = (category || '').toLowerCase();
  if (cat.includes('nail')) return CDN_IMAGES.nailsCouture;
  if (cat.includes('hair') || cat.includes('shear')) return CDN_IMAGES.hairShears;
  if (cat.includes('pedi') || cat.includes('spa') || cat.includes('hydro')) return CDN_IMAGES.pedicureSpa;
  if (cat.includes('lash') || cat.includes('brow')) return CDN_IMAGES.nailsGelX;
  return CDN_IMAGES.ambiance;
}

/**
 * Resilient image error handler that swaps broken local assets or offline links
 * with tailored high-resolution CDN salon photography.
 */
export function handleImageError(e: React.SyntheticEvent<HTMLImageElement, Event>) {
  const target = e.currentTarget;
  // Prevent infinite error looping
  if (target.getAttribute('data-error-handled') === 'true') {
    return;
  }
  target.setAttribute('data-error-handled', 'true');

  const altText = (target.alt || '').toLowerCase();
  if (altText.includes('nail') || altText.includes('manicure')) {
    target.src = CDN_IMAGES.nailsCouture;
  } else if (altText.includes('hair') || altText.includes('shear') || altText.includes('cut')) {
    target.src = CDN_IMAGES.hairShears;
  } else if (altText.includes('pedi') || altText.includes('spa') || altText.includes('stone')) {
    target.src = CDN_IMAGES.pedicureSpa;
  } else {
    target.src = CDN_IMAGES.ambiance;
  }
}
