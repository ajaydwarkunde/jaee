import { BUSINESS_LOCATION_LINE } from '@/config/business'

/** Public storefront origin — set VITE_SITE_URL on Vercel (e.g. custom domain). */
export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://jaai-store.vercel.app').replace(
  /\/$/,
  ''
)

export const SITE_NAME = 'Jaai'
export const SITE_TAGLINE = 'Premium Candles & Home Decor'

/** Homepage & fallback title — target 50–60 characters for on-page SEO audits. */
export const DEFAULT_HOME_TITLE =
  'Jaai | Hand-Poured Soy Candles & Gifts from Pune, India'

/** Default meta description — target 120–160 characters. */
export const DEFAULT_SITE_DESCRIPTION =
  'Shop Jaai soy candles & gift hampers hand-poured in Pune, Maharashtra. Premium fragrances, all-India shipping, secure checkout and easy returns online.'

export const DEFAULT_OG_IMAGE = `${SITE_URL}/favicon.svg`

export const ORGANIZATION_DESCRIPTION =
  'Jaai is an Indian D2C brand selling luxury hand-poured soy candles, gift hampers, and home fragrance products from Pune, Maharashtra.'

export const GEO_ADDRESS = {
  locality: 'Pune',
  region: 'Maharashtra',
  country: 'IN',
  full: BUSINESS_LOCATION_LINE,
}

/** Default Instagram — storefront may override via settings at runtime in schemas. */
export const DEFAULT_INSTAGRAM_HANDLE = '@jaai_candle_studio'
