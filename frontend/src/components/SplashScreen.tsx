import { useState, useEffect } from 'react'

type Phase = 'dark' | 'appear' | 'pop' | 'settle' | 'reveal' | 'done'

const TIMINGS: Record<Phase, number> = {
  dark: 500,
  appear: 900,
  pop: 1400,
  settle: 1400,
  reveal: 1100,
  done: 0,
}

const CONFETTI = Array.from({ length: 28 }, (_, i) => {
  const angle = (i / 28) * 360 + (Math.random() - 0.5) * 30
  const rad = (angle * Math.PI) / 180
  const dist = 90 + Math.random() * 80
  const dx = Math.cos(rad) * dist
  const dy = -Math.abs(Math.sin(rad)) * dist * 0.8 - Math.random() * 40
  const colors = ['#B4617B', '#D4A843', '#F0D78C', '#E9868B', '#6B9E76', '#F2E3E8', '#923C5B', '#FBF6F3']
  return {
    dx, dy,
    color: colors[i % colors.length],
    size: 3 + Math.random() * 4,
    rot: Math.random() * 360,
    delay: Math.random() * 200,
    shape: i % 3,
  }
})

const ITEMS: { emoji: string; label: string; dx: number; dy: number; delay: number }[] = [
  { emoji: '🕯️', label: 'Candle',      dx: -75, dy: -120, delay: 0 },
  { emoji: '🍫', label: 'Chocolates',  dx: 70,  dy: -130, delay: 80 },
  { emoji: '🌸', label: 'Flowers',     dx: -45, dy: -160, delay: 160 },
  { emoji: '🧴', label: 'Scent',       dx: 50,  dy: -155, delay: 120 },
  { emoji: '🍪', label: 'Snacks',      dx: -90, dy: -90,  delay: 60 },
  { emoji: '🧼', label: 'Soap',        dx: 90,  dy: -95,  delay: 140 },
  { emoji: '🫖', label: 'Tea',         dx: 0,   dy: -175, delay: 200 },
]

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<Phase>('dark')

  useEffect(() => {
    const phases: Phase[] = ['dark', 'appear', 'pop', 'settle', 'reveal', 'done']
    let i = 0
    let timeout: ReturnType<typeof setTimeout>

    const advance = () => {
      if (i >= phases.length - 1) {
        onComplete()
        return
      }
      timeout = setTimeout(() => {
        i++
        setPhase(phases[i])
        advance()
      }, TIMINGS[phases[i]])
    }
    advance()

    return () => clearTimeout(timeout)
  }, [onComplete])

  if (phase === 'done') return null

  const idx = ['dark', 'appear', 'pop', 'settle', 'reveal'].indexOf(phase)
  const boxVisible = idx >= 1
  const popped = idx >= 2
  const settled = idx >= 3
  const revealing = phase === 'reveal'

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{
        opacity: revealing ? 0 : 1,
        transition: 'opacity 1s ease',
        pointerEvents: revealing ? 'none' : 'all',
        background: '#000',
      }}
    >
      {/* Subtle warm bg after pop */}
      <div
        className="absolute inset-0 transition-opacity"
        style={{
          opacity: popped ? 1 : 0,
          transitionDuration: '1200ms',
          background: 'radial-gradient(ellipse at 50% 55%, rgba(180,97,123,0.08) 0%, transparent 50%)',
        }}
      />

      {/* Center stage */}
      <div className="relative flex flex-col items-center" style={{ width: 320, height: 360 }}>

        {/* ── Confetti burst ── */}
        {CONFETTI.map((c, i) => (
          <div
            key={`c${i}`}
            className="absolute"
            style={{
              left: '50%',
              top: '55%',
              width: c.size,
              height: c.shape === 2 ? c.size : c.size * (c.shape === 1 ? 2.5 : 1),
              borderRadius: c.shape === 0 ? '50%' : c.shape === 1 ? '1px' : '2px',
              background: c.color,
              transform: popped
                ? `translate(${c.dx}px, ${c.dy}px) rotate(${c.rot + 180}deg) scale(1)`
                : `translate(0, 0) rotate(0deg) scale(0)`,
              opacity: popped ? (settled ? 0 : 0.85) : 0,
              transition: popped
                ? `transform 600ms cubic-bezier(0.2,0.8,0.3,1) ${c.delay}ms, opacity ${settled ? '600ms' : '400ms'} ease ${settled ? '0ms' : `${c.delay}ms`}`
                : 'none',
            }}
          />
        ))}

        {/* ── Products popping out ── */}
        {ITEMS.map((item, i) => (
          <div
            key={`item${i}`}
            className="absolute flex flex-col items-center"
            style={{
              left: '50%',
              top: '52%',
              transform: popped
                ? `translate(calc(-50% + ${item.dx}px), ${item.dy}px) scale(1)`
                : 'translate(-50%, 0) scale(0.3)',
              opacity: popped ? (settled ? 0.9 : 1) : 0,
              transition: `transform 700ms cubic-bezier(0.17,0.89,0.32,1.25) ${item.delay}ms, opacity 500ms ease ${item.delay}ms`,
              zIndex: 20,
            }}
          >
            <span className="text-3xl md:text-4xl drop-shadow-lg" style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.4))' }}>
              {item.emoji}
            </span>
            <span
              className="mt-1 text-[10px] font-medium tracking-wide uppercase"
              style={{
                color: 'rgba(251,246,243,0.6)',
                opacity: settled ? 1 : 0,
                transition: 'opacity 400ms ease 200ms',
              }}
            >
              {item.label}
            </span>
          </div>
        ))}

        {/* ── Gift box SVG ── */}
        <svg
          width="200"
          height="180"
          viewBox="0 0 240 210"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute"
          style={{
            bottom: 30,
            left: '50%',
            transform: 'translateX(-50%)',
            opacity: boxVisible ? 1 : 0,
            transition: 'opacity 600ms ease',
          }}
        >
          <defs>
            <linearGradient id="sp-box" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#B4617B" />
              <stop offset="100%" stopColor="#6E2C44" />
            </linearGradient>
            <linearGradient id="sp-box-r" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C06A85" />
              <stop offset="100%" stopColor="#8A3558" />
            </linearGradient>
            <linearGradient id="sp-lid" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D47A93" />
              <stop offset="100%" stopColor="#923C5B" />
            </linearGradient>
            <linearGradient id="sp-rib" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#C4953A" />
              <stop offset="30%" stopColor="#F0D78C" />
              <stop offset="50%" stopColor="#D4A843" />
              <stop offset="70%" stopColor="#F0D78C" />
              <stop offset="100%" stopColor="#C4953A" />
            </linearGradient>
          </defs>

          {/* Floor shadow */}
          <ellipse cx="120" cy="200" rx="75" ry="8" fill="#B4617B" opacity="0.1" />

          {/* Box body */}
          <path d="M40 105 L40 190 L120 200 L120 115 Z" fill="url(#sp-box)" />
          <path d="M120 115 L120 200 L200 190 L200 105 Z" fill="url(#sp-box-r)" />
          <path d="M40 105 L120 115 L200 105 L120 95 Z" fill="#C87A90" opacity="0.4" />
          {/* Ribbon V left */}
          <path d="M75 105 L75 193 L87 194.5 L87 106 Z" fill="url(#sp-rib)" opacity="0.7" />
          {/* Ribbon V right */}
          <path d="M153 106 L153 194 L165 193 L165 105 Z" fill="url(#sp-rib)" opacity="0.7" />
          {/* Ribbon H */}
          <path d="M40 140 L120 150 L200 140 L200 128 L120 138 L40 128 Z" fill="url(#sp-rib)" opacity="0.6" />
          {/* Highlight */}
          <path d="M45 110 L45 185 L52 186 L52 111 Z" fill="white" opacity="0.05" />

          {/* Lid */}
          <g
            style={{
              transform: popped ? 'translateY(-50px)' : 'translateY(0)',
              opacity: popped ? (settled ? 0 : 1) : 1,
              transition: 'transform 500ms cubic-bezier(0.2,0.8,0.3,1), opacity 400ms ease 800ms',
              transformOrigin: '120px 95px',
            }}
          >
            <path d="M35 93 L120 103 L205 93 L120 83 Z" fill="url(#sp-lid)" />
            <path d="M35 93 L35 105 L120 115 L120 103 Z" fill="#A85570" />
            <path d="M120 103 L120 115 L205 105 L205 93 Z" fill="#924B64" />
            <path d="M35 97 L120 107 L205 97 L205 93 L120 103 L35 93 Z" fill="url(#sp-rib)" opacity="0.5" />
            {/* Bow */}
            <ellipse cx="107" cy="78" rx="15" ry="9" fill="#D4A843" opacity="0.85" />
            <ellipse cx="133" cy="78" rx="15" ry="9" fill="#F0D78C" opacity="0.75" />
            <circle cx="120" cy="80" r="5" fill="#C4953A" />
            <circle cx="120" cy="80" r="2.5" fill="#F0D78C" opacity="0.5" />
            <path d="M115 84 Q107 94,99 90" stroke="#D4A843" strokeWidth="2" fill="none" opacity="0.6" strokeLinecap="round" />
            <path d="M125 84 Q133 94,141 90" stroke="#D4A843" strokeWidth="2" fill="none" opacity="0.6" strokeLinecap="round" />
          </g>
        </svg>

        {/* ── Brand ── */}
        <div
          className="absolute w-full text-center"
          style={{ bottom: -10 }}
        >
          <h1
            className="font-serif text-3xl md:text-4xl tracking-widest"
            style={{
              color: '#FBF6F3',
              opacity: settled ? 1 : 0,
              transform: settled ? 'translateY(0)' : 'translateY(10px)',
              transition: 'all 600ms ease',
              textShadow: '0 0 25px rgba(180,97,123,0.35)',
            }}
          >
            Jaai
          </h1>
          <p
            className="mt-1.5 text-xs tracking-[0.25em] uppercase"
            style={{
              color: 'rgba(251,246,243,0.45)',
              opacity: settled ? 1 : 0,
              transform: settled ? 'translateY(0)' : 'translateY(8px)',
              transition: 'all 600ms ease 150ms',
            }}
          >
            Gifts Crafted with Love
          </p>
        </div>
      </div>
    </div>
  )
}
