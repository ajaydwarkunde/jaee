/**
 * Ensures product/listing images request reasonable dimensions instead of full originals.
 * Unsplash honors `w`, `q`, `auto=format`, `fit=crop` — without these, the CDN may serve very large files.
 */

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
      url.searchParams.set('fit', 'crop')
      url.searchParams.set('w', String(Math.min(Math.max(maxWidth, 64), 4096)))
      url.searchParams.set('q', String(Math.min(100, Math.max(50, quality))))
      return url.toString()
    }
  } catch {
    return s
  }
  return s
}

/** Matches ProductCard grid: 2 cols mobile → 3 tablet → 4 desktop */
const LISTING_SIZES = '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'

const DEFAULT_CARD_FALLBACK =
  'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&w=480&q=78'

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
    const url = new URL(fallback)
    if (url.hostname.includes('unsplash.com')) {
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
