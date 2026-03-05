import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import LazyImage from './LazyImage'

interface Category {
  id: number
  name: string
  slug: string
  imageUrl: string | null
  productCount: number
}

interface CategoryCarouselProps {
  categories: Category[]
  autoPlay?: boolean
  interval?: number
}

function useItemsPerView() {
  const [count, setCount] = useState(() => {
    if (typeof window === 'undefined') return 4
    if (window.innerWidth < 768) return 1
    if (window.innerWidth < 1024) return 2
    return 4
  })

  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 768) setCount(1)
      else if (window.innerWidth < 1024) setCount(2)
      else setCount(4)
    }
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return count
}

export default function CategoryCarousel({
  categories,
  autoPlay = true,
  interval = 4000,
}: CategoryCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const itemsPerView = useItemsPerView()

  const maxIndex = Math.max(0, categories.length - itemsPerView)
  const totalPages = Math.ceil(categories.length / itemsPerView)
  const needsNavigation = categories.length > itemsPerView

  useEffect(() => {
    if (currentIndex > maxIndex) setCurrentIndex(maxIndex)
  }, [maxIndex, currentIndex])

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1))
  }, [maxIndex])

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1))
  }, [maxIndex])

  useEffect(() => {
    if (!autoPlay || isHovered || !needsNavigation) return
    const timer = setInterval(handleNext, interval)
    return () => clearInterval(timer)
  }, [autoPlay, interval, isHovered, needsNavigation, handleNext])

  if (!categories || categories.length === 0) return null

  const canGoPrev = currentIndex > 0
  const canGoNext = currentIndex < maxIndex

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Navigation buttons — hidden on mobile, visible on md+ only when needed */}
      {needsNavigation && (
        <>
          <button
            onClick={handlePrev}
            className={cn(
              'absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-soft-white/90 backdrop-blur-sm rounded-full shadow-soft-lg items-center justify-center transition-all duration-300 -ml-6',
              'hidden md:flex',
              canGoPrev
                ? 'opacity-100 hover:bg-rose hover:text-soft-white'
                : 'opacity-0 pointer-events-none'
            )}
            aria-label="Previous"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={handleNext}
            className={cn(
              'absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-soft-white/90 backdrop-blur-sm rounded-full shadow-soft-lg items-center justify-center transition-all duration-300 -mr-6',
              'hidden md:flex',
              canGoNext
                ? 'opacity-100 hover:bg-rose hover:text-soft-white'
                : 'opacity-0 pointer-events-none'
            )}
            aria-label="Next"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Carousel */}
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
          }}
        >
          {categories.map((category) => (
            <div
              key={category.id}
              className="w-full md:w-1/2 lg:w-1/4 flex-shrink-0 px-2"
            >
              <Link
                to={`/shop/${category.slug}`}
                className="group block relative aspect-[4/5] rounded-xl overflow-hidden shadow-soft hover:shadow-soft-lg transition-all duration-300"
              >
                <LazyImage
                  src={
                    category.imageUrl ||
                    'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=400'
                  }
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="font-serif text-xl md:text-2xl font-semibold text-soft-white mb-1 group-hover:text-rose-light transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-soft-white/80 flex items-center gap-2">
                    <span>{category.productCount} Products</span>
                    <span className="inline-block transform group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </p>
                </div>

                <div className="absolute inset-0 bg-rose/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Dot indicators */}
      {needsNavigation && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              onClick={() =>
                setCurrentIndex(Math.min(idx * itemsPerView, maxIndex))
              }
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-300',
                Math.floor(currentIndex / itemsPerView) === idx
                  ? 'w-8 bg-rose'
                  : 'bg-blush hover:bg-rose/50'
              )}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
