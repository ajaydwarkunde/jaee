import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ShoppingBag, User, Menu, X, Search, LogOut } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useCartStore } from '@/stores/cartStore'
import { useQuery } from '@tanstack/react-query'
import { cartService } from '@/services/cartService'
import { cn } from '@/lib/utils'
import Button from '../ui/Button'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  
  const { isAuthenticated, isAdmin, user, logout } = useAuthStore()
  const guestCartCount = useCartStore((state) => state.getGuestCartCount())
  
  // Get cart count for logged-in users
  const { data: cart } = useQuery({
    queryKey: ['cart'],
    queryFn: cartService.getCart,
    enabled: isAuthenticated,
  })

  const cartCount = isAuthenticated ? (cart?.itemCount ?? 0) : guestCartCount

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`)
      setSearchQuery('')
      setSearchOpen(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
    setMobileMenuOpen(false)
  }

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Shop' },
    { to: '/shop/candles', label: 'Candles' },
    { to: '/shop/gift-sets', label: 'Gifts' },
  ]

  return (
    <header className="sticky top-0 z-40 bg-soft-white/95 backdrop-blur-sm border-b border-blush">
      <nav className="container-custom">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 -ml-2 text-charcoal hover:text-rose transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo */}
          <Link 
            to="/" 
            className="font-serif text-2xl md:text-3xl font-semibold tracking-wider text-rose hover:text-rose-dark transition-colors"
          >
            JAEE
          </Link>

          {/* Desktop navigation */}
          <ul className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    cn(
                      'text-sm font-medium tracking-wide transition-colors hover:text-rose',
                      isActive ? 'text-rose' : 'text-charcoal'
                    )
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Search button */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-charcoal hover:text-rose transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* User menu */}
            {isAuthenticated ? (
              <div className="relative group">
                <button className="p-2 text-charcoal hover:text-rose transition-colors">
                  <User className="w-5 h-5" />
                </button>
                <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="bg-soft-white rounded-lg shadow-soft-lg border border-blush py-2 min-w-[180px]">
                    <div className="px-4 py-2 border-b border-blush">
                      <p className="text-sm font-medium text-charcoal truncate">
                        {user?.name || user?.email || 'Account'}
                      </p>
                    </div>
                    <Link
                      to="/account"
                      className="block px-4 py-2 text-sm text-charcoal hover:bg-blush transition-colors"
                    >
                      My Account
                    </Link>
                    <Link
                      to="/orders"
                      className="block px-4 py-2 text-sm text-charcoal hover:bg-blush transition-colors"
                    >
                      My Orders
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-sm text-charcoal hover:bg-blush transition-colors"
                      >
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-sm text-left text-error hover:bg-blush transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="p-2 text-charcoal hover:text-rose transition-colors"
                aria-label="Login"
              >
                <User className="w-5 h-5" />
              </Link>
            )}

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 text-charcoal hover:text-rose transition-colors"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose text-soft-white text-xs font-medium rounded-full flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="py-4 border-t border-blush animate-slide-up">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="flex-1 px-4 py-2 bg-cream border border-blush rounded-lg focus:outline-none focus:border-rose"
                autoFocus
              />
              <Button type="submit" size="sm">Search</Button>
            </form>
          </div>
        )}

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-blush animate-slide-up">
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'block py-2 text-base font-medium transition-colors',
                        isActive ? 'text-rose' : 'text-charcoal'
                      )
                    }
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
              {!isAuthenticated && (
                <li className="pt-4 border-t border-blush">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-base font-medium text-charcoal"
                  >
                    Login / Register
                  </Link>
                </li>
              )}
              {isAuthenticated && (
                <>
                  <li className="pt-4 border-t border-blush">
                    <Link
                      to="/account"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 text-base font-medium text-charcoal"
                    >
                      My Account
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/orders"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 text-base font-medium text-charcoal"
                    >
                      My Orders
                    </Link>
                  </li>
                  {isAdmin && (
                    <li>
                      <Link
                        to="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block py-2 text-base font-medium text-charcoal"
                      >
                        Admin Panel
                      </Link>
                    </li>
                  )}
                  <li>
                    <button
                      onClick={handleLogout}
                      className="block py-2 text-base font-medium text-error"
                    >
                      Logout
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>
        )}
      </nav>
    </header>
  )
}
