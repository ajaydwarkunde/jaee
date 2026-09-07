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
    pageSize: 24,
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
    pageSize: 24,
  }
}

/** Infinite-scroll query key — page is a pageParam, not part of the key. */
export function shopListingQueryKey(filters: ProductFilters) {
  const { page: _page, ...rest } = filters
  return ['products', rest] as const
}

function prefetchProductListing(queryClient: QueryClient, filters: ProductFilters) {
  return queryClient.prefetchInfiniteQuery({
    queryKey: shopListingQueryKey(filters),
    queryFn: ({ pageParam }) =>
      productService.getProducts({ ...filters, page: pageParam as number }),
    initialPageParam: 0,
  })
}

/** Warm listing JSON cache so “View All” feels instant (hero → `/shop/candles` already used candle prefetch). */
export function prefetchShopIndexListing(queryClient: QueryClient) {
  return prefetchProductListing(queryClient, shopIndexListingFilters())
}

export function prefetchCandleListing(queryClient: QueryClient, categoryId: number) {
  return prefetchProductListing(queryClient, candleListingFilters(categoryId))
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
