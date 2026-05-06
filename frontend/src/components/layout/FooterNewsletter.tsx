import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { CheckCircle } from 'lucide-react'
import { newsletterService } from '@/services/newsletterService'
import Button from '@/components/ui/Button'
import Logo from '@/components/ui/Logo'
import toast from 'react-hot-toast'

/** Newsletter block rendered above footer links (homepage sequence). */
export default function FooterNewsletter() {
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
      <section className="theme-invert py-16 md:py-24 bg-charcoal border-b border-cream/10">
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
    <section className="theme-invert py-16 md:py-24 bg-charcoal border-b border-cream/10">
      <div className="container-custom text-center">
        <div className="inline-flex rounded-2xl bg-cream px-6 py-4 mx-auto mb-6 shadow-soft ring-1 ring-white/10">
          <Logo size="xl" variant="brand" linkTo={false} className="max-w-[200px] brightness-0" />
        </div>
        <h2 className="heading-2 text-cream mb-4 font-semibold tracking-tight">Join the Jaai Community</h2>
        <p className="text-cream/95 max-w-lg mx-auto mb-8 leading-relaxed">
          Subscribe for exclusive offers, new arrivals, and self-care inspiration delivered to your inbox.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="flex-1 px-4 py-3 bg-soft-white/10 border border-cream/30 rounded-lg text-cream placeholder:text-cream/55 focus:outline-none focus:border-rose transition-colors"
            required
          />
          <Button type="submit" loading={subscribeMutation.isPending}>
            Subscribe
          </Button>
        </form>
        <p className="text-cream/75 text-xs mt-4">
          No spam, unsubscribe anytime.
        </p>
      </div>
    </section>
  )
}
