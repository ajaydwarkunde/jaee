export type OrderStatusValue =
  | 'PENDING'
  | 'PAID'
  | 'PREPARING'
  | 'PACKAGING'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'FULFILLED'
  | 'CANCELLED'

export const ORDER_STATUS_OPTIONS: { value: OrderStatusValue; label: string }[] = [
  { value: 'PENDING', label: 'Pending Payment' },
  { value: 'PAID', label: 'Order Confirmed' },
  { value: 'PREPARING', label: 'Preparing Your Order' },
  { value: 'PACKAGING', label: 'Packaging' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { value: 'FULFILLED', label: 'Fulfilled' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

export const ORDER_STATUS_FILTER_TABS = ['ALL', ...ORDER_STATUS_OPTIONS.map((o) => o.value)] as const

export function orderStatusLabel(status: string, customStatus?: string | null): string {
  if (customStatus?.trim()) return customStatus.trim()
  const found = ORDER_STATUS_OPTIONS.find((o) => o.value === status)
  return found?.label ?? status
}
