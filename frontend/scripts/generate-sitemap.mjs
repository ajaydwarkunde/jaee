/**
 * Build-time sitemap for GEO / SEO. Run before `vite build`.
 * Env: VITE_SITE_URL, VITE_API_URL (production values on Vercel).
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')

const SITE_URL = (process.env.VITE_SITE_URL || 'https://jaai-store.vercel.app').replace(/\/$/, '')
const API_URL = (process.env.VITE_API_URL || 'https://jaee-backend.onrender.com').replace(/\/$/, '')

const STATIC_PATHS = [
  '/',
  '/shop',
  '/shop/candles',
  '/sale',
  '/about',
  '/custom-candle',
  '/custom-hamper',
]

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function urlEntry(loc, changefreq = 'weekly', priority = '0.7') {
  const today = new Date().toISOString().slice(0, 10)
  return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
}

async function fetchProductSlugs() {
  const slugs = []
  let page = 0
  let last = false

  while (!last) {
    const res = await fetch(`${API_URL}/products?page=${page}&pageSize=100`)
    if (!res.ok) {
      console.warn(`[sitemap] products API ${res.status} — skipping product URLs`)
      return slugs
    }
    const body = await res.json()
    const data = body?.data
    if (!data?.content) break
    for (const p of data.content) {
      if (p?.slug && p.active !== false) slugs.push(p.slug)
    }
    last = Boolean(data.last)
    page += 1
    if (page > 50) break
  }

  return slugs
}

async function fetchCategorySlugs() {
  try {
    const res = await fetch(`${API_URL}/categories/storefront`)
    if (!res.ok) return []
    const body = await res.json()
    const list = body?.data ?? []
    return list.map((c) => c.slug).filter(Boolean)
  } catch {
    return []
  }
}

async function main() {
  mkdirSync(publicDir, { recursive: true })

  const [productSlugs, categorySlugs] = await Promise.all([
    fetchProductSlugs(),
    fetchCategorySlugs(),
  ])

  const paths = new Set(STATIC_PATHS)
  for (const slug of categorySlugs) {
    paths.add(`/shop/${slug}`)
  }
  for (const slug of productSlugs) {
    paths.add(`/product/${slug}`)
  }

  const entries = []
  for (const path of paths) {
    const loc = `${SITE_URL}${path}`
    const priority =
      path === '/' ? '1.0' : path.startsWith('/product/') ? '0.8' : path.startsWith('/shop') ? '0.9' : '0.7'
    const changefreq = path.startsWith('/product/') ? 'weekly' : 'daily'
    entries.push(urlEntry(loc, changefreq, priority))
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>
`

  const outPath = join(publicDir, 'sitemap.xml')
  writeFileSync(outPath, xml, 'utf8')
  console.log(`[sitemap] Wrote ${paths.size} URLs to ${outPath}`)
}

main().catch((err) => {
  console.error('[sitemap] Failed:', err)
  process.exit(1)
})
