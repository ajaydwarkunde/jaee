import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

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
        // Smaller margin = fewer off-screen images competing for bandwidth at once
        rootMargin: '100px',
        threshold: 0,
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [priority])

  return (
    <div ref={imgRef} className={cn('relative overflow-hidden', wrapperClassName)}>
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
          onLoad={() => setIsLoaded(true)}
          className={cn(
            'transition-opacity duration-500',
            isLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
        />
      )}
    </div>
  )
}
