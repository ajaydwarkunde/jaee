import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** SPA default is to keep scroll position; reset on route changes so PDP/cart never open mid-page (esp. mobile). */
export default function ScrollToTop() {
  const { pathname } = useLocation()

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [pathname])

  return null
}
