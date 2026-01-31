import { Link } from 'react-router-dom'
import { User, Package, MapPin, LogOut, ChevronRight } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { getInitials } from '@/lib/utils'
import Button from '@/components/ui/Button'

export default function AccountPage() {
  const { user, logout } = useAuthStore()

  const menuItems = [
    { icon: Package, label: 'My Orders', to: '/orders', desc: 'Track, return, or review your orders' },
    { icon: MapPin, label: 'Addresses', to: '/addresses', desc: 'Manage your saved addresses' },
    { icon: User, label: 'Profile Settings', to: '/profile', desc: 'Update your personal information' },
  ]

  return (
    <div className="bg-cream min-h-screen py-8 md:py-12">
      <div className="container-custom max-w-4xl">
        <h1 className="heading-2 text-charcoal mb-8">My Account</h1>

        {/* Profile Card */}
        <div className="bg-soft-white rounded-xl p-6 shadow-soft mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-rose rounded-full flex items-center justify-center">
              <span className="text-soft-white text-xl font-medium">
                {getInitials(user?.name || user?.email)}
              </span>
            </div>
            <div>
              <h2 className="font-serif text-xl font-medium text-charcoal">
                {user?.name || 'Welcome!'}
              </h2>
              <p className="text-warm-gray">
                {user?.email || user?.mobileNumber}
              </p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="bg-soft-white rounded-xl shadow-soft overflow-hidden mb-8">
          {menuItems.map((item, idx) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center justify-between p-4 hover:bg-blush/50 transition-colors ${
                idx !== menuItems.length - 1 ? 'border-b border-blush' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-rose/10 rounded-full flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-rose" />
                </div>
                <div>
                  <p className="font-medium text-charcoal">{item.label}</p>
                  <p className="text-sm text-warm-gray">{item.desc}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-warm-gray" />
            </Link>
          ))}
        </div>

        {/* Logout */}
        <Button
          variant="outline"
          onClick={logout}
          icon={<LogOut className="w-5 h-5" />}
          className="w-full"
        >
          Sign Out
        </Button>
      </div>
    </div>
  )
}
