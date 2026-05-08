/**
 * Ensures product/listing/hero images request reasonable dimensions instead of full originals.
 * Unsplash: `fit=max` keeps the full frame inside `w` (no side-crop).
 * Supabase render: `resize=contain` with width+height (see Supabase Storage → enable image transformations).
 *
 * Profiling (no build step):
 * - DevTools → Network → Img → sort by Time or Size; check TTFB (region) vs Content Download (bytes).
 * - Or set `localStorage.setItem('jaai_debug_images','1')` and reload — image load times log to the console.
 */

const DEBUG_FLAG = 'jaai_debug_images'

/** Enable console timing for image loads (see LazyImage). */
export function isImageLoadDebugEnabled(): boolean {
  if (typeof window === 'undefined') return false
  try {
    if (window.localStorage?.getItem(DEBUG_FLAG) === '1') return true
    return new URLSearchParams(window.location.search).get('debugImages') === '1'
  } catch {
    return false
  }
}

function isSupabaseStorageUrl(host: string): boolean {
  return host.endsWith('.supabase.co') || host.endsWith('.supabase.in')
}

/** Supabase signed object URLs use a different path; do not rewrite (would break signature). */
function isSupabaseSignedObjectUrl(pathname: string): boolean {
  return pathname.includes('/storage/v1/object/sign/')
}

/**
 * Apply Supabase Storage image render params. Public object URLs are rewritten to `/render/image/public/...`.
 * Signed URLs are returned unchanged.
 */
function applySupabaseImageParams(url: URL, maxWidth: number, quality: number): string {
  if (isSupabaseSignedObjectUrl(url.pathname)) {
    return url.toString()
  }
  const supabaseDim = String(Math.min(Math.max(maxWidth, 64), 2000))
  if (url.pathname.includes('/storage/v1/render/image/public/')) {
    url.searchParams.set('width', supabaseDim)
    url.searchParams.set('height', supabaseDim)
    url.searchParams.set('quality', String(Math.min(100, Math.max(50, quality))))
    url.searchParams.set('resize', 'contain')
    return url.toString()
  }
  if (url.pathname.includes('/storage/v1/object/public/')) {
    url.pathname = url.pathname.replace(
      '/storage/v1/object/public/',
      '/storage/v1/render/image/public/',
    )
    url.searchParams.set('width', supabaseDim)
    url.searchParams.set('height', supabaseDim)
    url.searchParams.set('quality', String(Math.min(100, Math.max(50, quality))))
    url.searchParams.set('resize', 'contain')
    return url.toString()
  }
  return url.toString()
}

export function optimizeImageUrl(
  src: string | null | undefined,
  maxWidth: number,
  quality = 78,
): string {
  if (!src?.trim()) return src || ''
  const s = src.trim()
  try {
    const url = new URL(s)
    const host = url.hostname.toLowerCase()
    if (host === 'images.unsplash.com' || host === 'plus.unsplash.com') {
      url.searchParams.set('auto', 'format')
      url.searchParams.set('fit', 'max')
      url.searchParams.set('w', String(Math.min(Math.max(maxWidth, 64), 4096)))
      url.searchParams.set('q', String(Math.min(100, Math.max(50, quality))))
      return url.toString()
    }
    if (isSupabaseStorageUrl(host)) {
      return applySupabaseImageParams(url, maxWidth, quality)
    }
  } catch {
    return s
  }
  return s
}

/** Matches ProductCard grid: 2 cols mobile → 3 tablet → 4 desktop */
const LISTING_SIZES = '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'

/** Full-bleed heroes (About, Sale, single-column shop header) */
const HERO_FULL_BLEED_SIZES =
  '(max-width: 640px) 100vw, (max-width: 1024px) 90vw, (max-width: 1536px) 85vw, 1920px'

/** Homepage split hero (~half viewport per panel on md+) */
const HERO_SPLIT_SIZES = '(max-width: 768px) 100vw, 50vw'

/** Shop listing header — band below nav, not always full viewport width */
const SHOP_HEADER_SIZES = '(max-width: 768px) 100vw, min(1200px, 92vw)'

