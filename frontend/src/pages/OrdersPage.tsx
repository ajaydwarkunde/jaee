import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Package, ChevronRight, RefreshCw, Edit3 } from 'lucide-react'
import { orderService } from '@/services/orderService'
import { checkoutService } from '@/services/checkoutService'
import { formatPrice, formatDate } from '@/lib/utils'
import OrderItemsBreakdown from '@/components/order/OrderItemsBreakdown'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'
import { initializeRazorpay, loadRazorpayScript } from '@/lib/razorpay'
import { getErrorMessage } from '@/lib/api'

export default function OrdersPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => orderService.getOrders(0, 20),
  })

  const verifyPaymentMutation = useMutation({
    mutationFn: checkoutService.verifyPayment,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['order'] })
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      toast.success('Payment successful!')
      navigate(`/order-success?orderId=${data.orderId}`)
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })

  const retryOrderMutation = useMutation({
    mutationFn: (orderId: number) => checkoutService.retryOrderPayment(orderId),
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })

  const restoreToCartMutation = useMutation({
    mutationFn: (orderId: number) => orderService.restoreToCart(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      toast.success('Order items moved to cart. You can edit and checkout again.')
      navigate('/cart')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })

  const handleRetryPayment = async (orderId: number) => {
    try {
      const orderData = await retryOrderMutation.mutateAsync(orderId)

      if (orderData.testMode) {
        const mockPaymentId = 'test_pay_' + Date.now()
        const mockSignature = 'test_signature_' + Date.now()
        verifyPaymentMutation.mutate({
          razorpayOrderId: orderData.orderId,
          razorpayPaymentId: mockPaymentId,
          razorpaySignature: mockSignature,
        })
        return
      }

      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        toast.error('Failed to load payment gateway')
        return
      }

      const razorpay = initializeRazorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Jaai',
        description: `Retry payment for order #${orderId}`,
        image: '/favicon.svg',
        order_id: orderData.orderId,
        prefill: orderData.prefill,
        theme: { color: '#923C5B' },
        handler: (response) => {
          verifyPaymentMutation.mutate({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          })
        },
        modal: {
          ondismiss: () => {
            toast.error('Payment cancelled')
          },
        },
      })

      if (!razorpay) {
        toast.error('Failed to initialize payment gateway')
        return
      }
      razorpay.open()
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

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

                <div className="p-4 space-y-4">
                  <OrderItemsBreakdown
                    items={order.items}
                    currency={order.currency}
                    dense
                    customerFriendlyNames
                  />
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {(order.status === 'PENDING' || order.status === 'CANCELLED') && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          icon={<RefreshCw className="w-4 h-4" />}
                          onClick={() => handleRetryPayment(order.id)}
                          disabled={retryOrderMutation.isPending || verifyPaymentMutation.isPending}
                        >
                          Pay now
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={<Edit3 className="w-4 h-4" />}
                          onClick={() => restoreToCartMutation.mutate(order.id)}
                          disabled={restoreToCartMutation.isPending}
                        >
                          Modify order
                        </Button>
                      </>
                    )}
                    <Link
                      to={`/orders/${order.id}`}
                      className="inline-flex items-center gap-1 text-sm text-rose hover:text-rose-dark transition-colors"
                    >
                      View full order
                      <ChevronRight className="w-4 h-4" />
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
