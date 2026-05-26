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

const STATIC_ROUTES: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'Home',
    description: DEFAULT_SITE_DESCRIPTION,
  },
  '/shop': {
    title: 'Shop All Products',
    description:
      'Browse Jaai’s full collection of hand-poured soy candles, gift hampers, and home fragrance products. Ships across India from Pune.',
  },
  '/sale': {
    title: 'Offers & Sale',
    description: 'Shop discounted candles and gifts from Jaai. Limited-time offers on premium hand-poured products.',
  },
  '/about': {
    title: 'About Us',
    description:
      'Learn how Jaai crafts premium soy candles by hand in Pune, Maharashtra — our story, values, and commitment to quality.',
  },
  '/custom-candle': {
    title: 'Custom Candle',
    description: 'Design your own hand-poured custom candle with Jaai. Choose fragrance, vessel, and packaging.',
  },
  '/custom-hamper': {
    title: 'Custom Gift Hamper',
    description: 'Build a personalized gift hamper with Jaai candles and curated home products.',
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
