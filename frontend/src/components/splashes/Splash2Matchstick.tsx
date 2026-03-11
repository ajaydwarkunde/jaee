import { useState, useEffect } from 'react'

type Phase = 'idle' | 'strike' | 'flame' | 'glow' | 'jaai' | 'fade' | 'done'

const TIMINGS: Record<Phase, number> = {
  idle: 400,
  strike: 800,
  flame: 200,
  glow: 900,
  jaai: 600,
  fade: 600,
  done: 0,
}

const SPARKS = Array.from({ length: 12 }, (_, i) => ({
  x: 100 + i * 8,
  y: 50 - i * 3,
  delay: i * 30,
  size: 2 + (i % 3),
}))

export default function Splash2Matchstick({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<Phase>('idle')

  useEffect(() => {
    const phases: Phase[] = ['idle', 'strike', 'flame', 'glow', 'jaai', 'fade', 'done']
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

  const struck = phase === 'strike' || phase === 'flame' || phase === 'glow' || phase === 'jaai' || phase === 'fade'
  const flameOn = phase === 'flame' || phase === 'glow' || phase === 'jaai' || phase === 'fade'
  const glowExpanded = phase === 'glow' || phase === 'jaai' || phase === 'fade'
  const jaaiVisible = phase === 'jaai' || phase === 'fade'
  const fading = phase === 'fade'

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      style={{
        background: fading ? 'transparent' : '#000',
        opacity: fading ? 0 : 1,
        transition: 'opacity 600ms ease',
        pointerEvents: 'none',
      }}
    >
      {/* Warm golden radial glow - expands from flame */}
      <div
        className="absolute inset-0"
        style={{
          background: glowExpanded ? 'radial-gradient(circle at 50% 45%, rgba(212,168,67,0.6) 0%, rgba(180,97,123,0.2) 35%, transparent 65%)' : 'transparent',
          opacity: glowExpanded ? 1 : 0,
          transition: 'opacity 400ms ease',
        }}
      />

      {/* Strike surface - left edge */}
      <div
        className="absolute left-[15%] top-1/2 w-1 h-24 -translate-y-1/2 rounded"
        style={{ background: 'linear-gradient(90deg, #3d3228, #5c4a38)' }}
      />

      {/* Matchstick - drags across */}
      <div
        className="absolute left-[10%] top-1/2 -translate-y-1/2 origin-right"
        style={{
          transform: struck ? 'translateX(35vw) rotate(-5deg)' : 'translateX(0) rotate(-5deg)',
          transition: 'transform 800ms cubic-bezier(0.2,0.8,0.3,1)',
          zIndex: 10,
        }}
      >
        <svg width="80" height="16" viewBox="0 0 80 16" fill="none">
          {/* Stick */}
          <rect x="0" y="4" width="70" height="5" rx="1" fill="#5c4033" />
          <rect x="0" y="4" width="70" height="2" rx="1" fill="#6b5344" opacity="0.5" />
          {/* Head */}
          <ellipse cx="72" cy="6.5" rx="6" ry="5" fill="#7c5c45" />
          <ellipse cx="72" cy="6" rx="5" ry="4" fill="#8b6914" />
        </svg>

        {/* Sparks trail */}
        <div className="absolute -top-2 -right-2" style={{ width: 100, height: 40 }}>
          {SPARKS.map((s, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-amber-400"
              style={{
                left: s.x,
                top: s.y,
                width: s.size,
                height: s.size,
                opacity: struck ? 0.9 : 0,
                transform: struck ? 'scale(1)' : 'scale(0)',
                animation: struck ? `spark 400ms ease ${s.delay}ms forwards` : 'none',
                boxShadow: '0 0 4px #F0D78C',
              }}
            />
          ))}
        </div>
      </div>

      {/* Flame - appears at strike point */}
      <div
        className="absolute left-[47%] top-[42%] -translate-x-1/2 -translate-y-1/2"
        style={{
          opacity: flameOn ? 1 : 0,
          transition: 'opacity 150ms ease',
          zIndex: 5,
        }}
      >
        <svg width="60" height="80" viewBox="0 0 60 80" fill="none">
          <defs>
            <linearGradient id="flame-grad" x1="30" y1="80" x2="30" y2="0">
              <stop offset="0%" stopColor="#D4A843" />
              <stop offset="40%" stopColor="#F0D78C" />
              <stop offset="70%" stopColor="#F5A623" />
              <stop offset="100%" stopColor="#FBF6F3" stopOpacity="0.8" />
            </linearGradient>
            <filter id="flame-glow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            d="M30 5 C10 25 5 45 15 60 C20 70 25 75 30 80 C35 75 40 70 45 60 C55 45 50 25 30 5 Z"
            fill="url(#flame-grad)"
            filter="url(#flame-glow)"
          />
        </svg>
      </div>

      {/* Jaai text */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          opacity: jaaiVisible ? 1 : 0,
          transition: 'opacity 500ms ease',
          zIndex: 6,
        }}
      >
        <h1
          className="font-serif text-4xl md:text-5xl tracking-widest"
          style={{
            color: '#FBF6F3',
            textShadow: '0 0 40px rgba(212,168,67,0.6), 0 2px 15px rgba(0,0,0,0.4)',
          }}
        >
          Jaai
        </h1>
      </div>

      <style>{`
        @keyframes spark {
          0% { opacity: 0.9; transform: scale(1); }
          100% { opacity: 0; transform: scale(0) translateY(-15px); }
        }
      `}</style>
    </div>
  )
}
