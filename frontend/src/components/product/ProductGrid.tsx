import type { Product } from '@/types'
import ProductCard from './ProductCard'
import { ProductGridSkeleton } from '../ui/Skeleton'

interface ProductGridProps {
  products: Product[]
  loading?: boolean
  onAddToCart?: (product: Product) => void
  emptyMessage?: string
}

export default function ProductGrid({ 
  products, 
  loading, 
  onAddToCart,
  emptyMessage = 'No products found' 
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
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart ? () => onAddToCart(product) : undefined}
        />
      ))}
    </div>
  )
}
