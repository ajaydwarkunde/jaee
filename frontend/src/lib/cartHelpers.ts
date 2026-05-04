import type { Product } from '@/types'

/**
 * When adding from a grid or quick view without the user choosing a SKU,
 * pick a default variant so the API receives variantId for multi-SKU products.
 * Prefers first in-stock, active variant; otherwise first variant.
 */
export function defaultVariantIdForProduct(product: Product): number | undefined {
  const variants = product.variants
  if (!variants?.length) return undefined
  const available = variants.find((v) => v.active && v.inStock)
  return (available ?? variants[0]).id
}
