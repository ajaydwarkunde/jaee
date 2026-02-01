import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface LazyImageProps {
  src: string
  alt: string
  className?: string
  wrapperClassName?: string
  priority?: boolean // Load immediately (for above-the-fold images)
  placeholder?: 'blur' | 'skeleton'
}

export default function LazyImage({
  src,
  alt,
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
        rootMargin: '200px', // Start loading 200px before entering viewport
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
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
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
