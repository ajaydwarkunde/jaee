import { formatOrderDateLong, formatPrice } from '@/lib/utils'
import type { Order } from '@/types'

function paymentStatusLabel(status: string): string {
  switch (status) {
    case 'CANCELLED':
      return '🔴 Cancelled'
    case 'PENDING':
      return '🟡 Pending payment'
    default:
      return '🟢 Paid'
  }
}

/** Structured WhatsApp summary matching storefront copy guidelines. */
export function buildOrderWhatsAppMessage(order: Order): string {
  const payment = paymentStatusLabel(order.status)
  const rows = order.items
    .map((item) => `${item.name} | ${item.qty} | ${formatPrice(item.subtotal, order.currency)}`)
    .join('\n')

  const addr = order.shippingAddress?.trim().replace(/\r\n/g, '\n') || '—'

  const intro =
    order.status === 'CANCELLED'
      ? `Order update ✨

This order is no longer active.`

      : `Order Confirmed ✨

Thank you for shopping with Jaai 🤍
Your order has been placed successfully and is now being prepared with care.`

  return `${intro}

Order Details

Order ID
#${order.id}

Date
${formatOrderDateLong(order.createdAt)}

Payment Status
${payment}

Items Ordered

Product | Qty | Price
${rows}

Total Paid
${formatPrice(order.totalAmount, order.currency)}

Delivery Address

${addr}

What Happens Next?

🕯️ Your order is now being handcrafted
📦 Dispatch usually takes 1–2 working days
🚚 Shipping updates will be shared once packed

Need Help?

For any order queries, feel free to reach out to us on WhatsApp or Instagram anytime 🤍

Thank you for supporting Jaai ✨`
}

export function orderWhatsAppHref(order: Order, whatsappDigits: string): string {
  const text = buildOrderWhatsAppMessage(order)
  const encoded = encodeURIComponent(text)
  const digits = whatsappDigits.replace(/\D/g, '')
  if (digits.length >= 10) {
    return `https://wa.me/${digits}?text=${encoded}`
  }
  return `https://wa.me/?text=${encoded}`
}
