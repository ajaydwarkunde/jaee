import { describe, it, expect } from 'vitest'
import { cn, formatPrice, formatDate, truncate, slugify, getInitials } from '../utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible')
  })

  it('handles undefined and null', () => {
    expect(cn('a', undefined, null, 'b')).toBe('a b')
  })
})

describe('formatPrice', () => {
  it('formats INR by default', () => {
    const result = formatPrice(999)
    expect(result).toContain('999')
    expect(result).toMatch(/₹/)
  })

  it('formats with decimals when needed', () => {
    const result = formatPrice(49.99)
    expect(result).toContain('49.99')
  })

  it('formats zero', () => {
    const result = formatPrice(0)
    expect(result).toContain('0')
  })
})

describe('formatDate', () => {
  it('formats ISO date string', () => {
    const result = formatDate('2024-01-15T00:00:00')
    expect(result).toContain('15')
    expect(result).toContain('2024')
  })
})

describe('truncate', () => {
  it('returns string as-is if shorter than length', () => {
    expect(truncate('hello', 10)).toBe('hello')
  })

  it('truncates and adds ellipsis', () => {
    expect(truncate('hello world', 5)).toBe('hello...')
  })

  it('handles exact length', () => {
    expect(truncate('hello', 5)).toBe('hello')
  })
})

describe('slugify', () => {
  it('converts to lowercase with hyphens', () => {
    expect(slugify('Hello World')).toBe('hello-world')
  })

  it('removes special characters', () => {
    expect(slugify('Price: $10!')).toBe('price-10')
  })

  it('collapses multiple hyphens', () => {
    expect(slugify('a  --  b')).toBe('a-b')
  })
})

describe('getInitials', () => {
  it('returns first letters of each word', () => {
    expect(getInitials('John Doe')).toBe('JD')
  })

  it('returns single initial for one name', () => {
    expect(getInitials('Alice')).toBe('A')
  })

  it('limits to 2 characters', () => {
    expect(getInitials('A B C D')).toBe('AB')
  })

  it('returns ? for null/undefined', () => {
    expect(getInitials(null)).toBe('?')
    expect(getInitials(undefined)).toBe('?')
  })

  it('returns ? for empty string', () => {
    expect(getInitials('')).toBe('?')
  })
})
