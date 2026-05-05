import { Link, useParams } from 'react-router-dom'
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Package, Truck, MapPin, Phone, Mail, MessageCircle, ExternalLink } from 'lucide-react'
import { orderService } from '@/services/orderService'
import { formatPrice, formatDate } from '@/lib/utils'
import { orderWhatsAppHref } from '@/lib/orderWhatsApp'
import { useStoreSettings } from '@/hooks/useStoreSettings'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import OrderStepper from '@/components/ui/OrderStepper'
import OrderItemsBreakdown from '@/components/order/OrderItemsBreakdown'
export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const { supportEmail, whatsappPhoneDigits } = useStoreSettings()

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderService.getOrderById(Number(orderId)),
    enabled: !!orderId,
  })

  const summary = useMemo(() => {
    if (!order) return null
    const itemsSum = order.items.reduce((s, i) => s + i.subtotal, 0)
    const shipping = order.shippingAmount ?? 0
    const discount = order.discountAmount ?? 0
    return { itemsSum, shipping, discount }
  }, [order])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="warning">Pending</Badge>
      case 'PAID':
        return <Badge variant="success">Paid</Badge>
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

  if (error || !order || !summary) {
    return (
      <div className="bg-cream min-h-screen py-8 md:py-12">
        <div className="container-custom max-w-4xl text-center">
          <Package className="w-16 h-16 text-warm-gray/50 mx-auto mb-4" />
          <h1 className="heading-3 text-charcoal mb-2">Order not found</h1>
          <p className="text-warm-gray mb-8">This order doesn&apos;t exist or you don&apos;t have access to it.</p>
          <Link to="/orders">
            <Button>View All Orders</Button>
          </Link>
        </div>
      </div>
    )
  }

  const statusBadge = getStatusBadge(order.status)

  return (
    <div className="bg-cream min-h-screen py-8 md:py-12">
      <div className="container-custom max-w-4xl">
        <Link
          to="/orders"
          className="inline-flex items-center text-warm-gray hover:text-charcoal mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Orders
        </Link>

        <div className="bg-soft-white rounded-xl shadow-soft p-6 mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="heading-3 text-charcoal">Order #{order.id}</h1>
              <p className="text-warm-gray mt-1">Placed on {formatDate(order.createdAt)}</p>
            </div>
            <div className="text-right">
              {statusBadge}
              <p className="text-2xl text-rose tabular-nums mt-2">{formatPrice(order.totalAmount, order.currency)}</p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-blush">
            <OrderStepper status={order.status} />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-soft-white rounded-xl shadow-soft p-6">
            <h2 className="font-serif text-lg text-charcoal mb-4">
              Order Items ({order.items.length})
            </h2>
            <OrderItemsBreakdown items={order.items} currency={order.currency} />

            <div className="mt-6 pt-6 border-t border-blush space-y-3">
              <div className="flex justify-between text-warm-gray">
                <span>Items subtotal</span>
                <span className="tabular-nums">{formatPrice(summary.itemsSum, order.currency)}</span>
              </div>
              {summary.discount > 0 && (
                <div className="flex justify-between text-success">
                  <span>{order.couponCode ? `Discount (${order.couponCode})` : 'Discount'}</span>
                  <span className="tabular-nums">−{formatPrice(summary.discount, order.currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-warm-gray">
                <span>Shipping</span>
                <span className={summary.shipping === 0 ? 'text-success' : 'tabular-nums'}>
                  {summary.shipping === 0 ? 'Free' : formatPrice(summary.shipping, order.currency)}
                </span>
              </div>
              <div className="flex justify-between text-charcoal text-lg pt-3 border-t border-blush">
                <span>Total</span>
                <span className="text-rose tabular-nums">{formatPrice(order.totalAmount, order.currency)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-soft-white rounded-xl shadow-soft p-6">
              <h2 className="font-serif text-lg text-charcoal mb-4">Customer Details</h2>
              <div className="space-y-3">
                {order.customerEmail && (
                  <div className="flex items-center gap-3 text-warm-gray">
                    <Mail className="w-4 h-4 shrink-0" />
                    <span className="text-sm">{order.customerEmail}</span>
                  </div>
                )}
                {order.customerPhone && (
                  <div className="flex items-center gap-3 text-warm-gray">
                    <Phone className="w-4 h-4 shrink-0" />
                    <span className="text-sm">{order.customerPhone}</span>
                  </div>
                )}
              </div>
            </div>

            {order.shippingAddress && (
              <div className="bg-soft-white rounded-xl shadow-soft p-6">
                <h2 className="font-serif text-lg text-charcoal mb-4">Shipping Address</h2>
                <div className="flex items-start gap-3 text-warm-gray">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                  <p className="text-sm whitespace-pre-line">{order.shippingAddress}</p>
                </div>
              </div>
            )}

            {order.trackingNumber && (
              <div className="bg-soft-white rounded-xl shadow-soft p-6">
                <h2 className="font-serif text-lg text-charcoal mb-4">Tracking Details</h2>
                <div className="space-y-3">
                  {order.carrier && (
                    <div className="flex items-center gap-3 text-warm-gray">
                      <Truck className="w-4 h-4 shrink-0" />
                      <span className="text-sm text-charcoal">{order.carrier}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-warm-gray">
                    <Package className="w-4 h-4 shrink-0" />
                    <span className="text-sm font-mono">{order.trackingNumber}</span>
                  </div>
                  {order.trackingUrl && (
                    <a
                      href={order.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-rose hover:bg-rose/90 text-soft-white text-sm rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Track Order
                    </a>
                  )}
                </div>
              </div>
            )}

            <div className="bg-soft-white rounded-xl shadow-soft p-6">
              <h2 className="font-serif text-lg text-charcoal mb-4">Need Help?</h2>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
                <a href={`mailto:${supportEmail}`} className="flex-1 min-w-0">
                  <Button variant="outline" className="w-full" size="sm">
                    Contact Support
                  </Button>
                </a>
                <a
                  href={orderWhatsAppHref(order, whatsappPhoneDigits)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-0 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#25D366] hover:bg-[#1da851] text-soft-white text-sm rounded-lg transition-colors"
                >
                  <MessageCircle className="w-4 h-4 shrink-0" />
                  Share on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
