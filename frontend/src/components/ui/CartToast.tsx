import { useNavigate } from 'react-router-dom'
import { ShoppingBag, Check, X } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Toast } from 'react-hot-toast'
import { DEFAULT_TOAST_DURATION_MS, DEFAULT_TOAST_REMOVE_DELAY_MS } from '@/lib/toastConfig'

interface CartToastProps {
  t: Toast
  productName: string
  productImage?: string
  price: number
  currency?: string
  quantity?: number
}

function CartToastContent({ t, productName, productImage, price, currency = 'INR', quantity = 1 }: CartToastProps) {
  const navigate = useNavigate()

  return (
    <div
      className={`${
        t.visible ? 'animate-slide-up' : 'opacity-0 translate-y-4'
      } max-w-sm w-full bg-soft-white shadow-soft-xl rounded-xl pointer-events-auto border border-blush overflow-hidden transition-all duration-300`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Product image or icon */}
          <div className="flex-shrink-0">
            {productImage ? (
              <img
                src={productImage}
                alt={productName}
                className="w-14 h-14 rounded-lg object-cover border border-blush"
              />
            ) : (
              <div className="w-14 h-14 rounded-lg bg-rose/10 flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-rose" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-5 h-5 rounded-full bg-success/15 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-success" />
              </div>
              <p className="text-sm font-medium text-charcoal">Added to cart</p>
            </div>
            <p className="text-sm text-charcoal font-medium truncate">{productName}</p>
            <p className="text-xs text-warm-gray mt-0.5">
              {quantity > 1 ? `${quantity} × ` : ''}{formatPrice(price, currency)}
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={() => toast.dismiss(t.id)}
            className="flex-shrink-0 p-1 rounded-full hover:bg-blush transition-colors"
          >
            <X className="w-4 h-4 text-warm-gray" />
          </button>
        </div>

        {/* Action button */}
        <button
          onClick={() => {
            toast.dismiss(t.id)
            navigate('/cart')
          }}
          className="mt-3 w-full py-2 bg-charcoal text-soft-white text-sm font-medium rounded-lg hover:bg-charcoal/90 transition-colors flex items-center justify-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" />
          View Cart
        </button>
      </div>
    </div>
  )
}

interface ShowCartToastOptions {
  productName: string
  productImage?: string
  price: number
  currency?: string
  quantity?: number
}

export function showCartToast({ productName, productImage, price, currency, quantity }: ShowCartToastOptions) {
  toast.custom(
    (t) => (
      <CartToastContent
        t={t}
        productName={productName}
        productImage={productImage}
        price={price}
        currency={currency}
        quantity={quantity}
      />
    ),
    {
      duration: DEFAULT_TOAST_DURATION_MS,
      position: 'top-right',
      removeDelay: DEFAULT_TOAST_REMOVE_DELAY_MS,
    }
  )
}
