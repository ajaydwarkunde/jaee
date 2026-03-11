import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowRight, Sparkles, Heart, Truck, Gift, CheckCircle, Star, ChevronLeft, ChevronRight, Quote, Flame, Palette, Droplets, Package } from 'lucide-react'
import { productService } from '@/services/productService'
import { categoryService } from '@/services/categoryService'
import { cartService } from '@/services/cartService'
import { newsletterService } from '@/services/newsletterService'
import ProductGrid from '@/components/product/ProductGrid'
import QuickViewModal from '@/components/product/QuickViewModal'
import Button from '@/components/ui/Button'
import LazyImage from '@/components/ui/LazyImage'
import CategoryCarousel from '@/components/ui/CategoryCarousel'
import Carousel3D from '@/components/ui/Carousel3D'
import { useCartStore } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/authStore'
import { useStoreSettings } from '@/hooks/useStoreSettings'
import { getErrorMessage } from '@/lib/api'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import { showCartToast } from '@/components/ui/CartToast'
import type { Product } from '@/types'

const testimonials = [
  { name: 'Priya M.', location: 'Mumbai', rating: 5, text: 'The candles from Jaai are absolutely divine! The fragrance fills the entire room and lasts for hours. My go-to gift for every occasion now.', product: 'Lavender Bliss Candle' },
  { name: 'Ananya S.', location: 'Bangalore', rating: 5, text: 'I ordered the gift set for my mom\'s birthday and she loved it! The packaging was beautiful and the candles smell amazing. Will definitely order again.', product: 'Gift Set Collection' },
  { name: 'Rahul K.', location: 'Delhi', rating: 5, text: 'Best quality candles I\'ve found in India. The soy wax burns so cleanly and the scents are subtle yet luxurious. Highly recommend!', product: 'Vanilla Bean Candle' },
  { name: 'Meera D.', location: 'Pune', rating: 5, text: 'The attention to detail is incredible. From the hand-poured wax to the eco-friendly packaging, everything speaks quality. Jaai has a customer for life!', product: 'Rose Garden Candle' },
  { name: 'Sneha T.', location: 'Hyderabad', rating: 5, text: 'I\'ve been ordering from Jaai for months now. Every single candle has been perfect. The customer service is also top-notch!', product: 'Sandalwood Serenity' },
]

function TestimonialsSection() {
  const [current, setCurrent] = useState(0)

  const next = useCallback(() => {
    setCurrent(prev => (prev + 1) % testimonials.length)
  }, [])

  const prev = useCallback(() => {
    setCurrent(prev => (prev - 1 + testimonials.length) % testimonials.length)
  }, [])

  useEffect(() => {
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next])

  const t = testimonials[current]

  return (
    <section className="py-16 md:py-24 bg-cream">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="heading-2 text-charcoal">What Our Customers Say</h2>
          <p className="mt-4 text-warm-gray">Real stories from the Jaai community</p>
        </div>
        <div className="max-w-2xl mx-auto relative">
          <div className="bg-soft-white rounded-2xl p-8 md:p-10 shadow-soft text-center">
            <Quote className="w-10 h-10 text-rose/30 mx-auto mb-4" />
            <p className="text-lg md:text-xl text-charcoal leading-relaxed font-serif italic mb-6">
              "{t.text}"
            </p>
            <div className="flex justify-center gap-1 mb-4">
              {Array.from({ length: t.rating }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-warning text-warning" />
              ))}
            </div>
            <p className="font-medium text-charcoal">{t.name}</p>
            <p className="text-sm text-warm-gray">{t.location} · {t.product}</p>
          </div>
          <div className="flex justify-center items-center gap-4 mt-6">
            <button onClick={prev} className="p-2 rounded-full bg-soft-white shadow-soft hover:shadow-soft-md transition-shadow" aria-label="Previous testimonial">
              <ChevronLeft className="w-5 h-5 text-charcoal" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)} className={`w-2 h-2 rounded-full transition-colors ${i === current ? 'bg-rose' : 'bg-blush'}`} aria-label={`Go to testimonial ${i + 1}`} />
              ))}
            </div>
            <button onClick={next} className="p-2 rounded-full bg-soft-white shadow-soft hover:shadow-soft-md transition-shadow" aria-label="Next testimonial">
              <ChevronRight className="w-5 h-5 text-charcoal" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

// Newsletter Section Component
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
        <Sparkles className="w-10 h-10 text-rose mx-auto mb-6" />
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

