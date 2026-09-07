import { useEffect, useMemo, useRef } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Tag, Percent } from 'lucide-react'
import { productService } from '@/services/productService'
import ProductGrid from '@/components/product/ProductGrid'
import Button from '@/components/ui/Button'
import { useStoreSettings } from '@/hooks/useStoreSettings'
import type { StoreSettings } from '@/services/settingsService'
import { cmsHeroImageProps } from '@/lib/imageUrl'

export default function SalePage() {
  const { getValue } = useStoreSettings()
  const saleBannerImg = getValue('sale_page_header_image_url' as keyof StoreSettings).trim()
  const saleBannerTitle = getValue('sale_page_header_title' as keyof StoreSettings).trim()
  const saleBannerSubtitle = getValue('sale_page_header_subtitle' as keyof StoreSettings).trim()

  const saleBannerImgProps = saleBannerImg ? cmsHeroImageProps(saleBannerImg, 'full') : null

  const {
    data: productsPages,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ['products-on-sale'],
    queryFn: ({ pageParam }) => productService.getOnSaleProducts(pageParam, 24),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (lastPage.last) return undefined
      const next = lastPage.page + 1
      return next < lastPage.totalPages ? next : undefined
    },
  })

  const products = useMemo(
    () => productsPages?.pages.flatMap((page) => page.content) ?? [],
    [productsPages]
  )
  const totalElements = productsPages?.pages[0]?.totalElements

  const loadMoreRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = loadMoreRef.current
    if (!el) return

    const maybeLoadMore = () => {
      if (!hasNextPage || isFetchingNextPage) return
      if (el.getBoundingClientRect().top < window.innerHeight + 900) {
        void fetchNextPage()
      }
    }

    let io: IntersectionObserver | undefined
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
            void fetchNextPage()
          }
        },
        { root: null, rootMargin: '900px 0px', threshold: 0 }
      )
      io.observe(el)
    }

    window.addEventListener('scroll', maybeLoadMore, { passive: true })
    maybeLoadMore()
    return () => {
      io?.disconnect()
      window.removeEventListener('scroll', maybeLoadMore)
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, products.length])

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Banner */}
      <div
        className={`relative py-12 md:py-16 overflow-hidden ${
          saleBannerImg ? '' : 'bg-gradient-to-r from-rose/20 via-blush to-rose/10'
        }`}
      >
        {saleBannerImg && saleBannerImgProps ? (
          <>
            <img
              src={saleBannerImgProps.src}
              srcSet={saleBannerImgProps.srcSet}
              sizes={saleBannerImgProps.sizes}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              decoding="async"
              fetchPriority="high"
            />
            <div className="absolute inset-0 bg-charcoal/45" />
          </>
        ) : null}
        <div className="container-custom text-center relative z-10">
          {!saleBannerImg ? (
            <div className="flex items-center justify-center gap-3 mb-4">
              <Tag className="w-8 h-8 text-rose" />
              <Percent className="w-6 h-6 text-rose" />
            </div>
          ) : null}
          <h1 className={`heading-2 ${saleBannerImg ? 'text-soft-white drop-shadow-sm' : 'text-charcoal'}`}>
            {saleBannerTitle || 'Sale & Offers'}
          </h1>
          <p
            className={`mt-4 max-w-2xl mx-auto ${
              saleBannerImg ? 'text-cream/90' : 'text-warm-gray'
            }`}
          >
            {saleBannerSubtitle ||
              'Discover amazing deals on our premium candles and home decor. Limited time offers you do not want to miss!'}
          </p>
        </div>
      </div>

      <div className="container-custom py-8 md:py-12">
        {totalElements != null && (
          <p className="text-sm text-warm-gray mb-6">
            {totalElements} {totalElements === 1 ? 'product' : 'products'} on sale
          </p>
        )}

        <ProductGrid
          products={products}
          loading={isLoading}
          emptyMessage="No sale items right now. Check back soon for amazing deals!"
        />

        <div ref={loadMoreRef} className="flex flex-col items-center gap-3 py-10" aria-live="polite">
          {isFetchingNextPage && (
            <p className="text-sm text-warm-gray">Loading more products…</p>
          )}
          {hasNextPage && !isFetchingNextPage && (
            <Button variant="outline" size="sm" onClick={() => void fetchNextPage()}>
              Load more products
            </Button>
          )}
          {!hasNextPage && products.length > 0 && (
            <p className="text-sm text-warm-gray">You&apos;ve seen all products</p>
          )}
        </div>
      </div>
    </div>
  )
}
