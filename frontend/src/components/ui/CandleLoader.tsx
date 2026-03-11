import { cn } from '@/lib/utils'

interface CandleLoaderProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
}

export default function CandleLoader({ size = 'md', className, text }: CandleLoaderProps) {
  const scale = { sm: 0.6, md: 0.85, lg: 1.1 }[size]

  return (
    <div className={cn('flex flex-col items-center justify-center gap-4', className)}>
      <div
        className="candle-scene"
        style={{ transform: `scale(${scale})` }}
      >
        {/* Ambient glow that appears when candle lights */}
        <div className="candle-ambient" />

        {/* Smoke wisps */}
        <div className="candle-smoke">
          <div className="smoke-wisp smoke-wisp-1" />
          <div className="smoke-wisp smoke-wisp-2" />
        </div>

        {/* Flame group */}
        <div className="candle-flame-group">
          {/* Flame outer glow */}
          <div className="flame-glow" />
          {/* Flame body */}
          <div className="flame-body">
            <div className="flame-inner" />
          </div>
          {/* Light rays */}
          <div className="flame-rays" />
        </div>

        {/* Wick */}
        <div className="candle-wick" />

        {/* Candle body */}
        <div className="candle-body">
          {/* Wax pool on top */}
          <div className="candle-wax-pool" />
          {/* Wax drip */}
          <div className="candle-drip candle-drip-1" />
          <div className="candle-drip candle-drip-2" />
          {/* Candle rim highlight */}
          <div className="candle-rim" />
          {/* Body shine */}
          <div className="candle-shine" />
        </div>

        {/* Surface reflection */}
        <div className="candle-reflection" />
      </div>

      {text && (
        <p className="text-warm-gray text-sm animate-pulse tracking-wide">{text}</p>
      )}
    </div>
  )
}
