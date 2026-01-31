import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Package, Truck, CheckCircle, Clock, XCircle, MapPin, Phone, Mail } from 'lucide-react'
import { orderService } from '@/services/orderService'
import { formatPrice, formatDate } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>()

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderService.getOrderById(Number(orderId)),
    enabled: !!orderId,
  })

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { badge: <Badge variant="warning">Pending</Badge>, icon: Clock, color: 'text-yellow-600' }
      case 'PAID':
        return { badge: <Badge variant="success">Paid</Badge>, icon: CheckCircle, color: 'text-green-600' }
      case 'SHIPPED':
        return { badge: <Badge variant="default">Shipped</Badge>, icon: Truck, color: 'text-blue-600' }
      case 'FULFILLED':
        return { badge: <Badge variant="success">Delivered</Badge>, icon: Package, color: 'text-green-600' }
      case 'CANCELLED':
        return { badge: <Badge variant="error">Cancelled</Badge>, icon: XCircle, color: 'text-red-600' }
      default:
        return { badge: <Badge>{status}</Badge>, icon: Package, color: 'text-gray-600' }
    }
  }

  if (isLoading) {
    return <LoadingSpinner fullScreen />
  }

  if (error || !order) {
    return (
      <div className="bg-cream min-h-screen py-8 md:py-12">
        <div className="container-custom max-w-4xl text-center">
          <Package className="w-16 h-16 text-warm-gray/50 mx-auto mb-4" />
          <h1 className="heading-3 text-charcoal mb-2">Order not found</h1>
          <p className="text-warm-gray mb-8">This order doesn't exist or you don't have access to it.</p>
          <Link to="/orders">
            <Button>View All Orders</Button>
          </Link>
        </div>
      </div>
    )
  }

  const statusInfo = getStatusInfo(order.status)
  const StatusIcon = statusInfo.icon

  return (
    <div className="bg-cream min-h-screen py-8 md:py-12">
      <div className="container-custom max-w-4xl">
        {/* Back Link */}
        <Link
          to="/orders"
          className="inline-flex items-center text-warm-gray hover:text-charcoal mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Orders
        </Link>

        {/* Order Header */}
        <div className="bg-soft-white rounded-xl shadow-soft p-6 mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="heading-3 text-charcoal">Order #{order.id}</h1>
              <p className="text-warm-gray mt-1">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="text-right">
              {statusInfo.badge}
              <p className="font-serif text-2xl font-semibold text-rose mt-2">
                {formatPrice(order.totalAmount, order.currency)}
              </p>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="mt-8 pt-6 border-t border-blush">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                order.status !== 'CANCELLED' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
              </div>
              <div>
                <p className="font-medium text-charcoal">
                  {order.status === 'PAID' && 'Payment Confirmed'}
                  {order.status === 'PENDING' && 'Awaiting Payment'}
                  {order.status === 'SHIPPED' && 'Order Shipped'}
                  {order.status === 'FULFILLED' && 'Order Delivered'}
                  {order.status === 'CANCELLED' && 'Order Cancelled'}
                </p>
                <p className="text-sm text-warm-gray">
                  {order.paidAt ? formatDate(order.paidAt) : formatDate(order.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2 bg-soft-white rounded-xl shadow-soft p-6">
            <h2 className="font-serif text-lg font-medium text-charcoal mb-4">
              Order Items ({order.items.length})
            </h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 bg-cream rounded-lg"
                >
                  <img
                    src={item.imageUrl || 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=200'}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-charcoal">{item.name}</h3>
                    <p className="text-sm text-warm-gray mt-1">
                      Qty: {item.qty} × {formatPrice(item.price)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-charcoal">
                      {formatPrice(item.subtotal)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-6 pt-6 border-t border-blush space-y-3">
              <div className="flex justify-between text-warm-gray">
                <span>Subtotal</span>
                <span>{formatPrice(order.totalAmount, order.currency)}</span>
              </div>
              <div className="flex justify-between text-warm-gray">
                <span>Shipping</span>
                <span className="text-success">Free</span>
              </div>
              <div className="flex justify-between font-medium text-charcoal text-lg pt-3 border-t border-blush">
                <span>Total</span>
                <span className="text-rose">{formatPrice(order.totalAmount, order.currency)}</span>
              </div>
            </div>
          </div>

          {/* Order Info */}
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="bg-soft-white rounded-xl shadow-soft p-6">
              <h2 className="font-serif text-lg font-medium text-charcoal mb-4">
                Customer Details
              </h2>
              <div className="space-y-3">
                {order.customerEmail && (
                  <div className="flex items-center gap-3 text-warm-gray">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{order.customerEmail}</span>
                  </div>
                )}
                {order.customerPhone && (
                  <div className="flex items-center gap-3 text-warm-gray">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{order.customerPhone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div className="bg-soft-white rounded-xl shadow-soft p-6">
                <h2 className="font-serif text-lg font-medium text-charcoal mb-4">
                  Shipping Address
                </h2>
                <div className="flex items-start gap-3 text-warm-gray">
                  <MapPin className="w-4 h-4 mt-0.5" />
                  <p className="text-sm">{order.shippingAddress}</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="bg-soft-white rounded-xl shadow-soft p-6">
              <h2 className="font-serif text-lg font-medium text-charcoal mb-4">
                Need Help?
              </h2>
              <div className="space-y-3">
                <Button variant="outline" className="w-full" size="sm">
                  Track Order
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  Contact Support
                </Button>
                {order.status === 'PAID' && (
                  <Button variant="outline" className="w-full text-error border-error hover:bg-error/10" size="sm">
                    Request Cancellation
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
