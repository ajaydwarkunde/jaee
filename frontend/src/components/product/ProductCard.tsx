import { Link } from 'react-router-dom'
import { ShoppingBag, Heart, Star, Plus, Eye } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { formatPrice, productDiscountPercentOff } from '@/lib/utils'
import { wishlistService } from '@/services/wishlistService'
import { useAuthStore } from '@/stores/authStore'
import type { Product } from '@/types'
import Badge from '../ui/Badge'
import LazyImage from '../ui/LazyImage'
import toast from 'react-hot-toast'

interface ProductCardProps {
  product: Product
  onAddToCart?: () => void
  onQuickView?: () => void
}

export default function ProductCard({ product, onAddToCart, onQuickView }: ProductCardProps) {
  const imageUrl = product.images[0] || 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=400'
  const discountPct = productDiscountPercentOff(product)
  const hasDiscount = discountPct != null
  const { isAuthenticated } = useAuthStore()
  const queryClient = useQueryClient()

  // Get wishlist product IDs
  const { data: wishlistIds = [] } = useQuery({
    queryKey: ['wishlistIds'],
    queryFn: wishlistService.getWishlistProductIds,
    enabled: isAuthenticated,
  })

  const isWishlisted = wishlistIds.includes(product.id)

  const toggleWishlistMutation = useMutation({
    mutationFn: async () => {
      if (isWishlisted) {
        await wishlistService.removeFromWishlist(product.id)
      } else {
        await wishlistService.addToWishlist(product.id)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlistIds'] })
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
      toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist')
    },
    onError: () => {
      toast.error('Please login to use wishlist')
    },
  })

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) {
      toast.error('Please login to add to wishlist')
      return
    }
    toggleWishlistMutation.mutate()
  }

  return (
    <div className="group bg-soft-white rounded-lg overflow-hidden shadow-soft hover:shadow-soft-md transition-all duration-300">
      {/* Image container */}
      <div className="relative aspect-square overflow-hidden bg-cream">
        <Link to={`/product/${product.slug}`} className="block w-full h-full">
          <LazyImage
            src={imageUrl}
            alt={product.name}
            wrapperClassName="w-full h-full"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
        </Link>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {hasDiscount && (
            <span className="inline-flex items-center rounded-full bg-rose text-soft-white text-xs font-semibold px-2.5 py-1 shadow-md tabular-nums">
              {discountPct}% off
            </span>
          )}
          {!product.inStock && (
            <Badge variant="error">Out of Stock</Badge>
          )}
          {product.stockQty > 0 && product.stockQty <= 5 && (
            <Badge variant="warning">Only {product.stockQty} left</Badge>
          )}
        </div>

        {/* Quick actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <button
            onClick={handleWishlistToggle}
            className={`p-2 rounded-full shadow-soft transition-colors ${
              isWishlisted
                ? 'bg-rose text-soft-white'
                : 'bg-soft-white/90 backdrop-blur-sm hover:bg-rose hover:text-soft-white md:opacity-0 md:group-hover:opacity-100'
            }`}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
          {onQuickView && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView() }}
              className="p-2 rounded-full shadow-soft bg-soft-white/90 backdrop-blur-sm hover:bg-rose hover:text-soft-white transition-colors md:opacity-0 md:group-hover:opacity-100"
              aria-label="Quick view"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Add to cart overlay (desktop only - hidden on touch devices) */}
        {product.inStock && onAddToCart && (
          <div className="hidden md:block absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={(e) => {
                e.preventDefault()
                onAddToCart()
              }}
              className="w-full py-2.5 bg-rose text-soft-white text-sm font-medium rounded-lg hover:bg-rose-dark transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              Add to Cart
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <Link to={`/product/${product.slug}`} className="block p-4">
        {product.categoryNames?.length > 0 && (
          <p className="text-xs text-warm-gray uppercase tracking-wide mb-1">
            {product.categoryNames.join(' · ')}
          </p>
        )}
        <h3 className="font-serif text-lg font-bold text-charcoal line-clamp-1 group-hover:text-rose transition-colors tracking-tight">
          {product.name}
        </h3>
        {/* Rating */}
        {(product.reviewCount ?? 0) > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <Star className="w-3.5 h-3.5 fill-warning text-warning" />
            <span className="text-sm font-medium text-charcoal tabular-nums">{product.avgRating?.toFixed(1)}</span>
            <span className="text-xs text-warm-gray">({product.reviewCount})</span>
          </div>
        )}
        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex flex-col min-w-0 gap-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg font-semibold text-rose tabular-nums">
                {formatPrice(Number(product.price), product.currency)}
              </span>
              {hasDiscount && product.compareAtPrice != null && (
                <span className="text-sm text-warm-gray line-through tabular-nums">
                  {formatPrice(Number(product.compareAtPrice), product.currency)}
                </span>
              )}
            </div>
            {hasDiscount && (
              <span className="text-sm font-semibold text-rose tabular-nums">
                {discountPct}% off
              </span>
            )}
          </div>
          {product.inStock && onAddToCart && (
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onAddToCart()
              }}
              className="md:hidden p-2 bg-rose text-soft-white rounded-full hover:bg-rose-dark transition-colors shrink-0"
              aria-label="Add to cart"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
      </Link>
    </div>
  )
}
