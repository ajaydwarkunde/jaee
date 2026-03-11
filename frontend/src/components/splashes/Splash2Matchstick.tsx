import { useState, useEffect } from 'react'

export default function Splash2Matchstick({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 1800),
      setTimeout(() => setPhase(3), 3200),
      setTimeout(() => setPhase(4), 4200),
      setTimeout(() => onComplete(), 5000),
    ]
    return () => timers.forEach(clearTimeout)
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-[100]" style={{ pointerEvents: phase >= 4 ? 'none' : 'all' }}>
      <div
        className="absolute inset-0"
        style={{
          background: '#0a0a0a',
          opacity: phase >= 4 ? 0 : 1,
          transition: 'opacity 800ms cubic-bezier(0.4, 0, 0, 1)',
        }}
      />

      {/* Ink blob that blooms organically */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg className="absolute" width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
          <defs>
            <filter id="ink-turbulence">
              <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="4" seed="3" />
              <feDisplacementMap in="SourceGraphic" scale={phase >= 2 ? 30 : 15} />
              <feGaussianBlur stdDeviation="0.5" />
            </filter>
            <radialGradient id="ink-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#D4A843" stopOpacity="0.9" />
              <stop offset="40%" stopColor="#B4617B" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#2D2D2D" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle
            cx="50"
            cy="50"
            r={phase >= 2 ? 80 : phase >= 1 ? 12 : 0}
            fill="url(#ink-grad)"
            filter="url(#ink-turbulence)"
            style={{
              transition: phase >= 2
                ? 'r 1200ms cubic-bezier(0.4, 0, 0, 1)'
                : 'r 1400ms cubic-bezier(0.16, 1, 0.3, 1)',
              transformOrigin: 'center',
            }}
          />
        </svg>
      </div>

      {/* Soft ambient glow */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(212,168,67,0.08) 0%, transparent 60%)',
          opacity: phase >= 1 && phase < 4 ? 1 : 0,
          transition: 'opacity 1000ms ease',
        }}
      />

      {/* Brand */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <h1
          className="font-serif tracking-[0.3em] text-4xl md:text-5xl"
          style={{
            color: '#FBF6F3',
            opacity: phase >= 3 ? 1 : 0,
            transform: phase >= 3 ? 'scale(1)' : 'scale(0.95)',
            transition: 'opacity 800ms ease 100ms, transform 800ms cubic-bezier(0.4, 0, 0, 1) 100ms',
            letterSpacing: '0.35em',
          }}
        >
          Jaai
        </h1>
        <p
          className="mt-3 text-xs tracking-[0.5em] uppercase"
          style={{
            color: 'rgba(212,168,67,0.6)',
            opacity: phase >= 3 ? 1 : 0,
            transition: 'opacity 800ms ease 400ms',
          }}
        >
          Curated Gifts
        </p>
      </div>

      <div
        className="absolute inset-0 bg-[#FBF6F3]"
        style={{
          opacity: phase >= 4 ? 1 : 0,
          transition: 'opacity 700ms cubic-bezier(0.4, 0, 0, 1)',
        }}
      />
    </div>
  )
}
