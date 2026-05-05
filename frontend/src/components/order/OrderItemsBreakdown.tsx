import { formatPrice } from '@/lib/utils'
import type { OrderItem } from '@/types'

function fmtKg(kg: number | null | undefined): string {
  if (kg == null || !Number.isFinite(kg)) return '—'
  return `${kg.toFixed(3)} kg`
}

/** Customer + admin: consistent item-level order breakdown. */
export default function OrderItemsBreakdown({
  items,
  currency,
  dense = false,
  showWeights = false,
}: {
  items: OrderItem[]
  currency: string
  dense?: boolean
  /** Admin: show per-line and captured weights when available */
  showWeights?: boolean
}) {
  const th = dense ? 'p-2.5' : 'p-3'
  const td = dense ? 'p-2.5' : 'p-3'

  return (
    <div className="overflow-x-auto rounded-xl border border-blush bg-soft-white">
      <table className="w-full text-sm text-charcoal min-w-[640px]">
        <thead className="bg-blush/35 text-left">
          <tr>
            <th className={`${th} font-normal text-warm-gray`}>Product</th>
            <th className={`${th} font-normal text-warm-gray whitespace-nowrap`}>SKU / variant</th>
            <th className={`${th} font-normal text-warm-gray whitespace-nowrap text-right`}>Qty</th>
            {showWeights && (
              <th className={`${th} font-normal text-warm-gray whitespace-nowrap text-right`}>Wt (ea)</th>
            )}
            {showWeights && (
              <th className={`${th} font-normal text-warm-gray whitespace-nowrap text-right`}>Line wt</th>
            )}
            <th className={`${th} font-normal text-warm-gray whitespace-nowrap text-right`}>Retail</th>
            <th className={`${th} font-normal text-warm-gray whitespace-nowrap text-right`}>Unit price</th>
            <th className={`${th} font-normal text-warm-gray whitespace-nowrap text-right`}>Line total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-t border-blush/80 align-top">
              <td className={`${td} text-charcoal`}>{item.name}</td>
              <td className={`${td} text-warm-gray`}>
                {[item.sku, item.variantLabel].filter(Boolean).join(' · ') || '—'}
              </td>
              <td className={`${td} text-right tabular-nums`}>{item.qty}</td>
              {showWeights && (
                <td className={`${td} text-right tabular-nums text-warm-gray`}>{fmtKg(item.unitWeightKg)}</td>
              )}
              {showWeights && (
                <td className={`${td} text-right tabular-nums text-warm-gray`}>{fmtKg(item.lineWeightKg)}</td>
              )}
              <td className={`${td} text-right tabular-nums text-warm-gray`}>
                {item.compareAtPrice != null && item.compareAtPrice > 0
                  ? formatPrice(item.compareAtPrice, currency)
                  : '—'}
              </td>
              <td className={`${td} text-right tabular-nums`}>{formatPrice(item.price, currency)}</td>
              <td className={`${td} text-right tabular-nums text-charcoal`}>
                {formatPrice(item.subtotal, currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
