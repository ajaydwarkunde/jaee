import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { isImageLoadDebugEnabled } from '@/lib/imageUrl'

interface LazyImageProps {
  src: string
  alt: string
  /** Responsive hints — browser picks smallest suitable download when set with srcSet */
  srcSet?: string
  sizes?: string
  className?: string
  wrapperClassName?: string
  priority?: boolean // Load immediately (for above-the-fold images)
  placeholder?: 'blur' | 'skeleton'
}

export default function LazyImage({
  src,
  alt,
  srcSet,
  sizes,
  className,
  wrapperClassName,
  priority = false,
  placeholder = 'skeleton',
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(priority)
  const imgRef = useRef<HTMLDivElement>(null)
  const loadStartedAt = useRef<number | null>(null)

  useEffect(() => {
    if (priority) {
      setIsInView(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        // Preload moderately ahead of viewport to balance smoothness vs network burst.
        rootMargin: '280px',
        threshold: 0,
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [priority])

  useEffect(() => {
    if (isInView && loadStartedAt.current === null) {
      loadStartedAt.current = performance.now()
    }
  }, [isInView])

  return (
    <div ref={imgRef} className={cn('relative h-full min-h-0 w-full overflow-hidden', wrapperClassName)}>
      {/* Skeleton/Blur placeholder */}
      {!isLoaded && (
        <div
          className={cn(
            'absolute inset-0 animate-pulse',
            placeholder === 'skeleton' ? 'bg-blush' : 'bg-blush/50 backdrop-blur-sm',
            className
          )}
        />
      )}

      {/* Actual image - only rendered when in view */}
      {isInView && (
        <img
          src={src}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'low'}
          onLoad={() => {
            setIsLoaded(true)
            if (isImageLoadDebugEnabled() && loadStartedAt.current != null) {
              const ms = Math.round(performance.now() - loadStartedAt.current)
              console.debug(`[jaai image] ${ms}ms`, src.slice(0, 96))
            }
          }}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
        />
      )}
    </div>
  )
}
