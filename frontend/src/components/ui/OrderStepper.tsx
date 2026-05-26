import { Check, CreditCard, Package, Truck, Gift, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { OrderStatusValue } from '@/lib/orderStatus'

interface OrderStepperProps {
  status: OrderStatusValue
  className?: string
}

const steps = [
  { key: 'PENDING', label: 'Pending Payment', icon: CreditCard },
  { key: 'PAID', label: 'Order Confirmed', icon: Check },
  { key: 'PREPARING', label: 'Preparing Your Order', icon: Package },
  { key: 'PACKAGING', label: 'Packaging', icon: Package },
  { key: 'SHIPPED', label: 'Shipped', icon: Truck },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck },
  { key: 'FULFILLED', label: 'Fulfilled', icon: Gift },
]

const statusIndex: Record<string, number> = {
  PENDING: 0,
  PAID: 1,
  PREPARING: 2,
  PACKAGING: 3,
  SHIPPED: 4,
  OUT_FOR_DELIVERY: 5,
  FULFILLED: 6,
}

export default function OrderStepper({ status, className }: OrderStepperProps) {
  const isCancelled = status === 'CANCELLED'
  const activeIndex = isCancelled ? -1 : statusIndex[status] ?? 0

  if (isCancelled) {
    return (
      <div className={cn('flex items-center justify-center gap-3 py-6', className)}>
        <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center">
          <XCircle className="w-6 h-6 text-error" />
        </div>
        <div>
          <p className="font-medium text-error">Order Cancelled</p>
          <p className="text-sm text-warm-gray">This order has been cancelled</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('py-4 overflow-x-auto', className)}>
      <div className="flex items-start min-w-[640px]">
        {steps.map((step, index) => {
          const isCompleted = index < activeIndex
          const isActive = index === activeIndex
          const isUpcoming = index > activeIndex
          const Icon = step.icon

          return (
            <div key={step.key} className="flex-1 relative">
              <div className="flex flex-col items-center text-center px-1">
                {index > 0 && (
                  <div
                    className={cn(
                      'absolute top-5 right-1/2 h-0.5 w-full -translate-y-1/2',
                      isCompleted || isActive ? 'bg-rose' : 'bg-blush',
                    )}
                  />
                )}
                <div
                  className={cn(
                    'relative z-10 w-9 h-9 rounded-full flex items-center justify-center border-2',
                    isCompleted && 'bg-rose border-rose',
                    isActive && 'bg-rose/10 border-rose',
                    isUpcoming && 'bg-cream border-blush',
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 text-soft-white" />
                  ) : (
                    <Icon className={cn('w-4 h-4', isActive ? 'text-rose' : 'text-warm-gray/40')} />
                  )}
                </div>
                <p
                  className={cn(
                    'mt-2 text-[10px] font-medium leading-tight',
                    isCompleted || isActive ? 'text-charcoal' : 'text-warm-gray/50',
                  )}
                >
                  {step.label}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
