import type { ProductFilters } from '@/types'

/** Stable shape for React Query keys — must match `ShopPage` filter state + prefetch calls */
export function candleListingFilters(categoryId: number): ProductFilters {
  return {
    categoryId,
    minPrice: undefined,
    maxPrice: undefined,
    search: undefined,
    color: undefined,
    size: undefined,
    sortBy: 'newest',
    sortDir: 'desc',
    page: 0,
    pageSize: 12,
  }
}
