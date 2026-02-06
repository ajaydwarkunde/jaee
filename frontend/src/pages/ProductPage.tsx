import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ShoppingBag, Heart, Minus, Plus, ChevronLeft, Truck, RotateCcw, Shield } from 'lucide-react'
import { productService } from '@/services/productService'
import { cartService } from '@/services/cartService'
import { useAuthStore } from '@/stores/authStore'
import { useCartStore } from '@/stores/cartStore'
import { formatPrice } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { ProductDetailSkeleton } from '@/components/ui/Skeleton'
import toast from 'react-hot-toast'

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>()
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)

  const { isAuthenticated } = useAuthStore()
  const addToGuestCart = useCartStore((state) => state.addToGuestCart)
  const queryClient = useQueryClient()

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productService.getProductBySlug(slug!),
    enabled: !!slug,
  })

  const addToCartMutation = useMutation({
    mutationFn: () => cartService.addToCart(product!.id, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      toast.success(`Added ${quantity} item(s) to cart!`)
    },
    onError: () => {
      toast.error('Failed to add to cart')
    },
  })

  const handleAddToCart = () => {
    if (!product) return

    if (isAuthenticated) {
      addToCartMutation.mutate()
    } else {
      addToGuestCart(product.id, quantity)
      toast.success(`Added ${quantity} item(s) to cart!`)
    }
  }

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => {
      const newQty = prev + delta
      if (newQty < 1) return 1
      if (product && newQty > product.stockQty) return product.stockQty
      return newQty
    })
  }

  if (isLoading) {
    return (
      <div className="container-custom py-12">
        <ProductDetailSkeleton />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container-custom py-12 text-center">
        <h1 className="heading-3 text-charcoal mb-4">Product Not Found</h1>
        <p className="text-warm-gray mb-8">The product you're looking for doesn't exist.</p>
        <Link to="/shop">
          <Button>Back to Shop</Button>
        </Link>
      </div>
    )
  }

  const images = product.images.length > 0 
    ? product.images 
    : ['https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=800']

  return (
    <div className="bg-cream min-h-screen">
      <div className="container-custom py-8 md:py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-8">
          <Link to="/shop" className="text-warm-gray hover:text-rose transition-colors flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" />
            Back to Shop
          </Link>
          <span className="text-warm-gray">/</span>
          {product.categoryName && (
            <>
              <Link to={`/shop`} className="text-warm-gray hover:text-rose transition-colors">
                {product.categoryName}
              </Link>
              <span className="text-warm-gray">/</span>
            </>
          )}
          <span className="text-charcoal">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div className="space-y-4">
            {/* Main image */}
            <div className="aspect-square bg-soft-white rounded-xl overflow-hidden shadow-soft">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === idx ? 'border-rose' : 'border-transparent hover:border-blush'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="lg:py-4">
            {product.categoryName && (
              <p className="text-sm text-warm-gray uppercase tracking-wide mb-2">
                {product.categoryName}
              </p>
            )}
            
            <h1 className="heading-2 text-charcoal mb-4">{product.name}</h1>

            <div className="flex items-center gap-4 mb-6 flex-wrap">
              <span className="text-3xl font-serif font-semibold text-rose">
                {formatPrice(product.price, product.currency)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <>
                  <span className="text-xl text-warm-gray line-through">
                    {formatPrice(product.compareAtPrice, product.currency)}
                  </span>
                  <Badge variant="success" size="md">{product.discountPercent}% OFF</Badge>
                </>
              )}
              {!product.inStock ? (
                <Badge variant="error" size="md">Out of Stock</Badge>
              ) : product.stockQty <= 5 ? (
                <Badge variant="warning" size="md">Only {product.stockQty} left</Badge>
              ) : (
                <Badge variant="success" size="md">In Stock</Badge>
              )}
            </div>

            {product.description && (
              <div className="prose prose-warm-gray mb-8">
                <p className="text-warm-gray leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Quantity & Add to Cart */}
            {product.inStock && (
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-charcoal">Quantity:</span>
                  <div className="flex items-center border border-blush rounded-full">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="p-2 hover:bg-blush rounded-l-full transition-colors disabled:opacity-50"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 font-medium min-w-[48px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= product.stockQty}
                      className="p-2 hover:bg-blush rounded-r-full transition-colors disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleAddToCart}
                    loading={addToCartMutation.isPending}
                    icon={<ShoppingBag className="w-5 h-5" />}
                    className="flex-1"
                    size="lg"
                  >
                    Add to Cart
                  </Button>
                  <Button variant="outline" size="lg" aria-label="Add to wishlist">
                    <Heart className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            )}

            {/* Features */}
            <div className="border-t border-blush pt-8 space-y-4">
              {[
                { icon: Truck, title: 'Free Shipping', desc: 'On orders over ₹999' },
                { icon: RotateCcw, title: 'Easy Returns', desc: '7-day return policy' },
                { icon: Shield, title: 'Secure Payment', desc: '100% secure checkout' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-rose/10 rounded-full flex items-center justify-center">
                    <Icon className="w-5 h-5 text-rose" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-charcoal">{title}</p>
                    <p className="text-xs text-warm-gray">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
