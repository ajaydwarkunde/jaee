import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, Sparkles, Heart, Truck, Gift } from 'lucide-react'
import { productService } from '@/services/productService'
import { categoryService } from '@/services/categoryService'
import ProductGrid from '@/components/product/ProductGrid'
import Button from '@/components/ui/Button'
import LazyImage from '@/components/ui/LazyImage'
import { useCartStore } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/authStore'
import { cartService } from '@/services/cartService'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import type { Product } from '@/types'

export default function HomePage() {
  const { isAuthenticated } = useAuthStore()
  const addToGuestCart = useCartStore((state) => state.addToGuestCart)
  const queryClient = useQueryClient()

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
                <span className="text-gradient">Jaee</span>
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
              { icon: Truck, title: 'Free Shipping', desc: 'On orders over ₹999' },
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

      {/* Categories */}
      {categories && categories.length > 0 && (
        <section className="py-16 md:py-24 bg-cream">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="heading-2 text-charcoal">Shop by Category</h2>
              <p className="mt-4 text-warm-gray max-w-2xl mx-auto">
                Explore our curated collections designed to transform your space
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {categories.slice(0, 4).map((category) => (
                <Link
                  key={category.id}
                  to={`/shop/${category.slug}`}
                  className="group relative aspect-[4/5] rounded-xl overflow-hidden shadow-soft hover:shadow-soft-lg transition-all duration-300"
                >
                  <LazyImage
                    src={category.imageUrl || 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=400'}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-serif text-lg md:text-xl font-medium text-soft-white">
                      {category.name}
                    </h3>
                    <p className="text-sm text-soft-white/80 mt-1">
                      {category.productCount} Products
                    </p>
                  </div>
                </Link>
              ))}
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
                Jaee was born from a simple belief: that small moments of beauty can transform our everyday lives. 
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

      {/* Newsletter */}
      <section className="py-16 md:py-24 bg-charcoal">
        <div className="container-custom text-center">
          <Sparkles className="w-10 h-10 text-rose mx-auto mb-6" />
          <h2 className="heading-2 text-soft-white mb-4">Join the Jaee Community</h2>
          <p className="text-cream/70 max-w-lg mx-auto mb-8">
            Subscribe for exclusive offers, new arrivals, and self-care inspiration delivered to your inbox.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 bg-soft-white/10 border border-cream/20 rounded-lg text-soft-white placeholder:text-cream/50 focus:outline-none focus:border-rose"
            />
            <Button type="submit">Subscribe</Button>
          </form>
        </div>
      </section>
    </div>
  )
}
