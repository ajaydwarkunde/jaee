import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Package, ChevronRight } from 'lucide-react'
import { orderService } from '@/services/orderService'
import { formatPrice, formatDate } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Button from '@/components/ui/Button'

export default function OrdersPage() {
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => orderService.getOrders(0, 20),
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge variant="success">Paid</Badge>
      case 'PENDING':
        return <Badge variant="warning">Pending</Badge>
      case 'SHIPPED':
        return <Badge variant="default">Shipped</Badge>
      case 'FULFILLED':
        return <Badge variant="success">Delivered</Badge>
      case 'CANCELLED':
        return <Badge variant="error">Cancelled</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (isLoading) {
    return <LoadingSpinner fullScreen />
  }

  const orders = ordersData?.content || []

  return (
    <div className="bg-cream min-h-screen py-8 md:py-12">
      <div className="container-custom max-w-4xl">
        <h1 className="heading-2 text-charcoal mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="bg-soft-white rounded-xl p-12 text-center shadow-soft">
            <Package className="w-16 h-16 text-warm-gray/50 mx-auto mb-4" />
            <h2 className="heading-4 text-charcoal mb-2">No orders yet</h2>
            <p className="text-warm-gray mb-8">Start shopping to see your orders here.</p>
            <Link to="/shop">
              <Button>Browse Products</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-soft-white rounded-xl shadow-soft overflow-hidden"
              >
                {/* Order Header */}
                <div className="p-4 border-b border-blush bg-blush/30">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-sm text-warm-gray">Order #{order.id}</p>
                        <p className="text-xs text-warm-gray">{formatDate(order.createdAt)}</p>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="font-medium text-charcoal">
                      {formatPrice(order.totalAmount, order.currency)}
                    </p>
                  </div>
                </div>

                {/* Order Items Preview */}
                <div className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Show first 3 items */}
                    <div className="flex -space-x-3">
                      {order.items.slice(0, 3).map((item, idx) => (
                        <img
                          key={idx}
                          src={item.imageUrl || 'https://images.unsplash.com/photo-1602523961359-24a68d4e5a9b?w=100'}
                          alt={item.name}
                          className="w-12 h-12 rounded-lg border-2 border-soft-white object-cover"
                        />
                      ))}
                      {order.items.length > 3 && (
                        <div className="w-12 h-12 rounded-lg border-2 border-soft-white bg-blush flex items-center justify-center">
                          <span className="text-xs font-medium text-charcoal">
                            +{order.items.length - 3}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-charcoal">
                        {order.items.map((item) => item.name).join(', ')}
                      </p>
                      <p className="text-xs text-warm-gray mt-1">
                        {order.items.reduce((sum, item) => sum + item.qty, 0)} items
                      </p>
                    </div>
                    <Link
                      to={`/orders/${order.id}`}
                      className="text-rose hover:text-rose-dark transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
