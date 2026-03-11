import { useState, useEffect, useMemo } from 'react'

export default function Splash5GiftTag({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 1400),
      setTimeout(() => setPhase(3), 2800),
      setTimeout(() => setPhase(4), 3800),
      setTimeout(() => setPhase(5), 4600),
      setTimeout(() => onComplete(), 5400),
    ]
    return () => timers.forEach(clearTimeout)
  }, [onComplete])

  const letters = useMemo(() => ['J', 'a', 'a', 'i'], [])

  return (
    <div className="fixed inset-0 z-[100]" style={{ pointerEvents: phase >= 5 ? 'none' : 'all' }}>
      <div
        className="absolute inset-0"
        style={{
          background: '#0a0a0a',
          opacity: phase >= 5 ? 0 : 1,
          transition: 'opacity 800ms cubic-bezier(0.4, 0, 0, 1)',
        }}
      />

      {/* Subtle grain texture */}
      <div
        className="absolute inset-0"
        style={{
          opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Animated letter reveal — each letter fades in with stagger */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex items-baseline gap-1">
          {letters.map((letter, i) => (
            <span
              key={i}
              className="font-serif"
              style={{
                fontSize: 'clamp(40px, 8vw, 64px)',
                letterSpacing: '0.15em',
                color: '#FBF6F3',
                opacity: phase >= 1 ? 1 : 0,
                transform: phase >= 1 ? 'translateY(0) rotateX(0)' : 'translateY(20px) rotateX(40deg)',
                transition: `opacity 600ms cubic-bezier(0.4, 0, 0, 1) ${200 + i * 150}ms, transform 600ms cubic-bezier(0.4, 0, 0, 1) ${200 + i * 150}ms`,
              }}
            >
              {letter}
            </span>
          ))}
        </div>
      </div>

      {/* Underline stroke */}
      <div className="absolute inset-0 flex items-center justify-center" style={{ paddingTop: 'clamp(60px, 10vw, 90px)' }}>
        <div
          style={{
            width: phase >= 2 ? '140px' : '0px',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, #D4A843, transparent)',
            transition: 'width 800ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </div>

      {/* Tagline */}
      <div className="absolute inset-0 flex items-center justify-center" style={{ paddingTop: 'clamp(100px, 14vw, 140px)' }}>
        <p
          className="text-[10px] md:text-xs tracking-[0.5em] uppercase"
          style={{
            color: 'rgba(228,213,207,0.5)',
            opacity: phase >= 2 ? 1 : 0,
            transition: 'opacity 800ms ease 200ms',
          }}
        >
          Illuminate Your Space
        </p>
      </div>

      {/* Circular mask reveal from center */}
      <div
        className="absolute inset-0"
        style={{
          background: '#FBF6F3',
          clipPath: phase >= 3
            ? 'circle(150% at 50% 50%)'
            : 'circle(0% at 50% 50%)',
          transition: 'clip-path 1000ms cubic-bezier(0.7, 0, 0.3, 1)',
          opacity: phase >= 3 ? 1 : 0,
        }}
      />

      {/* Brand on cream (after reveal) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <h1
          className="font-serif tracking-[0.35em] text-4xl md:text-5xl"
          style={{
            color: '#2D2D2D',
            opacity: phase >= 4 ? 1 : 0,
            transition: 'opacity 600ms ease',
          }}
        >
          Jaai
        </h1>
      </div>
    </div>
  )
}
