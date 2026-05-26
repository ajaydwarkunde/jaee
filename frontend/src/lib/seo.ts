import {
  DEFAULT_OG_IMAGE,
  DEFAULT_SITE_DESCRIPTION,
  GEO_ADDRESS,
  ORGANIZATION_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
} from '@/config/site'
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

export function pageTitle(pageTitle?: string): string {
  if (!pageTitle) return `${SITE_NAME} | ${SITE_TAGLINE}`
  return `${pageTitle} | ${SITE_NAME}`
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
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
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
  const fullTitle = pageTitle(title)

  document.title = fullTitle
  upsertMeta('name', 'description', description)
  upsertLink('canonical', canonical)

  upsertMeta('property', 'og:type', type)
  upsertMeta('property', 'og:site_name', SITE_NAME)
  upsertMeta('property', 'og:title', fullTitle)
  upsertMeta('property', 'og:description', description)
  upsertMeta('property', 'og:url', canonical)
  upsertMeta('property', 'og:image', image.startsWith('http') ? image : absoluteUrl(image))
  upsertMeta('property', 'og:locale', 'en_IN')

  upsertMeta('name', 'twitter:card', 'summary_large_image')
  upsertMeta('name', 'twitter:title', fullTitle)
  upsertMeta('name', 'twitter:description', description)
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
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || `${product.name} — hand-poured candle by ${SITE_NAME}.`,
    image: product.images.length > 0 ? product.images : [DEFAULT_OG_IMAGE],
    url: productUrl,
    brand: {
      '@type': 'Brand',
      name: SITE_NAME,
    },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: product.currency || 'INR',
      price: product.price,
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
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

  if (product.categoryNames.length > 0) {
    schema.category = product.categoryNames.join(', ')
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
