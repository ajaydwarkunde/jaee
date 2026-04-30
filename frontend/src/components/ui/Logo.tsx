import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** dark: default theme-aware | light: inverted for dark backgrounds | brand: full-color mark (no filters) */
  variant?: 'dark' | 'light' | 'brand'
  linkTo?: string | false
  className?: string
}

const sizeMap = {
  sm: { height: 32, width: 48 },
  md: { height: 40, width: 60 },
  lg: { height: 48, width: 72 },
  xl: { height: 64, width: 96 },
}

export default function Logo({ size = 'md', variant = 'dark', linkTo = '/', className }: LogoProps) {
  const { height, width } = sizeMap[size]

  const logo = (
    <img
      src="/brandclr_1.svg"
      alt="Jaai"
      width={width}
      height={height}
      className={cn(
        'select-none object-contain',
        variant === 'light' && 'brightness-0 invert',
        variant === 'dark' && 'dark:brightness-0 dark:invert',
        variant === 'brand' && 'drop-shadow-sm',
        className
      )}
      style={{ height, width: 'auto' }}
    />
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
