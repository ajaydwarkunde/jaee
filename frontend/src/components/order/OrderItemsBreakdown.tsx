import { formatPrice } from '@/lib/utils'
import type { OrderItem } from '@/types'

function fmtKg(kg: number | null | undefined): string {
  if (kg == null || !Number.isFinite(kg)) return '—'
  return `${kg.toFixed(3)} kg`
}

function normalizeVariantLabel(label?: string | null): string | null {
  if (!label) return null
  return label.replace(/^size:\s*/i, '').trim() || null
}

function getCustomerDisplay(item: OrderItem): { product: string; skuVariant: string } {
  const rawName = (item.name || '').trim()
  const baseName = rawName.split('—')[0]?.trim() || rawName
  const nameParts = baseName.split(' - ').map((p) => p.trim()).filter(Boolean)

  const product = nameParts[0] || rawName
  const descriptorFromName = nameParts.length > 1 ? nameParts.slice(1).join(' - ') : null
  const normalizedVariant = normalizeVariantLabel(item.variantLabel)

  const descriptor = descriptorFromName && normalizedVariant
    ? `${descriptorFromName} - ${normalizedVariant}`
    : descriptorFromName || normalizedVariant

  const skuParts = [item.sku, descriptor].filter(Boolean)
  return {
    product,
    skuVariant: skuParts.length > 0 ? skuParts.join(' · ') : '—',
  }
}

/** Customer + admin: consistent item-level order breakdown. */
export default function OrderItemsBreakdown({
  items,
  currency,
  dense = false,
  showWeights = false,
  customerFriendlyNames = false,
}: {
  items: OrderItem[]
  currency: string
  dense?: boolean
  /** Admin: show per-line and captured weights when available */
  showWeights?: boolean
  /** Customer pages: split product and variant into cleaner columns */
  customerFriendlyNames?: boolean
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
          {items.map((item) => {
            const display = customerFriendlyNames
              ? getCustomerDisplay(item)
              : { product: item.name, skuVariant: [item.sku, item.variantLabel].filter(Boolean).join(' · ') || '—' }
            return (
              <tr key={item.id} className="border-t border-blush/80 align-top">
                <td className={`${td} text-charcoal`}>
                  <div>{display.product}</div>
                  {item.customizationText?.trim() && (
                    <p className="text-xs text-warm-gray mt-1.5 max-w-md">
                      <span className="font-medium text-charcoal/80">Customization:</span>{' '}
                      {item.customizationText}
                    </p>
                  )}
                </td>
                <td className={`${td} text-warm-gray`}>{display.skuVariant}</td>
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
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
