import { Link } from 'react-router-dom'
import { Instagram, Mail, Flame, Gift } from 'lucide-react'
import Logo from '../ui/Logo'
import { useStoreSettings } from '@/hooks/useStoreSettings'
import { instagramProfileUrl } from '@/lib/utils'
import { BUSINESS_LOCATION_LINE } from '@/config/business'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const { featureHamperPublic, featureCustomCandle, supportEmail, instagramHandle } = useStoreSettings()
  const instagramUrl = instagramProfileUrl(instagramHandle)

  const candleLinks = [
    { to: '/shop/candles', label: 'Shop Candles' },
    ...(featureCustomCandle ? [{ to: '/custom-candle' as const, label: 'Custom Candle' }] : []),
    { to: '/sale', label: 'Candle Offers' },
  ]

  return (
    <footer className="theme-invert bg-charcoal text-cream">
      <div className="container-custom py-12 md:py-16">
        <div
          className={
            featureHamperPublic
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-10'
              : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10'
          }
        >
          {/* Brand */}
          <div className="lg:col-span-2">
            <Logo size="lg" variant="light" />
            <div className="mt-4 text-cream/70 max-w-md leading-relaxed space-y-3">
              <p>
                Crafted with precision and quiet luxury,
                <br />
                our candles and hampers embody timeless design.
              </p>
              <p>An experience of warmth, scent, and sophistication.</p>
              <p>Jaai — where elegance lingers.</p>
            </div>
            <div className="flex gap-4 mt-6">
              <a 
                href={instagramUrl}
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-cream/10 rounded-full hover:bg-rose/20 transition-colors"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href={`mailto:${supportEmail}`}
                className="p-2 bg-cream/10 rounded-full hover:bg-rose/20 transition-colors"
                aria-label="Email us"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
            <div className="mt-4 space-y-1 text-sm text-cream/60">
              <p>{supportEmail}</p>
              <p>{instagramHandle}</p>
              <p>{BUSINESS_LOCATION_LINE}</p>
            </div>
          </div>

          {/* Candle Store */}
          <div>
            <h4 className="font-serif text-lg font-medium mb-4 flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose" />
              Candle Store
            </h4>
            <ul className="space-y-3">
              {candleLinks.map((link) => (
                <li key={link.to}>
                  <Link 
                    to={link.to}
                    className="text-cream/70 hover:text-rose transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hamper Store */}
          {featureHamperPublic && (
          <div>
            <h4 className="font-serif text-lg font-medium mb-4 flex items-center gap-2">
              <Gift className="w-4 h-4 text-rose" />
              Hamper Store
            </h4>
            <ul className="space-y-3">
              {[
                { to: '/shop/gift-sets', label: 'Shop Hampers' },
                { to: '/custom-hamper', label: 'Build a Hamper' },
                { to: '/shop', label: 'All Products' },
              ].map((link) => (
                <li key={link.to}>
                  <Link 
                    to={link.to}
                    className="text-cream/70 hover:text-rose transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          )}

          {/* Support */}
          <div>
            <h4 className="font-serif text-lg font-medium mb-4">Support</h4>
            <ul className="space-y-3">
              {[
                { to: '/orders', label: 'Track Order' },
                { to: '/account', label: 'My Account' },
                { to: '/about', label: 'About Us' },
              ].map((link) => (
                <li key={link.to}>
                  <Link 
                    to={link.to}
                    className="text-cream/70 hover:text-rose transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <a 
                  href={`mailto:${supportEmail}`}
                  className="text-cream/70 hover:text-rose transition-colors"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-cream/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-cream/50">
              &copy; {currentYear} Jaai. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm text-cream/50">
              <a 
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-cream transition-colors"
              >
                {instagramHandle}
              </a>
              <span className="text-cream/30">&middot;</span>
              <a 
                href={`mailto:${supportEmail}`}
                className="hover:text-cream transition-colors"
              >
                {supportEmail}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
