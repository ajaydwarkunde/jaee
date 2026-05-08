import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Tag, Percent } from 'lucide-react'
import { productService } from '@/services/productService'
import ProductGrid from '@/components/product/ProductGrid'
import Button from '@/components/ui/Button'
import { useStoreSettings } from '@/hooks/useStoreSettings'
import type { StoreSettings } from '@/services/settingsService'
import { cmsHeroImageProps } from '@/lib/imageUrl'

export default function SalePage() {
  const [page, setPage] = useState(0)
  const { getValue } = useStoreSettings()
  const saleBannerImg = getValue('sale_page_header_image_url' as keyof StoreSettings).trim()
  const saleBannerTitle = getValue('sale_page_header_title' as keyof StoreSettings).trim()
  const saleBannerSubtitle = getValue('sale_page_header_subtitle' as keyof StoreSettings).trim()

  const saleBannerImgProps = saleBannerImg ? cmsHeroImageProps(saleBannerImg, 'full') : null

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products-on-sale', page],
    queryFn: () => productService.getOnSaleProducts(page, 12),
  })

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

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
        {/* Results count */}
        {productsData && (
          <p className="text-sm text-warm-gray mb-6">
            {productsData.totalElements} {productsData.totalElements === 1 ? 'product' : 'products'} on sale
          </p>
        )}

        {/* Products Grid */}
        <ProductGrid
          products={productsData?.content || []}
          loading={isLoading}
          emptyMessage="No sale items right now. Check back soon for amazing deals!"
        />

        {/* Pagination */}
        {productsData && productsData.totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={productsData.first}
            >
              Previous
            </Button>
            <span className="px-4 text-sm text-warm-gray">
              Page {productsData.page + 1} of {productsData.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={productsData.last}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
