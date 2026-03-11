import { useState, useEffect } from 'react'

type Phase = 'idle' | 'shake' | 'burst' | 'items' | 'brand' | 'fade' | 'done'

const TIMINGS: Record<Phase, number> = {
  idle: 300,
  shake: 600,
  burst: 800,
  items: 1000,
  brand: 600,
  fade: 400,
  done: 0,
}

const BURST_ITEMS = [
  { type: 'candle', angle: 0, delay: 0 },
  { type: 'flower', angle: 45, delay: 40 },
  { type: 'heart', angle: 90, delay: 80 },
  { type: 'star', angle: 135, delay: 30 },
  { type: 'candle', angle: 180, delay: 60 },
  { type: 'flower', angle: 225, delay: 100 },
  { type: 'heart', angle: 270, delay: 20 },
  { type: 'star', angle: 315, delay: 70 },
  { type: 'flower', angle: 30, delay: 50 },
  { type: 'heart', angle: 150, delay: 90 },
  { type: 'star', angle: 210, delay: 40 },
  { type: 'candle', angle: 300, delay: 110 },
]

function BurstIcon({ type }: { type: string }) {
  const size = 28
  const stroke = '#D4A843'
  const fill = type === 'heart' ? '#B4617B' : type === 'flower' ? '#B4617B' : '#D4A843'
  switch (type) {
    case 'candle':
      return (
        <svg viewBox="0 0 24 24" width={size} height={size}>
          <rect x="10" y="4" width="4" height="12" rx="1" fill={stroke} opacity={0.9} />
          <line x1="12" y1="2" x2="12" y2="4" stroke={stroke} strokeWidth="1.5" />
          <ellipse cx="12" cy="2" rx="2" ry="1" fill="#F0D78C" />
          <rect x="9" y="16" width="6" height="2" rx="0.5" fill="#E4D5CF" />
        </svg>
      )
    case 'flower':
      return (
        <svg viewBox="0 0 24 24" width={size} height={size}>
          <circle cx="12" cy="12" r="3" fill={fill} />
          <circle cx="12" cy="6" r="2" fill={fill} opacity={0.95} />
          <circle cx="18" cy="12" r="2" fill={fill} opacity={0.95} />
          <circle cx="12" cy="18" r="2" fill={fill} opacity={0.95} />
          <circle cx="6" cy="12" r="2" fill={fill} opacity={0.95} />
        </svg>
      )
    case 'heart':
      return (
        <svg viewBox="0 0 24 24" width={size} height={size}>
          <path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            fill={fill}
            transform="scale(0.45) translate(8, 5)"
          />
        </svg>
      )
    case 'star':
      return (
        <svg viewBox="0 0 24 24" width={size} height={size}>
          <path
            d="M12 2l2.4 7.4H22l-6 4.6 2.3 7-6.3-4.6-6.3 4.6 2.3-7-6-4.6h7.6L12 2z"
            fill={stroke}
          />
        </svg>
      )
    default:
      return <div className="w-6 h-6 rounded-full bg-[#D4A843]" />
  }
}

