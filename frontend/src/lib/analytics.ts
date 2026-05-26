/** GA4 measurement ID — override via VITE_GA_MEASUREMENT_ID on Vercel if needed. */
export const GA_MEASUREMENT_ID =
  import.meta.env.VITE_GA_MEASUREMENT_ID?.trim() || 'G-YLD8HLXYPY'

export function trackPageView(path: string, title?: string) {
  if (typeof window.gtag !== 'function') return
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: path,
    page_title: title ?? document.title,
  })
}
