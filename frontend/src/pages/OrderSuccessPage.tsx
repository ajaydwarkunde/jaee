import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle, Package, ArrowRight, MessageCircle } from 'lucide-react'
import { orderService } from '@/services/orderService'
import { formatPrice, formatDate } from '@/lib/utils'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import OrderStepper from '@/components/ui/OrderStepper'
import confetti from '@/lib/confetti'
import type { Order } from '@/types'

// Generate WhatsApp share link with order details
function generateWhatsAppLink(order: Order): string {
  const items = order.items
    .map((item) => `• ${item.name} x${item.qty} - ₹${item.subtotal}`)
    .join('\n')

  const message = `🎉 *Order Confirmed - Jaee*

📦 *Order #${order.id}*
📅 ${formatDate(order.createdAt)}

*Items:*
${items}

💰 *Total: ₹${order.totalAmount}*

${order.shippingAddress ? `📍 *Delivery Address:*\n${order.shippingAddress}` : ''}

🚚 Expected delivery: 5-7 business days

Thank you for shopping with Jaee! 🕯️✨`

  // Encode the message for URL
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/?text=${encodedMessage}`
}

export default function OrderSuccessPage() {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId')

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderService.getOrderById(Number(orderId)),
    enabled: !!orderId,
    retry: 3,
    retryDelay: 1000,
  })

  // Confetti effect on success
  useEffect(() => {
    if (order) {
      confetti()
    }
  }, [order])

  if (isLoading) {
    return <LoadingSpinner fullScreen />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blush via-cream to-champagne py-12">
      <div className="container-custom max-w-2xl">
        <div className="bg-soft-white rounded-2xl shadow-soft-xl p-8 md:p-12 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in">
            <CheckCircle className="w-10 h-10 text-success" />
          </div>

          <h1 className="heading-2 text-charcoal mb-2">Thank You!</h1>
          <p className="text-warm-gray text-lg mb-4">
            Your order has been placed successfully.
          </p>

          {/* Order Progress */}
          {order && (
            <div className="mb-8 bg-cream rounded-xl p-4">
              <OrderStepper status={order.status} />
            </div>
          )}

          {order && (
            <div className="bg-blush/30 rounded-xl p-6 mb-8 text-left">
              <div className="flex items-center justify-between mb-4">
                <span className="text-warm-gray">Order Number</span>
                <span className="font-medium text-charcoal">#{order.id}</span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-warm-gray">Date</span>
                <span className="text-charcoal">{formatDate(order.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-warm-gray">Email</span>
                <span className="text-charcoal">{order.customerEmail}</span>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-blush">
                <span className="font-medium text-charcoal">Total</span>
                <span className="text-xl font-bold text-rose tabular-nums">
                  {formatPrice(order.totalAmount, order.currency)}
                </span>
              </div>
            </div>
          )}

          {order && (
            <div className="mb-8">
              <h3 className="font-medium text-charcoal mb-4 text-left">Order Items</h3>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 bg-cream rounded-lg p-3"
                  >
                    <img
                      src={item.imageUrl || 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=100'}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 text-left">
                      <p className="font-medium text-charcoal">{item.name}</p>
                      <p className="text-sm text-warm-gray">Qty: {item.qty}</p>
                    </div>
                    <p className="font-medium text-charcoal">
                      {formatPrice(item.subtotal)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-warm-gray mb-8">
            We've sent a confirmation email with all the details. Your order will be 
            shipped soon!
          </p>

          {/* Share on WhatsApp */}
          {order && (
            <div className="mb-8">
              <a
                href={generateWhatsAppLink(order)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#1da851] text-white font-medium rounded-full transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                Share Order on WhatsApp
              </a>
              <p className="text-xs text-warm-gray mt-2">Share order details with family or save for yourself</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/orders">
              <Button variant="outline" icon={<Package className="w-5 h-5" />}>
                View My Orders
              </Button>
            </Link>
            <Link to="/shop">
              <Button icon={<ArrowRight className="w-5 h-5" />}>
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
