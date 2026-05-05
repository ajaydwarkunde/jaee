import { useState, useEffect, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowRight, Sparkles, Heart, Truck, Gift, Flame, MessageSquare } from 'lucide-react'
import { productService } from '@/services/productService'
import { categoryService } from '@/services/categoryService'
import { cartService } from '@/services/cartService'
import ProductGrid from '@/components/product/ProductGrid'
import Button from '@/components/ui/Button'
import LazyImage from '@/components/ui/LazyImage'
import CategoryCarousel from '@/components/ui/CategoryCarousel'
import { useCartStore } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/authStore'
import { useStoreSettings } from '@/hooks/useStoreSettings'
import { getErrorMessage } from '@/lib/api'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import { showCartToast } from '@/components/ui/CartToast'
import FooterNewsletter from '@/components/layout/FooterNewsletter'
import type { Product } from '@/types'
import { defaultVariantIdForProduct } from '@/lib/cartHelpers'
import { BUSINESS_LOCATION_SHORT } from '@/config/business'
import { candleListingFilters } from '@/lib/shopPrefetch'

const COMMUNITY_STORAGE_KEY = 'jaai-community-experiences'

type CommunityStory = {
  id: string
  name: string
  location: string
  text: string
  at: string
}

const SEED_COMMUNITY_STORIES: CommunityStory[] = [
  {
    id: 'seed-1',
    name: 'Priya M.',
    location: 'Pune',
    text: 'The candles from Jaai are absolutely divine — the fragrance fills the room and lasts for hours.',
    at: new Date().toISOString(),
  },
  {
    id: 'seed-2',
    name: 'Rahul K.',
    location: 'Delhi',
    text: 'Best quality I’ve found in India. Clean burn, subtle scents, and beautiful packaging every time.',
    at: new Date().toISOString(),
  },
]

