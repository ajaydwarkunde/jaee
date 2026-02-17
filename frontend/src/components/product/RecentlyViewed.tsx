import { Link } from 'react-router-dom'
import { Clock } from 'lucide-react'
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed'
import { formatPrice } from '@/lib/utils'

interface RecentlyViewedProps {
  excludeProductId?: number
  maxItems?: number
}

export default function RecentlyViewed({ excludeProductId, maxItems = 4 }: RecentlyViewedProps) {
  const { getItemsExcluding } = useRecentlyViewed()
  
  const items = getItemsExcluding(excludeProductId).slice(0, maxItems)
  
  if (items.length === 0) {
    return null
  }

  return (
    <div className="mt-16 border-t border-blush pt-12">
      <h2 className="heading-3 text-charcoal mb-8 flex items-center gap-2">
        <Clock className="w-6 h-6 text-rose" />
        Recently Viewed
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {items.map((item) => (
          <Link
            key={item.id}
            to={`/product/${item.slug}`}
            className="group"
          >
            <div className="aspect-square rounded-xl overflow-hidden bg-blush mb-3">
              <img
                src={item.image || 'https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=400'}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <h3 className="font-medium text-charcoal group-hover:text-rose transition-colors line-clamp-1">
              {item.name}
            </h3>
            <p className="text-rose font-bold mt-1">{formatPrice(item.price)}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
