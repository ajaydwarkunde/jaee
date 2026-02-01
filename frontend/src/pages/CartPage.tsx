import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2, Minus, Plus, ArrowRight, ShoppingCart } from 'lucide-react'
import { cartService } from '@/services/cartService'
import { checkoutService } from '@/services/checkoutService'
import { productService } from '@/services/productService'
import { useAuthStore } from '@/stores/authStore'
import { useCartStore } from '@/stores/cartStore'
import { formatPrice } from '@/lib/utils'
import { loadRazorpayScript, initializeRazorpay } from '@/lib/razorpay'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'
import type { Product } from '@/types'

export default function CartPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const { guestCart, updateGuestCartItem, removeFromGuestCart } = useCartStore()
  const queryClient = useQueryClient()
  const [guestProducts, setGuestProducts] = useState<Map<number, Product>>(new Map())
  const [loadingGuestProducts, setLoadingGuestProducts] = useState(false)

  // Get cart for authenticated users
  const { data: cart, isLoading: cartLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: cartService.getCart,
    enabled: isAuthenticated,
  })

  // Load guest cart products
  useEffect(() => {
    async function loadGuestProducts() {
      if (isAuthenticated || guestCart.length === 0) return
      
      setLoadingGuestProducts(true)
      const products = new Map<number, Product>()
      
      for (const item of guestCart) {
        try {
          // We'll use the products API - assuming we have a way to get by ID
          const productsData = await productService.getProducts({ size: 100 })
          const product = productsData.content.find(p => p.id === item.productId)
          if (product) {
            products.set(item.productId, product)
          }
        } catch {
          // Product load failed silently
        }
      }
      
      setGuestProducts(products)
      setLoadingGuestProducts(false)
    }

    loadGuestProducts()
  }, [isAuthenticated, guestCart])

  // Cart mutations
  const updateItemMutation = useMutation({
    mutationFn: ({ itemId, qty }: { itemId: number; qty: number }) =>
      cartService.updateCartItem(itemId, qty),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
    onError: () => {
      toast.error('Failed to update cart')
    },
  })

  const removeItemMutation = useMutation({
    mutationFn: (itemId: number) => cartService.removeCartItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      toast.success('Item removed')
    },
    onError: () => {
      toast.error('Failed to remove item')
    },
  })

  const [checkoutLoading, setCheckoutLoading] = useState(false)

  const verifyPaymentMutation = useMutation({
    mutationFn: checkoutService.verifyPayment,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      toast.success('Payment successful!')
      navigate(`/order-success?orderId=${data.orderId}`)
    },
    onError: () => {
      toast.error('Payment verification failed')
    },
  })

  const handleUpdateQuantity = (itemId: number, productId: number, delta: number, currentQty: number) => {
    const newQty = currentQty + delta
    if (newQty < 1) return

    if (isAuthenticated) {
      updateItemMutation.mutate({ itemId, qty: newQty })
    } else {
      updateGuestCartItem(productId, newQty)
    }
  }

  const handleRemoveItem = (itemId: number, productId: number) => {
    if (isAuthenticated) {
      removeItemMutation.mutate(itemId)
    } else {
      removeFromGuestCart(productId)
      toast.success('Item removed')
    }
  }

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to checkout')
      navigate('/login', { state: { from: '/cart' } })
      return
    }

    setCheckoutLoading(true)

    try {
      // Create order
      const orderData = await checkoutService.createOrder()

      // TEST MODE: Simulate payment without Razorpay
      if (orderData.testMode) {
        toast.success('🧪 Test Mode: Simulating payment...')
        
        // Simulate a short delay for realistic experience
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // Generate mock payment details
        const mockPaymentId = 'test_pay_' + Date.now()
        const mockSignature = 'test_signature_' + Date.now()
        
        // Verify payment (backend will skip signature verification in test mode)
        verifyPaymentMutation.mutate({
          razorpayOrderId: orderData.orderId,
          razorpayPaymentId: mockPaymentId,
          razorpaySignature: mockSignature,
        })
        return
      }

      // PRODUCTION MODE: Use Razorpay
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        toast.error('Failed to load payment gateway')
        setCheckoutLoading(false)
        return
      }

      // Initialize Razorpay
      const razorpay = initializeRazorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Jaee',
        description: 'Order Payment',
        image: '/logo.svg',
        order_id: orderData.orderId,
        prefill: {
          name: orderData.prefill.name,
          email: orderData.prefill.email,
          contact: orderData.prefill.contact,
        },
        theme: {
          color: '#D4A5A5', // Rose color matching the brand
        },
        handler: (response) => {
          // Verify payment on backend
          verifyPaymentMutation.mutate({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          })
        },
        modal: {
          ondismiss: () => {
            setCheckoutLoading(false)
            toast.error('Payment cancelled')
          },
        },
      })

      if (razorpay) {
        razorpay.open()
      } else {
        toast.error('Failed to initialize payment')
        setCheckoutLoading(false)
      }
    } catch {
      toast.error('Failed to start checkout')
      setCheckoutLoading(false)
    }
  }

  // Calculate guest cart totals
  const calculateGuestCartSubtotal = () => {
    return guestCart.reduce((total, item) => {
      const product = guestProducts.get(item.productId)
      return total + (product ? product.price * item.qty : 0)
    }, 0)
  }

  const isLoading = isAuthenticated ? cartLoading : loadingGuestProducts
  const isEmpty = isAuthenticated 
    ? (!cart || cart.items.length === 0)
    : guestCart.length === 0

  if (isLoading) {
    return <LoadingSpinner fullScreen />
  }

  return (
    <div className="bg-cream min-h-screen py-8 md:py-12">
      <div className="container-custom">
        <h1 className="heading-2 text-charcoal mb-8">Your Cart</h1>

        {isEmpty ? (
          <div className="text-center py-16 bg-soft-white rounded-xl shadow-soft">
            <ShoppingCart className="w-16 h-16 text-warm-gray/50 mx-auto mb-4" />
            <h2 className="heading-4 text-charcoal mb-2">Your cart is empty</h2>
            <p className="text-warm-gray mb-8">Looks like you haven't added anything yet.</p>
            <Link to="/shop">
              <Button>Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {isAuthenticated && cart ? (
                // Authenticated cart
                cart.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 bg-soft-white rounded-lg p-4 shadow-soft"
                  >
                    <Link to={`/product/${item.productSlug}`} className="flex-shrink-0">
                      <img
                        src={item.productImage || 'https://images.unsplash.com/photo-1602523961359-24a68d4e5a9b?w=200'}
                        alt={item.productName}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link 
                        to={`/product/${item.productSlug}`}
                        className="font-serif text-lg font-medium text-charcoal hover:text-rose transition-colors line-clamp-1"
                      >
                        {item.productName}
                      </Link>
                      <p className="text-rose font-medium mt-1">
                        {formatPrice(item.unitPrice)}
                      </p>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-blush rounded-lg">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.productId, -1, item.qty)}
                            disabled={item.qty <= 1}
                            className="p-1.5 hover:bg-blush transition-colors disabled:opacity-50"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-3 py-1 font-medium text-sm">
                            {item.qty}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.productId, 1, item.qty)}
                            disabled={item.qty >= item.availableQty}
                            className="p-1.5 hover:bg-blush transition-colors disabled:opacity-50"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemoveItem(item.id, item.productId)}
                          className="p-2 text-warm-gray hover:text-error transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-charcoal">
                        {formatPrice(item.subtotal)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                // Guest cart
                guestCart.map((item) => {
                  const product = guestProducts.get(item.productId)
                  if (!product) return null
                  
                  return (
                    <div
                      key={item.productId}
                      className="flex gap-4 bg-soft-white rounded-lg p-4 shadow-soft"
                    >
                      <Link to={`/product/${product.slug}`} className="flex-shrink-0">
                        <img
                          src={product.images[0] || 'https://images.unsplash.com/photo-1602523961359-24a68d4e5a9b?w=200'}
                          alt={product.name}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link 
                          to={`/product/${product.slug}`}
                          className="font-serif text-lg font-medium text-charcoal hover:text-rose transition-colors line-clamp-1"
                        >
                          {product.name}
                        </Link>
                        <p className="text-rose font-medium mt-1">
                          {formatPrice(product.price)}
                        </p>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center border border-blush rounded-lg">
                            <button
                              onClick={() => handleUpdateQuantity(0, item.productId, -1, item.qty)}
                              disabled={item.qty <= 1}
                              className="p-1.5 hover:bg-blush transition-colors disabled:opacity-50"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="px-3 py-1 font-medium text-sm">
                              {item.qty}
                            </span>
                            <button
                              onClick={() => handleUpdateQuantity(0, item.productId, 1, item.qty)}
                              className="p-1.5 hover:bg-blush transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <button
                            onClick={() => handleRemoveItem(0, item.productId)}
                            className="p-2 text-warm-gray hover:text-error transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-charcoal">
                          {formatPrice(product.price * item.qty)}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-soft-white rounded-xl p-6 shadow-soft sticky top-24">
                <h2 className="font-serif text-xl font-medium text-charcoal mb-6">
                  Order Summary
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-warm-gray">
                    <span>Subtotal</span>
                    <span>
                      {formatPrice(isAuthenticated ? (cart?.subtotal || 0) : calculateGuestCartSubtotal())}
                    </span>
                  </div>
                  <div className="flex justify-between text-warm-gray">
                    <span>Shipping</span>
                    <span className="text-success">Free</span>
                  </div>
                  <div className="border-t border-blush pt-3 flex justify-between font-medium text-charcoal">
                    <span>Total</span>
                    <span className="text-lg">
                      {formatPrice(isAuthenticated ? (cart?.subtotal || 0) : calculateGuestCartSubtotal())}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleCheckout}
                  loading={checkoutLoading || verifyPaymentMutation.isPending}
                  className="w-full"
                  size="lg"
                  icon={<ArrowRight className="w-5 h-5" />}
                >
                  {isAuthenticated ? 'Proceed to Checkout' : 'Login to Checkout'}
                </Button>

                {!isAuthenticated && (
                  <p className="text-sm text-warm-gray text-center mt-4">
                    Your cart will be saved after login
                  </p>
                )}

                <Link
                  to="/shop"
                  className="block text-center text-sm text-rose hover:underline mt-4"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
