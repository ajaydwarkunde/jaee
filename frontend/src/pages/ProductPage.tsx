import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ShoppingBag, Heart, Minus, Plus, ChevronLeft, ChevronRight, Truck, RotateCcw, Shield, Star, MessageSquare, Share2, Copy, Bell, Play, Volume2, VolumeX } from 'lucide-react'
import { productService } from '@/services/productService'
import { cartService } from '@/services/cartService'
import { wishlistService } from '@/services/wishlistService'
import { useAuthStore } from '@/stores/authStore'
import { useCartStore } from '@/stores/cartStore'
import { useStoreSettings } from '@/hooks/useStoreSettings'
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed'
import { formatPrice } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { ProductDetailSkeleton } from '@/components/ui/Skeleton'
import StarRating from '@/components/review/StarRating'
import ReviewSummary from '@/components/review/ReviewSummary'
import ReviewList from '@/components/review/ReviewList'
import ReviewForm from '@/components/review/ReviewForm'
import RecentlyViewed from '@/components/product/RecentlyViewed'
import { stockNotificationService } from '@/services/stockNotificationService'
import { getErrorMessage } from '@/lib/api'
import type { Product } from '@/types'
import toast from 'react-hot-toast'
import { showCartToast } from '@/components/ui/CartToast'

function ShareButtons({ productName }: { productName: string }) {
  const url = window.location.href
  const text = `Check out ${productName} from Jaai!`

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank')
  }

  const shareInstagram = () => {
    navigator.clipboard.writeText(url)
    toast.success('Link copied! Share it on Instagram')
  }

  const copyLink = () => {
    navigator.clipboard.writeText(url)
    toast.success('Link copied to clipboard!')
  }

  return (
    <div className="flex items-center gap-3 pt-6">
      <span className="text-sm text-warm-gray flex items-center gap-1.5">
        <Share2 className="w-4 h-4" /> Share:
      </span>
      <button onClick={shareWhatsApp} className="p-2 rounded-full bg-[#25D366]/10 hover:bg-[#25D366]/20 transition-colors" aria-label="Share on WhatsApp">
        <svg className="w-4 h-4 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      </button>
      <button onClick={shareInstagram} className="p-2 rounded-full bg-rose/10 hover:bg-rose/20 transition-colors" aria-label="Share on Instagram">
        <svg className="w-4 h-4 text-rose" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
      </button>
      <button onClick={copyLink} className="p-2 rounded-full bg-blush hover:bg-champagne transition-colors" aria-label="Copy link">
        <Copy className="w-4 h-4 text-charcoal" />
      </button>
    </div>
  )
}

