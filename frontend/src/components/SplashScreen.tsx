import { useState, useEffect } from 'react'

type Phase = 'dark' | 'appear' | 'open' | 'glow' | 'reveal' | 'done'

const TIMINGS: Record<Phase, number> = {
  dark: 500,
  appear: 800,
  open: 1200,
  glow: 1400,
  reveal: 1200,
  done: 0,
}

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<Phase>('dark')

  useEffect(() => {
    const phases: Phase[] = ['dark', 'appear', 'open', 'glow', 'reveal', 'done']
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

  const phaseIdx = ['dark', 'appear', 'open', 'glow', 'reveal'].indexOf(phase)
  const boxVisible = phaseIdx >= 1
  const lidOpen = phaseIdx >= 2
  const glowing = phaseIdx >= 3
  const revealing = phase === 'reveal'

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-1000"
      style={{ opacity: revealing ? 0 : 1, pointerEvents: revealing ? 'none' : 'all' }}
    >
      {/* Black background with radial glow */}
      <div
        className="absolute inset-0 transition-all duration-[1400ms] ease-out"
        style={{
          background: glowing
            ? 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 10%, rgba(0,0,0,0.8) 25%, #000 55%)'
            : '#000',
        }}
      />

      {/* Warm ambient glow */}
      <div
        className="absolute rounded-full transition-all ease-out"
        style={{
          width: glowing ? '700px' : '0px',
          height: glowing ? '700px' : '0px',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(212,168,67,0.15) 0%, rgba(180,97,123,0.08) 40%, transparent 70%)',
          transitionDuration: '1600ms',
        }}
      />

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Gift Hamper SVG */}
        <svg
          width="220"
          height="220"
          viewBox="0 0 240 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-opacity duration-700"
          style={{ opacity: boxVisible ? 1 : 0 }}
        >
          <defs>
            <linearGradient id="sp-box" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#B4617B" />
              <stop offset="50%" stopColor="#923C5B" />
              <stop offset="100%" stopColor="#6E2C44" />
            </linearGradient>
            <linearGradient id="sp-box-front" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C06A85" />
              <stop offset="100%" stopColor="#8A3558" />
            </linearGradient>
            <linearGradient id="sp-lid" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D47A93" />
              <stop offset="50%" stopColor="#B4617B" />
              <stop offset="100%" stopColor="#923C5B" />
            </linearGradient>
            <linearGradient id="sp-ribbon" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#C4953A" />
              <stop offset="30%" stopColor="#F0D78C" />
              <stop offset="50%" stopColor="#D4A843" />
              <stop offset="70%" stopColor="#F0D78C" />
              <stop offset="100%" stopColor="#C4953A" />
            </linearGradient>
            <linearGradient id="sp-ribbon-v" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C4953A" />
              <stop offset="40%" stopColor="#F0D78C" />
              <stop offset="60%" stopColor="#D4A843" />
              <stop offset="100%" stopColor="#C4953A" />
            </linearGradient>
            <radialGradient id="sp-inner-glow" cx="50%" cy="30%" r="60%">
              <stop offset="0%" stopColor="#FFF0D4" stopOpacity="0.9" />
              <stop offset="40%" stopColor="#F0D78C" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#D4A843" stopOpacity="0" />
            </radialGradient>
            <filter id="sp-glow-filter">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="sp-soft"><feGaussianBlur stdDeviation="3" /></filter>
          </defs>

          {/* Floor shadow */}
          <ellipse
            cx="120" cy="225" rx="70" ry="8"
            fill="#B4617B"
            className="transition-opacity duration-1000"
            style={{ opacity: boxVisible ? 0.12 : 0 }}
          />

          {/* Inner glow from open box */}
          <g
            className="transition-all duration-[1000ms] ease-out"
            style={{
              opacity: lidOpen ? 1 : 0,
              transform: lidOpen ? 'scale(1)' : 'scale(0.3)',
              transformOrigin: '120px 140px',
            }}
          >
            <ellipse cx="120" cy="120" rx="60" ry="50" fill="url(#sp-inner-glow)" filter="url(#sp-glow-filter)" />
          </g>

          {/* Floating sparkles from open box */}
          {[
            { cx: 95, delay: '0s', dur: '2s', y1: 110, y2: 40 },
            { cx: 120, delay: '0.3s', dur: '1.8s', y1: 100, y2: 25 },
            { cx: 145, delay: '0.15s', dur: '2.2s', y1: 115, y2: 45 },
            { cx: 108, delay: '0.5s', dur: '1.6s', y1: 105, y2: 30 },
            { cx: 135, delay: '0.4s', dur: '2s', y1: 108, y2: 35 },
          ].map((s, i) => (
            <circle
              key={i}
              cx={s.cx}
              r={i % 2 === 0 ? 2 : 1.5}
              fill="#F0D78C"
              className="transition-opacity duration-700"
              style={{ opacity: lidOpen ? 0.8 : 0 }}
            >
              <animate attributeName="cy" values={`${s.y1};${s.y2};${s.y1}`} dur={s.dur} begin={s.delay} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;0.9;0.6;0" dur={s.dur} begin={s.delay} repeatCount="indefinite" />
            </circle>
          ))}

          {/* Small floating items silhouettes */}
          {/* Mini candle */}
          <g
            className="transition-all duration-[800ms] ease-out"
            style={{
              opacity: lidOpen ? 0.7 : 0,
              transform: lidOpen ? 'translateY(0)' : 'translateY(30px)',
              transitionDelay: '200ms',
            }}
          >
            <rect x="86" y="68" width="10" height="22" rx="2" fill="#FBF6F3" opacity="0.6" />
            <ellipse cx="91" cy="66" rx="3" ry="4" fill="#F0D78C" opacity="0.7">
              <animate attributeName="ry" values="3.5;4.5;3.5" dur="1.2s" repeatCount="indefinite" />
            </ellipse>
          </g>
          {/* Mini flower */}
          <g
            className="transition-all duration-[800ms] ease-out"
            style={{
              opacity: lidOpen ? 0.6 : 0,
              transform: lidOpen ? 'translateY(0)' : 'translateY(30px)',
              transitionDelay: '350ms',
            }}
          >
            <circle cx="142" cy="75" r="6" fill="#E9868B" opacity="0.5" />
            <circle cx="142" cy="75" r="3" fill="#F0D78C" opacity="0.6" />
            <line x1="142" y1="81" x2="142" y2="95" stroke="#6B9E76" strokeWidth="1.5" opacity="0.4" />
          </g>
          {/* Mini star */}
          <g
            className="transition-all duration-[800ms] ease-out"
            style={{
              opacity: lidOpen ? 0.65 : 0,
              transform: lidOpen ? 'translateY(0)' : 'translateY(30px)',
              transitionDelay: '500ms',
            }}
          >
            <path d="M120 55 l2.5 5 5.5 0.8 -4 3.9 0.9 5.5 -4.9-2.6 -4.9 2.6 0.9-5.5 -4-3.9 5.5-0.8Z" fill="#F0D78C" opacity="0.6">
              <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2s" repeatCount="indefinite" />
            </path>
          </g>

          {/* Box body */}
          <g className="transition-opacity duration-500" style={{ opacity: boxVisible ? 1 : 0 }}>
            {/* Box left face */}
            <path d="M40 130 L40 210 L120 220 L120 140 Z" fill="url(#sp-box)" />
            {/* Box right face */}
            <path d="M120 140 L120 220 L200 210 L200 130 Z" fill="url(#sp-box-front)" />
            {/* Box top edge */}
            <path d="M40 130 L120 140 L200 130 L120 120 Z" fill="#C87A90" opacity="0.5" />

            {/* Ribbon vertical on front-left */}
            <path d="M75 130 L75 213 L87 214.5 L87 131 Z" fill="url(#sp-ribbon-v)" opacity="0.75" />
            {/* Ribbon vertical on front-right */}
            <path d="M153 131 L153 214.5 L165 213 L165 130 Z" fill="url(#sp-ribbon-v)" opacity="0.75" />
            {/* Ribbon horizontal band */}
            <path d="M40 162 L120 172 L200 162 L200 150 L120 160 L40 150 Z" fill="url(#sp-ribbon)" opacity="0.7" />

            {/* Box highlight */}
            <path d="M45 135 L45 205 L55 207 L55 137 Z" fill="white" opacity="0.06" />
          </g>

          {/* Lid — animates upward when opening */}
          <g
            className="transition-all ease-out"
            style={{
              transform: lidOpen ? 'translateY(-45px) rotateX(15deg)' : 'translateY(0)',
              transformOrigin: '120px 125px',
              transitionDuration: '1000ms',
            }}
          >
            {/* Lid top */}
            <path d="M35 118 L120 128 L205 118 L120 108 Z" fill="url(#sp-lid)" />
            {/* Lid front-left */}
            <path d="M35 118 L35 130 L120 140 L120 128 Z" fill="#A85570" />
            {/* Lid front-right */}
            <path d="M120 128 L120 140 L205 130 L205 118 Z" fill="#924B64" />

            {/* Lid ribbon horizontal */}
            <path d="M35 122 L120 132 L205 122 L205 118 L120 128 L35 118 Z" fill="url(#sp-ribbon)" opacity="0.6" />

            {/* Bow — sits on top of lid */}
            <g>
              {/* Left loop */}
              <ellipse cx="107" cy="102" rx="16" ry="10" fill="#D4A843" opacity="0.8">
                <animate attributeName="ry" values="9;11;9" dur="2.5s" repeatCount="indefinite" />
              </ellipse>
              {/* Right loop */}
              <ellipse cx="133" cy="102" rx="16" ry="10" fill="#F0D78C" opacity="0.7">
                <animate attributeName="ry" values="11;9;11" dur="2.5s" repeatCount="indefinite" />
              </ellipse>
              {/* Center knot */}
              <circle cx="120" cy="104" r="5" fill="#C4953A" />
              <circle cx="120" cy="104" r="3" fill="#F0D78C" opacity="0.5" />
              {/* Ribbon tails */}
              <path d="M115 108 Q108 118,100 115" stroke="#D4A843" strokeWidth="2.5" fill="none" opacity="0.6" strokeLinecap="round" />
              <path d="M125 108 Q132 118,140 115" stroke="#D4A843" strokeWidth="2.5" fill="none" opacity="0.6" strokeLinecap="round" />
            </g>
          </g>
        </svg>

        {/* Brand name */}
        <h1
          className="mt-4 font-serif text-3xl md:text-4xl tracking-widest transition-all duration-700"
          style={{
            color: '#FBF6F3',
            opacity: glowing ? 1 : 0,
            transform: glowing ? 'translateY(0)' : 'translateY(12px)',
            textShadow: '0 0 30px rgba(212,168,67,0.4)',
          }}
        >
          Jaai
        </h1>

        {/* Tagline */}
        <p
          className="mt-2 text-sm tracking-[0.25em] uppercase transition-all duration-700 delay-200"
          style={{
            color: 'rgba(251,246,243,0.5)',
            opacity: glowing ? 1 : 0,
            transform: glowing ? 'translateY(0)' : 'translateY(8px)',
          }}
        >
          Gifts Crafted with Love
        </p>
      </div>
    </div>
  )
}
