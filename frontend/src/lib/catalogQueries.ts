import type { QueryClient } from '@tanstack/react-query'

/** Refetch storefront product caches after admin catalog changes. */
export function invalidateCatalogQueries(queryClient: QueryClient) {
  const opts = { refetchType: 'all' as const }
  void queryClient.invalidateQueries({ queryKey: ['product'], ...opts })
  void queryClient.invalidateQueries({ queryKey: ['products'], ...opts })
  void queryClient.invalidateQueries({ queryKey: ['products-on-sale'], ...opts })
  void queryClient.invalidateQueries({ queryKey: ['featured'], ...opts })
  void queryClient.invalidateQueries({ queryKey: ['admin-products'], ...opts })
  void queryClient.invalidateQueries({ queryKey: ['variants'], ...opts })
}
