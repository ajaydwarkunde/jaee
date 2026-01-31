import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: ReactNode
  children: ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, icon, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:opacity-50 disabled:cursor-not-allowed'
    
    const variants = {
      primary: 'bg-rose text-soft-white hover:bg-rose-dark active:scale-[0.98] shadow-soft hover:shadow-soft-md',
      secondary: 'bg-blush text-charcoal hover:bg-champagne active:scale-[0.98]',
      outline: 'border-2 border-rose text-rose hover:bg-rose hover:text-soft-white active:scale-[0.98]',
      ghost: 'text-charcoal hover:bg-blush active:scale-[0.98]',
      danger: 'bg-error text-soft-white hover:bg-error/90 active:scale-[0.98]',
    }

    const sizes = {
      sm: 'px-4 py-2 text-sm rounded-md gap-1.5',
      md: 'px-6 py-2.5 text-base rounded-lg gap-2',
      lg: 'px-8 py-3 text-lg rounded-lg gap-2.5',
    }

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : icon ? (
          <span className="w-4 h-4">{icon}</span>
        ) : null}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
