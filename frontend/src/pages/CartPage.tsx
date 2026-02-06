import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2, Minus, Plus, ArrowRight, ShoppingCart, MapPin, ChevronDown, ChevronUp } from 'lucide-react'
import { cartService } from '@/services/cartService'
import { checkoutService } from '@/services/checkoutService'
import { productService } from '@/services/productService'
import { addressService } from '@/services/addressService'
import { useAuthStore } from '@/stores/authStore'
import { useCartStore } from '@/stores/cartStore'
import { formatPrice } from '@/lib/utils'
import { loadRazorpayScript, initializeRazorpay } from '@/lib/razorpay'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'
import type { Product, AddressFormData } from '@/types'

export default function CartPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const { guestCart, updateGuestCartItem, removeFromGuestCart } = useCartStore()
  const queryClient = useQueryClient()
  const [guestProducts, setGuestProducts] = useState<Map<number, Product>>(new Map())
  const [loadingGuestProducts, setLoadingGuestProducts] = useState(false)
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [showAddressSection, setShowAddressSection] = useState(false)
  const [addressForm, setAddressForm] = useState<AddressFormData>({
    line1: '', line2: '', city: '', state: '', country: 'India', zip: '', phone: '', isDefault: true,
  })

  // Get cart for authenticated users
  const { data: cart, isLoading: cartLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: cartService.getCart,
    enabled: isAuthenticated,
  })

  // Get user addresses
  const { data: addresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: addressService.getAddresses,
    enabled: isAuthenticated,
  })

  // Select default address on load
  useEffect(() => {
    if (addresses && addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find(a => a.isDefault)
      setSelectedAddressId(defaultAddr ? defaultAddr.id : addresses[0].id)
    }
  }, [addresses, selectedAddressId])

  // Load guest cart products
  useEffect(() => {
    async function loadGuestProducts() {
      if (isAuthenticated || guestCart.length === 0) return
      
      setLoadingGuestProducts(true)
      const products = new Map<number, Product>()
      
      for (const item of guestCart) {
        try {
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

  const addAddressMutation = useMutation({
    mutationFn: (data: AddressFormData) => addressService.createAddress(data),
    onSuccess: (newAddr) => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      setSelectedAddressId(newAddr.id)
      setShowAddressForm(false)
      setAddressForm({ line1: '', line2: '', city: '', state: '', country: 'India', zip: '', phone: '', isDefault: true })
      toast.success('Address added!')
    },
    onError: () => {
      toast.error('Failed to add address')
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

    if (!selectedAddressId && (!addresses || addresses.length === 0)) {
      setShowAddressSection(true)
      setShowAddressForm(true)
      toast.error('Please add a delivery address')
      return
    }

    if (!selectedAddressId) {
      setShowAddressSection(true)
      toast.error('Please select a delivery address')
      return
    }

    setCheckoutLoading(true)

    try {
      // Create order with address
      const orderData = await checkoutService.createOrder(selectedAddressId)

      // TEST MODE: Simulate payment without Razorpay
      if (orderData.testMode) {
        toast.success('Test Mode: Simulating payment...')
        
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        const mockPaymentId = 'test_pay_' + Date.now()
        const mockSignature = 'test_signature_' + Date.now()
        
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

      const razorpay = initializeRazorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Jaee',
        description: 'Order Payment',
        image: '/favicon.svg',
        order_id: orderData.orderId,
        prefill: {
          name: orderData.prefill.name,
          email: orderData.prefill.email,
          contact: orderData.prefill.contact,
        },
        theme: {
          color: '#E9868B',
        },
        handler: (response) => {
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

  const selectedAddress = addresses?.find(a => a.id === selectedAddressId)

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
                        <div className="flex items-center border border-blush rounded-full">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.productId, -1, item.qty)}
                            disabled={item.qty <= 1}
                            className="p-1.5 hover:bg-blush rounded-l-full transition-colors disabled:opacity-50"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-3 py-1 font-medium text-sm">
                            {item.qty}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.productId, 1, item.qty)}
                            disabled={item.qty >= item.availableQty}
                            className="p-1.5 hover:bg-blush rounded-r-full transition-colors disabled:opacity-50"
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
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-rose font-medium">
                            {formatPrice(product.price)}
                          </span>
                          {product.compareAtPrice && product.compareAtPrice > product.price && (
                            <span className="text-sm text-warm-gray line-through">
                              {formatPrice(product.compareAtPrice)}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center border border-blush rounded-full">
                            <button
                              onClick={() => handleUpdateQuantity(0, item.productId, -1, item.qty)}
                              disabled={item.qty <= 1}
                              className="p-1.5 hover:bg-blush rounded-l-full transition-colors disabled:opacity-50"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="px-3 py-1 font-medium text-sm">
                              {item.qty}
                            </span>
                            <button
                              onClick={() => handleUpdateQuantity(0, item.productId, 1, item.qty)}
                              className="p-1.5 hover:bg-blush rounded-r-full transition-colors"
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

              {/* Delivery Address Section - shown for authenticated users */}
              {isAuthenticated && (
                <div className="bg-soft-white rounded-xl p-6 shadow-soft">
                  <button
                    onClick={() => setShowAddressSection(!showAddressSection)}
                    className="w-full flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-rose" />
                      <h3 className="font-serif text-lg font-medium text-charcoal">Delivery Address</h3>
                    </div>
                    {showAddressSection ? (
                      <ChevronUp className="w-5 h-5 text-warm-gray" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-warm-gray" />
                    )}
                  </button>

                  {/* Selected address preview */}
                  {!showAddressSection && selectedAddress && (
                    <p className="text-sm text-warm-gray mt-2 ml-8">
                      {selectedAddress.line1}, {selectedAddress.city} - {selectedAddress.zip}
                    </p>
                  )}

                  {showAddressSection && (
                    <div className="mt-4 space-y-3">
                      {/* Existing addresses */}
                      {addresses && addresses.length > 0 && (
                        <div className="space-y-2">
                          {addresses.map((addr) => (
                            <label
                              key={addr.id}
                              className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                                selectedAddressId === addr.id
                                  ? 'border-rose bg-rose/5'
                                  : 'border-blush hover:border-rose/50'
                              }`}
                            >
                              <input
                                type="radio"
                                name="address"
                                checked={selectedAddressId === addr.id}
                                onChange={() => setSelectedAddressId(addr.id)}
                                className="mt-1 accent-rose"
                              />
                              <div className="flex-1 text-sm">
                                <p className="font-medium text-charcoal">{addr.line1}</p>
                                {addr.line2 && <p className="text-warm-gray">{addr.line2}</p>}
                                <p className="text-warm-gray">
                                  {addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.zip ? `- ${addr.zip}` : ''}
                                </p>
                                <p className="text-warm-gray">{addr.country}</p>
                                {addr.phone && <p className="text-warm-gray">Phone: {addr.phone}</p>}
                                {addr.isDefault && (
                                  <span className="inline-block mt-1 text-xs bg-rose/10 text-rose px-2 py-0.5 rounded-full">
                                    Default
                                  </span>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      )}

                      {/* Add new address button/form */}
                      {!showAddressForm ? (
                        <button
                          onClick={() => setShowAddressForm(true)}
                          className="w-full p-3 border-2 border-dashed border-blush rounded-lg text-rose text-sm font-medium hover:bg-rose/5 transition-colors"
                        >
                          + Add New Address
                        </button>
                      ) : (
                        <div className="p-4 border border-blush rounded-lg space-y-3">
                          <h4 className="font-medium text-charcoal text-sm">New Address</h4>
                          <Input
                            label="Address Line 1"
                            value={addressForm.line1}
                            onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })}
                            placeholder="123 Main Street, Apt 4B"
                            required
                          />
                          <Input
                            label="Address Line 2 (optional)"
                            value={addressForm.line2 || ''}
                            onChange={(e) => setAddressForm({ ...addressForm, line2: e.target.value })}
                            placeholder="Near landmark"
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <Input
                              label="City"
                              value={addressForm.city}
                              onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                              placeholder="Mumbai"
                              required
                            />
                            <Input
                              label="State"
                              value={addressForm.state || ''}
                              onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                              placeholder="Maharashtra"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <Input
                              label="PIN Code"
                              value={addressForm.zip || ''}
                              onChange={(e) => setAddressForm({ ...addressForm, zip: e.target.value })}
                              placeholder="400001"
                            />
                            <Input
                              label="Phone"
                              value={addressForm.phone || ''}
                              onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                              placeholder="+91 98765 43210"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => {
                                if (!addressForm.line1 || !addressForm.city) {
                                  toast.error('Please fill address line 1 and city')
                                  return
                                }
                                addAddressMutation.mutate(addressForm)
                              }}
                              loading={addAddressMutation.isPending}
                            >
                              Save Address
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setShowAddressForm(false)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
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

                {/* Delivery info summary */}
                {isAuthenticated && selectedAddress && (
                  <div className="mb-4 p-3 bg-cream rounded-lg">
                    <p className="text-xs text-warm-gray uppercase tracking-wide mb-1">Delivering to</p>
                    <p className="text-sm text-charcoal font-medium">{selectedAddress.line1}</p>
                    <p className="text-xs text-warm-gray">
                      {selectedAddress.city}{selectedAddress.zip ? ` - ${selectedAddress.zip}` : ''}
                    </p>
                  </div>
                )}

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
