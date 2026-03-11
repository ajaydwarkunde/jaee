import { useState, useEffect } from 'react'

type Phase = 'bow' | 'untie' | 'sweep' | 'light' | 'brand' | 'fade' | 'done'

const TIMINGS: Record<Phase, number> = {
  bow: 500,
  untie: 1200,
  sweep: 800,
  light: 800,
  brand: 600,
  fade: 400,
  done: 0,
}

const SHIMMER_PARTICLES = Array.from({ length: 16 }, (_, i) => ({
  angle: (i / 16) * 360,
  distance: 30 + (i % 4) * 20,
  delay: i * 50,
}))

export default function Splash12RibbonUntie({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<Phase>('bow')

  useEffect(() => {
    const phases: Phase[] = ['bow', 'untie', 'sweep', 'light', 'brand', 'fade', 'done']
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

  const untying = phase === 'untie' || phase === 'sweep' || phase === 'light' || phase === 'brand' || phase === 'fade'
  const sweeping = phase === 'sweep' || phase === 'light' || phase === 'brand' || phase === 'fade'
  const lightExpanding = phase === 'light' || phase === 'brand' || phase === 'fade'
  const brandVisible = phase === 'brand' || phase === 'fade'
  const fading = phase === 'fade'

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      style={{
        background: fading ? 'transparent' : '#000',
        opacity: fading ? 0 : 1,
        transition: 'background 300ms ease, opacity 400ms ease',
        pointerEvents: 'none',
      }}
    >
      {/* Rose-gold circle of light - expands from center */}
      <div
        className="absolute rounded-full"
        style={{
          left: '50%',
          top: '50%',
          width: lightExpanding ? '200vmax' : 20,
          height: lightExpanding ? '200vmax' : 20,
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(180,97,123,0.5) 0%, rgba(228,213,207,0.3) 40%, transparent 70%)',
          opacity: lightExpanding ? 1 : 0,
          transition: lightExpanding
            ? 'width 800ms cubic-bezier(0.2,0.8,0.3,1), height 800ms cubic-bezier(0.2,0.8,0.3,1), opacity 400ms ease'
            : 'opacity 200ms ease',
        }}
      />

      {/* Shimmer particles trail */}
      {SHIMMER_PARTICLES.map((p, i) => {
        const rad = (p.angle * Math.PI) / 180
        const dx = Math.cos(rad) * (untying ? p.distance + 80 : p.distance)
        const dy = Math.sin(rad) * (untying ? p.distance + 80 : p.distance)
        return (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 3,
              height: 3,
              left: '50%',
              top: '50%',
              background: 'radial-gradient(circle, #F0D78C, #D4A843)',
              boxShadow: '0 0 8px rgba(212,168,67,0.8)',
              transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`,
              opacity: untying ? 0.6 : 0,
              transition: untying
                ? `transform 1s cubic-bezier(0.2,0.6,0.4,1) ${p.delay}ms, opacity 600ms ease ${p.delay}ms`
                : 'none',
            }}
          />
        )
      })}

      {/* Ribbon bow - SVG with two loops and two tails */}
      <svg
        viewBox="0 0 200 180"
        className="absolute"
        style={{
          width: 200,
          height: 180,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 5,
        }}
      >
        <defs>
          <linearGradient id="ribbon-satin" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F0D78C" />
            <stop offset="25%" stopColor="#D4A843" />
            <stop offset="50%" stopColor="#E8C55A" />
            <stop offset="75%" stopColor="#D4A843" />
            <stop offset="100%" stopColor="#B8952E" />
          </linearGradient>
          <filter id="ribbon-glow">
            <feGaussianBlur stdDeviation="1" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Left tail - curls to bottom-left */}
        <path
          d="M 70 100 Q 50 130, 30 170"
          fill="none"
          stroke="url(#ribbon-satin)"
          strokeWidth="10"
          strokeLinecap="round"
          filter="url(#ribbon-glow)"
          style={{
            transform: sweeping ? 'translate(-40px, 20px) scaleX(0.3)' : 'translate(0,0) scaleX(1)',
            transformOrigin: '70px 100px',
            transition: 'transform 800ms cubic-bezier(0.4,0,0.2,1)',
          }}
        />
        {/* Right tail - curls to bottom-right */}
        <path
          d="M 130 100 Q 150 130, 170 170"
          fill="none"
          stroke="url(#ribbon-satin)"
          strokeWidth="10"
          strokeLinecap="round"
          filter="url(#ribbon-glow)"
          style={{
            transform: sweeping ? 'translate(40px, 20px) scaleX(0.3)' : 'translate(0,0) scaleX(1)',
            transformOrigin: '130px 100px',
            transition: 'transform 800ms cubic-bezier(0.4,0,0.2,1)',
          }}
        />

        {/* Left loop - shrinks inward */}
        <ellipse
          cx="85"
          cy="75"
          rx={untying ? 5 : 35}
          ry={untying ? 8 : 25}
          fill="url(#ribbon-satin)"
          filter="url(#ribbon-glow)"
          style={{
            transform: untying ? 'translate(30px, 10px) rotate(-20deg)' : 'translate(0,0) rotate(0deg)',
            transition: 'all 1.2s cubic-bezier(0.4,0,0.2,1)',
          }}
        />
        {/* Right loop - shrinks inward */}
        <ellipse
          cx="115"
          cy="75"
          rx={untying ? 5 : 35}
          ry={untying ? 8 : 25}
          fill="url(#ribbon-satin)"
          filter="url(#ribbon-glow)"
          style={{
            transform: untying ? 'translate(-30px, 10px) rotate(20deg)' : 'translate(0,0) rotate(0deg)',
            transition: 'all 1.2s cubic-bezier(0.4,0,0.2,1)',
          }}
        />
        {/* Center knot */}
        <circle
          cx="100"
          cy="85"
          r={untying ? 3 : 12}
          fill="#B8952E"
          style={{
            opacity: untying ? 0 : 1,
            transition: 'all 0.8s ease',
          }}
        />
      </svg>

      {/* Tails sweeping to corners - extra ribbons for sweep effect */}
      <div
        className="absolute left-0 top-0 w-32 h-1"
        style={{
          background: 'linear-gradient(135deg, transparent, #D4A843 50%, transparent)',
          transform: sweeping ? 'translate(0, 0) scaleX(1)' : 'translate(-100%, -100%) scaleX(0)',
          transformOrigin: '100% 100%',
          transition: 'transform 800ms cubic-bezier(0.4,0,0.2,1)',
          opacity: sweeping ? 0.8 : 0,
        }}
      />
      <div
        className="absolute right-0 bottom-0 w-32 h-1"
        style={{
          background: 'linear-gradient(-45deg, transparent, #D4A843 50%, transparent)',
          transform: sweeping ? 'translate(0, 0) scaleX(1)' : 'translate(100%, 100%) scaleX(0)',
          transformOrigin: '0% 0%',
          transition: 'transform 800ms cubic-bezier(0.4,0,0.2,1)',
          opacity: sweeping ? 0.8 : 0,
        }}
      />

      {/* Jaai text */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          opacity: brandVisible ? 1 : 0,
          transition: 'opacity 500ms ease 100ms',
          zIndex: 10,
        }}
      >
        <h1
          className="font-serif text-5xl md:text-6xl tracking-widest"
          style={{
            color: '#FBF6F3',
            textShadow: '0 0 40px rgba(212,168,67,0.6), 0 0 60px rgba(180,97,123,0.4), 0 2px 12px rgba(0,0,0,0.3)',
          }}
        >
          Jaai
        </h1>
      </div>
    </div>
  )
}
