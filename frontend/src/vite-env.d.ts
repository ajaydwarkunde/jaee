/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_RAZORPAY_KEY_ID: string
  readonly VITE_GA_MEASUREMENT_ID?: string
}

interface Window {
  dataLayer?: unknown[]
  gtag?: (...args: unknown[]) => void
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
