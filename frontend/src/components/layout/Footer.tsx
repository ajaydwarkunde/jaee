import { Link } from 'react-router-dom'
import { Instagram } from 'lucide-react'
import Logo from '../ui/Logo'
import { useStoreSettings } from '@/hooks/useStoreSettings'
import { instagramProfileUrl } from '@/lib/utils'
import { BUSINESS_LOCATION_LINE } from '@/config/business'
import FooterNewsletter from './FooterNewsletter'

/** Sitewide footer: newsletter, contact (single email / IG), quick links, legal strip */
export default function Footer() {
  const currentYear = new Date().getFullYear()
  const { featureHamperPublic, featureCustomCandle, supportEmail, instagramHandle } = useStoreSettings()
  const instagramUrl = instagramProfileUrl(instagramHandle)

  const quickLinks = [
    { to: '/shop/candles', label: 'Candles' },
    { to: '/sale', label: 'Offers' },
    { to: '/orders', label: 'Track Order' },
    { to: '/account', label: 'My Account' },
    { to: '/about', label: 'About Us' },
  ]

  return (
    <footer className="theme-invert bg-charcoal text-cream">
      <FooterNewsletter />

      <div className="container-custom py-12 md:py-16">
        <div
          className={
            featureHamperPublic
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 text-sm'
              : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12 text-sm'
          }
        >
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="inline-flex rounded-2xl bg-cream px-5 py-4 shadow-soft ring-1 ring-white/10">
              <Logo size="lg" variant="brand" linkTo="/" className="h-11 md:h-12 w-auto brightness-0" />
            </div>
            <p className="mt-5 text-cream leading-relaxed max-w-sm font-normal">
              Luxury candles and gifts — handcrafted with care in India.
            </p>
          </div>

          <div>
            <h4 className="font-serif text-base font-semibold text-cream mb-4 tracking-wide">Get in Touch</h4>
            <ul className="space-y-3 text-cream">
              <li>
                <a href={`mailto:${supportEmail}`} className="hover:text-rose transition-colors underline-offset-2 hover:underline">
                  {supportEmail}
                </a>
              </li>
              <li>
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-rose transition-colors underline-offset-2 hover:underline"
                >
                  <Instagram className="w-4 h-4 shrink-0 opacity-95" />
                  {instagramHandle}
                </a>
              </li>
              <li className="leading-snug text-cream/95">{BUSINESS_LOCATION_LINE}</li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-base font-semibold text-cream mb-4 tracking-wide">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-cream hover:text-rose transition-colors underline-offset-2 hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <a href={`mailto:${supportEmail}`} className="text-cream hover:text-rose transition-colors underline-offset-2 hover:underline">
                  Contact Us
                </a>
              </li>
              {featureCustomCandle ? (
                <li>
                  <Link to="/custom-candle" className="text-cream hover:text-rose transition-colors underline-offset-2 hover:underline">
                    Custom Candle
                  </Link>
                </li>
              ) : null}
              {featureHamperPublic ? (
                <li>
                  <Link to="/shop/gift-sets" className="text-cream hover:text-rose transition-colors underline-offset-2 hover:underline">
                    Gift Hampers
                  </Link>
                </li>
              ) : null}
            </ul>
          </div>

          {featureHamperPublic ? (
            <div>
              <h4 className="font-serif text-base font-semibold text-cream mb-4 tracking-wide">Hamper Store</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/shop/gift-sets" className="text-cream hover:text-rose transition-colors underline-offset-2 hover:underline">
                    Shop Hampers
                  </Link>
                </li>
                <li>
                  <Link to="/custom-hamper" className="text-cream hover:text-rose transition-colors underline-offset-2 hover:underline">
                    Build a Hamper
                  </Link>
                </li>
              </ul>
            </div>
          ) : null}
        </div>

        <div className="mt-12 pt-8 border-t border-cream/25 text-center">
          <p className="text-sm text-cream/80">&copy; {currentYear} Jaai. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