/** Product grids / recently viewed: letterboxed fit so the full product is visible (not tight crop). */
export const PRODUCT_GRID_IMAGE_CLASS =
  'absolute inset-0 h-full w-full max-h-full max-w-full object-contain object-center p-3 sm:p-4 bg-cream transition-opacity duration-300 group-hover:opacity-95'

const DEFAULT_CARD_FALLBACK =
  'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=max&w=480&q=78'

function canBuildResponsiveSet(urlString: string): boolean {
  try {
    const u = new URL(urlString)
    if (u.hostname.includes('unsplash.com')) return true
    if (isSupabaseStorageUrl(u.hostname.toLowerCase()) && !isSupabaseSignedObjectUrl(u.pathname)) {
      return u.pathname.includes('/object/public/') || u.pathname.includes('/render/image/public/')
    }
  } catch {
    return false
  }
  return false
}

/**
 * Responsive sources for product grids — cuts bytes on HiDPI without changing layout.
 */
export function productListingImageProps(rawUrl: string | null | undefined): {
  src: string
  srcSet?: string
  sizes?: string
} {
  const fallback = rawUrl?.trim() || DEFAULT_CARD_FALLBACK
  try {
    if (canBuildResponsiveSet(fallback)) {
      const s320 = optimizeImageUrl(fallback, 320)
      const s480 = optimizeImageUrl(fallback, 480)
      const s640 = optimizeImageUrl(fallback, 640)
      return {
        src: s480,
        srcSet: `${s320} 320w, ${s480} 480w, ${s640} 640w`,
        sizes: LISTING_SIZES,
      }
    }
  } catch {
    /* ignore */
  }
  return { src: optimizeImageUrl(fallback, 640) }
}

/**
 * Large hero / banner images: multiple widths so the browser does not always download 1920px on mobile.
 *
 * @param preset `split` — ~50vw per side (homepage split hero). `shopHeader` — shop page title band. `full` — default full-bleed.
 */
export function cmsHeroImageProps(
  rawUrl: string | null | undefined,
  preset: 'full' | 'split' | 'shopHeader' = 'full',
): { src: string; srcSet?: string; sizes?: string } {
  const fallback = rawUrl?.trim() || ''
  if (!fallback) {
    return { src: '' }
  }
  const sizes =
    preset === 'split' ? HERO_SPLIT_SIZES : preset === 'shopHeader' ? SHOP_HEADER_SIZES : HERO_FULL_BLEED_SIZES
  try {
    if (canBuildResponsiveSet(fallback)) {
      const w640 = optimizeImageUrl(fallback, 640)
      const w960 = optimizeImageUrl(fallback, 960)
      const w1280 = optimizeImageUrl(fallback, 1280)
      const w1920 = optimizeImageUrl(fallback, 1920)
      return {
        src: w1280,
        srcSet: `${w640} 640w, ${w960} 960w, ${w1280} 1280w, ${w1920} 1920w`,
        sizes,
      }
    }
  } catch {
    /* ignore */
  }
  return { src: optimizeImageUrl(fallback, 1280) }
}

/**
 * About "Our story" square / section accent — smaller max widths.
 */
export function cmsSectionImageProps(
  rawUrl: string | null | undefined,
): { src: string; srcSet?: string; sizes?: string } {
  const fallback = rawUrl?.trim() || ''
  if (!fallback) return { src: '' }
  const sizes = '(max-width: 1024px) 90vw, 400px'
  try {
    if (canBuildResponsiveSet(fallback)) {
      const w320 = optimizeImageUrl(fallback, 320)
      const w480 = optimizeImageUrl(fallback, 480)
      const w640 = optimizeImageUrl(fallback, 640)
      return {
        src: w480,
        srcSet: `${w320} 320w, ${w480} 480w, ${w640} 640w`,
        sizes,
      }
    }
  } catch {
    /* ignore */
  }
  return { src: optimizeImageUrl(fallback, 640) }
}
