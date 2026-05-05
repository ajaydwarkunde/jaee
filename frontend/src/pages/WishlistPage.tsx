import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Heart, ShoppingBag, Trash2 } from 'lucide-react'
import { wishlistService } from '@/services/wishlistService'
import { cartService } from '@/services/cartService'
import { useAuthStore } from '@/stores/authStore'
import { formatPrice } from '@/lib/utils'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import LazyImage from '@/components/ui/LazyImage'
import toast from 'react-hot-toast'
import { showCartToast } from '@/components/ui/CartToast'
import type { Product } from '@/types'
import { defaultVariantIdForProduct } from '@/lib/cartHelpers'
import { productListingImageProps } from '@/lib/imageUrl'

export default function WishlistPage() {
  const { isAuthenticated } = useAuthStore()
  const queryClient = useQueryClient()

  const { data: wishlist, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: wishlistService.getWishlist,
    enabled: isAuthenticated,
  })

  const removeMutation = useMutation({
    mutationFn: (productId: number) => wishlistService.removeFromWishlist(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
      queryClient.invalidateQueries({ queryKey: ['wishlistIds'] })
      toast.success('Removed from wishlist')
    },
    onError: () => {
      toast.error('Failed to remove from wishlist')
    },
  })

  const addToCartMutation = useMutation({
    mutationFn: (product: Product) =>
      cartService.addToCart(product.id, 1, defaultVariantIdForProduct(product)),
    onSuccess: (_, product) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      showCartToast({ productName: product.name, productImage: product.images[0], price: product.price, currency: product.currency })
    },
    onError: () => {
      toast.error('Failed to add to cart')
    },
  })

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-cream">
        <div className="text-center px-4">
          <Heart className="w-16 h-16 text-rose/30 mx-auto mb-4" />
          <h1 className="heading-3 text-charcoal mb-2">Your Wishlist</h1>
          <p className="text-warm-gray mb-8 max-w-md mx-auto">
            Please sign in to view and manage your wishlist.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/login">
              <Button>Sign In</Button>
            </Link>
            <Link to="/register">
              <Button variant="outline">Create Account</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return <LoadingSpinner fullScreen />
  }

  const items = wishlist || []

  return (
    <div className="bg-cream min-h-screen py-8 md:py-12">
      <div className="container-custom">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="w-7 h-7 text-rose" />
          <h1 className="heading-2 text-charcoal">My Wishlist</h1>
          {items.length > 0 && (
            <span className="text-warm-gray text-sm">({items.length} items)</span>
          )}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16 bg-soft-white rounded-xl shadow-soft">
            <Heart className="w-16 h-16 text-warm-gray/50 mx-auto mb-4" />
            <h2 className="heading-4 text-charcoal mb-2">Your wishlist is empty</h2>
            <p className="text-warm-gray mb-8">
              Start adding items you love to keep track of them.
            </p>
            <Link to="/shop">
              <Button>Explore Products</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => {
              const img = productListingImageProps(item.product.images[0])
              return (
              <div
                key={item.id}
                className="bg-soft-white rounded-xl shadow-soft overflow-hidden group"
              >
                <Link to={`/product/${item.product.slug}`} className="block relative aspect-square bg-cream overflow-hidden">
                  <LazyImage
                    src={img.src}
                    srcSet={img.srcSet}
                    sizes={img.sizes}
                    alt={item.product.name}
                    wrapperClassName="absolute inset-0"
                    className="w-full h-full object-contain object-center p-3 bg-cream transition-opacity group-hover:opacity-95"
                  />
                  {item.product.compareAtPrice && item.product.compareAtPrice > item.product.price && (
                    <span className="absolute top-3 left-3 bg-rose text-soft-white text-xs font-semibold px-2 py-1 rounded-full">
                      {Math.round(((item.product.compareAtPrice - item.product.price) / item.product.compareAtPrice) * 100)}% OFF
                    </span>
                  )}
                </Link>

                <div className="p-4">
                  <Link
                    to={`/product/${item.product.slug}`}
                    className="font-serif text-lg font-semibold text-rose hover:opacity-90 transition-opacity line-clamp-1 tracking-tight"
                  >
                    {item.product.name}
                  </Link>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-lg text-rose font-semibold tabular-nums">
                      {formatPrice(item.product.price)}
                    </span>
                    {item.product.compareAtPrice && item.product.compareAtPrice > item.product.price && (
                      <span className="text-sm text-warm-gray line-through tabular-nums">
                        {formatPrice(item.product.compareAtPrice)}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      className="flex-1"
                      icon={<ShoppingBag className="w-4 h-4" />}
                      onClick={() => addToCartMutation.mutate(item.product)}
                      loading={addToCartMutation.isPending}
                      disabled={!item.product.inStock}
                    >
                      {item.product.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </Button>
                    <button
                      onClick={() => removeMutation.mutate(item.product.id)}
                      className="p-2 text-warm-gray hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
