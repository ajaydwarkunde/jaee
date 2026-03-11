import { cn } from '@/lib/utils'

interface KineticDotsLoaderProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function KineticDotsLoader({ size = 'md', className }: KineticDotsLoaderProps) {
  const dots = 4

  const sizeConfig = {
    sm: { container: 'min-h-[80px] gap-3', track: 'h-12 w-4', dot: 'w-3 h-3', bounce: '24px', ripple: 'w-6 h-2', shadow: 'w-3 h-1', highlight: 'w-1 h-1 top-0.5 left-0.5' },
    md: { container: 'min-h-[120px] gap-4', track: 'h-16 w-5', dot: 'w-4 h-4', bounce: '32px', ripple: 'w-8 h-2.5', shadow: 'w-4 h-1.5', highlight: 'w-1 h-1 top-0.5 left-0.5' },
    lg: { container: 'min-h-[180px] gap-5', track: 'h-20 w-6', dot: 'w-5 h-5', bounce: '40px', ripple: 'w-10 h-3', shadow: 'w-5 h-1.5', highlight: 'w-1.5 h-1.5 top-1 left-1' },
  }

  const s = sizeConfig[size]

  return (
    <div className={cn('flex items-center justify-center p-6', s.container, className)}>
      {[...Array(dots)].map((_, i) => (
        <div
          key={i}
          className={cn('relative flex flex-col items-center justify-end', s.track)}
        >
          <div
            className={cn('relative z-10', s.dot)}
            style={{
              animation: 'kdl-bounce 1.4s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite',
              animationDelay: `${i * 0.15}s`,
              willChange: 'transform',
            }}
          >
            <div
              className={cn('w-full h-full rounded-full bg-gradient-to-b from-rose-light to-rose-dark shadow-[0_0_12px_rgba(146,60,91,0.5)]')}
              style={{
                animation: 'kdl-morph 1.4s linear infinite',
                animationDelay: `${i * 0.15}s`,
                willChange: 'transform',
              }}
            />
            <div className={cn('absolute bg-white/50 rounded-full blur-[0.5px]', s.highlight)} />
          </div>

          <div
            className={cn('absolute bottom-0 border border-rose/30 rounded-[100%] opacity-0', s.ripple)}
            style={{
              animation: 'kdl-ripple 1.4s linear infinite',
              animationDelay: `${i * 0.15}s`,
            }}
          />

          <div
            className={cn('absolute -bottom-1 rounded-[100%] bg-rose/35 blur-sm', s.shadow)}
            style={{
              animation: 'kdl-shadow 1.4s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite',
              animationDelay: `${i * 0.15}s`,
            }}
          />
        </div>
      ))}
    </div>
  )
}
