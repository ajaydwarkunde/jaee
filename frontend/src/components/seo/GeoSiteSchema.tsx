import JsonLd from '@/components/seo/JsonLd'
import { buildOrganizationSchema, buildWebSiteSchema } from '@/lib/seo'
import { useStoreSettings } from '@/hooks/useStoreSettings'

/** Sitewide Organization + WebSite entity graph for crawlers and LLMs. */
export default function GeoSiteSchema() {
  const { instagramHandle } = useStoreSettings()
  return <JsonLd data={[buildOrganizationSchema(instagramHandle), buildWebSiteSchema()]} />
}
