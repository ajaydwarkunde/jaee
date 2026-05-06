import type { QueryClient } from '@tanstack/react-query'
import type { ProductFilters } from '@/types'
import { productService } from '@/services/productService'

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

/** `/shop` — all products, default sort (matches ShopPage state before URL overrides). */
export function shopIndexListingFilters(): ProductFilters {
  return {
    categoryId: undefined,
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

/** Warm listing JSON cache so “View All” feels instant (hero → `/shop/candles` already used candle prefetch). */
export function prefetchShopIndexListing(queryClient: QueryClient) {
  const filters = shopIndexListingFilters()
  return queryClient.prefetchQuery({
    queryKey: ['products', filters],
    queryFn: () => productService.getProducts(filters),
  })
}

const productPageChunk = () => import('@/pages/ProductPage')

/** Matches ProductPage `useQuery` key — prefetch on card/link hover so PDP renders + requests images sooner. */
export function prefetchProductBySlug(queryClient: QueryClient, slug: string | undefined | null) {
  const s = slug?.trim()
  if (!s) return Promise.resolve()
  void productPageChunk()
  return queryClient.prefetchQuery({
    queryKey: ['product', s],
    queryFn: () => productService.getProductBySlug(s),
  })
}
