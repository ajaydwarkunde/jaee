import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import KineticDotsLoader from './KineticDotsLoader'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  fullScreen?: boolean
  variant?: 'dots' | 'spinner'
}

export default function LoadingSpinner({ size = 'md', className, fullScreen, variant = 'dots' }: LoadingSpinnerProps) {
  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="flex flex-col items-center gap-2">
          <KineticDotsLoader size="lg" />
          <p className="text-warm-gray text-sm animate-pulse">Loading...</p>
        </div>
      </div>
    )
  }

  if (variant === 'spinner') {
    const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className={cn('animate-spin text-rose', sizes[size], className)} />
      </div>
    )
  }

  return <KineticDotsLoader size={size} className={className} />
}