function CustomBuilderSection() {
  const [mode, setMode] = useState<'candle' | 'hamper'>('candle')
  const isCandle = mode === 'candle'

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-rose/5 via-blush to-champagne/50 overflow-hidden">
      <div className="container-custom">
        {/* Section header + toggle */}
        <div className="text-center mb-10">
          <h2 className="heading-2 text-charcoal mb-4">Create Something Unique</h2>
          <p className="text-warm-gray max-w-lg mx-auto mb-8">
            Design a one-of-a-kind piece — handcrafted just for you or someone special
          </p>
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
        </div>

        {/* Card */}
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
            {/* Text side */}
            <div className={cn(!isCandle && 'md:order-2')}>
              <div
                key={mode}
                className="animate-fade-in"
              >
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

                {/* Feature chips */}
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

            {/* SVG side */}
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

export default function HomePage() {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
  const { isAuthenticated } = useAuthStore()
  const addToGuestCart = useCartStore((state) => state.addToGuestCart)
  const queryClient = useQueryClient()
  const { freeShippingThreshold } = useStoreSettings()

  const { data: featuredProducts, isLoading: productsLoading } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => productService.getFeaturedProducts(8),
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getCategories,
  })

  const addToCartMutation = useMutation({
    mutationFn: (product: Product) => cartService.addToCart(product.id, 1),
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
      addToGuestCart(product.id, 1)
      showCartToast({ productName: product.name, productImage: product.images[0], price: product.price, currency: product.currency })
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center bg-gradient-to-br from-blush via-cream to-champagne overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-64 h-64 bg-rose/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-champagne/50 rounded-full blur-3xl" />
        </div>

        <div className="container-custom relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <span className="inline-block px-4 py-1.5 bg-rose/10 text-rose text-sm font-medium rounded-full mb-6">
                ✨ Handcrafted with Love
              </span>
              <h1 className="heading-1 text-charcoal mb-6">
                Illuminate Your Space with{' '}
                <span className="text-gradient">Jaai</span>
              </h1>
              <p className="body-large text-warm-gray mb-8 max-w-lg mx-auto lg:mx-0">
                Discover our collection of premium, hand-poured candles and home décor. 
                Each piece is designed to bring warmth, beauty, and moments of calm to your everyday life.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/shop">
                  <Button size="lg" icon={<ArrowRight className="w-5 h-5" />}>
                    Shop Collection
                  </Button>
                </Link>
                <Link to="/shop/gift-sets">
                  <Button size="lg" variant="outline">
                    Gift Sets
                  </Button>
                </Link>
              </div>
            </div>

            {/* Hero image */}
            <div className="relative hidden lg:block">
              <div className="relative aspect-square max-w-lg mx-auto">
                <LazyImage
                  src="https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=800"
                  alt="Beautiful candle arrangement"
                  className="w-full h-full object-cover rounded-[32px] shadow-soft-xl"
                  priority // Above the fold - load immediately
                />
                {/* Floating card */}
                <div className="absolute -bottom-6 -left-6 bg-soft-white p-4 rounded-xl shadow-soft-lg animate-slide-up">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-rose/10 rounded-full flex items-center justify-center">
                      <Heart className="w-6 h-6 text-rose" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-charcoal">5000+</p>
                      <p className="text-xs text-warm-gray">Happy Customers</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-soft-white border-y border-blush">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Sparkles, title: 'Premium Quality', desc: 'Hand-poured with care' },
              { icon: Truck, title: 'Free Shipping', desc: `On orders over ₹${freeShippingThreshold}` },
              { icon: Gift, title: 'Gift Wrapping', desc: 'Beautiful packaging' },
              { icon: Heart, title: 'Made with Love', desc: 'Crafted in India' },
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

      {/* Categories Carousel */}
      {categories && categories.length > 0 && (
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
                categories={categories} 
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
      <CustomBuilderSection />

      {/* Lifestyle Showcase */}
      <section className="py-16 md:py-24 bg-cream overflow-hidden">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="heading-2 text-charcoal">The Jaai Experience</h2>
            <p className="mt-4 text-warm-gray max-w-2xl mx-auto">
              Explore the world of handcrafted luxury and everyday elegance
            </p>
          </div>
        </div>
        <div className="pb-16">
          <Carousel3D
            slides={[
              {
                title: 'Warm Glow Collection',
                button: 'Shop Candles',
                href: '/shop/candles',
                src: 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=800&auto=format&fit=crop',
              },
              {
                title: 'Curated Gift Sets',
                button: 'Explore Gifts',
                href: '/shop/gift-sets',
                src: 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=800&auto=format&fit=crop',
              },
              {
                title: 'Home Fragrances',
                button: 'Discover More',
                href: '/shop',
                src: 'https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?w=800&auto=format&fit=crop',
              },
              {
                title: 'Sale & Offers',
                button: 'View Deals',
                href: '/sale',
                src: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800&auto=format&fit=crop',
              },
            ]}
          />
        </div>
      </section>

      {/* Brand Story */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-blush to-champagne">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <span className="text-rose text-sm font-medium uppercase tracking-wide">Our Story</span>
              <h2 className="heading-2 text-charcoal mt-4 mb-6">
                Crafted with Intention, Designed for Serenity
              </h2>
              <p className="text-warm-gray leading-relaxed mb-6">
                Jaai was born from a simple belief: that small moments of beauty can transform our everyday lives. 
                What started as a passion project has grown into a brand dedicated to creating premium, 
                sustainable products that bring warmth and joy to homes across India.
              </p>
              <p className="text-warm-gray leading-relaxed mb-8">
                Every candle we make is hand-poured with premium soy wax and carefully selected fragrances. 
                We believe in quality over quantity, ensuring each piece meets our exacting standards 
                before reaching your home.
              </p>
              <Link to="/about">
                <Button variant="secondary">Learn More About Us</Button>
              </Link>
            </div>
            <div className="order-1 lg:order-2">
              <div className="relative">
                <LazyImage
                  src="https://images.unsplash.com/photo-1543512214-318c7553f230?w=800"
                  alt="Candle making process"
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

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Newsletter */}
      <NewsletterSection />
    </div>
  )
}
