import { Check, CreditCard, Package, Truck, Gift, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OrderStepperProps {
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'SHIPPED' | 'FULFILLED'
  className?: string
}

const steps = [
  { key: 'PENDING', label: 'Order Placed', description: 'Your order has been received', icon: Package },
  { key: 'PAID', label: 'Payment Confirmed', description: 'Payment processed successfully', icon: CreditCard },
  { key: 'SHIPPED', label: 'Shipped', description: 'Your order is on its way', icon: Truck },
  { key: 'FULFILLED', label: 'Delivered', description: 'Order delivered successfully', icon: Gift },
]

const statusIndex: Record<string, number> = {
  PENDING: 0,
  PAID: 1,
  SHIPPED: 2,
  FULFILLED: 3,
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
    <div className={cn('py-4', className)}>
      {/* Desktop stepper (horizontal) */}
      <div className="hidden sm:flex items-start">
        {steps.map((step, index) => {
          const isCompleted = index < activeIndex
          const isActive = index === activeIndex
          const isUpcoming = index > activeIndex
          const Icon = step.icon

          return (
            <div key={step.key} className="flex-1 relative">
              <div className="flex flex-col items-center text-center">
                {/* Connector line (before circle) */}
                {index > 0 && (
                  <div
                    className={cn(
                      'absolute top-5 right-1/2 h-0.5 w-full -translate-y-1/2',
                      isCompleted || isActive ? 'bg-rose' : 'bg-blush'
                    )}
                  />
                )}

                {/* Step circle */}
                <div
                  className={cn(
                    'relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                    isCompleted && 'bg-rose border-rose',
                    isActive && 'bg-rose/10 border-rose',
                    isUpcoming && 'bg-cream border-blush'
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 text-soft-white" />
                  ) : (
                    <Icon
                      className={cn(
                        'w-5 h-5',
                        isActive ? 'text-rose' : 'text-warm-gray/40'
                      )}
                    />
                  )}
                </div>

                {/* Label */}
                <p
                  className={cn(
                    'mt-2 text-xs font-medium',
                    isCompleted || isActive ? 'text-charcoal' : 'text-warm-gray/50'
                  )}
                >
                  {step.label}
                </p>
                <p
                  className={cn(
                    'mt-0.5 text-[11px] max-w-[120px]',
                    isActive ? 'text-warm-gray' : 'text-warm-gray/40'
                  )}
                >
                  {step.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Mobile stepper (vertical) */}
      <div className="sm:hidden space-y-0">
        {steps.map((step, index) => {
          const isCompleted = index < activeIndex
          const isActive = index === activeIndex
          const isUpcoming = index > activeIndex
          const Icon = step.icon
          const isLast = index === steps.length - 1

          return (
            <div key={step.key} className="flex gap-4">
              {/* Circle + connector */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center border-2 shrink-0 transition-all duration-300',
                    isCompleted && 'bg-rose border-rose',
                    isActive && 'bg-rose/10 border-rose',
                    isUpcoming && 'bg-cream border-blush'
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 text-soft-white" />
                  ) : (
                    <Icon
                      className={cn(
                        'w-4 h-4',
                        isActive ? 'text-rose' : 'text-warm-gray/40'
                      )}
                    />
                  )}
                </div>
                {!isLast && (
                  <div
                    className={cn(
                      'w-0.5 flex-1 min-h-[24px]',
                      isCompleted ? 'bg-rose' : 'bg-blush'
                    )}
                  />
                )}
              </div>

              {/* Content */}
              <div className={cn('pb-6', isLast && 'pb-0')}>
                <p
                  className={cn(
                    'text-sm font-medium leading-9',
                    isCompleted || isActive ? 'text-charcoal' : 'text-warm-gray/50'
                  )}
                >
                  {step.label}
                </p>
                <p
                  className={cn(
                    'text-xs -mt-1',
                    isActive ? 'text-warm-gray' : 'text-warm-gray/40'
                  )}
                >
                  {step.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
