import { describe, it, expect } from 'vitest'
import { optimizeImageUrl, cmsHeroImageProps, cmsSectionImageProps } from './imageUrl'

describe('optimizeImageUrl', () => {
  it('adds Unsplash resize params', () => {
    const out = optimizeImageUrl(
      'https://images.unsplash.com/photo-1?foo=bar',
      480,
      78,
    )
    const u = new URL(out)
    expect(u.searchParams.get('w')).toBe('480')
    expect(u.searchParams.get('fit')).toBe('max')
    expect(u.searchParams.get('auto')).toBe('format')
  })

  it('rewrites Supabase public object URL to render with dimensions', () => {
    const raw =
      'https://abcdefghijk.supabase.co/storage/v1/object/public/images/file.jpg'
    const out = optimizeImageUrl(raw, 640)
    expect(out).toContain('/storage/v1/render/image/public/')
    expect(out).toContain('width=640')
    expect(out).toContain('height=640')
    expect(out).toContain('resize=contain')
  })

  it('updates existing Supabase render URL dimensions', () => {
    const raw =
      'https://xyz.supabase.co/storage/v1/render/image/public/bucket/img.png?width=100'
    const out = optimizeImageUrl(raw, 320)
    expect(out).toContain('/render/image/public/')
    expect(out).toContain('width=320')
  })

  it('does not rewrite signed Supabase object URLs', () => {
    const raw =
      'https://xyz.supabase.co/storage/v1/object/sign/public/bucket/img.jpg?token=abc'
    expect(optimizeImageUrl(raw, 640)).toBe(raw)
  })

  it('returns unknown hosts unchanged', () => {
    const raw = 'https://example.com/static/photo.jpg'
    expect(optimizeImageUrl(raw, 800)).toBe(raw)
  })
})

describe('cmsHeroImageProps', () => {
  it('returns srcSet for Unsplash', () => {
    const u = 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6'
    const p = cmsHeroImageProps(u, 'full')
    expect(p.srcSet).toContain('640w')
    expect(p.srcSet).toContain('1920w')
    expect(p.sizes).toBeTruthy()
  })
})

describe('cmsSectionImageProps', () => {
  it('returns tighter srcSet for section images', () => {
    const p = cmsSectionImageProps(
      'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6',
    )
    expect(p.srcSet).toContain('480w')
    expect(p.srcSet?.includes('1920w')).toBe(false)
  })
})