/* ─── Split Hero ─── */
function SplitHero({ hamperEnabled }: { hamperEnabled: boolean }) {
  const [hovered, setHovered] = useState<'candles' | 'hampers' | null>(null)

  if (!hamperEnabled) {
    return (
      <section className="relative min-h-[85vh] flex items-stretch overflow-hidden">
        <Link
          to="/shop/candles"
          className="relative flex-1 flex items-center justify-center transition-all duration-700 ease-out group cursor-pointer overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blush via-cream to-champagne" />
          <div className="absolute inset-0">
            <LazyImage
              src="https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=1200&auto=format&fit=crop"
              alt="Candle collection"
              className="w-full h-full object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/30 to-charcoal/10" />
          </div>
          <div className="relative z-10 text-center px-8 max-w-lg">
            <div className="transition-all duration-500 scale-100">
              <div className="w-16 h-16 bg-soft-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-rose/30 transition-colors duration-500">
                <Flame className="w-8 h-8 text-soft-white" />
              </div>
              <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold text-soft-white mb-4 tracking-tight">
                Candle Store
              </h2>
              <p className="text-soft-white/80 text-base md:text-lg leading-relaxed mb-8 max-w-sm mx-auto">
                Hand-poured premium candles crafted with love. Illuminate your space with warmth and fragrance.
              </p>
              <span className="inline-flex items-center gap-2 px-6 py-3 bg-rose text-soft-white font-medium rounded-full shadow-soft hover:bg-rose-dark transition-colors duration-300">
                Explore Candle
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>
        </Link>
      </section>
    )
  }

  return (
    <section className="relative min-h-[85vh] flex items-stretch overflow-hidden">
      {/* Candles Side */}
      <Link
        to="/shop/candles"
        className={cn(
          'relative flex-1 flex items-center justify-center transition-all duration-700 ease-out group cursor-pointer overflow-hidden',
          hovered === 'hampers' ? 'flex-[0.4]' : hovered === 'candles' ? 'flex-[0.6]' : 'flex-[0.5]'
        )}
        onMouseEnter={() => setHovered('candles')}
        onMouseLeave={() => setHovered(null)}
      >
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blush via-cream to-champagne" />
        <div className="absolute inset-0">
          <LazyImage
            src="https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=1200&auto=format&fit=crop"
            alt="Candle collection"
            className="w-full h-full object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/30 to-charcoal/10" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-8 max-w-lg">
          <div className={cn(
            'transition-all duration-500',
            hovered === 'candles' ? 'scale-105' : 'scale-100'
          )}>
            <div className="w-16 h-16 bg-soft-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-rose/30 transition-colors duration-500">
              <Flame className="w-8 h-8 text-soft-white" />
            </div>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold text-soft-white mb-4 tracking-tight">
              Candle Store
            </h2>
            <p className="text-soft-white/80 text-base md:text-lg leading-relaxed mb-8 max-w-sm mx-auto">
              Hand-poured premium candles crafted with love. Illuminate your space with warmth and fragrance.
            </p>
            <span className="hidden md:inline-flex items-center gap-2 px-6 py-3 bg-rose text-soft-white font-medium rounded-full shadow-soft hover:bg-rose-dark transition-colors duration-300">
              Explore Candles
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </div>
      </Link>

      {/* Divider */}
      <div className="relative z-20 w-px bg-soft-white/30 hidden md:block">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-soft-white rounded-full shadow-lg flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-rose" />
        </div>
      </div>

      {/* Hampers Side */}
      <Link
        to="/shop/gift-sets"
        className={cn(
          'relative flex-1 flex items-center justify-center transition-all duration-700 ease-out group cursor-pointer overflow-hidden',
          hovered === 'candles' ? 'flex-[0.4]' : hovered === 'hampers' ? 'flex-[0.6]' : 'flex-[0.5]'
        )}
        onMouseEnter={() => setHovered('hampers')}
        onMouseLeave={() => setHovered(null)}
      >
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-champagne via-cream to-blush" />
        <div className="absolute inset-0">
          <LazyImage
            src="https://images.unsplash.com/photo-1543512214-318c7553f230?w=1200&auto=format&fit=crop"
            alt="Gift hamper collection"
            className="w-full h-full object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/30 to-charcoal/10" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-8 max-w-lg">
          <div className={cn(
            'transition-all duration-500',
            hovered === 'hampers' ? 'scale-105' : 'scale-100'
          )}>
            <div className="w-16 h-16 bg-soft-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-rose/30 transition-colors duration-500">
              <Gift className="w-8 h-8 text-soft-white" />
            </div>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold text-soft-white mb-4 tracking-tight">
              Hamper Store
            </h2>
            <p className="text-soft-white/80 text-base md:text-lg leading-relaxed mb-8 max-w-sm mx-auto">
              Curated gift hampers for every occasion. Thoughtfully assembled, beautifully wrapped.
            </p>
            <span className="hidden md:inline-flex items-center gap-2 px-6 py-3 bg-rose text-soft-white font-medium rounded-full shadow-soft hover:bg-rose-dark transition-colors duration-300">
              Explore Hampers
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </div>
      </Link>

      {/* Mobile: single primary CTA */}
      <div className="absolute bottom-0 left-0 right-0 md:hidden z-20 bg-gradient-to-t from-charcoal/80 to-transparent p-6">
        <Link
          to="/shop/candles"
          className="flex w-full items-center justify-center gap-2 px-4 py-3 bg-rose text-soft-white font-medium rounded-xl text-sm shadow-soft hover:bg-rose-dark transition-colors"
        >
          <Flame className="w-4 h-4 shrink-0" />
          Explore Candles
          <ArrowRight className="w-4 h-4 shrink-0" />
        </Link>
      </div>
    </section>
  )
}

