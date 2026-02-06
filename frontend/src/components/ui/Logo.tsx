import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'dark' | 'light'
  linkTo?: string | false
  className?: string
}

export default function Logo({ size = 'md', variant = 'dark', linkTo = '/', className }: LogoProps) {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
  }

  const colorClasses = {
    dark: 'text-rose',
    light: 'text-cream',
  }

  const logo = (
    <span
      className={cn(
        'font-serif font-bold tracking-[0.15em] uppercase select-none',
        sizeClasses[size],
        colorClasses[variant],
        className
      )}
    >
      JAEE
    </span>
  )

  if (linkTo === false) {
    return logo
  }

  return (
    <Link to={linkTo} className="inline-block hover:opacity-90 transition-opacity">
      {logo}
    </Link>
  )
}
