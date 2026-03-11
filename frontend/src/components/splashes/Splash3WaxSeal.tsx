import { useState, useEffect } from 'react'

type Phase = 'seal' | 'crack' | 'scatter' | 'flap' | 'light' | 'fade' | 'done'

const TIMINGS: Record<Phase, number> = {
  seal: 700,
  crack: 500,
  scatter: 600,
  flap: 500,
  light: 600,
  fade: 500,
  done: 0,
}

const PIECES = Array.from({ length: 8 }, (_, i) => {
  const angle = (i / 8) * 360 * (Math.PI / 180)
  const dist = 80 + Math.random() * 40
  return {
    dx: Math.cos(angle) * dist,
    dy: Math.sin(angle) * dist,
    rot: 90 + Math.random() * 180,
    delay: i * 40,
  }
})

export default function Splash3WaxSeal({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<Phase>('seal')

  useEffect(() => {
    const phases: Phase[] = ['seal', 'crack', 'scatter', 'flap', 'light', 'fade', 'done']
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

  const cracked = phase === 'crack' || phase === 'scatter' || phase === 'flap' || phase === 'light' || phase === 'fade'
  const scattered = phase === 'scatter' || phase === 'flap' || phase === 'light' || phase === 'fade'
  const flapOpen = phase === 'flap' || phase === 'light' || phase === 'fade'
  const lightOn = phase === 'light' || phase === 'fade'
  const fading = phase === 'fade'

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      style={{
        background: fading ? 'transparent' : '#1a1518',
        opacity: fading ? 0 : 1,
        transition: 'opacity 500ms ease',
        pointerEvents: 'none',
      }}
    >
      {/* Dark textured bg - subtle noise */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, #2D2D2D 0%, #1a1518 100%)',
        }}
      />

      {/* Envelope flap - opens upward */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 origin-bottom"
        style={{
          width: 320,
          height: 200,
          perspective: 800,
          transformStyle: 'preserve-3d',
        }}
      >
        <div
          className="absolute inset-0 rounded-t-lg"
          style={{
            background: 'linear-gradient(180deg, #E4D5CF 0%, #d4c4bc 100%)',
            transform: flapOpen ? 'rotateX(-120deg)' : 'rotateX(0deg)',
            transformOrigin: 'center bottom',
            transition: 'transform 500ms cubic-bezier(0.4,0,0.2,1)',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.3)',
          }}
        />
      </div>

      {/* Warm light pours out */}
      <div
        className="absolute inset-0"
        style={{
          background: lightOn ? 'radial-gradient(ellipse at 50% 55%, rgba(212,168,67,0.35) 0%, rgba(180,97,123,0.15) 40%, transparent 70%)' : 'transparent',
          opacity: lightOn ? 1 : 0,
          transition: 'opacity 400ms ease',
        }}
      />

      {/* Wax seal + pieces */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ zIndex: 5 }}>
        {/* Scattered pieces */}
        {PIECES.map((p, i) => (
          <div
            key={i}
            className="absolute w-6 h-6 rounded-full"
            style={{
              left: '50%',
              top: '50%',
              background: 'radial-gradient(circle at 30% 30%, #c76a7a, #8a3558)',
              boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.2)',
              transform: scattered
                ? `translate(calc(-50% + ${p.dx}px), calc(-50% + ${p.dy}px)) rotate(${p.rot}deg) scale(0.6)`
                : 'translate(-50%, -50%) rotate(0deg) scale(0)',
              opacity: scattered ? 0.8 : 0,
              transition: `transform 500ms cubic-bezier(0.3,0.8,0.3,1) ${p.delay}ms, opacity 300ms ease`,
            }}
          />
        ))}

        {/* Main seal */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full flex items-center justify-center"
          style={{
            background: 'radial-gradient(circle at 35% 35%, #c76a7a, #8a3558 60%, #6E2D44)',
            boxShadow: scattered ? 'none' : 'inset 0 2px 8px rgba(255,255,255,0.25), 0 4px 20px rgba(0,0,0,0.4)',
            opacity: scattered ? 0 : 1,
            transition: 'opacity 300ms ease',
          }}
        >
          <span
            className="font-serif text-4xl font-bold"
            style={{ color: 'rgba(255,255,255,0.9)', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
          >
            J
          </span>
        </div>

        {/* Crack lines (pseudo via divs) */}
        {[[45, 2, 30], [-30, 4, 25], [60, -20, 20]].map(([rot, x, len], i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `calc(50% + ${x}px)`,
              top: '50%',
              width: len,
              height: 2,
              background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.5))',
              transform: `translate(-50%, -50%) rotate(${rot}deg)`,
              opacity: cracked ? 1 : 0,
              transition: 'opacity 300ms ease',
            }}
          />
        ))}
      </div>

      {/* Overlay fade */}
      <div
        className="absolute inset-0 bg-black"
        style={{
          opacity: fading ? 0 : lightOn ? 0.3 : 1,
          transition: 'opacity 500ms ease',
        }}
      />
    </div>
  )
}
