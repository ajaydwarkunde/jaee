import { useLocation } from 'react-router-dom'
import PageMeta from '@/components/seo/PageMeta'
import { DEFAULT_SITE_DESCRIPTION } from '@/config/site'

const PRIVATE_PREFIXES = [
  '/admin',
  '/account',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/cart',
  '/orders',
  '/order-success',
  '/order-failure',
  '/wishlist',
  '/loader-demo',
  '/splash-demo',
]

/** Per-route titles (50–60 chars with brand suffix) and descriptions (120–160 chars). */
const STATIC_ROUTES: Record<string, { title?: string; description: string }> = {
  '/': {
    description: DEFAULT_SITE_DESCRIPTION,
  },
  '/shop': {
    title: 'Shop Hand-Poured Soy Candles & Gift Hampers',
    description:
      "Browse Jaai's full candle shop — soy wax candles, scented jars, tea lights & curated gift hampers. Handmade in Pune, Maharashtra. Filter by fragrance, price & size with all-India shipping.",
  },
  '/sale': {
    title: 'Candle Sale & Offers — Discounts on Jaai',
    description:
      'Save on Jaai candles and gift sets — limited-time offers on hand-poured soy wax candles and home fragrance. Premium quality from Pune with all-India delivery and secure online checkout today.',
  },
  '/about': {
    title: 'About Jaai — Pune Candle Makers & Our Story',
    description:
      'Discover Jaai — a Pune-based candle brand making premium soy wax candles and gifts by hand. Read our story, values, and commitment to natural ingredients, quality, and sustainable packaging in India.',
  },
  '/custom-candle': {
    title: 'Build a Custom Hand-Poured Soy Candle',
    description:
      'Design your own Jaai custom candle — pick fragrance, vessel, wax blend, and packaging. Hand-poured soy candles made to order in Pune, Maharashtra with gift-ready options and all-India delivery.',
  },
  '/custom-hamper': {
    title: 'Create a Custom Gift Hamper — Candles & More',
    description:
      'Build a personalized Jaai gift hamper with candles, home fragrance, and curated add-ons. Perfect for weddings, corporate gifts, and festivals — handmade in Pune with premium packaging and India-wide shipping.',
  },
}

function isPrivateRoute(pathname: string) {
  return PRIVATE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

/** Default meta for public routes; product/shop pages set richer meta locally. */
export default function RouteSeo() {
  const { pathname, search } = useLocation()

  if (pathname.startsWith('/product/')) {
    return null
  }

  if (isPrivateRoute(pathname)) {
    return <PageMeta title="Account" noindex path={pathname + search} />
  }

  if (pathname.startsWith('/shop/')) {
    return null
  }

  const config = STATIC_ROUTES[pathname]
  if (!config) {
    return <PageMeta path={pathname + search} />
  }

  return (
    <PageMeta
      title={config.title}
      description={config.description}
      path={pathname + search}
    />
  )
}
