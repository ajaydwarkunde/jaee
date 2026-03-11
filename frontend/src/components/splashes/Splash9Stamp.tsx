import { useState, useEffect } from 'react'

type Phase = 'stamp' | 'ripple' | 'cracks' | 'shatter' | 'done'

const FRAGMENTS = 36

export default function Splash9Stamp({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<Phase>('stamp')

  useEffect(() => {
    const phases: Phase[] = ['stamp', 'ripple', 'cracks', 'shatter', 'done']
    const timings = [800, 400, 600, 1200, 0]
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

  const cols = 6
  const rows = 6

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{
        background: '#000',
        opacity: phase === 'shatter' ? 0 : 1,
        transition: phase === 'shatter' ? 'opacity 800ms ease 400ms' : 'none',
        pointerEvents: phase === 'shatter' ? 'none' : 'all',
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
        }}
      >
        {Array.from({ length: FRAGMENTS }).map((_, i) => {
          const row = Math.floor(i / cols)
          const col = i % cols
          const tx = (col - cols / 2) * 55 + ((i * 7) % 30) - 15
          const ty = 80 + row * 35 + ((i * 11) % 50)
          const rot = ((i * 13) % 90) - 45
          return (
            <div
              key={i}
              className="bg-black"
              style={{
                transform: phase === 'shatter' ? `translate(${tx}px, ${ty}px) rotate(${rot}deg)` : 'none',
                opacity: phase === 'shatter' ? 0 : 1,
                transition: `transform 800ms cubic-bezier(0.5, 0.2, 0.3, 1) ${i * 25}ms, opacity 600ms ease ${i * 20}ms`,
              }}
            />
          )
        })}
      </div>

      {/* Stamp + J monogram - drops from above */}
      <div
        className="absolute flex items-center justify-center"
        style={{
          transform: phase === 'stamp' ? 'translateY(0) scale(1.05)' : 'translateY(-150px) scale(0.8)',
          transition: 'transform 600ms cubic-bezier(0.2, 0.8, 0.3, 1)',
        }}
      >
        <svg viewBox="0 0 120 120" width={140} height={140}>
          <defs>
            <linearGradient id="stamp-gold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F0D78C" />
              <stop offset="50%" stopColor="#D4A843" />
              <stop offset="100%" stopColor="#B8952E" />
            </linearGradient>
            <filter id="stamp-glow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <circle
            cx="60"
            cy="60"
            r="55"
            fill="none"
            stroke="url(#stamp-gold)"
            strokeWidth="3"
            filter="url(#stamp-glow)"
          />
          <text
            x="60"
            y="78"
            textAnchor="middle"
            className="font-serif"
            fill="url(#stamp-gold)"
            style={{ fontSize: 56, fontWeight: 600 }}
          >
            J
          </text>
        </svg>
      </div>

      {/* Impact ripple */}
      <div
        className="absolute rounded-full border-2 border-[#D4A843]"
        style={{
          width: 160,
          height: 160,
          opacity: phase === 'ripple' ? 0 : 0.5,
          transform: phase === 'ripple' ? 'scale(2.2)' : 'scale(1)',
          transition: phase === 'ripple' ? 'transform 400ms ease-out, opacity 400ms ease' : 'opacity 0ms',
        }}
      />

      {/* Cracks */}
      {[0, 45, 90, 135].map((angle, i) => (
        <div
          key={i}
          className="absolute w-px bg-gradient-to-b from-[#D4A843]/80 to-transparent"
          style={{
            height: 80,
            left: '50%',
            top: '50%',
            transform: `rotate(${angle}deg)`,
            opacity: phase === 'cracks' ? 1 : 0,
            transition: `opacity 300ms ease ${i * 80}ms`,
          }}
        />
      ))}
    </div>
  )
}
