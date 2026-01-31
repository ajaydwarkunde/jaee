import { Link } from 'react-router-dom'
import { ShoppingBag, Heart } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/types'
import Badge from '../ui/Badge'

interface ProductCardProps {
  product: Product
  onAddToCart?: () => void
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const imageUrl = product.images[0] || 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=400'

  return (
    <div className="group bg-soft-white rounded-lg overflow-hidden shadow-soft hover:shadow-soft-md transition-all duration-300">
      {/* Image container */}
      <div className="relative aspect-square overflow-hidden">
        <Link to={`/product/${product.slug}`}>
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </Link>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {!product.inStock && (
            <Badge variant="error">Out of Stock</Badge>
          )}
          {product.stockQty > 0 && product.stockQty <= 5 && (
            <Badge variant="warning">Only {product.stockQty} left</Badge>
          )}
        </div>

        {/* Quick actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            className="p-2 bg-soft-white/90 backdrop-blur-sm rounded-full shadow-soft hover:bg-rose hover:text-soft-white transition-colors"
            aria-label="Add to wishlist"
          >
            <Heart className="w-4 h-4" />
          </button>
        </div>

        {/* Add to cart overlay */}
        {product.inStock && onAddToCart && (
          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={(e) => {
                e.preventDefault()
                onAddToCart()
              }}
              className="w-full py-2.5 bg-rose text-soft-white text-sm font-medium rounded-lg hover:bg-rose-dark transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              Add to Cart
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <Link to={`/product/${product.slug}`} className="block p-4">
        {product.categoryName && (
          <p className="text-xs text-warm-gray uppercase tracking-wide mb-1">
            {product.categoryName}
          </p>
        )}
        <h3 className="font-serif text-lg font-medium text-charcoal line-clamp-1 group-hover:text-rose transition-colors">
          {product.name}
        </h3>
        <p className="mt-2 font-medium text-rose">
          {formatPrice(product.price, product.currency)}
        </p>
      </Link>
    </div>
  )
}
