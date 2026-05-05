import { Link } from 'react-router-dom'
import { Clock } from 'lucide-react'
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed'
import { formatPrice } from '@/lib/utils'
import { productListingImageProps } from '@/lib/imageUrl'

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
        {items.map((item) => {
          const img = productListingImageProps(item.image)
          return (
            <Link
              key={item.id}
              to={`/product/${item.slug}`}
              className="group"
            >
              <div className="aspect-square rounded-xl overflow-hidden bg-blush mb-3">
                <img
                  src={img.src}
                  srcSet={img.srcSet}
                  sizes={img.sizes}
                  alt={item.name}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="font-serif text-lg font-semibold text-rose group-hover:opacity-90 transition-opacity line-clamp-1 tracking-tight">
                {item.name}
              </h3>
              <p className="text-rose font-semibold mt-1 tabular-nums">{formatPrice(item.price)}</p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
