import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { trackPageView } from '@/lib/analytics'

/** SPA default is to keep scroll position; reset on route changes so PDP/cart never open mid-page (esp. mobile). */
export default function ScrollToTop() {
  const { pathname, search } = useLocation()

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
    trackPageView(pathname + search)
  }, [pathname, search])

  return null
}