export default function Splash13BoxBurst({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<Phase>('idle')

  useEffect(() => {
    const phases: Phase[] = ['idle', 'shake', 'burst', 'items', 'brand', 'fade', 'done']
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

  const shaking = phase === 'shake'
  const burst = phase === 'burst' || phase === 'items' || phase === 'brand' || phase === 'fade'
  const itemsVisible = phase === 'items' || phase === 'brand' || phase === 'fade'
  const brandVisible = phase === 'brand' || phase === 'fade'
  const fading = phase === 'fade'

  const boxSize = 100
  const burstDist = 90

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
      {/* Closed gift box - 4 sides that burst outward, with shake */}
      <div
        className="absolute"
        style={{
          width: boxSize * 2,
          height: boxSize * 2,
          left: '50%',
          top: '50%',
          transform: shaking ? 'translate(-50%, -50%)' : 'translate(-50%, -50%)',
          animation: shaking ? 'boxShake 600ms ease-in-out' : 'none',
          zIndex: 5,
        }}
      >
        {/* Top - goes up */}
        <div
          className="absolute"
          style={{
            left: 25,
            top: 0,
            width: 150,
            height: 50,
            background: `repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(212,168,67,0.2) 4px, rgba(212,168,67,0.2) 6px), linear-gradient(180deg, #B4617B 0%, #8A3558 100%)`,
            border: '2px solid #D4A843',
            transform: burst ? 'translateY(-120px) rotate(-8deg)' : 'translateY(0) rotate(0)',
            transformOrigin: 'center bottom',
            transition: 'all 800ms cubic-bezier(0.4,0,0.6,1)',
            boxShadow: burst ? 'none' : 'inset 0 2px 10px rgba(255,255,255,0.2)',
          }}
        />
        {/* Bottom - goes down */}
        <div
          className="absolute"
          style={{
            left: 25,
            bottom: 0,
            top: 'auto',
            width: 150,
            height: 50,
            background: `repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(212,168,67,0.15) 4px, rgba(212,168,67,0.15) 6px), linear-gradient(0deg, #B4617B 0%, #8A3558 100%)`,
            border: '2px solid #D4A843',
            transform: burst ? 'translateY(120px) rotate(8deg)' : 'translateY(0) rotate(0)',
            transformOrigin: 'center top',
            transition: 'all 800ms cubic-bezier(0.4,0,0.6,1)',
            boxShadow: burst ? 'none' : 'inset 0 -2px 10px rgba(0,0,0,0.2)',
          }}
        />
        {/* Left - goes left */}
        <div
          className="absolute"
          style={{
            left: 0,
            top: 25,
            width: 50,
            height: 150,
            background: `repeating-linear-gradient(180deg, transparent, transparent 4px, rgba(212,168,67,0.18) 4px, rgba(212,168,67,0.18) 6px), linear-gradient(90deg, #C06A85 0%, #8A3558 100%)`,
            border: '2px solid rgba(212,168,67,0.9)',
            transform: burst ? 'translateX(-120px) rotate(-8deg)' : 'translateX(0) rotate(0)',
            transformOrigin: 'right center',
            transition: 'all 800ms cubic-bezier(0.4,0,0.6,1)',
          }}
        />
        {/* Right - goes right */}
        <div
          className="absolute"
          style={{
            right: 0,
            left: 'auto',
            top: 25,
            width: 50,
            height: 150,
            background: `repeating-linear-gradient(180deg, transparent, transparent 4px, rgba(212,168,67,0.18) 4px, rgba(212,168,67,0.18) 6px), linear-gradient(-90deg, #C06A85 0%, #8A3558 100%)`,
            border: '2px solid rgba(212,168,67,0.9)',
            transform: burst ? 'translateX(120px) rotate(8deg)' : 'translateX(0) rotate(0)',
            transformOrigin: 'left center',
            transition: 'all 800ms cubic-bezier(0.4,0,0.6,1)',
          }}
        />
        {/* Center front face - stays briefly then fades */}
        <div
          className="absolute"
          style={{
            left: 50,
            top: 50,
            width: 100,
            height: 100,
            background: `repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(212,168,67,0.1) 3px, rgba(212,168,67,0.1) 5px), linear-gradient(135deg, #B4617B 0%, #8A3558 100%)`,
            border: '2px solid #D4A843',
            opacity: burst ? 0 : 1,
            transition: 'opacity 300ms ease',
          }}
        />
      </div>

      {/* Center area - items explode from here */}
      <div
        className="absolute"
        style={{
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          height: 400,
          zIndex: 8,
        }}
      >
        {BURST_ITEMS.map((item, i) => {
          const rad = (item.angle * Math.PI) / 180
          const dist = itemsVisible ? burstDist + (i % 3) * 15 : 0
          const dx = Math.cos(rad) * dist
          const dy = Math.sin(rad) * dist
          const rot = itemsVisible ? (i % 5) * 36 : 0
          return (
            <div
              key={i}
              className="absolute flex items-center justify-center"
              style={{
                left: '50%',
                top: '50%',
                transform: itemsVisible
                  ? `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${rot}deg)`
                  : 'translate(-50%, -50%) scale(0)',
                opacity: itemsVisible ? 1 : 0,
                transition: itemsVisible
                  ? `transform 1s cubic-bezier(0.17,0.89,0.32,1.2) ${item.delay}ms, opacity 400ms ease ${item.delay}ms`
                  : 'none',
              }}
            >
              <BurstIcon type={item.type} />
            </div>
          )
        })}
      </div>

      {/* Jaai text - appears in center */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          opacity: brandVisible ? 1 : 0,
          transition: 'opacity 500ms ease 100ms',
          zIndex: 15,
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

      <style>{`
        @keyframes boxShake {
          0%, 100% { transform: translate(-50%, -50%); }
          10% { transform: translate(calc(-50% - 5px), -50%); }
          20% { transform: translate(calc(-50% + 5px), -50%); }
          30% { transform: translate(calc(-50% - 4px), -50%); }
          40% { transform: translate(calc(-50% + 4px), -50%); }
          50% { transform: translate(calc(-50% - 2px), -50%); }
          60% { transform: translate(calc(-50% + 2px), -50%); }
          70% { transform: translate(calc(-50% - 1px), -50%); }
          80% { transform: translate(calc(-50% + 1px), -50%); }
          90% { transform: translate(-50%, -50%); }
        }
      `}</style>
    </div>
  )
}
