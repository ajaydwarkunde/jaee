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
        {/* Candle SVG — tall sleek vessel */}
        <svg
          width="90"
          height="240"
          viewBox="0 0 90 260"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-opacity duration-700"
          style={{ opacity: phaseIdx >= 1 ? 1 : 0 }}
        >
          <defs>
            <linearGradient id="sp-flame" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#923C5B" />
              <stop offset="30%" stopColor="#D4796A" />
              <stop offset="60%" stopColor="#E9B88B" />
              <stop offset="85%" stopColor="#FFF0D4" />
              <stop offset="100%" stopColor="#FFFEFA" />
            </linearGradient>
            <linearGradient id="sp-vessel" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#1a1216" stopOpacity="0.7" />
              <stop offset="15%" stopColor="#2a2025" stopOpacity="0.4" />
              <stop offset="40%" stopColor="#3a3035" stopOpacity="0.15" />
              <stop offset="60%" stopColor="#2a2025" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#1a1216" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="sp-wax" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#D4C0B8" />
              <stop offset="30%" stopColor="#F2E3E8" />
              <stop offset="70%" stopColor="#FBF6F3" />
              <stop offset="100%" stopColor="#E4D5CF" />
            </linearGradient>
            <linearGradient id="sp-rim" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#8B7355" />
              <stop offset="30%" stopColor="#D4A843" />
              <stop offset="60%" stopColor="#F0D78C" />
              <stop offset="100%" stopColor="#8B7355" />
            </linearGradient>
            <radialGradient id="sp-glow" cx="50%" cy="15%" r="50%">
              <stop offset="0%" stopColor="#E9B88B" stopOpacity="0.35" />
              <stop offset="50%" stopColor="#B4617B" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#B4617B" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="sp-wax-glow" cx="50%" cy="0%" r="80%">
              <stop offset="0%" stopColor="#FFF0D4" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#FBF6F3" stopOpacity="0" />
            </radialGradient>
            <filter id="sp-flame-blur"><feGaussianBlur stdDeviation="1.8" /></filter>
            <filter id="sp-soft-glow">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <clipPath id="sp-vessel-clip">
              <path d="M25 88 Q24 90 24 95 L24 240 Q24 248 32 248 L58 248 Q66 248 66 240 L66 95 Q66 90 65 88 Z" />
            </clipPath>
          </defs>

          {/* Flame glow halo */}
          <circle
            cx="45" cy="45" r="40"
            fill="url(#sp-glow)"
            className="transition-opacity duration-700"
            style={{ opacity: flameVisible ? 1 : 0 }}
          >
            <animate attributeName="r" values="38;46;38" dur="2.5s" repeatCount="indefinite" />
          </circle>

          {/* Outer flame — tall tapered shape */}
          <g
            filter="url(#sp-flame-blur)"
            className="transition-all duration-700"
            style={{
              opacity: flameVisible ? 0.9 : 0,
              transform: flameVisible ? 'scale(1)' : 'scale(0.15)',
              transformOrigin: '45px 72px',
            }}
          >
            <path
              d="M45 18 C48 38,55 52,53 62 C52 68,49 72,45 72 C41 72,38 68,37 62 C35 52,42 38,45 18Z"
              fill="url(#sp-flame)"
              filter="url(#sp-soft-glow)"
            >
              <animate
                attributeName="d"
                values="M45 18 C48 38,55 52,53 62 C52 68,49 72,45 72 C41 72,38 68,37 62 C35 52,42 38,45 18Z;M45 14 C49 36,53 50,52 61 C51 67,48 71,45 71 C42 71,39 67,38 61 C37 50,41 36,45 14Z;M45 18 C48 38,55 52,53 62 C52 68,49 72,45 72 C41 72,38 68,37 62 C35 52,42 38,45 18Z"
                dur="1.4s"
                repeatCount="indefinite"
              />
            </path>
          </g>

          {/* Inner flame core */}
          <path
            d="M45 44 C47 52,49 58,48 64 C47.5 67,46 68,45 68 C44 68,42.5 67,42 64 C41 58,43 52,45 44Z"
            fill="#FFFEFA"
            className="transition-all duration-700"
            style={{
              opacity: flameVisible ? 0.9 : 0,
              transform: flameVisible ? 'scale(1)' : 'scale(0)',
              transformOrigin: '45px 64px',
            }}
          >
            <animate
              attributeName="d"
              values="M45 44 C47 52,49 58,48 64 C47.5 67,46 68,45 68 C44 68,42.5 67,42 64 C41 58,43 52,45 44Z;M45 42 C47.5 50,48 57,47 63 C46.5 66,46 67,45 67 C44 67,43.5 66,43 63 C42 57,42.5 50,45 42Z;M45 44 C47 52,49 58,48 64 C47.5 67,46 68,45 68 C44 68,42.5 67,42 64 C41 58,43 52,45 44Z"
              dur="0.9s"
              repeatCount="indefinite"
            />
          </path>

          {/* Wick — thin, slightly curved */}
          <path d="M45 68 Q45.5 74,45 82" stroke="#2a2025" strokeWidth="1" strokeLinecap="round" fill="none" />

          {/* Vessel body — tall slim glass */}
          <path
            d="M25 88 Q24 90 24 95 L24 240 Q24 248 32 248 L58 248 Q66 248 66 240 L66 95 Q66 90 65 88 Z"
            fill="url(#sp-vessel)"
          />
          {/* Glass edge highlight left */}
          <path
            d="M27 92 L27 242 Q27 246 32 246"
            stroke="rgba(251,246,243,0.08)"
            strokeWidth="1.5"
            fill="none"
          />
          {/* Glass reflection streak */}
          <rect x="29" y="95" width="5" height="140" rx="2.5" fill="white" opacity="0.06" />
          {/* Second subtle reflection */}
          <rect x="56" y="100" width="3" height="120" rx="1.5" fill="white" opacity="0.03" />

          {/* Wax fill inside vessel */}
          <g clipPath="url(#sp-vessel-clip)">
            <rect x="24" y="84" width="42" height="170" fill="url(#sp-wax)" opacity="0.85" />
            {/* Wax highlight */}
            <rect x="28" y="86" width="8" height="160" rx="4" fill="white" opacity="0.12" />
            {/* Warm glow on wax from flame */}
            <rect
              x="24" y="84" width="42" height="40"
              fill="url(#sp-wax-glow)"
              className="transition-opacity duration-700"
              style={{ opacity: flameVisible ? 1 : 0 }}
            />
          </g>

          {/* Wax pool surface — slight melt pool */}
          <ellipse cx="45" cy="86" rx="20" ry="3.5" fill="#FBF6F3" opacity="0.8" />
          <ellipse
            cx="45" cy="86" rx="12" ry="2"
            fill="#FFF0D4"
            className="transition-opacity duration-700"
            style={{ opacity: flameVisible ? 0.5 : 0 }}
          >
            <animate attributeName="rx" values="11;13;11" dur="3s" repeatCount="indefinite" />
          </ellipse>

          {/* Gold rim at top */}
          <ellipse cx="45" cy="88" rx="21" ry="3" fill="none" stroke="url(#sp-rim)" strokeWidth="0.8" opacity="0.6" />

          {/* Soft reflection on floor */}
          <ellipse
            cx="45" cy="255" rx="25" ry="3"
            fill="#B4617B"
            className="transition-opacity duration-1000"
            style={{ opacity: flameVisible ? 0.1 : 0.02 }}
          >
            <animate attributeName="opacity" values="0.06;0.12;0.06" dur="3s" repeatCount="indefinite" />
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
