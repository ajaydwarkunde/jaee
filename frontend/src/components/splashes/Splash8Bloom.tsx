import { useState, useEffect } from 'react'

type Phase = 'bud' | 'unfurl' | 'grow' | 'reveal' | 'done'

const PETALS = 8
const colors = ['#B4617B', '#E4D5CF', '#D4A843', '#F2E3E8', '#FBF6F3', '#B4617B', '#E4D5CF', '#D4A843']

export default function Splash8Bloom({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<Phase>('bud')

  useEffect(() => {
    const phases: Phase[] = ['bud', 'unfurl', 'grow', 'reveal', 'done']
    const timings = [600, 1800, 1000, 800, 0]
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
      <svg className="absolute" viewBox="-200 -200 400 400" style={{ width: '120vmax', height: '120vmax' }}>
        <defs>
          {colors.map((c, i) => (
            <linearGradient key={i} id={`bloom-g${i}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={c} stopOpacity="0.95" />
              <stop offset="100%" stopColor={c} stopOpacity="0.7" />
            </linearGradient>
          ))}
        </defs>
        {Array.from({ length: PETALS }).map((_, i) => {
          const angle = (i / PETALS) * 360
          const unfurlDeg = phase === 'bud' ? -20 : phase === 'unfurl' ? 50 : 70
          const scale = phase === 'grow' ? 2.8 : phase === 'unfurl' ? 1.1 : 0.5
          return (
            <ellipse
              key={i}
              cx={0}
              cy={-30}
              rx={35}
              ry={70}
              fill={`url(#bloom-g${i})`}
              style={{
                transform: `rotate(${angle}deg) rotate(${unfurlDeg}deg) scaleY(${scale})`,
                transformOrigin: '0 70px',
                opacity: phase === 'bud' ? 1 : 0.95,
                transition: `transform 600ms cubic-bezier(0.3, 0.8, 0.2, 1) ${i * 120}ms`,
              }}
            />
          )
        })}
      </svg>

      <h1
        className="font-serif text-4xl md:text-5xl tracking-widest absolute z-10"
        style={{
          color: '#FBF6F3',
          textShadow: '0 0 30px rgba(180,97,123,0.5)',
          opacity: phase === 'unfurl' || phase === 'grow' ? 1 : 0,
          transition: 'opacity 500ms ease 400ms',
        }}
      >
        Jaai
      </h1>
    </div>
  )
}
