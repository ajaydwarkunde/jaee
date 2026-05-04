import { useState, useEffect, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowRight, Sparkles, Heart, Truck, Gift, CheckCircle, Flame, Palette, Droplets, Package, MessageSquare } from 'lucide-react'
import { productService } from '@/services/productService'
import { categoryService } from '@/services/categoryService'
import { cartService } from '@/services/cartService'
import { newsletterService } from '@/services/newsletterService'
import ProductGrid from '@/components/product/ProductGrid'
import QuickViewModal from '@/components/product/QuickViewModal'
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
import Logo from '@/components/ui/Logo'
import type { Product } from '@/types'
import { defaultVariantIdForProduct } from '@/lib/cartHelpers'
import { BUSINESS_LOCATION_SHORT } from '@/config/business'

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
              <span className="inline-flex items-center gap-2 px-6 py-3 bg-soft-white/20 backdrop-blur-sm text-soft-white font-medium rounded-full group-hover:bg-rose group-hover:text-soft-white transition-all duration-500">
                Explore Candles
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>
        </Link>
        <div className="absolute bottom-0 left-0 right-0 md:hidden z-20 bg-gradient-to-t from-charcoal/80 to-transparent p-6">
          <Link
            to="/shop/candles"
            className="flex w-full items-center justify-center gap-2 px-4 py-3 bg-soft-white/20 backdrop-blur-sm text-soft-white font-medium rounded-xl text-sm hover:bg-rose transition-colors"
          >
            <Flame className="w-4 h-4" />
            Explore Candles
          </Link>
        </div>
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
            <span className="inline-flex items-center gap-2 px-6 py-3 bg-soft-white/20 backdrop-blur-sm text-soft-white font-medium rounded-full group-hover:bg-rose group-hover:text-soft-white transition-all duration-500">
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
            <span className="inline-flex items-center gap-2 px-6 py-3 bg-soft-white/20 backdrop-blur-sm text-soft-white font-medium rounded-full group-hover:bg-rose group-hover:text-soft-white transition-all duration-500">
              Explore Hampers
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </div>
      </Link>

      {/* Mobile: stacked overlay text at bottom */}
      <div className="absolute bottom-0 left-0 right-0 md:hidden z-20 bg-gradient-to-t from-charcoal/80 to-transparent p-6">
        <div className="flex gap-3">
          <Link
            to="/shop/candles"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-soft-white/20 backdrop-blur-sm text-soft-white font-medium rounded-xl text-sm hover:bg-rose transition-colors"
          >
            <Flame className="w-4 h-4" />
            Candles
          </Link>
          <Link
            to="/shop/gift-sets"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-soft-white/20 backdrop-blur-sm text-soft-white font-medium rounded-xl text-sm hover:bg-rose transition-colors"
          >
            <Gift className="w-4 h-4" />
            Hampers
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ─── Store Showcase Cards ─── */
function StoreShowcase({
  hamperEnabled,
  customCandleEnabled,
}: {
  hamperEnabled: boolean
  customCandleEnabled: boolean
}) {
  const candleTags = [
    'Scented Candles',
    'Home Fragrance',
    ...(customCandleEnabled ? ['Custom Candles'] : []),
    ...(hamperEnabled ? ['Gift Sets'] : []),
  ]

  return (
    <section className="py-16 md:py-24 bg-soft-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="heading-2 text-charcoal">Two Stores, One Destination</h2>
          <p className="mt-4 text-warm-gray max-w-2xl mx-auto">
            Whether you're looking for the perfect candle or a thoughtful gift, we've got you covered
          </p>
        </div>

        <div
          className={cn(
            'grid gap-8',
            hamperEnabled ? 'md:grid-cols-2' : 'md:grid-cols-1 max-w-2xl mx-auto'
          )}
        >
          {/* Candle Store Card */}
          <div className="group relative bg-gradient-to-br from-blush/40 to-champagne/40 rounded-2xl p-8 md:p-10 overflow-hidden hover:shadow-soft-lg transition-shadow duration-500">
            <div className="absolute top-0 right-0 w-48 h-48 bg-rose/10 rounded-full blur-3xl -translate-y-1/4 translate-x-1/4" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-rose/10 rounded-xl flex items-center justify-center">
                  <Flame className="w-6 h-6 text-rose" />
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-semibold text-charcoal">Candle Store</h3>
                  <p className="text-sm text-warm-gray">Handcrafted with premium ingredients</p>
                </div>
              </div>
              <p className="text-warm-gray leading-relaxed mb-6">
                Explore our collection of hand-poured soy candles, from calming lavender to rich vanilla. 
                Each candle is crafted to bring warmth and serenity to your space.
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                {candleTags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-soft-white/80 text-xs font-medium text-charcoal rounded-full">{tag}</span>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/shop/candles">
                  <Button icon={<ArrowRight className="w-4 h-4" />}>
                    Shop Candles
                  </Button>
                </Link>
                {customCandleEnabled && (
                  <Link to="/custom-candle">
                    <Button variant="outline" icon={<Palette className="w-4 h-4" />}>
                      Design Your Own
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Hamper Store Card */}
          {hamperEnabled && (
          <div className="group relative bg-gradient-to-br from-champagne/40 to-blush/40 rounded-2xl p-8 md:p-10 overflow-hidden hover:shadow-soft-lg transition-shadow duration-500">
            <div className="absolute top-0 right-0 w-48 h-48 bg-champagne/30 rounded-full blur-3xl -translate-y-1/4 translate-x-1/4" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-rose/10 rounded-xl flex items-center justify-center">
                  <Gift className="w-6 h-6 text-rose" />
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-semibold text-charcoal">Hamper Store</h3>
                  <p className="text-sm text-warm-gray">Curated gifts for every occasion</p>
                </div>
              </div>
              <p className="text-warm-gray leading-relaxed mb-6">
                Discover beautifully curated gift hampers packed with candles, snacks, scents, and more. 
                Perfect for birthdays, weddings, festivals, or just to make someone's day.
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                {['Gift Hampers', 'Custom Hampers', 'Festival Specials', 'Corporate Gifts'].map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-soft-white/80 text-xs font-medium text-charcoal rounded-full">{tag}</span>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/shop/gift-sets">
                  <Button icon={<ArrowRight className="w-4 h-4" />}>
                    Shop Hampers
                  </Button>
                </Link>
                <Link to="/custom-hamper">
                  <Button variant="outline" icon={<Package className="w-4 h-4" />}>
                    Build a Hamper
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          )}
        </div>
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

        <div className="grid md:grid-cols-2 gap-4 mb-10">
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
  )
}

/* ─── Newsletter ─── */
function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)

  const subscribeMutation = useMutation({
    mutationFn: () => newsletterService.subscribe(email, 'homepage'),
    onSuccess: () => {
      setIsSubscribed(true)
      setEmail('')
      toast.success('Successfully subscribed!')
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

  if (isSubscribed) {
    return (
      <section className="theme-invert py-16 md:py-24 bg-charcoal">
        <div className="container-custom text-center">
          <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          <h2 className="heading-2 text-soft-white mb-4">You're In!</h2>
          <p className="text-cream/70 max-w-lg mx-auto">
            Thank you for subscribing! You'll be the first to know about new arrivals, exclusive offers, and self-care inspiration.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="theme-invert py-16 md:py-24 bg-charcoal">
      <div className="container-custom text-center">
        <Logo size="xl" variant="brand" linkTo={false} className="mx-auto mb-6 max-w-[220px]" />
        <h2 className="heading-2 text-soft-white mb-4">Join the Jaai Community</h2>
        <p className="text-cream/70 max-w-lg mx-auto mb-8">
          Subscribe for exclusive offers, new arrivals, and self-care inspiration delivered to your inbox.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="flex-1 px-4 py-3 bg-soft-white/10 border border-cream/20 rounded-lg text-soft-white placeholder:text-cream/50 focus:outline-none focus:border-rose transition-colors"
            required
          />
          <Button 
            type="submit" 
            loading={subscribeMutation.isPending}
          >
            Subscribe
          </Button>
        </form>
        <p className="text-cream/50 text-xs mt-4">
          No spam, unsubscribe anytime.
        </p>
      </div>
    </section>
  )
}

/* ─── Custom Builder CTA ─── */
function CustomBuilderSection({
  hamperEnabled,
  customCandleEnabled,
}: {
  hamperEnabled: boolean
  customCandleEnabled: boolean
}) {
  const [mode, setMode] = useState<'candle' | 'hamper'>('candle')
  const both = hamperEnabled && customCandleEnabled
  const isCandle = both ? mode === 'candle' : customCandleEnabled

  if (!hamperEnabled && !customCandleEnabled) return null

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-rose/5 via-blush to-champagne/50 overflow-hidden">
      <div className="container-custom">
        <div className="text-center mb-10">
          <h2 className="heading-2 text-charcoal mb-4">Create Something Unique</h2>
          <p className="text-warm-gray max-w-lg mx-auto mb-8">
            Design a one-of-a-kind piece — handcrafted just for you or someone special
          </p>
          {both && (
          <div className="inline-flex bg-soft-white rounded-full p-1 shadow-soft">
            <button
              onClick={() => setMode('candle')}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300',
                isCandle
                  ? 'bg-rose text-soft-white shadow-md'
                  : 'text-warm-gray hover:text-charcoal'
              )}
            >
              <Flame className="w-4 h-4" />
              Custom Candle
            </button>
            <button
              onClick={() => setMode('hamper')}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300',
                !isCandle
                  ? 'bg-rose text-soft-white shadow-md'
                  : 'text-warm-gray hover:text-charcoal'
              )}
            >
              <Gift className="w-4 h-4" />
              Gift Hamper
            </button>
          </div>
          )}
        </div>

        <div className="relative bg-soft-white rounded-2xl md:rounded-3xl shadow-soft-lg overflow-hidden">
          <div
            className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 transition-colors duration-500"
            style={{ background: isCandle ? 'rgba(180,97,123,0.1)' : 'rgba(212,168,67,0.1)' }}
          />
          <div
            className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 transition-colors duration-500"
            style={{ background: isCandle ? 'rgba(228,213,207,0.4)' : 'rgba(107,158,118,0.1)' }}
          />

          <div className="relative grid md:grid-cols-2 gap-8 items-center p-8 md:p-12 lg:p-16">
            <div className={cn(!isCandle && 'md:order-2')}>
              <div key={mode} className="animate-fade-in">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-rose/10 text-rose text-sm font-medium rounded-full mb-6">
                  {isCandle ? <Flame className="w-4 h-4" /> : <Gift className="w-4 h-4" />}
                  {isCandle ? 'Custom Builder' : 'Gift Hampers'}
                </span>
                <h3 className="heading-2 text-charcoal mb-4">
                  {isCandle ? (
                    <>Design Your Own <span className="text-gradient">Custom Candle</span></>
                  ) : (
                    <>Curate a <span className="text-gradient">Custom Gift</span></>
                  )}
                </h3>
                <p className="text-warm-gray leading-relaxed mb-8 max-w-md">
                  {isCandle
                    ? 'Choose your wax, fragrance, color, and container — we\'ll handcraft a candle that\'s uniquely yours. Perfect as a gift or a personal indulgence.'
                    : 'Birthdays, weddings, festivals, or just because — pick the items, wrapping, and message. We\'ll assemble a beautiful hamper they\'ll love.'}
                </p>

                <div className="flex flex-wrap gap-3 mb-8">
                  {(isCandle
                    ? [
                        { icon: Droplets, text: '4 Wax Types' },
                        { icon: Sparkles, text: '8 Fragrances' },
                        { icon: Palette, text: '10 Colors' },
                      ]
                    : [
                        { icon: Package, text: '8 Items' },
                        { icon: Sparkles, text: '4 Wrappings' },
                        { icon: Palette, text: '5 Themes' },
                      ]
                  ).map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-2 px-3 py-1.5 bg-blush/60 rounded-full">
                      <Icon className="w-3.5 h-3.5 text-rose" />
                      <span className="text-xs font-medium text-charcoal">{text}</span>
                    </div>
                  ))}
                </div>

                <Link to={isCandle ? '/custom-candle' : '/custom-hamper'}>
                  <Button size="lg" icon={<ArrowRight className="w-5 h-5" />}>
                    {isCandle ? 'Start Creating' : 'Build a Hamper'}
                  </Button>
                </Link>
              </div>
            </div>

            <div className={cn('hidden md:flex justify-center', !isCandle && 'md:order-1')}>
              <div key={mode} className="animate-fade-in">
                {isCandle ? <CandleSVG /> : <HamperSVG />}
                <p className="text-center text-sm font-serif italic text-rose mt-3">
                  {isCandle ? 'Starts at ₹499' : 'Starts at ₹1,999'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function CandleSVG() {
  return (
    <svg width="200" height="280" viewBox="0 0 160 220" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="hp-glow" cx="50%" cy="30%" r="50%">
          <stop offset="0%" stopColor="#B4617B" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#B4617B" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hp-flame" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#923C5B" />
          <stop offset="40%" stopColor="#E9868B" />
          <stop offset="80%" stopColor="#F2E3E8" />
          <stop offset="100%" stopColor="#FFF8F0" />
        </linearGradient>
        <linearGradient id="hp-body" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#F2E3E8" stopOpacity="0.85" />
          <stop offset="30%" stopColor="#F2E3E8" />
          <stop offset="100%" stopColor="#d4c0c8" />
        </linearGradient>
        <filter id="hp-blur"><feGaussianBlur stdDeviation="1.5" /></filter>
      </defs>
      <circle cx="80" cy="60" r="50" fill="url(#hp-glow)">
        <animate attributeName="r" values="48;54;48" dur="2s" repeatCount="indefinite" />
      </circle>
      <g filter="url(#hp-blur)">
        <path d="M80 25 C85 45,92 55,88 65 C86 72,82 74,80 74 C78 74,74 72,72 65 C68 55,75 45,80 25Z" fill="url(#hp-flame)" opacity="0.9">
          <animate attributeName="d" values="M80 25 C85 45,92 55,88 65 C86 72,82 74,80 74 C78 74,74 72,72 65 C68 55,75 45,80 25Z;M80 22 C87 42,90 54,87 64 C85 71,82 73,80 73 C78 73,75 71,73 64 C70 54,73 42,80 22Z;M80 25 C85 45,92 55,88 65 C86 72,82 74,80 74 C78 74,74 72,72 65 C68 55,75 45,80 25Z" dur="1.2s" repeatCount="indefinite" />
        </path>
      </g>
      <path d="M80 45 C82 55,85 60,84 65 C83 69,81 70,80 70 C79 70,77 69,76 65 C75 60,78 55,80 45Z" fill="#FFF8F0" opacity="0.8">
        <animate attributeName="d" values="M80 45 C82 55,85 60,84 65 C83 69,81 70,80 70 C79 70,77 69,76 65 C75 60,78 55,80 45Z;M80 43 C83 53,84 59,83 64 C82 68,81 69,80 69 C79 69,78 68,77 64 C76 59,77 53,80 43Z;M80 45 C82 55,85 60,84 65 C83 69,81 70,80 70 C79 70,77 69,76 65 C75 60,78 55,80 45Z" dur="0.8s" repeatCount="indefinite" />
      </path>
      <line x1="80" y1="70" x2="80" y2="82" stroke="#3a2a2a" strokeWidth="2" strokeLinecap="round" />
      <rect x="40" y="80" width="80" height="110" rx="6" fill="url(#hp-body)" />
      <rect x="36" y="78" width="88" height="114" rx="8" fill="none" stroke="#d4c0b8" strokeWidth="1.5" opacity="0.6" />
      <rect x="42" y="82" width="14" height="100" rx="3" fill="white" opacity="0.15" />
      <ellipse cx="80" cy="82" rx="38" ry="5" fill="#F2E3E8" opacity="0.6" />
      <ellipse cx="80" cy="200" rx="45" ry="6" fill="#923C5B" opacity="0.08">
        <animate attributeName="opacity" values="0.06;0.12;0.06" dur="3s" repeatCount="indefinite" />
      </ellipse>
    </svg>
  )
}

function HamperSVG() {
  return (
    <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="hp-hbox" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#B4617B" />
          <stop offset="100%" stopColor="#D4A843" />
        </linearGradient>
        <radialGradient id="hp-hglow" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#D4A843" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#D4A843" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="75" fill="url(#hp-hglow)">
        <animate attributeName="r" values="73;80;73" dur="3s" repeatCount="indefinite" />
      </circle>
      <rect x="35" y="90" width="130" height="80" rx="6" fill="url(#hp-hbox)" opacity="0.9" />
      <rect x="35" y="90" width="130" height="80" rx="6" fill="none" stroke="#F2E3E8" strokeWidth="1" opacity="0.4" />
      <rect x="30" y="78" width="140" height="16" rx="4" fill="#B4617B" opacity="0.85" />
      <rect x="94" y="78" width="12" height="92" fill="#F2E3E8" opacity="0.4" />
      <rect x="30" y="82" width="140" height="8" fill="#F2E3E8" opacity="0.3" />
      <ellipse cx="92" cy="68" rx="18" ry="12" fill="#B4617B" opacity="0.7">
        <animate attributeName="ry" values="11;13;11" dur="2s" repeatCount="indefinite" />
      </ellipse>
      <ellipse cx="108" cy="68" rx="18" ry="12" fill="#D4A843" opacity="0.7">
        <animate attributeName="ry" values="13;11;13" dur="2s" repeatCount="indefinite" />
      </ellipse>
      <circle cx="100" cy="70" r="5" fill="#F2E3E8" opacity="0.8" />
      <ellipse cx="100" cy="178" rx="50" ry="5" fill="#B4617B" opacity="0.06" />
    </svg>
  )
}

/* ─── Main Page ─── */
export default function HomePage() {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
  const { isAuthenticated } = useAuthStore()
  const addToGuestCart = useCartStore((state) => state.addToGuestCart)
  const queryClient = useQueryClient()
  const {
    freeShippingThreshold,
    featureHamperPublic,
    featureCustomCandle,
    featureTwoStoresSection,
  } = useStoreSettings()

  const { data: featuredProducts, isLoading: productsLoading } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => productService.getFeaturedProducts(8),
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getCategories,
  })

  const categoryRow = categories?.filter(
    (c) => featureHamperPublic || c.slug !== 'gift-sets'
  )

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
      {/* Split Hero */}
      <SplitHero hamperEnabled={featureHamperPublic} />

      {/* Features strip */}
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

      {/* Brand intro */}
      <section className="py-16 md:py-20 bg-cream border-y border-blush/60">
        <div className="container-custom max-w-3xl mx-auto">
          <p className="font-serif text-xl sm:text-2xl md:text-3xl leading-snug text-charcoal font-semibold mb-8 text-balance rounded-xl bg-gradient-to-br from-rose/15 via-blush/40 to-champagne/50 border border-rose/25 px-6 py-6 md:px-8 md:py-7 shadow-soft">
            <span className="text-rose">Not just candles</span>
            {' '}
            — a quiet ritual of warmth, memory, and presence.
          </p>
          <div className="space-y-5 text-warm-gray leading-relaxed text-base md:text-lg">
            <p>
              Jaai was born from a simple feeling — the comfort of slowing down. In a world that moves too fast,
              we wanted to create something that brings you back to yourself. Each candle is crafted with pure soy
              wax, designed to feel soft, clean, and consciously luxurious.
            </p>
            <p>
              This isn&apos;t just about fragrance. It&apos;s about moments — late-night thoughts, chai breaks,
              soft music, and the spaces in between. Jaai is for those who romanticize life in the smallest ways.
            </p>
          </div>
        </div>
      </section>

      {/* Store Showcase */}
      {featureTwoStoresSection && (
        <StoreShowcase
          hamperEnabled={featureHamperPublic}
          customCandleEnabled={featureCustomCandle}
        />
      )}

      {/* Categories */}
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
            onQuickView={setQuickViewProduct}
          />

          <QuickViewModal
            product={quickViewProduct}
            isOpen={!!quickViewProduct}
            onClose={() => setQuickViewProduct(null)}
          />
        </div>
      </section>

      {/* Custom Builder CTA */}
      <CustomBuilderSection
        hamperEnabled={featureHamperPublic}
        customCandleEnabled={featureCustomCandle}
      />

      {/* Our Story teaser */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-blush to-champagne">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <span className="text-rose text-sm font-medium uppercase tracking-wide">Our Story</span>
              <p className="font-serif text-xl md:text-2xl text-charcoal leading-snug mt-4 mb-6">
                <span className="text-rose font-semibold">Not just candles</span>
                {' '}
                — a quiet ritual of warmth, memory, and presence.
              </p>
              <div className="space-y-5 text-warm-gray leading-relaxed mb-8">
                <p>
                  Jaai was born from a simple feeling — the comfort of slowing down. Each candle is crafted with
                  pure soy wax, designed to feel soft, clean, and consciously luxurious — for late-night thoughts,
                  chai breaks, and the spaces in between.
                </p>
                <p>
                  Jaai is for those who romanticize life in the smallest ways.
                </p>
              </div>
              <Link to="/about">
                <Button variant="secondary">Read our full story</Button>
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

      {/* Community experiences */}
      <CommunityExperienceSection />

      {/* Newsletter */}
      <NewsletterSection />
    </div>
  )
}
