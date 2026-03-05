import { Link } from 'react-router-dom'
import { Heart, Leaf, Sparkles, Star, ArrowRight, Instagram, Mail } from 'lucide-react'
import Button from '@/components/ui/Button'
import LazyImage from '@/components/ui/LazyImage'

const values = [
  {
    icon: Heart,
    title: 'Crafted with Love',
    description:
      'Every product is made by hand with care and attention to detail. We pour our heart into each piece.',
  },
  {
    icon: Leaf,
    title: 'Sustainable & Natural',
    description:
      'We use premium soy wax, natural fragrances, and eco-friendly packaging to minimize our footprint.',
  },
  {
    icon: Sparkles,
    title: 'Premium Quality',
    description:
      'From wicks to wax, every ingredient is carefully selected to ensure a clean, long-lasting burn.',
  },
  {
    icon: Star,
    title: 'Customer First',
    description:
      'Your satisfaction is our priority. We stand behind every product with our quality guarantee.',
  },
]

export default function AboutPage() {
  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative py-20 md:py-32 bg-gradient-to-br from-blush via-cream to-champagne overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 right-20 w-72 h-72 bg-rose/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-champagne/60 rounded-full blur-3xl" />
        </div>
        <div className="container-custom relative z-10 text-center">
          <span className="inline-block px-4 py-1.5 bg-rose/10 text-rose text-sm font-medium rounded-full mb-6">
            Our Story
          </span>
          <h1 className="heading-1 text-charcoal mb-6 max-w-3xl mx-auto">
            Bringing Warmth &amp; Beauty Into Every Home
          </h1>
          <p className="body-large text-warm-gray max-w-2xl mx-auto">
            Jaee was born from a simple belief: that small moments of beauty can
            transform our everyday lives. What started as a passion project has
            grown into a brand dedicated to crafting premium home products.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 md:py-24 bg-soft-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <LazyImage
                src="https://images.unsplash.com/photo-1543512214-318c7553f230?w=800"
                alt="Handcrafting candles"
                className="w-full rounded-2xl shadow-soft-xl"
              />
            </div>
            <div>
              <h2 className="heading-2 text-charcoal mb-6">How It All Began</h2>
              <div className="space-y-4 text-warm-gray leading-relaxed">
                <p>
                  It all started with a single candle, hand-poured in a small
                  kitchen in Mumbai. The idea was simple — create something
                  beautiful, natural, and affordable that could transform any
                  space into a sanctuary.
                </p>
                <p>
                  What began as gifts for friends and family quickly grew as
                  word spread about our unique fragrances and long-lasting
                  quality. Today, Jaee has become a trusted name for handcrafted
                  candles and home décor across India.
                </p>
                <p>
                  We remain committed to the same principles we started with:
                  quality ingredients, sustainable practices, and a deep love
                  for creating products that spark joy in everyday moments.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="container-custom">
          <div className="text-center mb-14">
            <h2 className="heading-2 text-charcoal">What We Stand For</h2>
            <p className="mt-4 text-warm-gray max-w-2xl mx-auto">
              Every decision we make is guided by these core values.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="bg-soft-white rounded-xl p-6 shadow-soft hover:shadow-soft-lg transition-shadow text-center"
              >
                <div className="w-14 h-14 bg-rose/10 rounded-full flex items-center justify-center mx-auto mb-5">
                  <Icon className="w-6 h-6 text-rose" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-charcoal mb-2">
                  {title}
                </h3>
                <p className="text-sm text-warm-gray leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-16 md:py-24 bg-soft-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="heading-2 text-charcoal mb-6">Our Process</h2>
              <div className="space-y-6">
                {[
                  {
                    step: '01',
                    title: 'Source',
                    desc: 'We handpick premium soy wax, natural essential oils, and cotton wicks from trusted suppliers.',
                  },
                  {
                    step: '02',
                    title: 'Craft',
                    desc: 'Each candle is hand-poured in small batches, ensuring consistent quality and fragrance throw.',
                  },
                  {
                    step: '03',
                    title: 'Cure',
                    desc: 'Our candles cure for several days to develop their full fragrance profile before they reach you.',
                  },
                  {
                    step: '04',
                    title: 'Deliver',
                    desc: 'Packaged with care in eco-friendly materials and shipped straight to your doorstep.',
                  },
                ].map(({ step, title, desc }) => (
                  <div key={step} className="flex gap-5">
                    <span className="flex-shrink-0 w-10 h-10 bg-rose/10 text-rose font-serif font-semibold text-sm rounded-full flex items-center justify-center">
                      {step}
                    </span>
                    <div>
                      <h3 className="font-medium text-charcoal mb-1">{title}</h3>
                      <p className="text-sm text-warm-gray leading-relaxed">
                        {desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <LazyImage
                src="https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=800"
                alt="Candle making process"
                className="w-full rounded-2xl shadow-soft-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-blush to-champagne">
        <div className="container-custom text-center">
          <h2 className="heading-2 text-charcoal mb-4">
            Experience Jaee for Yourself
          </h2>
          <p className="text-warm-gray max-w-xl mx-auto mb-8">
            Browse our collection and find the perfect piece to bring warmth
            and beauty into your space.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/shop">
              <Button size="lg" icon={<ArrowRight className="w-5 h-5" />}>
                Shop Collection
              </Button>
            </Link>
            <a
              href="https://www.instagram.com/jaee.studio"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" variant="outline" icon={<Instagram className="w-5 h-5" />}>
                Follow Us
              </Button>
            </a>
          </div>

          {/* Contact */}
          <div className="mt-16 pt-12 border-t border-rose/20">
            <h3 className="font-serif text-xl font-semibold text-charcoal mb-4">
              Get in Touch
            </h3>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-warm-gray">
              <a
                href="mailto:jaeestudio12@gmail.com"
                className="flex items-center gap-2 hover:text-rose transition-colors"
              >
                <Mail className="w-4 h-4" />
                jaeestudio12@gmail.com
              </a>
              <a
                href="https://www.instagram.com/jaee.studio"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-rose transition-colors"
              >
                <Instagram className="w-4 h-4" />
                @jaee.studio
              </a>
            </div>
            <p className="text-sm text-warm-gray/70 mt-3">Mumbai, Maharashtra, India</p>
          </div>
        </div>
      </section>
    </div>
  )
}
