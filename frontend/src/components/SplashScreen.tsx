import { useState, useEffect } from 'react'

type Phase = 'dark' | 'wick' | 'ignite' | 'glow' | 'reveal' | 'done'

const TIMINGS: Record<Phase, number> = {
  dark: 400,
  wick: 600,
  ignite: 1000,
  glow: 1200,
  reveal: 1200,
  done: 0,
}

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<Phase>('dark')

  useEffect(() => {
    const phases: Phase[] = ['dark', 'wick', 'ignite', 'glow', 'reveal', 'done']
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

  const phaseIdx = ['dark', 'wick', 'ignite', 'glow', 'reveal'].indexOf(phase)
  const flameVisible = phaseIdx >= 2
  const glowVisible = phaseIdx >= 3
  const revealing = phase === 'reveal'

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-1000"
      style={{ opacity: revealing ? 0 : 1, pointerEvents: revealing ? 'none' : 'all' }}
    >
      {/* Black background with radial glow cutout */}
      <div
        className="absolute inset-0 transition-all duration-[1200ms] ease-out"
        style={{
          background: glowVisible
            ? 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 8%, rgba(0,0,0,0.75) 20%, rgba(0,0,0,0.95) 40%, #000 60%)'
            : '#000',
        }}
      />

      {/* Warm ambient glow behind candle */}
      <div
        className="absolute rounded-full transition-all ease-out"
        style={{
          width: glowVisible ? '600px' : '0px',
          height: glowVisible ? '600px' : '0px',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -55%)',
          background: 'radial-gradient(circle, rgba(180,97,123,0.12) 0%, rgba(212,168,67,0.08) 40%, transparent 70%)',
          transitionDuration: '1500ms',
        }}
      />

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Candle SVG */}
        <svg
          width="120"
          height="200"
          viewBox="0 0 120 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-opacity duration-700"
          style={{ opacity: phaseIdx >= 1 ? 1 : 0 }}
        >
          <defs>
            <linearGradient id="sp-flame" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#923C5B" />
              <stop offset="35%" stopColor="#E9868B" />
              <stop offset="70%" stopColor="#F2E3E8" />
              <stop offset="100%" stopColor="#FFF8F0" />
            </linearGradient>
            <linearGradient id="sp-body" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#E4D5CF" stopOpacity="0.9" />
              <stop offset="40%" stopColor="#FBF6F3" />
              <stop offset="100%" stopColor="#D4C0B8" />
            </linearGradient>
            <radialGradient id="sp-glow" cx="50%" cy="20%" r="60%">
              <stop offset="0%" stopColor="#B4617B" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#B4617B" stopOpacity="0" />
            </radialGradient>
            <filter id="sp-flame-blur"><feGaussianBlur stdDeviation="2" /></filter>
            <filter id="sp-soft-glow">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Flame glow halo */}
          <circle
            cx="60" cy="55" r="40"
            fill="url(#sp-glow)"
            className="transition-opacity duration-700"
            style={{ opacity: flameVisible ? 1 : 0 }}
          >
            <animate attributeName="r" values="38;44;38" dur="2.5s" repeatCount="indefinite" />
          </circle>

          {/* Outer flame */}
          <g
            filter="url(#sp-flame-blur)"
            className="transition-all duration-700"
            style={{
              opacity: flameVisible ? 0.9 : 0,
              transform: flameVisible ? 'scale(1)' : 'scale(0.2)',
              transformOrigin: '60px 75px',
            }}
          >
            <path
              d="M60 28 C65 48,73 58,70 68 C68 74,64 76,60 76 C56 76,52 74,50 68 C47 58,55 48,60 28Z"
              fill="url(#sp-flame)"
              filter="url(#sp-soft-glow)"
            >
              <animate
                attributeName="d"
                values="M60 28 C65 48,73 58,70 68 C68 74,64 76,60 76 C56 76,52 74,50 68 C47 58,55 48,60 28Z;M60 24 C67 44,71 56,69 66 C67 73,63 75,60 75 C57 75,53 73,51 66 C49 56,53 44,60 24Z;M60 28 C65 48,73 58,70 68 C68 74,64 76,60 76 C56 76,52 74,50 68 C47 58,55 48,60 28Z"
                dur="1.4s"
                repeatCount="indefinite"
              />
            </path>
          </g>

          {/* Inner flame (bright core) */}
          <path
            d="M60 50 C62 58,65 62,64 67 C63 70,61 71,60 71 C59 71,57 70,56 67 C55 62,58 58,60 50Z"
            fill="#FFF8F0"
            className="transition-all duration-700"
            style={{
              opacity: flameVisible ? 0.85 : 0,
              transform: flameVisible ? 'scale(1)' : 'scale(0)',
              transformOrigin: '60px 68px',
            }}
          >
            <animate
              attributeName="d"
              values="M60 50 C62 58,65 62,64 67 C63 70,61 71,60 71 C59 71,57 70,56 67 C55 62,58 58,60 50Z;M60 48 C63 56,64 61,63 66 C62 69,61 70,60 70 C59 70,58 69,57 66 C56 61,57 56,60 48Z;M60 50 C62 58,65 62,64 67 C63 70,61 71,60 71 C59 71,57 70,56 67 C55 62,58 58,60 50Z"
              dur="0.9s"
              repeatCount="indefinite"
            />
          </path>

          {/* Wick */}
          <line x1="60" y1="72" x2="60" y2="84" stroke="#3a2a2a" strokeWidth="1.5" strokeLinecap="round" />

          {/* Candle body - glass jar */}
          <rect x="30" y="82" width="60" height="90" rx="5" fill="url(#sp-body)" />
          <rect x="27" y="80" width="66" height="94" rx="7" fill="none" stroke="#d4c0b8" strokeWidth="1" opacity="0.5" />
          {/* Highlight streak */}
          <rect x="33" y="85" width="10" height="78" rx="3" fill="white" opacity="0.15" />
          {/* Wax surface */}
          <ellipse cx="60" cy="84" rx="28" ry="4" fill="#FBF6F3" opacity="0.7" />

          {/* Shadow */}
          <ellipse
            cx="60" cy="180" rx="35" ry="4"
            fill="#B4617B"
            className="transition-opacity duration-1000"
            style={{ opacity: flameVisible ? 0.12 : 0.03 }}
          >
            <animate attributeName="opacity" values="0.08;0.15;0.08" dur="3s" repeatCount="indefinite" />
          </ellipse>
        </svg>

        {/* Brand name */}
        <h1
          className="mt-6 font-serif text-3xl md:text-4xl tracking-widest transition-all duration-700"
          style={{
            color: '#FBF6F3',
            opacity: glowVisible ? 1 : 0,
            transform: glowVisible ? 'translateY(0)' : 'translateY(12px)',
            textShadow: '0 0 30px rgba(180,97,123,0.4)',
          }}
        >
          Jaai
        </h1>

        {/* Tagline */}
        <p
          className="mt-2 text-sm tracking-[0.25em] uppercase transition-all duration-700 delay-200"
          style={{
            color: 'rgba(251,246,243,0.5)',
            opacity: glowVisible ? 1 : 0,
            transform: glowVisible ? 'translateY(0)' : 'translateY(8px)',
          }}
        >
          Illuminate Your Space
        </p>
      </div>
    </div>
  )
}
