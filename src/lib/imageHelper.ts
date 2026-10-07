/**
 * Curated high-resolution CDN images for luxury salon, nail couture, spa, and ambiance.
 * These ensure crystal-clear visual delivery across Vercel, Supabase, and local previews.
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
 * Universal fallback image when any image fails to load.
 */
export const FALLBACK_IMAGE = CDN_IMAGES.ambiance;

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

