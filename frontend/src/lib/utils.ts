import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatPrice(price: number, currency: string = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price)
}

/** Whole percent off when compare-at is above sale price; coerces API strings; ignores invalid API 0. */
export function productDiscountPercentOff(product: {
  price: number | string
  compareAtPrice?: number | string | null
  discountPercent?: number | string | null
}): number | null {
  const price = Number(product.price)
  const compare =
    product.compareAtPrice != null && product.compareAtPrice !== ''
      ? Number(product.compareAtPrice)
      : NaN
  if (!Number.isFinite(price) || price <= 0) return null
  if (!Number.isFinite(compare) || compare <= price) return null

  const fromApi =
    product.discountPercent != null && product.discountPercent !== ''
      ? Number(product.discountPercent)
      : NaN
  if (Number.isFinite(fromApi) && fromApi > 0) {
    return Math.min(100, Math.round(fromApi))
  }

  const computed = Math.round(((compare - price) / compare) * 100)
  return computed > 0 ? Math.min(100, computed) : null
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

/** e.g. 9 March 2026 — for receipts and WhatsApp summaries */
export function formatOrderDateLong(date: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function instagramProfileUrl(handleOrUsername: string): string {
  const user = handleOrUsername.replace(/^@/, '').trim()
  return `https://www.instagram.com/${encodeURIComponent(user)}/`
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
