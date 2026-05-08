import { Link } from 'react-router-dom'
import { Heart, Leaf, Sparkles, Star, ArrowRight, Instagram, Mail, MapPin } from 'lucide-react'
import Button from '@/components/ui/Button'
import LazyImage from '@/components/ui/LazyImage'
import { useStoreSettings } from '@/hooks/useStoreSettings'
import { instagramProfileUrl } from '@/lib/utils'
import { BUSINESS_LOCATION_LINE } from '@/config/business'
import type { StoreSettings } from '@/services/settingsService'
import { cmsHeroImageProps, cmsSectionImageProps } from '@/lib/imageUrl'

const FALLBACK_ABOUT_HERO =
  'https://images.unsplash.com/photo-1596436889106-bbdff866e9b2?w=1920&auto=format&fit=crop&q=80'
const FALLBACK_STORY_IMAGE =
  'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=800&h=800&auto=format&fit=crop&q=80'
const FALLBACK_PROCESS_IMAGE =
  'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=800&auto=format&fit=crop&q=80'

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
  const { supportEmail, instagramHandle, getValue } = useStoreSettings()
  const instagramUrl = instagramProfileUrl(instagramHandle)

  const heroImage =
    getValue('about_page_header_image_url' as keyof StoreSettings).trim() || FALLBACK_ABOUT_HERO
  const heroTitle =
    getValue('about_page_header_title' as keyof StoreSettings).trim() || 'Our Story'
  const storyImage =
    getValue('about_story_image_url' as keyof StoreSettings).trim() || FALLBACK_STORY_IMAGE
  const processImage =
    getValue('about_process_image_url' as keyof StoreSettings).trim() || FALLBACK_PROCESS_IMAGE

  const heroImg = cmsHeroImageProps(heroImage, 'full')
  const storyImg = cmsSectionImageProps(storyImage)
  const processImg = cmsHeroImageProps(processImage, 'split')

  return (
    <div className="animate-fade-in">
      {/* Hero — CMS */}
      <section className="relative min-h-[260px] md:min-h-[340px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <LazyImage
            src={heroImg.src}
            srcSet={heroImg.srcSet}
            sizes={heroImg.sizes}
            alt=""
            className="w-full h-full object-cover min-h-[260px] md:min-h-[340px]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal/55 via-charcoal/45 to-charcoal/65" />
        </div>
        <div className="container-custom relative z-10 text-center py-16 md:py-24">
          <h1 className="heading-1 text-soft-white max-w-3xl mx-auto drop-shadow-md">{heroTitle}</h1>
        </div>
      </section>

      {/* Our Story — improved layout + CMS story image */}
      <section className="relative py-16 md:py-24 overflow-hidden bg-gradient-to-b from-cream via-[#faf6f3] to-blush/25">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(233,134,139,0.12),transparent_50%)]" />
        <div className="container-custom relative max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-5 flex justify-center lg:justify-start">
              <div className="w-full max-w-[380px] aspect-square rounded-3xl overflow-hidden shadow-soft-xl ring-2 ring-rose/20 bg-soft-white">
                <LazyImage
                  src={storyImg.src}
                  srcSet={storyImg.srcSet}
                  sizes={storyImg.sizes}
                  alt="Jaai candle — our story"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="lg:col-span-7">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose mb-3">Our Story</p>
              <h2 className="font-serif text-3xl md:text-4xl text-charcoal mb-8 leading-tight">
                Warmth, intention, and everyday luxury
              </h2>
              <div className="rounded-2xl bg-soft-white/90 backdrop-blur-sm border border-blush/40 shadow-soft p-6 md:p-8 space-y-5 text-warm-gray leading-relaxed text-base md:text-lg">
                <p className="text-charcoal/95">
                  Jaai began with a very simple feeling. I wanted to create something that could make everyday moments feel
                  softer, calmer, and a little more meaningful. I&apos;ve always believed that the atmosphere around us
                  changes the way we feel, and for me, candles were never just décor. They were comfort, warmth, quiet
                  evenings, slow mornings, and the feeling of being completely at ease in your own space.
                </p>
                <p>
                  What started as a small personal idea slowly became something much bigger. I found myself deeply involved
                  in every little detail, from testing fragrances to choosing the right wax and understanding what truly
                  makes a candle feel luxurious. I didn&apos;t want Jaai to be just another candle brand. I wanted it to feel
                  intentional. Something people could connect with emotionally, not just visually.
                </p>
                <p>
                  Quality became the foundation of everything we do. From using pure soy wax for a cleaner and longer burn to
                  carefully selecting fragrances that feel subtle yet memorable, every decision is made with care. We
                  believe luxury should feel effortless and honest. It should look beautiful, but also feel good to live with
                  every single day.
                </p>
                <p className="text-charcoal/95 pb-1">
                  Jaai is our way of bringing warmth, elegance, and comfort into everyday living. It&apos;s for the people who
                  appreciate soft lighting, beautiful spaces, and the little rituals that make life feel slower and more
                  personal. More than anything, Jaai is about creating a feeling people want to come back to.
                </p>
              </div>
            </div>
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
                className="bg-gradient-to-br from-soft-white to-blush/30 rounded-xl p-6 shadow-soft border border-blush/40 hover:shadow-soft-lg transition-shadow text-center"
              >
                <div className="w-14 h-14 bg-rose/15 rounded-full flex items-center justify-center mx-auto mb-5">
                  <Icon className="w-6 h-6 text-rose" />
                </div>
                <h3 className="font-serif text-lg text-charcoal mb-2">{title}</h3>
                <p className="text-sm text-warm-gray leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder note — elevated styling */}
      <section className="py-16 md:py-24 relative overflow-hidden bg-gradient-to-br from-charcoal via-[#2a2628] to-charcoal">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,rgba(233,134,139,0.18),transparent_45%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_80%,rgba(228,213,207,0.12),transparent_40%)]" />
        <div className="container-custom max-w-3xl mx-auto relative z-10">
          <h2 className="font-serif text-3xl md:text-4xl text-soft-white mb-10 text-center tracking-tight">
            A Note from the Founder
          </h2>
          <div className="relative rounded-3xl p-[1px] bg-gradient-to-br from-rose/50 via-blush/40 to-champagne/50 shadow-soft-xl">
            <div className="rounded-[22px] bg-gradient-to-b from-[#3d3639] to-[#2e292c] px-8 py-10 md:px-12 md:py-12 space-y-6 text-[#ebe4df] leading-relaxed text-base md:text-lg border border-white/5">
              <p className="text-soft-white font-medium text-lg">Jaai started as something very personal to me.</p>
              <p className="text-cream/95">
                I&apos;ve always been drawn to small, quiet moments—the kind that don&apos;t ask for attention but somehow mean
                the most. Lighting a candle after a long day, sitting in a space that feels calm, creating an atmosphere that
                feels like home… those were the feelings I wanted to hold onto.
              </p>
              <p className="text-cream/95">What began as a simple idea slowly turned into Jaai.</p>
              <p className="text-cream/95">
                I didn&apos;t just want to create candles—I wanted to create something that people could feel. Something that
                brings a sense of ease, warmth, and comfort into their everyday lives. Every detail, from the choice of soy wax
                to the way each candle is designed, comes from a place of intention and care.
              </p>
              <p className="text-cream/95">
                There&apos;s a lot of heart behind Jaai.
                <br />
                A lot of learning, patience, and belief in building something meaningful.
              </p>
              <p className="text-cream/95">And while this is just the beginning, it already means so much to me.</p>
              <p className="text-cream/95">
                If Jaai becomes even a small part of your everyday moments—your quiet evenings, your celebrations, or simply
                your space—I&apos;ll know it&apos;s doing exactly what it was meant to.
              </p>
              <p className="text-soft-white pt-2 font-medium">
                Thank you for being here,
                <br />
                and for being a part of this journey.
              </p>
              <p className="font-serif text-soft-white pt-6 mt-2 border-t border-white/15">
                — With love,
                <br />
                Founder of Jaai <span className="inline-block ml-1 opacity-90" aria-hidden>🤍</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Process — CMS image */}
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
                    <span className="flex-shrink-0 w-10 h-10 bg-rose/15 text-rose font-serif text-sm rounded-full flex items-center justify-center ring-1 ring-rose/25">
                      {step}
                    </span>
                    <div>
                      <h3 className="text-charcoal font-medium mb-1">{title}</h3>
                      <p className="text-sm text-warm-gray leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <LazyImage
                src={processImg.src}
                srcSet={processImg.srcSet}
                sizes={processImg.sizes}
                alt="Candle making process"
                className="w-full rounded-2xl shadow-soft-xl ring-1 ring-blush/40"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-blush to-champagne">
        <div className="container-custom text-center">
          <h2 className="heading-2 text-charcoal mb-4">Experience Jaai for Yourself</h2>
          <p className="text-warm-gray max-w-xl mx-auto mb-8">
            Browse our collection and find the perfect piece to bring warmth and beauty into your space.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/shop">
              <Button size="lg" icon={<ArrowRight className="w-5 h-5" />}>
                Shop Collection
              </Button>
            </Link>
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" icon={<Instagram className="w-5 h-5" />}>
                Follow Us
              </Button>
            </a>
          </div>

          <div className="mt-16 pt-12 border-t border-rose/20">
            <h3 className="font-serif text-xl text-charcoal mb-6 md:mb-8 text-center">Get in Touch</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 max-w-4xl mx-auto text-left items-stretch">
              <a
                href={`mailto:${supportEmail}`}
                className="group flex flex-col gap-2 rounded-xl border border-blush/40 bg-soft-white/90 p-5 shadow-soft hover:border-rose/40 hover:shadow-soft-lg transition-all min-h-[140px]"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-rose/10 text-rose">
                  <Mail className="w-5 h-5" aria-hidden />
                </span>
                <span className="text-xs uppercase tracking-wide text-warm-gray font-medium">Email</span>
                <span className="text-sm text-charcoal group-hover:text-rose transition-colors break-all">
                  {supportEmail}
                </span>
              </a>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col gap-2 rounded-xl border border-blush/40 bg-soft-white/90 p-5 shadow-soft hover:border-rose/40 hover:shadow-soft-lg transition-all min-h-[140px]"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-rose/10 text-rose">
                  <Instagram className="w-5 h-5" aria-hidden />
                </span>
                <span className="text-xs uppercase tracking-wide text-warm-gray font-medium">Instagram</span>
                <span className="text-sm text-charcoal group-hover:text-rose transition-colors">{instagramHandle}</span>
              </a>
              <div className="flex flex-col gap-2 rounded-xl border border-blush/40 bg-soft-white/90 p-5 shadow-soft min-h-[140px]">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-rose/10 text-rose">
                  <MapPin className="w-5 h-5" aria-hidden />
                </span>
                <span className="text-xs uppercase tracking-wide text-warm-gray font-medium">Address</span>
                <p className="text-sm text-charcoal leading-relaxed">{BUSINESS_LOCATION_LINE}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
