import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Package, Truck, CheckCircle, Clock, XCircle, MapPin, Phone, Mail, MessageCircle, ExternalLink } from 'lucide-react'
import { orderService } from '@/services/orderService'
import { formatPrice, formatDate } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import OrderStepper from '@/components/ui/OrderStepper'
import type { Order } from '@/types'

// Generate WhatsApp share link with order details
function generateWhatsAppLink(order: Order): string {
  const items = order.items
    .map((item) => `• ${item.name} x${item.qty} - ₹${item.subtotal}`)
    .join('\n')

  const message = `📦 *Order #${order.id} - Jaai*
📅 ${formatDate(order.createdAt)}
📊 Status: ${order.status}

*Items:*
${items}

💰 *Total: ₹${order.totalAmount}*

${order.shippingAddress ? `📍 *Delivery Address:*\n${order.shippingAddress}` : ''}`

  return `https://wa.me/?text=${encodeURIComponent(message)}`
}

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
        return { badge: <Badge>{status}</Badge>, icon: Package, color: 'text-warm-gray' }
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
              <p className="text-2xl font-bold text-rose tabular-nums mt-2">
                {formatPrice(order.totalAmount, order.currency)}
              </p>
            </div>
          </div>

          {/* Order Progress Stepper */}
          <div className="mt-8 pt-6 border-t border-blush">
            <OrderStepper status={order.status} />
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

            {/* Tracking Info */}
            {order.trackingNumber && (
              <div className="bg-soft-white rounded-xl shadow-soft p-6">
                <h2 className="font-serif text-lg font-medium text-charcoal mb-4">
                  Tracking Details
                </h2>
                <div className="space-y-3">
                  {order.carrier && (
                    <div className="flex items-center gap-3 text-warm-gray">
                      <Truck className="w-4 h-4" />
                      <span className="text-sm font-medium">{order.carrier}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-warm-gray">
                    <Package className="w-4 h-4" />
                    <span className="text-sm font-mono">{order.trackingNumber}</span>
                  </div>
                  {order.trackingUrl && (
                    <a
                      href={order.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-rose hover:bg-rose/90 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Track Order
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="bg-soft-white rounded-xl shadow-soft p-6">
              <h2 className="font-serif text-lg font-medium text-charcoal mb-4">
                Need Help?
              </h2>
              <div className="space-y-3">
                <a
                  href={generateWhatsAppLink(order)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-[#25D366] hover:bg-[#1da851] text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Share on WhatsApp
                </a>
                <a href="mailto:jaeestudio12@gmail.com">
                  <Button variant="outline" className="w-full" size="sm">
                    Contact Support
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
