import { type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'outline'
  size?: 'sm' | 'md'
  children: ReactNode
}

export default function Badge({ 
  className, 
  variant = 'default', 
  size = 'sm', 
  children, 
  ...props 
}: BadgeProps) {
  const variants = {
    default: 'bg-rose/10 text-rose',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    error: 'bg-error/10 text-error',
    outline: 'border border-rose text-rose bg-transparent',
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
