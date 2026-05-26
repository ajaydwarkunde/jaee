import { BUSINESS_LOCATION_LINE } from '@/config/business'

/** Public storefront origin — set VITE_SITE_URL on Vercel (e.g. custom domain). */
export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://jaai-store.vercel.app').replace(
  /\/$/,
  ''
)

export const SITE_NAME = 'Jaai'
export const SITE_TAGLINE = 'Premium Candles & Home Decor'

export const DEFAULT_SITE_DESCRIPTION =
  'Jaai — Premium hand-poured soy candles and home products. Handcrafted in Pune, Maharashtra, India. Shop candles, gift hampers, and custom gifts online.'

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
