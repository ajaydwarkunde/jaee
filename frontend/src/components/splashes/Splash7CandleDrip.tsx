import { useState, useEffect } from 'react'

type Phase = 'drip' | 'logo' | 'melt' | 'done'

const DRIPS = 7

export default function Splash7CandleDrip({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<Phase>('drip')

  useEffect(() => {
    const phases: Phase[] = ['drip', 'logo', 'melt', 'done']
    const timings = [2500, 1200, 1000, 0]
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
      className="fixed inset-0 z-[100] overflow-hidden"
      style={{
        background: '#B4617B',
        opacity: phase === 'melt' ? 0 : 1,
        transition: 'opacity 1s ease',
        pointerEvents: phase === 'melt' ? 'none' : 'all',
      }}
    >
      {Array.from({ length: DRIPS }).map((_, i) => (
        <div
          key={i}
          className="absolute top-0"
          style={{
            left: `${15 + (i / (DRIPS - 1)) * 70}%`,
            width: 12,
            height: phase === 'drip' ? '100vh' : 0,
            background: '#FBF6F3',
            borderRadius: '0 0 8px 8px',
            transformOrigin: 'top center',
            transition: `height 800ms cubic-bezier(0.3, 0.8, 0.2, 1) ${i * 220}ms`,
            boxShadow: 'inset 0 0 20px rgba(255,255,255,0.1)',
          }}
        />
      ))}

      {/* Logo embossed in last patch */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          opacity: phase === 'logo' ? 1 : 0,
          transition: phase === 'logo' ? 'opacity 600ms ease' : 'opacity 200ms ease',
        }}
      >
        <h1
          className="font-serif text-5xl tracking-widest"
          style={{
            color: '#2D2D2D',
            textShadow: '2px 2px 0 rgba(255,255,255,0.3), -1px -1px 0 rgba(0,0,0,0.2)',
          }}
        >
          Jaai
        </h1>
      </div>
    </div>
  )
}
