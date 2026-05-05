import type { Product } from '@/types'
import ProductCard from './ProductCard'
import { ProductGridSkeleton } from '../ui/Skeleton'

interface ProductGridProps {
  products: Product[]
  loading?: boolean
  onAddToCart?: (product: Product) => void
  onQuickView?: (product: Product) => void
  emptyMessage?: string
  /** First N product images get higher fetch priority (default ~1–2 rows) */
  priorityImageCount?: number
}

export default function ProductGrid({ 
  products, 
  loading, 
  onAddToCart,
  onQuickView,
  emptyMessage = 'No products found',
  priorityImageCount = 8,
}: ProductGridProps) {
  if (loading) {
    return <ProductGridSkeleton />
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-warm-gray text-lg">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={index < priorityImageCount}
          onAddToCart={onAddToCart ? () => onAddToCart(product) : undefined}
          onQuickView={onQuickView ? () => onQuickView(product) : undefined}
        />
      ))}
    </div>
  )
}
