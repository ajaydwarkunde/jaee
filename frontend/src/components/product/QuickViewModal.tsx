import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, Minus, Plus, Heart, Star } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { formatPrice } from '@/lib/utils'
import { cartService } from '@/services/cartService'
import { wishlistService } from '@/services/wishlistService'
import { useAuthStore } from '@/stores/authStore'
import { useCartStore } from '@/stores/cartStore'
import { getErrorMessage } from '@/lib/api'
import type { Product } from '@/types'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import toast from 'react-hot-toast'
import { showCartToast } from '@/components/ui/CartToast'

interface QuickViewModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

export default function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const { isAuthenticated } = useAuthStore()
  const addToGuestCart = useCartStore((state) => state.addToGuestCart)
  const queryClient = useQueryClient()

  const { data: wishlistIds = [] } = useQuery({
    queryKey: ['wishlistIds'],
    queryFn: wishlistService.getWishlistProductIds,
    enabled: isAuthenticated,
  })

  const isWishlisted = product ? wishlistIds.includes(product.id) : false

  const addToCartMutation = useMutation({
    mutationFn: () => cartService.addToCart(product!.id, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      showCartToast({ productName: product!.name, productImage: product!.images[0], price: product!.price, currency: product!.currency, quantity })
      onClose()
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  const toggleWishlistMutation = useMutation({
    mutationFn: async () => {
      if (!product) return
      if (isWishlisted) await wishlistService.removeFromWishlist(product.id)
      else await wishlistService.addToWishlist(product.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlistIds'] })
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
      toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist')
    },
    onError: () => toast.error('Please login to use wishlist'),
  })

  const handleAddToCart = () => {
    if (!product) return
    if (isAuthenticated) {
      addToCartMutation.mutate()
    } else {
      addToGuestCart(product.id, quantity)
      showCartToast({ productName: product.name, productImage: product.images[0], price: product.price, currency: product.currency, quantity })
      onClose()
    }
  }

  if (!product) return null

  const images = product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=600']
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" showClose>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Image */}
        <div>
          <div className="aspect-square bg-cream rounded-lg overflow-hidden">
            <img src={images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 mt-3">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-14 h-14 rounded overflow-hidden border-2 transition-colors ${selectedImage === idx ? 'border-rose' : 'border-transparent'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.categoryName && (
            <p className="text-xs text-warm-gray uppercase tracking-wide mb-1">{product.categoryName}</p>
          )}
          <h2 className="font-serif text-2xl font-medium text-charcoal mb-2">{product.name}</h2>

          {(product.reviewCount ?? 0) > 0 && (
            <div className="flex items-center gap-1 mb-3">
              <Star className="w-4 h-4 fill-warning text-warning" />
              <span className="text-sm font-medium">{product.avgRating?.toFixed(1)}</span>
              <span className="text-xs text-warm-gray">({product.reviewCount})</span>
            </div>
          )}

          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="text-2xl font-bold text-rose">{formatPrice(product.price, product.currency)}</span>
            {hasDiscount && (
              <span className="text-base text-warm-gray line-through">{formatPrice(product.compareAtPrice!, product.currency)}</span>
            )}
            {!product.inStock ? (
              <Badge variant="error">Out of Stock</Badge>
            ) : product.stockQty <= 5 ? (
              <Badge variant="warning">Only {product.stockQty} left</Badge>
            ) : null}
          </div>

          {product.description && (
            <p className="text-sm text-warm-gray leading-relaxed mb-4 line-clamp-3">{product.description}</p>
          )}

          {product.inStock && (
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Qty:</span>
                <div className="flex items-center border border-blush rounded-full">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-1.5 hover:bg-blush rounded-l-full transition-colors">
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 text-sm font-medium">{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(product.stockQty, q + 1))} className="p-1.5 hover:bg-blush rounded-r-full transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddToCart} loading={addToCartMutation.isPending} icon={<ShoppingBag className="w-4 h-4" />} className="flex-1">
                  Add to Cart
                </Button>
                <Button
                  variant={isWishlisted ? 'primary' : 'outline'}
                  onClick={() => {
                    if (!isAuthenticated) { toast.error('Please login'); return }
                    toggleWishlistMutation.mutate()
                  }}
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                </Button>
              </div>
            </div>
          )}

          <Link to={`/product/${product.slug}`} onClick={onClose} className="text-sm text-rose font-medium hover:underline">
            View full details →
          </Link>
        </div>
      </div>
    </Modal>
  )
}
