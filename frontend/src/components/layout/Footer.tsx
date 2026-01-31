import { Link } from 'react-router-dom'
import { Instagram, Mail, Phone } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-charcoal text-cream">
      <div className="container-custom py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="font-serif text-3xl font-semibold tracking-wider text-rose">
              JAEE
            </Link>
            <p className="mt-4 text-cream/70 max-w-md leading-relaxed">
              Bringing warmth and beauty into your home with handcrafted candles and carefully 
              curated home décor. Each piece is designed to create moments of calm and joy.
            </p>
            <div className="flex gap-4 mt-6">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-cream/10 rounded-full hover:bg-rose/20 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="mailto:hello@jaee.com"
                className="p-2 bg-cream/10 rounded-full hover:bg-rose/20 transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
              <a 
                href="tel:+919876543210"
                className="p-2 bg-cream/10 rounded-full hover:bg-rose/20 transition-colors"
                aria-label="Phone"
              >
                <Phone className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-medium mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { to: '/shop', label: 'Shop All' },
                { to: '/shop/candles', label: 'Candles' },
                { to: '/shop/gift-sets', label: 'Gift Sets' },
                { to: '/shop/home-decor', label: 'Home Decor' },
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

          {/* Support */}
          <div>
            <h4 className="font-serif text-lg font-medium mb-4">Support</h4>
            <ul className="space-y-3">
              {[
                { to: '/orders', label: 'Track Order' },
                { to: '/contact', label: 'Contact Us' },
                { to: '/shipping', label: 'Shipping Info' },
                { to: '/returns', label: 'Returns' },
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
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-cream/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-cream/50">
              © {currentYear} Jaee. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-cream/50">
              <Link to="/privacy" className="hover:text-cream transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-cream transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
