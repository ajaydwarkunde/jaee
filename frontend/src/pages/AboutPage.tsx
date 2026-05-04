import { Link } from 'react-router-dom'
import { Heart, Leaf, Sparkles, Star, ArrowRight, Instagram, Mail } from 'lucide-react'
import Button from '@/components/ui/Button'
import LazyImage from '@/components/ui/LazyImage'
import { useStoreSettings } from '@/hooks/useStoreSettings'
import { instagramProfileUrl } from '@/lib/utils'
import { BUSINESS_LOCATION_LINE } from '@/config/business'

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
  const { supportEmail, instagramHandle } = useStoreSettings()
  const instagramUrl = instagramProfileUrl(instagramHandle)

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative py-20 md:py-32 bg-gradient-to-br from-blush via-cream to-champagne overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 right-20 w-72 h-72 bg-rose/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-champagne/60 rounded-full blur-3xl" />
        </div>
        <div className="container-custom relative z-10 text-center">
          <h1 className="heading-1 text-charcoal max-w-3xl mx-auto">About Jaai</h1>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="container-custom max-w-3xl mx-auto">
          <h2 className="heading-2 text-charcoal mb-10 text-center md:text-left">Our Story</h2>
          <div className="space-y-6 text-warm-gray leading-relaxed text-base md:text-lg">
            <p className="text-charcoal font-medium">
              Jaai began with a simple intention—
              <br />
              to create something that feels gentle, intentional, and quietly luxurious.
            </p>
            <p>
              In a world that rarely pauses, Jaai was imagined as a way to slow down.
              To transform everyday spaces into something softer, calmer, more personal.
            </p>
            <p>
              At its core, Jaai is built on purity and detail.
              Each candle is crafted using high-quality soy wax—chosen for its clean burn, long-lasting nature,
              and sustainable origin. Every element is considered, not just for how it looks, but for how it feels.
            </p>
            <p className="text-charcoal font-medium">
              Because Jaai is not just about candles—
              <br />
              it&apos;s about the atmosphere they create.
            </p>
            <p>
              A warm glow at the end of a long day.
              <br />
              A scent that lingers gently in the background.
              <br />
              A space that feels like your own, without trying too hard.
            </p>
            <p>
              The fragrances are curated to be subtle yet memorable—never overpowering, always intentional. The
              design remains minimal, allowing the experience to speak for itself.
            </p>
            <p>
              Jaai is for those who find beauty in quiet moments.
              In soft lighting, clean aesthetics, and the feeling of being at ease.
            </p>
            <p className="text-charcoal">
              It is not about excess.
              <br />
              It is about presence.
            </p>
            <p>
              A small ritual, repeated daily—
              <br />
              that turns a house into something more.
            </p>
            <p className="text-charcoal font-serif text-xl pt-4 border-t border-blush">
              This is Jaai.
              <br />
              And this is just the beginning.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-24 bg-soft-white">
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

      {/* Founder&apos;s note */}
      <section className="py-16 md:py-24 bg-soft-white border-y border-blush/80">
        <div className="container-custom max-w-3xl mx-auto">
          <h2 className="heading-2 text-charcoal mb-10 text-center">A Note from the Founder</h2>
          <div className="bg-cream/80 rounded-2xl p-8 md:p-10 lg:p-12 shadow-soft border border-blush/50 space-y-6 text-warm-gray leading-relaxed text-base md:text-lg">
            <p className="text-charcoal font-medium">Jaai started as something very personal to me.</p>
            <p>
              I&apos;ve always been drawn to small, quiet moments—the kind that don&apos;t ask for attention but
              somehow mean the most. Lighting a candle after a long day, sitting in a space that feels calm,
              creating an atmosphere that feels like home… those were the feelings I wanted to hold onto.
            </p>
            <p>What began as a simple idea slowly turned into Jaai.</p>
            <p>
              I didn&apos;t just want to create candles—I wanted to create something that people could feel.
              Something that brings a sense of ease, warmth, and comfort into their everyday lives. Every detail,
              from the choice of soy wax to the way each candle is designed, comes from a place of intention and
              care.
            </p>
            <p>
              There&apos;s a lot of heart behind Jaai.
              <br />
              A lot of learning, patience, and belief in building something meaningful.
            </p>
            <p>And while this is just the beginning, it already means so much to me.</p>
            <p>
              If Jaai becomes even a small part of your everyday moments—your quiet evenings, your celebrations,
              or simply your space—I&apos;ll know it&apos;s doing exactly what it was meant to.
            </p>
            <p className="text-charcoal pt-2">
              Thank you for being here,
              <br />
              and for being a part of this journey.
            </p>
            <p className="font-serif text-charcoal pt-4 border-t border-blush/60">
              — With love,
              <br />
              Founder of Jaai <span className="inline-block ml-1" aria-hidden>🤍</span>
            </p>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-16 md:py-24 bg-cream">
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
            Experience Jaai for Yourself
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
              href={instagramUrl}
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
                href={`mailto:${supportEmail}`}
                className="flex items-center gap-2 hover:text-rose transition-colors"
              >
                <Mail className="w-4 h-4" />
                {supportEmail}
              </a>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-rose transition-colors"
              >
                <Instagram className="w-4 h-4" />
                {instagramHandle}
              </a>
            </div>
            <p className="text-sm text-warm-gray/70 mt-3">{BUSINESS_LOCATION_LINE}</p>
          </div>
        </div>
      </section>
    </div>
  )
}
