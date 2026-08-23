import {
  DEFAULT_HOME_TITLE,
  DEFAULT_OG_IMAGE,
  DEFAULT_SITE_DESCRIPTION,
  GEO_ADDRESS,
  ORGANIZATION_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from '@/config/site'

const SEO_TITLE_MAX = 60
const SEO_DESC_MIN = 120
const SEO_DESC_MAX = 160

/** Clamp or pad meta description to typical SERP length (120–160 chars). */
export function clampMetaDescription(
  text: string,
  min = SEO_DESC_MIN,
  max = SEO_DESC_MAX
): string {
  const trimmed = text.trim()
  if (trimmed.length >= min && trimmed.length <= max) return trimmed
  if (trimmed.length > max) {
    const cut = trimmed.slice(0, max - 1)
    const lastSpace = cut.lastIndexOf(' ')
    return (lastSpace > min ? cut.slice(0, lastSpace) : cut).trimEnd() + '.'
  }
  const suffix = ' Shop online at Jaai with all-India shipping.'
  const padded = trimmed + suffix
  return padded.length <= max ? padded : trimmed
}

/** Build a keyword-rich title; homepage uses DEFAULT_HOME_TITLE (50–60 chars). */
export function formatSeoTitle(pagePart?: string): string {
  if (!pagePart?.trim()) return DEFAULT_HOME_TITLE

  const suffix = ` | ${SITE_NAME}`
  const maxPartLen = SEO_TITLE_MAX - suffix.length
  let part = pagePart.trim()
  if (part.length > maxPartLen) {
    part = part.slice(0, Math.max(maxPartLen - 1, 1)).trimEnd() + '…'
  }
  return `${part}${suffix}`.slice(0, SEO_TITLE_MAX)
}
import { instagramProfileUrl } from '@/lib/utils'
import type { Product } from '@/types'

export interface PageMetaInput {
  title?: string
  description?: string
  path?: string
  image?: string
  type?: 'website' | 'product' | 'article'
  noindex?: boolean
}

export function absoluteUrl(path: string = '/'): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${SITE_URL}${normalized}`
}

/** @deprecated Use formatSeoTitle — kept as alias for callers. */
export function pageTitle(title?: string): string {
  return formatSeoTitle(title)
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]:not([hreflang])`) as HTMLLinkElement | null
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

function applyHreflang(canonicalUrl: string) {
  document.querySelectorAll('link[rel="alternate"][hreflang]').forEach((el) => el.remove())
  for (const hreflang of ['en-IN', 'x-default']) {
    const link = document.createElement('link')
    link.rel = 'alternate'
    link.hreflang = hreflang
    link.href = canonicalUrl
    document.head.appendChild(link)
  }
}

export function applyPageMeta(input: PageMetaInput) {
  const {
    title,
    description = DEFAULT_SITE_DESCRIPTION,
    path = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/',
    image = DEFAULT_OG_IMAGE,
    type = 'website',
    noindex = false,
  } = input

  const canonical = absoluteUrl(path.split('?')[0] || '/')
  const fullTitle = formatSeoTitle(title)
  const metaDescription = clampMetaDescription(description)

  document.title = fullTitle
  upsertMeta('name', 'description', metaDescription)
  upsertLink('canonical', canonical)
  applyHreflang(canonical)

  upsertMeta('property', 'og:type', type)
  upsertMeta('property', 'og:site_name', SITE_NAME)
  upsertMeta('property', 'og:title', fullTitle)
  upsertMeta('property', 'og:description', metaDescription)
  upsertMeta('property', 'og:url', canonical)
  upsertMeta('property', 'og:image', image.startsWith('http') ? image : absoluteUrl(image))
  upsertMeta('property', 'og:locale', 'en_IN')

  upsertMeta('name', 'twitter:card', 'summary_large_image')
  upsertMeta('name', 'twitter:title', fullTitle)
  upsertMeta('name', 'twitter:description', metaDescription)
  upsertMeta('name', 'twitter:image', image.startsWith('http') ? image : absoluteUrl(image))

  if (noindex) {
    upsertMeta('name', 'robots', 'noindex, nofollow')
  } else {
    upsertMeta('name', 'robots', 'index, follow, max-image-preview:large')
  }
}

export function buildOrganizationSchema(instagramHandle?: string) {
  const handle = instagramHandle?.trim() || '@jaai_candle_studio'
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl('/favicon.svg'),
    description: ORGANIZATION_DESCRIPTION,
    address: {
      '@type': 'PostalAddress',
      addressLocality: GEO_ADDRESS.locality,
      addressRegion: GEO_ADDRESS.region,
      addressCountry: GEO_ADDRESS.country,
    },
    areaServed: {
      '@type': 'Country',
      name: 'India',
    },
    sameAs: [instagramProfileUrl(handle)],
  }
}

export function buildWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_SITE_DESCRIPTION,
    publisher: { '@id': `${SITE_URL}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/shop?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function buildProductSchema(product: Product, productUrl: string) {
  const images = product.images ?? []
  const categoryNames = product.categoryNames ?? []
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || `${product.name} — hand-poured candle by ${SITE_NAME}.`,
    image: images.length > 0 ? images : [DEFAULT_OG_IMAGE],
    url: productUrl,
    brand: {
      '@type': 'Brand',
      name: SITE_NAME,
    },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: product.currency || 'INR',
      ...(product.pricingOnRequest
        ? { availability: 'https://schema.org/PreOrder' }
        : {
            price: product.price,
            availability: product.inStock
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
          }),
      seller: { '@id': `${SITE_URL}/#organization` },
    },
  }

  if (product.avgRating != null && product.reviewCount != null && product.reviewCount > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.avgRating,
      reviewCount: product.reviewCount,
    }
  }

  const sku = product.variants?.find((v) => v.sku)?.sku
  if (sku) schema.sku = sku

  if (categoryNames.length > 0) {
    schema.category = categoryNames.join(', ')
  }

  return schema
}

export function buildBreadcrumbSchema(
  items: { name: string; path: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

export function buildItemListSchema(
  name: string,
  products: Product[],
  listUrl: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    url: listUrl,
    numberOfItems: products.length,
    itemListElement: products.slice(0, 12).map((p, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: absoluteUrl(`/product/${p.slug}`),
      name: p.name,
    })),
  }
}