/* ─── Community experiences (local shares + highlights) ─── */
function CommunityExperienceSection() {
  const [items, setItems] = useState<CommunityStory[]>(SEED_COMMUNITY_STORIES)
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [text, setText] = useState('')

  useEffect(() => {
    try {
      const raw = localStorage.getItem(COMMUNITY_STORAGE_KEY)
      const parsed: CommunityStory[] = raw ? JSON.parse(raw) : []
      setItems([...SEED_COMMUNITY_STORIES, ...parsed])
    } catch {
      setItems(SEED_COMMUNITY_STORIES)
    }
  }, [])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const body = text.trim()
    if (body.length < 10) {
      toast.error('Please write at least a few sentences about your experience.')
      return
    }
    if (body.length > 2000) {
      toast.error('Please keep your story under 2000 characters.')
      return
    }
    const entry: CommunityStory = {
      id: crypto.randomUUID(),
      name: name.trim() || 'Community member',
      location: location.trim(),
      text: body,
      at: new Date().toISOString(),
    }
    let stored: CommunityStory[] = []
    try {
      stored = JSON.parse(localStorage.getItem(COMMUNITY_STORAGE_KEY) || '[]')
    } catch {
      stored = []
    }
    const nextStored = [...stored, entry]
    localStorage.setItem(COMMUNITY_STORAGE_KEY, JSON.stringify(nextStored))
    setItems([...SEED_COMMUNITY_STORIES, ...nextStored])
    setName('')
    setLocation('')
    setText('')
    toast.success('Thanks for sharing — your note appears below.')
  }

  return (
    <>
      <section className="py-16 md:py-24 bg-cream">
        <div className="container-custom">
          <div className="text-center mb-10 md:mb-12">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-rose/10 mb-4">
              <MessageSquare className="w-6 h-6 text-rose" />
            </div>
            <h2 className="heading-2 text-charcoal">Share Your Experience</h2>
            <p className="mt-4 text-warm-gray max-w-2xl mx-auto">
              Loved your order? Tell others what stood out — fragrance, packaging, gifting, or service.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {items.map((story) => (
              <article
                key={story.id}
                className="bg-soft-white rounded-2xl p-6 shadow-soft border border-blush/40 text-left"
              >
                <div className="flex gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-blush flex items-center justify-center text-sm font-semibold text-rose shrink-0">
                    {story.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-charcoal">{story.name}</p>
                    <p className="text-xs text-warm-gray">
                      {story.location ? `${story.location} · ` : ''}
                      {new Date(story.at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </p>
                  </div>
                </div>
                <p className="text-charcoal/90 leading-relaxed text-sm md:text-base whitespace-pre-wrap">
                  {story.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-soft-white border-t border-blush/40">
        <div className="container-custom">
          <div className="max-w-xl mx-auto bg-gradient-to-br from-blush/30 to-champagne/40 rounded-2xl p-6 md:p-8 border border-blush/50">
            <h3 className="font-serif text-lg font-semibold text-charcoal mb-4 text-center">Add your story</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name (optional)"
                className="w-full px-4 py-2.5 rounded-lg border border-blush bg-soft-white text-sm text-charcoal placeholder:text-warm-gray focus:outline-none focus:border-rose"
                maxLength={80}
              />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City (optional)"
                className="w-full px-4 py-2.5 rounded-lg border border-blush bg-soft-white text-sm text-charcoal placeholder:text-warm-gray focus:outline-none focus:border-rose"
                maxLength={80}
              />
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="How was your Jaai experience?"
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-blush bg-soft-white text-sm text-charcoal placeholder:text-warm-gray focus:outline-none focus:border-rose resize-y min-h-[100px]"
              maxLength={2000}
              required
            />
            <div className="flex justify-between items-center gap-3 flex-wrap">
              <p className="text-xs text-warm-gray">Shown on this device after you post. Contact us for featured stories.</p>
              <Button type="submit" size="sm">
                Share
              </Button>
            </div>
            </form>
          </div>
        </div>
      </section>
    </>
  )
}

/* ─── Main Page ─── */
export default function HomePage() {
  const { isAuthenticated } = useAuthStore()
  const addToGuestCart = useCartStore((state) => state.addToGuestCart)
  const queryClient = useQueryClient()
  const { freeShippingThreshold, featureHamperPublic } = useStoreSettings()

  const { data: featuredProducts, isLoading: productsLoading } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => productService.getFeaturedProducts(8),
  })

  const { data: categories } = useQuery({
    queryKey: ['categories', 'storefront'],
    queryFn: categoryService.getStorefrontCategories,
  })

  const categoryRow = categories

  /** Warm Shop JS bundle + candle listing cache before user navigates — faster perceived load */
  useEffect(() => {
    void import('./ShopPage')
  }, [])

  useEffect(() => {
    if (!categories?.length) return
    void queryClient.prefetchQuery({
      queryKey: ['filterOptions'],
      queryFn: () => productService.getFilterOptions(),
    })
    const candles = categories.find((c) => c.slug === 'candles')
    if (!candles) return
    const filters = candleListingFilters(candles.id)
    void queryClient.prefetchQuery({
      queryKey: ['products', filters],
      queryFn: () => productService.getProducts(filters),
    })
    void queryClient.prefetchQuery({
      queryKey: ['category', 'candles'],
      queryFn: () => categoryService.getCategoryBySlug('candles'),
    })
  }, [categories, queryClient])

  const addToCartMutation = useMutation({
    mutationFn: (product: Product) =>
      cartService.addToCart(product.id, 1, defaultVariantIdForProduct(product)),
    onSuccess: (_, product) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      showCartToast({ productName: product.name, productImage: product.images[0], price: product.price, currency: product.currency })
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })

  const handleAddToCart = (product: Product) => {
    if (isAuthenticated) {
      addToCartMutation.mutate(product)
    } else {
      addToGuestCart(product.id, 1, defaultVariantIdForProduct(product))
      showCartToast({ productName: product.name, productImage: product.images[0], price: product.price, currency: product.currency })
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Cover hero */}
      <SplitHero hamperEnabled={featureHamperPublic} />

      {/* Featured Products */}
      <section className="py-16 md:py-24 bg-soft-white">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
            <div>
              <h2 className="heading-2 text-charcoal">Featured Products</h2>
              <p className="mt-2 text-warm-gray">Our bestselling pieces loved by customers</p>
            </div>
            <Link to="/shop">
              <Button variant="outline" size="sm" icon={<ArrowRight className="w-4 h-4" />}>
                View All
              </Button>
            </Link>
          </div>

          <ProductGrid
            products={featuredProducts || []}
            loading={productsLoading}
            onAddToCart={handleAddToCart}
            priorityImageCount={12}
          />
        </div>
      </section>

      {/* Four pillars */}
      <section className="py-12 bg-soft-white border-y border-blush">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Sparkles, title: 'Premium Quality', desc: 'Hand-poured with care' },
              { icon: Truck, title: 'Free Shipping', desc: `On orders over ₹${freeShippingThreshold}` },
              { icon: Gift, title: 'Gift Wrapping', desc: 'Beautiful packaging' },
              { icon: Heart, title: 'Made with Love', desc: `Handcrafted in ${BUSINESS_LOCATION_SHORT}` },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="w-12 h-12 bg-rose/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-5 h-5 text-rose" />
                </div>
                <h3 className="font-medium text-charcoal text-sm">{title}</h3>
                <p className="text-xs text-warm-gray mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      {categoryRow && categoryRow.length > 0 && (
        <section className="py-16 md:py-24 bg-cream overflow-hidden">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="heading-2 text-charcoal">Shop by Category</h2>
              <p className="mt-4 text-warm-gray max-w-2xl mx-auto">
                Explore our curated collections designed to transform your space
              </p>
            </div>
            <div className="px-6">
              <CategoryCarousel 
                categories={categoryRow} 
                autoPlay={true}
                interval={4000}
              />
            </div>
          </div>
        </section>
      )}

      {/* Our Story teaser */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-blush to-champagne">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <span className="text-rose text-sm font-medium uppercase tracking-wide">Our Story</span>
              <p className="font-serif text-xl md:text-2xl text-charcoal leading-snug mt-4 mb-6">
                <span className="text-rose font-semibold">
                  Not just candles, but a feeling of warmth, comfort, and calm.
                </span>
              </p>
              <div className="space-y-4 text-warm-gray leading-relaxed mb-8">
                <p>
                  Jaai was created from the idea of slowing down and enjoying life&apos;s quiet moments. In a world
                  that always feels busy, we wanted to make something that helps you pause and feel at peace. Every
                  candle is made with pure soy wax and crafted to feel clean, soft, and luxurious.
                </p>
                <p>
                  For us, candles are more than just fragrance. They are about cozy evenings, chai breaks, soft
                  music, and the little moments that make life feel special. Jaai is for people who find beauty in
                  simple things.
                </p>
              </div>
              <Link to="/about">
                <Button variant="secondary">Read Our Full Story</Button>
              </Link>
            </div>
            <div className="order-1 lg:order-2">
              <div className="relative">
                <LazyImage
                  src="https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=800"
                  alt="Jaai candle craftsmanship"
                  className="w-full rounded-xl shadow-soft-xl"
                />
                <div className="absolute -bottom-4 -right-4 bg-soft-white p-6 rounded-xl shadow-soft-lg max-w-[200px]">
                  <p className="font-serif text-3xl font-semibold text-rose">100%</p>
                  <p className="text-sm text-warm-gray mt-1">Natural Ingredients</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Share experience + add your story + subscribe (before global footer) */}
      <CommunityExperienceSection />
      <FooterNewsletter />
    </div>
  )
}
