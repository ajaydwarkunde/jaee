import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2, Minus, Plus, ArrowRight, ShoppingCart, MapPin, ChevronDown, ChevronUp, LogIn, UserPlus, Tag, X, Check } from 'lucide-react'
import { cartService } from '@/services/cartService'
import { checkoutService } from '@/services/checkoutService'
import { addressService } from '@/services/addressService'
import { couponService, CouponValidationResponse } from '@/services/couponService'
import { useAuthStore } from '@/stores/authStore'
import { formatPrice } from '@/lib/utils'
import { loadRazorpayScript, initializeRazorpay } from '@/lib/razorpay'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { getErrorMessage } from '@/lib/api'
import toast from 'react-hot-toast'
import type { AddressFormData } from '@/types'
import { CITY_INPUT_PLACEHOLDER } from '@/config/business'

export default function CartPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const queryClient = useQueryClient()
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [showAddressSection, setShowAddressSection] = useState(false)
  const [addressForm, setAddressForm] = useState<AddressFormData>({
    line1: '', line2: '', city: '', state: '', country: 'India', zip: '', phone: '', isDefault: true,
  })
  
  // Coupon state
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResponse | null>(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState('')

  // Get cart for authenticated users (shipping quote when address + optional coupon)
  const { data: cart, isLoading: cartLoading } = useQuery({
    queryKey: ['cart', selectedAddressId, appliedCoupon?.code],
    queryFn: () =>
      cartService.getCart(selectedAddressId ?? undefined, appliedCoupon?.code),
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

  // Cart mutations
  const updateItemMutation = useMutation({
    mutationFn: ({ itemId, qty }: { itemId: number; qty: number }) =>
      cartService.updateCartItem(itemId, qty),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })

  const removeItemMutation = useMutation({
    mutationFn: (itemId: number) => cartService.removeCartItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      toast.success('Item removed')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
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
    onError: (error) => {
      toast.error(getErrorMessage(error))
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
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })

  const handleUpdateQuantity = (itemId: number, delta: number, currentQty: number) => {
    const newQty = currentQty + delta
    if (newQty < 1) return
    updateItemMutation.mutate({ itemId, qty: newQty })
  }

  const handleRemoveItem = (itemId: number) => {
    removeItemMutation.mutate(itemId)
  }

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code')
      return
    }

    setCouponLoading(true)
    setCouponError('')

    try {
      const response = await couponService.validateCoupon(couponCode.trim(), cart?.subtotal)
      if (response.valid) {
        setAppliedCoupon(response)
        toast.success(response.message)
      } else {
        setCouponError(response.message)
        setAppliedCoupon(null)
      }
    } catch (error: any) {
      setCouponError(error?.response?.data?.message || 'Failed to validate coupon')
      setAppliedCoupon(null)
    } finally {
      setCouponLoading(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
    setCouponError('')
  }

  const handleCheckout = async () => {
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
      // Create order with address and coupon
      const orderData = await checkoutService.createOrder({
        addressId: selectedAddressId || undefined,
        couponCode: appliedCoupon?.code || undefined,
      })

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
        name: 'Jaai',
        description: 'Order Payment',
        image: '/favicon.svg',
        order_id: orderData.orderId,
        prefill: {
          name: orderData.prefill.name,
          email: orderData.prefill.email,
          contact: orderData.prefill.contact,
        },
        theme: {
          color: '#923C5B',
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

  // Show login/register prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="bg-cream min-h-screen py-8 md:py-12">
        <div className="container-custom">
          <h1 className="heading-2 text-charcoal mb-8">Your Cart</h1>
          <div className="text-center py-16 bg-soft-white rounded-xl shadow-soft max-w-lg mx-auto">
            <ShoppingCart className="w-16 h-16 text-rose/40 mx-auto mb-4" />
            <h2 className="heading-4 text-charcoal mb-2">Sign in to view your cart</h2>
            <p className="text-warm-gray mb-8 max-w-sm mx-auto">
              Please log in or create an account to add items to your cart and proceed to checkout.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login" state={{ from: '/cart' }}>
                <Button icon={<LogIn className="w-5 h-5" />}>
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="outline" icon={<UserPlus className="w-5 h-5" />}>
                  Create Account
                </Button>
              </Link>
            </div>
            <Link
              to="/shop"
              className="block text-sm text-rose hover:underline mt-6"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (cartLoading) {
    return <LoadingSpinner fullScreen />
  }

  const isEmpty = !cart || cart.items.length === 0
  const selectedAddress = addresses?.find(a => a.id === selectedAddressId)

  const discountNum = Number(appliedCoupon?.discountAmount ?? 0)
  const shippingNum = Number(cart?.shippingAmount ?? 0)
  const orderTotal =
    cart != null ? Math.max(0, cart.subtotal - discountNum + shippingNum) : 0

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
              {cart.items.map((item) => (
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
                      className="font-serif text-lg font-semibold text-rose hover:opacity-90 transition-opacity line-clamp-1 tracking-tight"
                    >
                      {item.productName}
                    </Link>
                    {item.variantLabel ? (
                      <p className="text-sm text-warm-gray mt-1 line-clamp-2">{item.variantLabel}</p>
                    ) : null}
                    <p className="text-rose font-bold tabular-nums mt-1">
                      {formatPrice(item.unitPrice)}
                    </p>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-blush rounded-full">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, -1, item.qty)}
                          disabled={item.qty <= 1}
                          className="p-1.5 hover:bg-blush rounded-l-full transition-colors disabled:opacity-50"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-3 py-1 font-medium text-sm">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, 1, item.qty)}
                          disabled={item.qty >= item.availableQty}
                          className="p-1.5 hover:bg-blush rounded-r-full transition-colors disabled:opacity-50"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-2 text-warm-gray hover:text-error transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-charcoal tabular-nums">
                      {formatPrice(item.subtotal)}
                    </p>
                  </div>
                </div>
              ))}

              {/* Delivery Address Section */}
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
                          label="Address Line 1 *"
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
                            label="City *"
                            value={addressForm.city}
                            onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                            placeholder={CITY_INPUT_PLACEHOLDER}
                            required
                          />
                          <Input
                            label="State *"
                            value={addressForm.state || ''}
                            onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                            placeholder="Maharashtra"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            label="PIN Code *"
                            value={addressForm.zip || ''}
                            onChange={(e) => setAddressForm({ ...addressForm, zip: e.target.value })}
                            placeholder="400001"
                            required
                          />
                          <Input
                            label="Phone *"
                            value={addressForm.phone || ''}
                            onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                            placeholder="+91 98765 43210"
                            required
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              if (!addressForm.line1 || !addressForm.city || !addressForm.state || !addressForm.zip || !addressForm.phone) {
                                toast.error('Please fill all required fields')
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
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-soft-white rounded-xl p-6 shadow-soft sticky top-24">
                <h2 className="font-serif text-xl font-medium text-charcoal mb-6">
                  Order Summary
                </h2>

                {/* Coupon Code Section */}
                <div className="mb-6">
                  {!appliedCoupon ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <div className="flex-1 relative">
                          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray" />
                          <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => {
                              setCouponCode(e.target.value.toUpperCase())
                              setCouponError('')
                            }}
                            placeholder="Enter coupon code"
                            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-warm-gray/30 focus:border-rose focus:ring-1 focus:ring-rose outline-none uppercase"
                          />
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleApplyCoupon}
                          disabled={couponLoading || !couponCode.trim()}
                        >
                          {couponLoading ? 'Applying...' : 'Apply'}
                        </Button>
                      </div>
                      {couponError && (
                        <p className="text-xs text-error">{couponError}</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg border border-success/30">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-success" />
                        <div>
                          <p className="text-sm font-medium text-charcoal">{appliedCoupon.code}</p>
                          <p className="text-xs text-success">You save {formatPrice(appliedCoupon.discountAmount || 0)}</p>
                        </div>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="p-1 hover:bg-charcoal/10 rounded transition-colors"
                        title="Remove coupon"
                      >
                        <X className="w-4 h-4 text-charcoal/60" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-warm-gray">
                    <span>Subtotal</span>
                    <span>{formatPrice(cart.subtotal)}</span>
                  </div>
                  {appliedCoupon && appliedCoupon.discountAmount && (
                    <div className="flex justify-between text-success">
                      <span>Discount</span>
                      <span>-{formatPrice(appliedCoupon.discountAmount)}</span>
                    </div>
                  )}
                  {cart.totalWeightKg != null && Number(cart.totalWeightKg) > 0 && (
                    <div className="flex justify-between text-warm-gray text-sm">
                      <span>Est. total weight</span>
                      <span className="tabular-nums">{Number(cart.totalWeightKg).toFixed(2)} kg</span>
                    </div>
                  )}
                  <div className="flex justify-between text-warm-gray">
                    <span>Shipping</span>
                    {!selectedAddressId ? (
                      <span className="text-xs text-warm-gray">Select address</span>
                    ) : cart.freeShippingApplied ? (
                      <span className="text-success">Free</span>
                    ) : (
                      <span>{formatPrice(shippingNum)}</span>
                    )}
                  </div>
                  <div className="border-t border-blush pt-3 flex justify-between font-medium text-charcoal">
                    <span>Total</span>
                    <span className="text-lg">{formatPrice(orderTotal)}</span>
                  </div>
                </div>

                {/* Delivery info summary */}
                {selectedAddress && (
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
                  Proceed to Checkout
                </Button>

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