function NotifyMeForm({ productId, productName }: { productId: number; productName: string }) {
  const [email, setEmail] = useState('')

  const { data: waitlistCount } = useQuery({
    queryKey: ['waitlistCount', productId],
    queryFn: () => stockNotificationService.getWaitlistCount(productId),
  })

  const subscribeMutation = useMutation({
    mutationFn: () => stockNotificationService.subscribe(productId, email),
    onSuccess: () => {
      toast.success(`We'll notify you when ${productName} is back in stock!`)
      setEmail('')
    },
    onError: () => {
      toast.error('Failed to subscribe. Please try again.')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email')
      return
    }
    subscribeMutation.mutate()
  }

  if (subscribeMutation.isSuccess) {
    return (
      <div className="bg-success/10 border border-success/30 rounded-lg p-4 mb-8">
        <p className="text-sm text-success font-medium flex items-center gap-2">
          <Bell className="w-4 h-4" />
          We'll email you when this product is back in stock!
        </p>
      </div>
    )
  }

  return (
    <div className="bg-blush/50 rounded-lg p-4 mb-8">
      <p className="text-sm font-medium text-charcoal mb-2 flex items-center gap-2">
        <Bell className="w-4 h-4 text-rose" />
        Get notified when it's back
        {(waitlistCount ?? 0) > 0 && (
          <span className="text-xs text-warm-gray font-normal">· {waitlistCount} people waiting</span>
        )}
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="flex-1 px-3 py-2 bg-soft-white border border-blush rounded-lg text-sm focus:outline-none focus:border-rose"
          required
        />
        <Button type="submit" size="sm" loading={subscribeMutation.isPending}>Notify Me</Button>
      </form>
    </div>
  )
}

function FrequentlyBoughtTogether({ product, onAddToCart }: { product: Product; onAddToCart: () => void }) {
  const { isAuthenticated } = useAuthStore()
  const addToGuestCart = useCartStore((state) => state.addToGuestCart)
  const queryClient = useQueryClient()

  const { data: relatedProducts = [] } = useQuery({
    queryKey: ['frequentlyBought', product.id],
    queryFn: () => productService.getRelatedProducts(product.id, 3),
    enabled: !!product.id,
  })

  const addToCartMutation = useMutation({
    mutationFn: (p: Product) => cartService.addToCart(p.id, 1),
    onSuccess: (_, p) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      showCartToast({ productName: p.name, productImage: p.images[0], price: p.price, currency: p.currency })
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })

  const handleAddItem = (p: Product) => {
    if (isAuthenticated) {
      addToCartMutation.mutate(p)
    } else {
      addToGuestCart(p.id, 1)
      showCartToast({ productName: p.name, productImage: p.images[0], price: p.price, currency: p.currency })
    }
  }

  const handleAddAll = () => {
    onAddToCart()
    relatedProducts.filter(p => p.inStock).forEach(p => handleAddItem(p))
  }

  if (relatedProducts.length === 0) return null

  const totalPrice = product.price + relatedProducts.filter(p => p.inStock).reduce((sum, p) => sum + p.price, 0)

  return (
    <div className="mt-16 border-t border-blush pt-12">
      <h2 className="heading-3 text-charcoal mb-8">Frequently Bought Together</h2>
      <div className="bg-soft-white rounded-xl p-6 shadow-soft">
        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 mb-6">
          {/* Current product */}
          <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-rose shrink-0">
            <img src={product.images[0] || 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=200'} alt={product.name} className="w-full h-full object-cover" />
          </div>
          {relatedProducts.filter(p => p.inStock).map((p) => (
            <div key={p.id} className="flex items-center gap-3 md:gap-4">
              <span className="text-2xl text-warm-gray font-light">+</span>
              <Link to={`/product/${p.slug}`} className="w-24 h-24 rounded-lg overflow-hidden border border-blush hover:border-rose transition-colors shrink-0">
                <img src={p.images[0] || 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=200'} alt={p.name} className="w-full h-full object-cover" />
              </Link>
            </div>
          ))}
        </div>
        <div className="text-center">
          <p className="text-sm text-warm-gray mb-1">Total price for all items</p>
          <p className="text-2xl font-bold text-rose mb-4">{formatPrice(totalPrice, product.currency)}</p>
          <Button onClick={handleAddAll} icon={<ShoppingBag className="w-4 h-4" />}>
            Add All to Cart
          </Button>
        </div>
      </div>
    </div>
  )
}

interface MediaItem {
  url: string
  type: 'image' | 'video'
}

function ImageGallery({
  images,
  videos,
  selectedImage,
  onSelect,
  productName,
}: {
  images: string[]
  videos: string[]
  selectedImage: number
  onSelect: (idx: number) => void
  productName: string
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [playingVideo, setPlayingVideo] = useState<number | null>(null)
  const [mutedVideo, setMutedVideo] = useState(true)
  const videoRefs = useRef<Map<number, HTMLVideoElement>>(new Map())

  const media: MediaItem[] = useMemo(() => {
    const items: MediaItem[] = images.map(url => ({ url, type: 'image' as const }))
    videos.forEach(url => items.push({ url, type: 'video' as const }))
    return items
  }, [images, videos])

  const total = media.length
  const SWIPE_THRESHOLD = 40
  const VELOCITY_THRESHOLD = 0.3

  const goTo = useCallback(
    (idx: number) => {
      const prev = videoRefs.current.get(selectedImage)
      if (prev) { prev.pause(); setPlayingVideo(null) }

      if (idx < 0) onSelect(total - 1)
      else if (idx >= total) onSelect(0)
      else onSelect(idx)
    },
    [onSelect, total, selectedImage],
  )

  const handlePointerDown = useCallback((clientX: number, clientY: number) => {
    touchStart.current = { x: clientX, y: clientY, time: Date.now() }
    setIsDragging(true)
  }, [])

  const handlePointerMove = useCallback(
    (clientX: number) => {
      if (!touchStart.current || !isDragging) return
      const dx = clientX - touchStart.current.x
      setDragOffset(dx)
    },
    [isDragging],
  )

  const handlePointerUp = useCallback(() => {
    if (!touchStart.current) return
    const elapsed = Date.now() - touchStart.current.time
    const velocity = Math.abs(dragOffset) / Math.max(elapsed, 1)
    const isSwipe = Math.abs(dragOffset) > SWIPE_THRESHOLD || velocity > VELOCITY_THRESHOLD

    if (isSwipe) {
      if (dragOffset < 0) goTo(selectedImage + 1)
      else goTo(selectedImage - 1)
    }

    touchStart.current = null
    setDragOffset(0)
    setIsDragging(false)
  }, [dragOffset, goTo, selectedImage])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return

    const onTouchStart = (e: TouchEvent) => {
      handlePointerDown(e.touches[0].clientX, e.touches[0].clientY)
    }
    const onTouchMove = (e: TouchEvent) => {
      handlePointerMove(e.touches[0].clientX)
      if (Math.abs(dragOffset) > 10) e.preventDefault()
    }
    const onTouchEnd = () => handlePointerUp()

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd)

    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
    }
  }, [handlePointerDown, handlePointerMove, handlePointerUp, dragOffset])

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    handlePointerDown(e.clientX, e.clientY)
  }
  const onMouseMove = (e: React.MouseEvent) => handlePointerMove(e.clientX)
  const onMouseUp = () => handlePointerUp()
  const onMouseLeave = () => {
    if (isDragging) handlePointerUp()
  }

  return (
    <div className="space-y-4">
      <div className="relative group">
        {/* Swipeable main image */}
        <div
          ref={trackRef}
          className="aspect-square bg-soft-white rounded-xl overflow-hidden shadow-soft cursor-grab active:cursor-grabbing select-none"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
        >
          <div
            className="flex h-full"
            style={{
              width: `${total * 100}%`,
              transform: `translateX(calc(-${(selectedImage * 100) / total}% + ${dragOffset}px))`,
              transition: isDragging ? 'none' : 'transform 350ms cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {media.map((item, idx) => (
              <div key={idx} className="h-full relative" style={{ width: `${100 / total}%` }}>
                {item.type === 'video' ? (
                  <>
                    <video
                      ref={(el) => { if (el) videoRefs.current.set(idx, el); else videoRefs.current.delete(idx) }}
                      src={item.url}
                      className="w-full h-full object-cover pointer-events-none"
                      muted={mutedVideo}
                      playsInline
                      loop
                      preload="metadata"
                      draggable={false}
                      onEnded={() => setPlayingVideo(null)}
                    />
                    {selectedImage === idx && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
                        {playingVideo !== idx ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              const vid = videoRefs.current.get(idx)
                              if (vid) { vid.play(); setPlayingVideo(idx) }
                            }}
                            className="w-14 h-14 rounded-full bg-charcoal/60 backdrop-blur-sm flex items-center justify-center hover:bg-charcoal/80 transition-colors"
                          >
                            <Play className="w-6 h-6 text-soft-white ml-0.5" fill="currentColor" />
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setMutedVideo(!mutedVideo)
                            }}
                            className="absolute bottom-4 right-4 w-9 h-9 rounded-full bg-charcoal/60 backdrop-blur-sm flex items-center justify-center hover:bg-charcoal/80 transition-colors"
                          >
                            {mutedVideo ? <VolumeX className="w-4 h-4 text-soft-white" /> : <Volume2 className="w-4 h-4 text-soft-white" />}
                          </button>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <img
                    src={item.url}
                    alt={`${productName} ${idx + 1}`}
                    className="w-full h-full object-cover pointer-events-none"
                    draggable={false}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Arrow buttons — visible on hover (desktop) */}
        {total > 1 && (
          <>
            <button
              onClick={() => goTo(selectedImage - 1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-soft-white/80 backdrop-blur-sm shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-soft-white"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5 text-charcoal" />
            </button>
            <button
              onClick={() => goTo(selectedImage + 1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-soft-white/80 backdrop-blur-sm shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-soft-white"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5 text-charcoal" />
            </button>
          </>
        )}

        {/* Dot indicators */}
        {total > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-charcoal/30 backdrop-blur-sm rounded-full px-2.5 py-1.5">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => onSelect(idx)}
                aria-label={`Go to image ${idx + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  selectedImage === idx
                    ? 'w-5 h-1.5 bg-soft-white'
                    : 'w-1.5 h-1.5 bg-soft-white/50 hover:bg-soft-white/80'
                }`}
              />
            ))}
          </div>
        )}

        {/* Image counter */}
        {total > 1 && (
          <span className="absolute top-3 right-3 bg-charcoal/40 backdrop-blur-sm text-soft-white text-xs font-medium px-2.5 py-1 rounded-full">
            {selectedImage + 1} / {total}
          </span>
        )}
      </div>

      {/* Thumbnails */}
      {total > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {media.map((item, idx) => (
            <button
              key={idx}
              onClick={() => { goTo(idx); onSelect(idx) }}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors relative ${
                selectedImage === idx ? 'border-rose' : 'border-transparent hover:border-blush'
              }`}
            >
              {item.type === 'video' ? (
                <>
                  <video src={item.url} className="w-full h-full object-cover" muted preload="metadata" />
                  <div className="absolute inset-0 flex items-center justify-center bg-charcoal/30">
                    <Play className="w-4 h-4 text-soft-white" fill="currentColor" />
                  </div>
                </>
              ) : (
                <img src={item.url} alt="" className="w-full h-full object-cover" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>()
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [showReviewForm, setShowReviewForm] = useState(false)

  const { isAuthenticated } = useAuthStore()
  const addToGuestCart = useCartStore((state) => state.addToGuestCart)
  const queryClient = useQueryClient()
  const { freeShippingThreshold, returnDays } = useStoreSettings()
  const { addProduct: addToRecentlyViewed } = useRecentlyViewed()

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productService.getProductBySlug(slug!),
    enabled: !!slug,
  })

  const { data: relatedProducts = [] } = useQuery({
    queryKey: ['relatedProducts', product?.id],
    queryFn: () => productService.getRelatedProducts(product!.id, 4),
    enabled: !!product?.id,
  })

  // Track recently viewed
  useEffect(() => {
    if (product) {
      addToRecentlyViewed(product)
    }
  }, [product, addToRecentlyViewed])

  const addToCartMutation = useMutation({
    mutationFn: () => cartService.addToCart(product!.id, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      showCartToast({ productName: product!.name, productImage: product!.images[0], price: product!.price, currency: product!.currency, quantity })
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })

  // Wishlist
  const { data: wishlistIds = [] } = useQuery({
    queryKey: ['wishlistIds'],
    queryFn: wishlistService.getWishlistProductIds,
    enabled: isAuthenticated,
  })

  const isWishlisted = product ? wishlistIds.includes(product.id) : false

  const toggleWishlistMutation = useMutation({
    mutationFn: async () => {
      if (!product) throw new Error('No product')
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

  const handleWishlistToggle = () => {
    if (!isAuthenticated) {
      toast.error('Please login to add to wishlist')
      return
    }
    toggleWishlistMutation.mutate()
  }

  const handleAddToCart = () => {
    if (!product) return

    if (isAuthenticated) {
      addToCartMutation.mutate()
    } else {
      addToGuestCart(product.id, quantity)
      showCartToast({ productName: product.name, productImage: product.images[0], price: product.price, currency: product.currency, quantity })
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
          {/* Images — swipeable */}
          <ImageGallery
            images={images}
            videos={product.videos || []}
            selectedImage={selectedImage}
            onSelect={setSelectedImage}
            productName={product.name}
          />

          {/* Product Info */}
          <div className="lg:py-4">
            {product.categoryName && (
              <p className="text-sm text-warm-gray uppercase tracking-wide mb-2">
                {product.categoryName}
              </p>
            )}
            
            <h1 className="heading-2 text-charcoal mb-4">{product.name}</h1>

            {/* Rating summary */}
            {(product.reviewCount ?? 0) > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <StarRating rating={product.avgRating ?? 0} size="sm" />
                <span className="text-sm text-warm-gray">
                  {product.avgRating?.toFixed(1)} ({product.reviewCount} {product.reviewCount === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            )}

            <div className="flex items-center gap-4 mb-6 flex-wrap">
              <span className="text-3xl font-bold text-rose tabular-nums">
                {formatPrice(product.price, product.currency)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <>
                  <span className="text-xl text-warm-gray line-through tabular-nums">
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
                  <Button
                    variant={isWishlisted ? 'primary' : 'outline'}
                    size="lg"
                    aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                    onClick={handleWishlistToggle}
                    loading={toggleWishlistMutation.isPending}
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </div>
            )}

            {/* Notify Me (Out of Stock) */}
            {!product.inStock && (
              <NotifyMeForm productId={product.id} productName={product.name} />
            )}

            {/* Share */}
            <ShareButtons productName={product.name} />

            {/* Features */}
            <div className="border-t border-blush pt-8 space-y-4">
              {[
                { icon: Truck, title: 'Free Shipping', desc: `On orders over ₹${freeShippingThreshold}` },
                { icon: RotateCcw, title: 'Easy Returns', desc: `${returnDays}-day return policy` },
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

        {/* Reviews Section */}
        <div className="mt-16 border-t border-blush pt-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="heading-3 text-charcoal flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-rose" />
              Customer Reviews
            </h2>
            {isAuthenticated && !showReviewForm && (
              <Button
                variant="outline"
                onClick={() => setShowReviewForm(true)}
                icon={<Star className="w-4 h-4" />}
              >
                Write a Review
              </Button>
            )}
          </div>

          {/* Review Form */}
          {showReviewForm && isAuthenticated && (
            <div className="bg-soft-white rounded-xl p-6 mb-8 shadow-soft">
              <h3 className="font-serif text-lg font-medium text-charcoal mb-4">Write Your Review</h3>
              <ReviewForm
                productId={product.id}
                onSuccess={() => setShowReviewForm(false)}
                onCancel={() => setShowReviewForm(false)}
              />
            </div>
          )}

          {!isAuthenticated && (
            <div className="bg-blush/30 rounded-lg p-4 mb-8 text-center">
              <p className="text-warm-gray">
                <Link to="/login" className="text-rose font-medium hover:underline">Sign in</Link>
                {' '}to write a review
              </p>
            </div>
          )}

          {/* Review Summary */}
          <div className="bg-soft-white rounded-xl p-6 mb-8 shadow-soft">
            <ReviewSummary productId={product.id} />
          </div>

          {/* Reviews List */}
          <ReviewList productId={product.id} />
        </div>

        {/* Frequently Bought Together */}
        <FrequentlyBoughtTogether product={product} onAddToCart={handleAddToCart} />

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 border-t border-blush pt-12">
            <h2 className="heading-3 text-charcoal mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  to={`/product/${relatedProduct.slug}`}
                  className="group"
                >
                  <div className="aspect-square rounded-xl overflow-hidden bg-blush mb-3">
                    <img
                      src={relatedProduct.images?.[0] || 'https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=400'}
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="font-medium text-charcoal group-hover:text-rose transition-colors line-clamp-1">
                    {relatedProduct.name}
                  </h3>
                  <p className="text-rose font-bold mt-1">{formatPrice(relatedProduct.price)}</p>
                  {relatedProduct.stockQty <= 5 && relatedProduct.stockQty > 0 && (
                    <p className="text-xs text-warning mt-1">Only {relatedProduct.stockQty} left!</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recently Viewed */}
        <RecentlyViewed excludeProductId={product.id} maxItems={4} />
      </div>
    </div>
  )
}
