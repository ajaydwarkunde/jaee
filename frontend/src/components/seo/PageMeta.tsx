import { useEffect } from 'react'
import { applyPageMeta, type PageMetaInput } from '@/lib/seo'

/** Updates document head for SEO / GEO (title, description, Open Graph, canonical). */
export default function PageMeta(props: PageMetaInput) {
  const { title, description, path, image, type, noindex } = props

  useEffect(() => {
    applyPageMeta({ title, description, path, image, type, noindex })
  }, [title, description, path, image, type, noindex])

  return null
}
