import { cn } from '@/lib/utils'

/* ───────── 1. Candle Flame Pulse ───────── */
export function CandleFlameLoader({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <div className="relative w-10 h-16">
        {/* Wick */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-5 bg-charcoal/40 rounded-full" />
        {/* Flame outer glow */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-rose/20 rounded-full blur-md animate-[flame-glow_2s_ease-in-out_infinite]" />
        {/* Flame body */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-5 h-9 origin-bottom animate-[flame-sway_1.5s_ease-in-out_infinite]">
          <div className="w-full h-full bg-gradient-to-t from-rose via-rose-light to-champagne rounded-[50%_50%_50%_50%/60%_60%_40%_40%] animate-[flame-morph_1.2s_ease-in-out_infinite]" />
          {/* Inner flame */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2.5 h-5 bg-gradient-to-t from-champagne to-cream rounded-[50%_50%_50%_50%/60%_60%_40%_40%] animate-[flame-morph_0.9s_ease-in-out_infinite_0.1s]" />
        </div>
      </div>
    </div>
  )
}

/* ───────── 2. Breathing Glow Ring ───────── */
export function GlowRingLoader({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="relative w-16 h-16">
        {/* Outer glow */}
        <div className="absolute inset-0 rounded-full bg-rose/10 animate-[glow-breathe_2.4s_ease-in-out_infinite]" />
        {/* Ring */}
        <div className="absolute inset-1 rounded-full border-2 border-rose/30 animate-[glow-breathe_2.4s_ease-in-out_infinite_0.2s]" />
        {/* Inner ring */}
        <div className="absolute inset-3 rounded-full border-2 border-rose animate-[glow-breathe_2.4s_ease-in-out_infinite_0.4s]" />
        {/* Center dot */}
        <div className="absolute inset-[22px] rounded-full bg-rose animate-[glow-breathe_2.4s_ease-in-out_infinite_0.6s]" />
      </div>
    </div>
  )
}

/* ───────── 3. Petal Bloom ───────── */
export function PetalBloomLoader({ className }: { className?: string }) {
  const petals = 8
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="relative w-16 h-16">
        {[...Array(petals)].map((_, i) => (
          <div
            key={i}
            className="absolute top-1/2 left-1/2 w-2.5 h-2.5 -ml-1.25 -mt-1.25 rounded-full bg-rose"
            style={{
              animation: 'petal-bloom 1.6s ease-in-out infinite',
              animationDelay: `${i * (1.6 / petals)}s`,
              transform: `rotate(${i * (360 / petals)}deg) translateY(-12px)`,
            }}
          />
        ))}
        <div className="absolute top-1/2 left-1/2 w-3 h-3 -ml-1.5 -mt-1.5 rounded-full bg-rose-dark animate-pulse" />
      </div>
    </div>
  )
}

/* ───────── 4. Wax Drip Bars ───────── */
export function WaxDripLoader({ className }: { className?: string }) {
  const bars = 5
  return (
    <div className={cn('flex items-end justify-center gap-1.5', className)}>
      {[...Array(bars)].map((_, i) => (
        <div key={i} className="relative w-2 h-10 rounded-full bg-blush overflow-hidden">
          <div
            className="absolute bottom-0 left-0 w-full rounded-full bg-gradient-to-t from-rose-dark to-rose-light"
            style={{
              animation: 'wax-fill 1.4s ease-in-out infinite',
              animationDelay: `${i * 0.15}s`,
            }}
          />
        </div>
      ))}
    </div>
  )
}

/* ───────── 5. Elegant Orbit ───────── */
export function OrbitLoader({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="relative w-14 h-14">
        {/* Track */}
        <div className="absolute inset-0 rounded-full border border-blush" />
        {/* Dot 1 */}
        <div
          className="absolute top-0 left-1/2 -ml-1.5 -mt-1.5 w-3 h-3 rounded-full bg-rose shadow-[0_0_8px_rgba(146,60,91,0.5)]"
          style={{ animation: 'orbit-spin 1.8s linear infinite' }}
        />
        {/* Dot 2 */}
        <div
          className="absolute top-0 left-1/2 -ml-1 -mt-1 w-2 h-2 rounded-full bg-rose-light shadow-[0_0_6px_rgba(180,97,123,0.4)]"
          style={{ animation: 'orbit-spin 1.8s linear infinite reverse', animationDelay: '-0.9s' }}
        />
        {/* Center */}
        <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 -ml-[3px] -mt-[3px] rounded-full bg-rose-dark" />
      </div>
    </div>
  )
}
