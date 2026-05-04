import { useState, useEffect, useRef, useMemo } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ShoppingBag, User, Menu, X, Search, LogOut, Heart, ChevronDown, Flame, Gift, Sparkles, Package, Palette, Tag } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useCartStore } from '@/stores/cartStore'
import { useQuery } from '@tanstack/react-query'
import { cartService } from '@/services/cartService'
import { wishlistService } from '@/services/wishlistService'
import { productService } from '@/services/productService'
import { formatPrice } from '@/lib/utils'
import { cn } from '@/lib/utils'
import Button from '../ui/Button'
import Logo from '../ui/Logo'
import ThemeToggle from '../ui/ThemeToggle'
import { useStoreSettings } from '@/hooks/useStoreSettings'

function SearchWithSuggestions({ query, onQueryChange, onSearch, onClose }: {
  query: string
  onQueryChange: (q: string) => void
  onSearch: (e: React.FormEvent) => void
  onClose: () => void
}) {
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim())
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  const { data: suggestions } = useQuery({
    queryKey: ['searchSuggestions', debouncedQuery],
    queryFn: () => productService.getProducts({ search: debouncedQuery, pageSize: 5 }),
    enabled: debouncedQuery.length >= 2,
  })

  const handleSelectProduct = (slug: string) => {
    onQueryChange('')
    onClose()
    navigate(`/product/${slug}`)
  }

  return (
    <div className="py-4 border-t border-blush animate-slide-up">
      <form onSubmit={onSearch} className="flex gap-2">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search products..."
            className="w-full px-4 py-2 bg-cream border border-blush rounded-lg focus:outline-none focus:border-rose"
          />
          {suggestions && suggestions.content.length > 0 && query.length >= 2 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-soft-white border border-blush rounded-lg shadow-soft-lg z-50 overflow-hidden">
              {suggestions.content.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => handleSelectProduct(product.slug)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blush/50 transition-colors text-left"
                >
                  <img
                    src={product.images[0] || 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=100'}
                    alt=""
                    className="w-10 h-10 rounded object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-rose truncate">{product.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-rose font-semibold tabular-nums">{formatPrice(product.price, product.currency)}</p>
                      {product.categoryNames?.length > 0 && (
                        <span className="text-[10px] text-warm-gray">in {product.categoryNames[0]}</span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
              <button
                type="submit"
                className="w-full px-4 py-2 text-sm text-rose font-medium hover:bg-blush/50 transition-colors border-t border-blush"
              >
                View all results for "{query}"
              </button>
            </div>
          )}
        </div>
        <Button type="submit" size="sm">Search</Button>
      </form>
    </div>
  )
}

const storeMenus = {
  candles: {
    label: 'Candles',
    icon: Flame,
    links: [
      { to: '/shop/candles', label: 'Shop All Candles', icon: Flame, desc: 'Explore our full candle collection' },
      { to: '/custom-candle', label: 'Custom Candle Builder', icon: Palette, desc: 'Design your own unique candle' },
      { to: '/sale', label: 'Candle Offers', icon: Tag, desc: 'Special deals on select candles' },
    ],
  },
  hampers: {
    label: 'Hampers',
    icon: Gift,
    links: [
      { to: '/shop/gift-sets', label: 'Shop Gift Hampers', icon: Gift, desc: 'Browse curated gift hampers' },
      { to: '/custom-hamper', label: 'Build Your Hamper', icon: Package, desc: 'Create a custom gift hamper' },
      { to: '/shop', label: 'All Products', icon: Sparkles, desc: 'View everything we offer' },
    ],
  },
}

function MegaMenuDropdown({ menu, isOpen, onClose }: {
  menu: (typeof storeMenus)['candles']
  isOpen: boolean
  onClose: () => void
}) {
  if (!isOpen) return null

  return (
    <div
      className="absolute top-full left-1/2 -translate-x-1/2 pt-3 z-50 animate-slide-up"
      onMouseLeave={onClose}
    >
      <div className="bg-soft-white rounded-xl shadow-soft-lg border border-blush/50 p-4 min-w-[320px]">
        <div className="space-y-1">
          {menu.links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={onClose}
              className="flex items-start gap-3 px-3 py-3 rounded-lg hover:bg-blush/40 transition-colors group"
            >
              <div className="w-9 h-9 rounded-lg bg-rose/10 flex items-center justify-center flex-shrink-0 group-hover:bg-rose/20 transition-colors">
                <link.icon className="w-4.5 h-4.5 text-rose" />
              </div>
              <div>
                <p className="text-sm font-medium text-charcoal group-hover:text-rose transition-colors">{link.label}</p>
                <p className="text-xs text-warm-gray mt-0.5">{link.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<'candles' | 'hampers' | null>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const dropdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  const { isAuthenticated, isAdmin, user, logout } = useAuthStore()
  const guestCartCount = useCartStore((state) => state.getGuestCartCount())
  
  const { data: cart } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartService.getCart(),
    enabled: isAuthenticated,
  })

  const cartCount = isAuthenticated ? (cart?.itemCount ?? 0) : guestCartCount

  const { data: wishlistIds } = useQuery({
    queryKey: ['wishlistIds'],
    queryFn: wishlistService.getWishlistProductIds,
    enabled: isAuthenticated,
  })

  const wishlistCount = wishlistIds?.length ?? 0

  const { featureHamperPublic, featureCustomCandle } = useStoreSettings()

  const candleNavMenu = useMemo(
    () => ({
      ...storeMenus.candles,
      links: storeMenus.candles.links.filter(
        (l) => l.to !== '/custom-candle' || featureCustomCandle
      ),
    }),
    [featureCustomCandle]
  )

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

  const handleDropdownEnter = (store: 'candles' | 'hampers') => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current)
    setActiveDropdown(store)
  }

  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => setActiveDropdown(null), 150)
  }

  const [mobileExpanded, setMobileExpanded] = useState<'candles' | 'hampers' | null>(null)

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
          <Logo size="lg" />

          {/* Desktop navigation */}
          <ul className="hidden md:flex items-center gap-1">
            <li>
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  cn(
                    'relative px-4 py-2 text-sm font-medium tracking-wide rounded-full transition-all duration-300',
                    isActive ? 'text-rose bg-rose/10' : 'text-charcoal hover:text-rose hover:bg-blush/50'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    Home
                    <span className={cn('absolute bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 rounded-full bg-rose transition-all duration-300', isActive ? 'w-4' : 'w-0')} />
                  </>
                )}
              </NavLink>
            </li>

            {/* Candles dropdown */}
            <li
              className="relative"
              onMouseEnter={() => handleDropdownEnter('candles')}
              onMouseLeave={handleDropdownLeave}
            >
              <NavLink
                to="/shop/candles"
                className={({ isActive }) =>
                  cn(
                    'relative flex items-center gap-1 px-4 py-2 text-sm font-medium tracking-wide rounded-full transition-all duration-300',
                    isActive ? 'text-rose bg-rose/10' : 'text-charcoal hover:text-rose hover:bg-blush/50'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Flame className="w-3.5 h-3.5" />
                    Candles
                    <ChevronDown className={cn('w-3 h-3 transition-transform', activeDropdown === 'candles' && 'rotate-180')} />
                    <span className={cn('absolute bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 rounded-full bg-rose transition-all duration-300', isActive ? 'w-4' : 'w-0')} />
                  </>
                )}
              </NavLink>
              <MegaMenuDropdown
                menu={candleNavMenu}
                isOpen={activeDropdown === 'candles'}
                onClose={() => setActiveDropdown(null)}
              />
            </li>

            {/* Hampers dropdown */}
            {featureHamperPublic && (
            <li
              className="relative"
              onMouseEnter={() => handleDropdownEnter('hampers')}
              onMouseLeave={handleDropdownLeave}
            >
              <NavLink
                to="/shop/gift-sets"
                className={({ isActive }) =>
                  cn(
                    'relative flex items-center gap-1 px-4 py-2 text-sm font-medium tracking-wide rounded-full transition-all duration-300',
                    isActive ? 'text-rose bg-rose/10' : 'text-charcoal hover:text-rose hover:bg-blush/50'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Gift className="w-3.5 h-3.5" />
                    Hampers
                    <ChevronDown className={cn('w-3 h-3 transition-transform', activeDropdown === 'hampers' && 'rotate-180')} />
                    <span className={cn('absolute bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 rounded-full bg-rose transition-all duration-300', isActive ? 'w-4' : 'w-0')} />
                  </>
                )}
              </NavLink>
              <MegaMenuDropdown
                menu={storeMenus.hampers}
                isOpen={activeDropdown === 'hampers'}
                onClose={() => setActiveDropdown(null)}
              />
            </li>
            )}

            <li>
              <NavLink
                to="/sale"
                className={({ isActive }) =>
                  cn(
                    'relative px-4 py-2 text-sm font-medium tracking-wide rounded-full transition-all duration-300',
                    isActive ? 'text-rose bg-rose/10' : 'text-charcoal hover:text-rose hover:bg-blush/50'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    Sale
                    <span className={cn('absolute bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 rounded-full bg-rose transition-all duration-300', isActive ? 'w-4' : 'w-0')} />
                  </>
                )}
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  cn(
                    'relative px-4 py-2 text-sm font-medium tracking-wide rounded-full transition-all duration-300',
                    isActive ? 'text-rose bg-rose/10' : 'text-charcoal hover:text-rose hover:bg-blush/50'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    About
                    <span className={cn('absolute bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 rounded-full bg-rose transition-all duration-300', isActive ? 'w-4' : 'w-0')} />
                  </>
                )}
              </NavLink>
            </li>
          </ul>

          {/* Actions */}
          <div className="flex items-center gap-1 md:gap-3">
            <ThemeToggle />

            <button
              onClick={() => {
                setSearchOpen(!searchOpen)
                setUserMenuOpen(false)
              }}
              className="p-2 text-charcoal hover:text-rose transition-colors"
              aria-label="Search"
            >
              {searchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
            </button>

            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => {
                    setUserMenuOpen(!userMenuOpen)
                    setSearchOpen(false)
                  }}
                  className="p-2 text-charcoal hover:text-rose transition-colors"
                >
                  <User className="w-5 h-5" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full pt-2 z-50 animate-slide-up">
                    <div className="bg-soft-white rounded-lg shadow-soft-lg border border-blush py-2 min-w-[180px]">
                      <div className="px-4 py-2 border-b border-blush">
                        <p className="text-sm font-medium text-charcoal truncate">
                          {user?.name || user?.email || 'Account'}
                        </p>
                      </div>
                      <Link
                        to="/account"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-charcoal hover:bg-blush transition-colors"
                      >
                        My Account
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-charcoal hover:bg-blush transition-colors"
                      >
                        My Orders
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-charcoal hover:bg-blush transition-colors"
                        >
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={() => { setUserMenuOpen(false); handleLogout() }}
                        className="w-full px-4 py-2 text-sm text-left text-error hover:bg-blush transition-colors flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
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

            <Link
              to="/wishlist"
              className="relative p-2 text-charcoal hover:text-rose transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose text-soft-white text-xs font-medium rounded-full flex items-center justify-center">
                  {wishlistCount > 9 ? '9+' : wishlistCount}
                </span>
              )}
            </Link>

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
          <SearchWithSuggestions
            query={searchQuery}
            onQueryChange={setSearchQuery}
            onSearch={handleSearch}
            onClose={() => { setSearchOpen(false); setSearchQuery('') }}
          />
        )}

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-blush animate-slide-up">
            <ul className="space-y-1">
              <li>
                <NavLink
                  to="/"
                  end
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'block py-2.5 px-3 text-base font-medium rounded-lg transition-all duration-200',
                      isActive ? 'text-rose bg-rose/10 border-l-2 border-rose pl-4' : 'text-charcoal hover:bg-blush/40 hover:pl-4'
                    )
                  }
                >
                  Home
                </NavLink>
              </li>

              {/* Candles accordion */}
              <li>
                <button
                  onClick={() => setMobileExpanded(mobileExpanded === 'candles' ? null : 'candles')}
                  className="w-full flex items-center justify-between py-2.5 px-3 text-base font-medium text-charcoal rounded-lg hover:bg-blush/40 transition-all"
                >
                  <span className="flex items-center gap-2"><Flame className="w-4 h-4 text-rose" /> Candles</span>
                  <ChevronDown className={cn('w-4 h-4 transition-transform', mobileExpanded === 'candles' && 'rotate-180')} />
                </button>
                {mobileExpanded === 'candles' && (
                  <ul className="ml-4 mt-1 space-y-1 border-l-2 border-blush pl-3 animate-slide-up">
                    {candleNavMenu.links.map((link) => (
                      <li key={link.to}>
                        <Link
                          to={link.to}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block py-2 px-2 text-sm text-warm-gray hover:text-charcoal rounded transition-colors"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>

              {/* Hampers accordion */}
              {featureHamperPublic && (
              <li>
                <button
                  onClick={() => setMobileExpanded(mobileExpanded === 'hampers' ? null : 'hampers')}
                  className="w-full flex items-center justify-between py-2.5 px-3 text-base font-medium text-charcoal rounded-lg hover:bg-blush/40 transition-all"
                >
                  <span className="flex items-center gap-2"><Gift className="w-4 h-4 text-rose" /> Hampers</span>
                  <ChevronDown className={cn('w-4 h-4 transition-transform', mobileExpanded === 'hampers' && 'rotate-180')} />
                </button>
                {mobileExpanded === 'hampers' && (
                  <ul className="ml-4 mt-1 space-y-1 border-l-2 border-blush pl-3 animate-slide-up">
                    {storeMenus.hampers.links.map((link) => (
                      <li key={link.to}>
                        <Link
                          to={link.to}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block py-2 px-2 text-sm text-warm-gray hover:text-charcoal rounded transition-colors"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
              )}

              <li>
                <NavLink
                  to="/sale"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'block py-2.5 px-3 text-base font-medium rounded-lg transition-all duration-200',
                      isActive ? 'text-rose bg-rose/10 border-l-2 border-rose pl-4' : 'text-charcoal hover:bg-blush/40 hover:pl-4'
                    )
                  }
                >
                  Sale
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'block py-2.5 px-3 text-base font-medium rounded-lg transition-all duration-200',
                      isActive ? 'text-rose bg-rose/10 border-l-2 border-rose pl-4' : 'text-charcoal hover:bg-blush/40 hover:pl-4'
                    )
                  }
                >
                  About
                </NavLink>
              </li>

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
                    <Link to="/account" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-base font-medium text-charcoal">
                      My Account
                    </Link>
                  </li>
                  <li>
                    <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-base font-medium text-charcoal">
                      My Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
                    </Link>
                  </li>
                  <li>
                    <Link to="/orders" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-base font-medium text-charcoal">
                      My Orders
                    </Link>
                  </li>
                  {isAdmin && (
                    <li>
                      <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-base font-medium text-charcoal">
                        Admin Panel
                      </Link>
                    </li>
                  )}
                  <li>
                    <button onClick={handleLogout} className="block py-2 text-base font-medium text-error">
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
