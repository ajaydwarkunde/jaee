import { useState, useEffect } from 'react'

type Phase = 'stitch' | 'border' | 'fold' | 'done'

export default function Splash10Thread({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<Phase>('stitch')

  useEffect(() => {
    const phases: Phase[] = ['stitch', 'border', 'fold', 'done']
    const timings = [2200, 1200, 800, 0]
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
        background: '#000',
        opacity: phase === 'fold' ? 0 : 1,
        transition: 'opacity 800ms ease',
        pointerEvents: phase === 'fold' ? 'none' : 'all',
      }}
    >
      <svg viewBox="0 0 220 100" className="w-72 md:w-80" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="thread-gold" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#B8952E" />
            <stop offset="50%" stopColor="#D4A843" />
            <stop offset="100%" stopColor="#F0D78C" />
          </linearGradient>
        </defs>

        {/* Decorative border frame - stitched dashes */}
        <rect
          x="15"
          y="15"
          width="190"
          height="70"
          fill="none"
          stroke="url(#thread-gold)"
          strokeWidth="1.5"
          strokeDasharray="6 6"
          style={{
            strokeDashoffset: phase === 'border' ? 0 : 600,
            opacity: phase === 'border' ? 0.8 : 0,
            transition: `stroke-dashoffset 1200ms ease-out, opacity 400ms ease`,
          }}
        />

        {/* "Jaai" as stroked text - thread stitch effect */}
        <text
          x="110"
          y="58"
          textAnchor="middle"
          className="font-serif"
          fill="none"
          stroke="url(#thread-gold)"
          strokeWidth="2"
          strokeLinejoin="round"
          style={{
            fontSize: 42,
            letterSpacing: '0.2em',
            strokeDasharray: 380,
            strokeDashoffset: phase === 'stitch' ? 0 : 380,
            transition: 'stroke-dashoffset 2s ease-out',
          }}
        >
          Jaai
        </text>
      </svg>
    </div>
  )
}
