import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowRight, Sparkles, Heart, Truck, Gift, CheckCircle, Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'
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
