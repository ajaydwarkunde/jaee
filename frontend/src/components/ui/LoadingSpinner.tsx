import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  fullScreen?: boolean
}

export default function LoadingSpinner({ size = 'md', className, fullScreen }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className={cn('animate-spin text-rose', sizes[size], className)} />
          <p className="text-warm-gray text-sm animate-pulse">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center p-8">
      <Loader2 className={cn('animate-spin text-rose', sizes[size], className)} />
    </div>
  )
}
