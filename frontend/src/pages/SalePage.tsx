import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Tag, Percent } from 'lucide-react'
import { productService } from '@/services/productService'
import { cartService } from '@/services/cartService'
import { useAuthStore } from '@/stores/authStore'
import { useCartStore } from '@/stores/cartStore'
import ProductGrid from '@/components/product/ProductGrid'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'
import type { Product } from '@/types'

export default function SalePage() {
  const [page, setPage] = useState(0)
  const { isAuthenticated } = useAuthStore()
  const addToGuestCart = useCartStore((state) => state.addToGuestCart)
  const queryClient = useQueryClient()

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products-on-sale', page],
    queryFn: () => productService.getOnSaleProducts(page, 12),
  })

  const addToCartMutation = useMutation({
    mutationFn: (product: Product) => cartService.addToCart(product.id, 1),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      toast.success('Added to cart!')
    },
    onError: () => {
      toast.error('Failed to add to cart')
    },
  })

  const handleAddToCart = (product: Product) => {
    if (isAuthenticated) {
      addToCartMutation.mutate(product)
    } else {
      addToGuestCart(product.id, 1)
      toast.success('Added to cart!')
    }
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-rose/20 via-blush to-rose/10 py-12 md:py-16">
        <div className="container-custom text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Tag className="w-8 h-8 text-rose" />
            <Percent className="w-6 h-6 text-rose" />
          </div>
          <h1 className="heading-2 text-charcoal">Sale & Offers</h1>
          <p className="mt-4 text-warm-gray max-w-2xl mx-auto">
            Discover amazing deals on our premium candles and home decor. 
            Limited time offers you don't want to miss!
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
          onAddToCart={handleAddToCart}
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
