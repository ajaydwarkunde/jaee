import { useState, useEffect } from 'react'

type Phase = 'smoke' | 'text' | 'disperse' | 'reveal' | 'done'

export default function Splash6Fragrance({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<Phase>('smoke')

  useEffect(() => {
    const phases: Phase[] = ['smoke', 'text', 'disperse', 'reveal', 'done']
    const timings = [1200, 1500, 1200, 800, 0]
    let i = 0
    let t: ReturnType<typeof setTimeout>
    const advance = () => {
      if (i >= phases.length - 1) {
        onComplete()
        return
      }
      t = setTimeout(() => {
        i++
        setPhase(phases[i])
        advance()
      }, timings[i])
    }
    advance()
    return () => clearTimeout(t)
  }, [onComplete])

  if (phase === 'done') return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{
        background: phase === 'reveal' ? 'transparent' : '#000',
        opacity: phase === 'reveal' ? 0 : 1,
        transition: 'background 800ms ease, opacity 800ms ease',
        pointerEvents: phase === 'reveal' ? 'none' : 'all',
      }}
    >
      {/* Wispy smoke trails */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 600">
        <defs>
          <linearGradient id="fr-smoke" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#B4617B" stopOpacity="0" />
            <stop offset="40%" stopColor="#D4A843" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#F2E3E8" stopOpacity="0.6" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3, 4].map((i) => (
          <path
            key={i}
            d={`M ${200 + (i - 2) * 25} 600 Q ${180 + i * 20} 450 ${195 + (i - 2) * 15} 300 T ${200 + (i - 2) * 10} 150`}
            fill="none"
            stroke="url(#fr-smoke)"
            strokeWidth="2"
            opacity={phase === 'smoke' ? 0.4 : 0}
            style={{
              strokeDasharray: 500,
              strokeDashoffset: phase === 'smoke' ? 500 - 400 : 500,
              transition: phase === 'smoke' ? `stroke-dashoffset ${1200}ms ease ${i * 150}ms` : 'opacity 200ms ease',
            }}
          />
        ))}
      </svg>

      {/* Jaai text path - smoke forms text */}
      <svg
        className="absolute"
        viewBox="0 0 200 60"
        style={{
          width: 180,
          opacity: phase === 'text' ? 1 : phase === 'disperse' ? 0.3 : 0,
          transform: phase === 'disperse' ? 'scale(1.3)' : 'scale(1)',
          transition: phase === 'text' ? 'opacity 800ms ease 200ms' : phase === 'disperse' ? 'opacity 800ms ease, transform 800ms ease' : 'none',
        }}
      >
        <defs>
          <linearGradient id="fr-text" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#B4617B" />
            <stop offset="50%" stopColor="#D4A843" />
            <stop offset="100%" stopColor="#E4D5CF" />
          </linearGradient>
        </defs>
        <text
          x="100"
          y="42"
          textAnchor="middle"
          className="font-serif"
          fill="none"
          stroke="url(#fr-text)"
          strokeWidth="1.5"
          strokeLinejoin="round"
          style={{
            fontSize: 36,
            letterSpacing: '0.2em',
            strokeDasharray: 450,
            strokeDashoffset: phase === 'text' ? 0 : 450,
            transition: 'stroke-dashoffset 1500ms ease-out',
          }}
        >
          Jaai
        </text>
      </svg>

      {/* Overlay that fades to reveal site */}
    </div>
  )
}
