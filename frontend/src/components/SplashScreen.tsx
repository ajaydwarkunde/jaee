import { useState, useEffect } from 'react'

const ITEMS = [
  {
    label: 'Candle',
    dy: -110, dx: -60, delay: 0,
    path: 'M12 22v-4m0-4V6m0 0c-1.5 0-3 1.5-3 4h6c0-2.5-1.5-4-3-4zm0 0V3m-1 3h2M9 18h6v4H9v-4z',
  },
  {
    label: 'Bloom',
    dy: -135, dx: 0, delay: 120,
    path: 'M12 22V12m0 0c-2-2-5-2-6 0s1 5 3 5m3-5c2-2 5-2 6 0s-1 5-3 5m-3-5c0-3-2-6 0-8 2 2 0 5 0 8z',
  },
  {
    label: 'Scent',
    dy: -115, dx: 60, delay: 60,
    path: 'M10 22h4V10a2 2 0 00-4 0v12zm-1-12h6m-5-3c0-1 .5-2 2-3.5C13.5 5 14 6 14 7m-6 3h8a1 1 0 001-1V8a1 1 0 00-1-1H8a1 1 0 00-1 1v1a1 1 0 001 1z',
  },
  {
    label: 'Soap',
    dy: -95, dx: -90, delay: 180,
    path: 'M5 12a7 7 0 0114 0v2a3 3 0 01-3 3H8a3 3 0 01-3-3v-2zm3-4c0-2 1.5-3.5 4-3.5S16 6 16 8m-7 6h6',
  },
  {
    label: 'Gift',
    dy: -100, dx: 90, delay: 240,
    path: 'M4 14h16v7a1 1 0 01-1 1H5a1 1 0 01-1-1v-7zm0 0l1-4h14l1 4M12 10v12m-4-8c-2-2-2-4 0-5s4 1 4 3m0-3c0-2 2-5 4-3s2 3 0 5',
  },
]

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 1400),
      setTimeout(() => setPhase(3), 2600),
      setTimeout(() => setPhase(4), 4000),
      setTimeout(() => setPhase(5), 5000),
      setTimeout(() => onComplete(), 5800),
    ]
    return () => timers.forEach(clearTimeout)
  }, [onComplete])

  if (phase > 5) return null

  return (
    <div className="fixed inset-0 z-[100]" style={{ pointerEvents: phase >= 5 ? 'none' : 'all' }}>
      {/* Base */}
      <div
        className="absolute inset-0"
        style={{
          background: '#0a0a0a',
          opacity: phase >= 5 ? 0 : 1,
          transition: 'opacity 800ms cubic-bezier(0.4, 0, 0, 1)',
        }}
      />

      {/* Subtle film grain */}
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.04 }}>
        <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" /></filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>

      {/* Warm ambient glow behind box */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 50% 40% at 50% 55%, rgba(212,168,67,0.06) 0%, transparent 100%)',
          opacity: phase >= 2 ? 1 : 0,
          transition: 'opacity 1200ms ease',
        }}
      />

      {/* Stage */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative" style={{ width: 280, height: 320 }}>

          {/* Gift box — elegant line art */}
          <svg
            viewBox="0 0 200 160"
            fill="none"
            className="absolute"
            style={{
              width: 200,
              bottom: 20,
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          >
            <defs>
              <linearGradient id="g-gold" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#D4A843" />
                <stop offset="100%" stopColor="#F0D78C" />
              </linearGradient>
              <linearGradient id="g-rose" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#B4617B" />
                <stop offset="100%" stopColor="#D4839A" />
              </linearGradient>
            </defs>

            {/* Box body */}
            <rect
              x="30" y="65" width="140" height="85" rx="3"
              stroke="url(#g-rose)"
              strokeWidth="1.2"
              strokeDasharray={450}
              strokeDashoffset={phase >= 1 ? 0 : 450}
              style={{ transition: 'stroke-dashoffset 1000ms cubic-bezier(0.4, 0, 0, 1)' }}
              opacity="0.7"
            />

            {/* Ribbon vertical */}
            <line
              x1="100" y1="65" x2="100" y2="150"
              stroke="url(#g-gold)" strokeWidth="0.8"
              opacity={phase >= 1 ? 0.5 : 0}
              style={{ transition: 'opacity 600ms ease 400ms' }}
            />

            {/* Ribbon horizontal */}
            <line
              x1="30" y1="105" x2="170" y2="105"
              stroke="url(#g-gold)" strokeWidth="0.8"
              opacity={phase >= 1 ? 0.5 : 0}
              style={{ transition: 'opacity 600ms ease 600ms' }}
            />

            {/* Lid */}
            <g
              style={{
                transform: phase >= 2 ? 'translateY(-30px)' : 'translateY(0)',
                opacity: phase >= 2 ? (phase >= 4 ? 0 : 0.8) : 1,
                transition: 'transform 1000ms cubic-bezier(0.4, 0, 0, 1), opacity 800ms ease',
                transformOrigin: '100px 55px',
              }}
            >
              <rect
                x="25" y="50" width="150" height="20" rx="2"
                stroke="url(#g-rose)" strokeWidth="1.2"
                strokeDasharray={340}
                strokeDashoffset={phase >= 1 ? 0 : 340}
                style={{ transition: 'stroke-dashoffset 1000ms cubic-bezier(0.4, 0, 0, 1) 200ms' }}
                opacity="0.7"
              />
              {/* Bow */}
              <path
                d="M88 50 Q80 38 88 34 Q96 30 100 42 Q104 30 112 34 Q120 38 112 50"
                stroke="url(#g-gold)" strokeWidth="1" fill="none"
                opacity={phase >= 1 ? 0.6 : 0}
                style={{ transition: 'opacity 600ms ease 800ms' }}
              />
              <circle cx="100" cy="46" r="2.5" fill="#D4A843" opacity={phase >= 1 ? 0.5 : 0} style={{ transition: 'opacity 400ms ease 900ms' }} />
            </g>

            {/* Glow from opening */}
            <rect
              x="35" y="60" width="130" height="6" rx="3"
              fill="#D4A843"
              opacity={phase >= 2 && phase < 5 ? 0.15 : 0}
              style={{ transition: 'opacity 800ms ease', filter: 'blur(6px)' }}
            />
          </svg>

          {/* Items floating up — line art icons */}
          {ITEMS.map((item, i) => (
            <div
              key={i}
              className="absolute flex flex-col items-center"
              style={{
                left: '50%',
                bottom: 100,
                transform: phase >= 3
                  ? `translate(calc(-50% + ${item.dx}px), ${item.dy}px)`
                  : 'translate(-50%, 0px)',
                opacity: phase >= 3 ? (phase >= 4 ? 0 : 1) : 0,
                transition: `transform 1000ms cubic-bezier(0.4, 0, 0, 1) ${item.delay}ms, opacity ${phase >= 4 ? '600ms' : '800ms'} ease ${phase >= 4 ? '0ms' : `${item.delay}ms`}`,
              }}
            >
              <div
                className="flex items-center justify-center"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'rgba(212,168,67,0.06)',
                  border: '1px solid rgba(212,168,67,0.15)',
                }}
              >
                <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="#D4A843" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}>
                  <path d={item.path} />
                </svg>
              </div>
              <span
                className="mt-2 text-[9px] tracking-[0.2em] uppercase"
                style={{
                  color: 'rgba(228,213,207,0.4)',
                  opacity: phase >= 3 && phase < 4 ? 1 : 0,
                  transition: `opacity 600ms ease ${item.delay + 400}ms`,
                }}
              >
                {item.label}
              </span>
            </div>
          ))}

          {/* Brand */}
          <div
            className="absolute w-full text-center"
            style={{ bottom: -20 }}
          >
            <h1
              className="font-serif tracking-[0.35em] text-3xl md:text-4xl"
              style={{
                color: '#FBF6F3',
                opacity: phase >= 4 ? 1 : 0,
                transform: phase >= 4 ? 'translateY(0)' : 'translateY(8px)',
                transition: 'opacity 800ms cubic-bezier(0.4,0,0,1), transform 800ms cubic-bezier(0.4,0,0,1)',
              }}
            >
              Jaai
            </h1>
            <div className="flex items-center justify-center gap-3 mt-3">
              <div
                className="h-px"
                style={{
                  width: phase >= 4 ? 24 : 0,
                  background: 'rgba(212,168,67,0.3)',
                  transition: 'width 600ms ease 200ms',
                }}
              />
              <p
                className="text-[9px] tracking-[0.4em] uppercase"
                style={{
                  color: 'rgba(212,168,67,0.4)',
                  opacity: phase >= 4 ? 1 : 0,
                  transition: 'opacity 600ms ease 300ms',
                }}
              >
                Gifts Crafted with Love
              </p>
              <div
                className="h-px"
                style={{
                  width: phase >= 4 ? 24 : 0,
                  background: 'rgba(212,168,67,0.3)',
                  transition: 'width 600ms ease 200ms',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Final fade to cream */}
      <div
        className="absolute inset-0 bg-[#FBF6F3]"
        style={{
          opacity: phase >= 5 ? 1 : 0,
          transition: 'opacity 700ms cubic-bezier(0.4, 0, 0, 1)',
        }}
      />
    </div>
  )
}
