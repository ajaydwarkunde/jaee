import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Package, Tag, ShoppingBag, ShoppingCart, Settings, Percent, Flame, Gift, Sliders, TrendingUp, Award } from 'lucide-react'
import { productService } from '@/services/productService'
import { categoryService } from '@/services/categoryService'
import { orderService } from '@/services/orderService'
import type { StoreSales } from '@/services/orderService'
import { api } from '@/lib/api'
import { formatPrice } from '@/lib/utils'
import Card, { CardContent, CardTitle } from '@/components/ui/Card'

function StoreSalesCard({ data, icon: Icon, color, label }: {
  data: StoreSales | undefined
  icon: React.ElementType
  color: string
  label: string
}) {
  const revenue = data?.revenue ?? 0
  const orderCount = data?.orderCount ?? 0
  const itemsSold = data?.itemsSold ?? 0
  const topProducts = data?.topProducts ?? []

  return (
    <div className={`bg-soft-white rounded-xl shadow-soft overflow-hidden border-t-4 ${color}`}>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color.replace('border-', 'bg-').replace('rose', 'rose/10').replace('success', 'success/10')}`}>
            <Icon className={`w-5 h-5 ${color.replace('border-', 'text-')}`} />
          </div>
          <div>
            <h3 className="font-serif text-lg font-semibold text-charcoal">{label}</h3>
            <p className="text-xs text-warm-gray">Sales Overview</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-cream rounded-lg">
            <p className="text-xl font-serif font-bold text-charcoal">{formatPrice(revenue)}</p>
            <p className="text-xs text-warm-gray mt-1">Revenue</p>
          </div>
          <div className="text-center p-3 bg-cream rounded-lg">
            <p className="text-xl font-serif font-bold text-charcoal">{orderCount}</p>
            <p className="text-xs text-warm-gray mt-1">Orders</p>
          </div>
          <div className="text-center p-3 bg-cream rounded-lg">
            <p className="text-xl font-serif font-bold text-charcoal">{itemsSold}</p>
            <p className="text-xs text-warm-gray mt-1">Items Sold</p>
          </div>
        </div>

        {topProducts.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-4 h-4 text-warning" />
              <p className="text-sm font-medium text-charcoal">Top Products</p>
            </div>
            <div className="space-y-2">
              {topProducts.map((product, idx) => (
                <div key={product.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-blush flex items-center justify-center text-xs font-bold text-charcoal flex-shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-charcoal truncate">{product.name}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                    <span className="text-warm-gray">{product.qtySold} sold</span>
                    <span className="font-medium text-charcoal">{formatPrice(product.revenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {topProducts.length === 0 && (
          <p className="text-sm text-warm-gray text-center py-4">
            No sales data yet. Assign categories to this store to start tracking.
          </p>
        )}
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const { data: products } = useQuery({
    queryKey: ['products', { pageSize: 1 }],
    queryFn: () => productService.getProducts({ pageSize: 1 }),
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getCategories,
  })

  const { data: orderStats } = useQuery({
    queryKey: ['admin-order-stats'],
    queryFn: orderService.getOrderStats,
  })

  const { data: storeSales } = useQuery({
    queryKey: ['admin-store-sales'],
    queryFn: orderService.getStoreSales,
  })

  const { data: customCandles } = useQuery({
    queryKey: ['admin-custom-candles-count'],
    queryFn: () => api.get('/custom-candles/admin/all').then(res => res.data.data as unknown[]),
  })

  const { data: giftHampers } = useQuery({
    queryKey: ['admin-gift-hampers-count'],
    queryFn: () => api.get('/gift-hampers/admin/all').then(res => res.data.data as unknown[]),
  })

  const pendingCandles = (customCandles || []).filter((c: any) => c.status === 'PENDING').length
  const pendingHampers = (giftHampers || []).filter((h: any) => h.status === 'PENDING').length

  const candleSales = storeSales?.find(s => s.storeType === 'CANDLE')
  const hamperSales = storeSales?.find(s => s.storeType === 'HAMPER')

  const stats = [
    {
      title: 'Total Products',
      value: products?.totalElements || 0,
      icon: Package,
      link: '/admin/products',
      color: 'bg-rose/10 text-rose',
    },
    {
      title: 'Categories',
      value: categories?.length || 0,
      icon: Tag,
      link: '/admin/categories',
      color: 'bg-success/10 text-success',
    },
    {
      title: 'Total Orders',
      value: orderStats?.total || 0,
      icon: ShoppingCart,
      link: '/admin/orders',
      color: 'bg-warning/10 text-warning',
    },
    {
      title: 'Pending Orders',
      value: orderStats?.pending || 0,
      icon: ShoppingBag,
      link: '/admin/orders?status=PENDING',
      color: 'bg-charcoal/10 text-charcoal',
    },
    {
      title: 'Custom Candles',
      value: customCandles?.length || 0,
      icon: Flame,
      link: '/admin/custom-candles',
      color: 'bg-rose/10 text-rose',
    },
    {
      title: 'Gift Hampers',
      value: giftHampers?.length || 0,
      icon: Gift,
      link: '/admin/gift-hampers',
      color: 'bg-success/10 text-success',
    },
  ]

  return (
    <div className="bg-cream min-h-screen py-8">
      <div className="container-custom">
        <div className="mb-8">
          <h1 className="heading-2 text-charcoal">Admin Dashboard</h1>
          <p className="text-warm-gray mt-2">Manage your store</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {stats.map((stat) => (
            <Link key={stat.title} to={stat.link}>
              <Card hover className="h-full">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-warm-gray">{stat.title}</p>
                    <p className="text-2xl font-serif font-semibold text-charcoal">{stat.value}</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Store Sales Analytics */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-rose" />
            <h2 className="heading-3 text-charcoal">Sales by Store</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <StoreSalesCard
              data={candleSales}
              icon={Flame}
              color="border-rose"
              label="Candle Store"
            />
            <StoreSalesCard
              data={hamperSales}
              icon={Gift}
              color="border-success"
              label="Hamper Store"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardTitle>Products</CardTitle>
            <CardContent>
              <p className="mb-4">Manage your product catalog</p>
              <Link to="/admin/products" className="text-rose hover:underline font-medium">
                View All Products &rarr;
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardTitle>Categories</CardTitle>
            <CardContent>
              <p className="mb-4">Organize products into categories</p>
              <Link to="/admin/categories" className="text-rose hover:underline font-medium">
                Manage Categories &rarr;
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Orders
            </CardTitle>
            <CardContent>
              <p className="mb-4">View and manage customer orders</p>
              <Link to="/admin/orders" className="text-rose hover:underline font-medium">
                Manage Orders &rarr;
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardTitle className="flex items-center gap-2">
              <Percent className="w-5 h-5" />
              Promo Codes
            </CardTitle>
            <CardContent>
              <p className="mb-4">Manage discount coupons</p>
              <Link to="/admin/coupons" className="text-rose hover:underline font-medium">
                Manage Coupons &rarr;
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardTitle className="flex items-center gap-2">
              <Flame className="w-5 h-5" />
              Custom Candles
              {pendingCandles > 0 && (
                <span className="ml-auto px-2 py-0.5 bg-warning/10 text-warning text-xs font-bold rounded-full">
                  {pendingCandles} new
                </span>
              )}
            </CardTitle>
            <CardContent>
              <p className="mb-4">View custom candle requests</p>
              <Link to="/admin/custom-candles" className="text-rose hover:underline font-medium">
                Manage Requests &rarr;
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5" />
              Gift Hampers
              {pendingHampers > 0 && (
                <span className="ml-auto px-2 py-0.5 bg-warning/10 text-warning text-xs font-bold rounded-full">
                  {pendingHampers} new
                </span>
              )}
            </CardTitle>
            <CardContent>
              <p className="mb-4">View gift hamper requests</p>
              <Link to="/admin/gift-hampers" className="text-rose hover:underline font-medium">
                Manage Requests &rarr;
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardTitle className="flex items-center gap-2">
              <Sliders className="w-5 h-5" />
              Builder Options
            </CardTitle>
            <CardContent>
              <p className="mb-4">Manage candle & hamper choices</p>
              <Link to="/admin/builder-options" className="text-rose hover:underline font-medium">
                Manage Options &rarr;
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Store Settings
            </CardTitle>
            <CardContent>
              <p className="mb-4">Shipping, returns, and more</p>
              <Link to="/admin/settings" className="text-rose hover:underline font-medium">
                Configure Settings &rarr;
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
