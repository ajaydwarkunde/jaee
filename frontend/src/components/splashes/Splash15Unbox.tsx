import { useState, useEffect } from 'react'

type Phase = 'box' | 'hands' | 'lift' | 'items' | 'confetti' | 'brand' | 'fade' | 'done'

const TIMINGS: Record<Phase, number> = {
  box: 400,
  hands: 600,
  lift: 800,
  items: 1200,
  confetti: 500,
  brand: 600,
  fade: 400,
  done: 0,
}

const CONFETTI_COLORS = ['#B4617B', '#D4A843', '#F2E3E8']

export default function Splash15Unbox({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<Phase>('box')

  useEffect(() => {
    const phases: Phase[] = ['box', 'hands', 'lift', 'items', 'confetti', 'brand', 'fade', 'done']
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

  const handsVisible = phase === 'hands' || phase === 'lift' || phase === 'items' || phase === 'confetti' || phase === 'brand' || phase === 'fade'
  const lidLifted = phase === 'lift' || phase === 'items' || phase === 'confetti' || phase === 'brand' || phase === 'fade'
  const itemsVisible = phase === 'items' || phase === 'confetti' || phase === 'brand' || phase === 'fade'
  const confettiActive = phase === 'confetti' || phase === 'brand' || phase === 'fade'
  const brandVisible = phase === 'brand' || phase === 'fade'
  const fading = phase === 'fade'

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      style={{
        background: fading ? 'transparent' : '#000',
        opacity: fading ? 0 : 1,
        transition: 'background 400ms ease, opacity 400ms ease',
        pointerEvents: 'none',
      }}
    >
      {/* Closed gift box - top-down rose/gold square */}
      <div
        className="absolute relative"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 200,
          height: 200,
          zIndex: 2,
        }}
      >
        {/* Box base */}
        <svg viewBox="0 0 200 200" fill="none" className="w-full h-full absolute inset-0">
          <defs>
            <linearGradient id="boxGrad15" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#B4617B" />
              <stop offset="50%" stopColor="#D4A843" />
              <stop offset="100%" stopColor="#B4617B" />
            </linearGradient>
          </defs>
          <rect x="40" y="60" width="120" height="120" rx="4" stroke="url(#boxGrad15)" strokeWidth="2.5" fill="#2D2D2D" />
        </svg>
        {/* Lid - lifts up with CSS transition */}
        <div
          className="absolute"
          style={{
            top: '10%',
            left: '17.5%',
            width: '65%',
            height: '25%',
            transform: lidLifted ? 'translateY(-45%) scale(0.88)' : 'translateY(0) scale(1)',
            transformOrigin: 'center bottom',
            transition: 'transform 800ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <svg viewBox="0 0 130 50" fill="none" className="w-full h-full">
            <defs>
              <linearGradient id="lidGrad15" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#B4617B" />
                <stop offset="50%" stopColor="#D4A843" />
                <stop offset="100%" stopColor="#B4617B" />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="130" height="50" rx="4" stroke="url(#lidGrad15)" strokeWidth="2.5" fill="#2D2D2D" />
          </svg>
        </div>
      </div>

      {/* Left hand - elegant SVG outline */}
      <div
        className="absolute"
        style={{
          top: '45%',
          left: '25%',
          transform: handsVisible ? 'translate(0, 0)' : 'translate(-80px, 20px)',
          opacity: handsVisible ? 1 : 0,
          transition: 'transform 600ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 600ms ease',
          zIndex: 5,
        }}
      >
        <svg width="80" height="90" viewBox="0 0 80 90" fill="none">
          <path
            d="M70 45 Q75 35 70 25 Q65 15 55 10 Q40 5 30 15 Q20 25 25 40 L20 55 Q15 65 25 75 L35 85 Q45 88 55 80 L65 65 Q72 55 70 45"
            stroke="#E4D5CF"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Right hand */}
      <div
        className="absolute"
        style={{
          top: '45%',
          right: '25%',
          transform: handsVisible ? 'translate(0, 0) scaleX(-1)' : 'translate(80px, 20px) scaleX(-1)',
          opacity: handsVisible ? 1 : 0,
          transition: 'transform 600ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 600ms ease',
          zIndex: 5,
        }}
      >
        <svg width="80" height="90" viewBox="0 0 80 90" fill="none">
          <path
            d="M70 45 Q75 35 70 25 Q65 15 55 10 Q40 5 30 15 Q20 25 25 40 L20 55 Q15 65 25 75 L35 85 Q45 88 55 80 L65 65 Q72 55 70 45"
            stroke="#E4D5CF"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Product icons inside box - candle, bouquet, chocolate, diffuser, soap */}
      <div
        className="absolute flex items-center justify-center gap-3 flex-wrap"
        style={{
          top: '52%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 180,
          opacity: itemsVisible ? 1 : 0,
          transition: 'opacity 400ms ease',
          zIndex: 3,
        }}
      >
        {/* Candle */}
        <div
          style={{
            opacity: itemsVisible ? 1 : 0,
            transform: itemsVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 400ms ease 0ms, transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1) 0ms',
          }}
        >
          <svg width="28" height="36" viewBox="0 0 28 36" fill="none">
            <rect x="6" y="18" width="16" height="16" rx="2" fill="#D4A843" />
            <ellipse cx="14" cy="15" rx="5" ry="3" fill="#FBF6F3" />
            <line x1="14" y1="4" x2="14" y2="12" stroke="#FBF6F3" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        {/* Flower bouquet */}
        <div
          style={{
            opacity: itemsVisible ? 1 : 0,
            transform: itemsVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 400ms ease 100ms, transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1) 100ms',
          }}
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="12" r="4" fill="#B4617B" />
            <circle cx="10" cy="18" r="3" fill="#B4617B" />
            <circle cx="22" cy="18" r="3" fill="#B4617B" />
            <circle cx="16" cy="22" r="3" fill="#F2E3E8" />
            <path d="M14 26 L18 32 L22 26" stroke="#D4A843" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        </div>
        {/* Chocolate */}
        <div
          style={{
            opacity: itemsVisible ? 1 : 0,
            transform: itemsVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 400ms ease 200ms, transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1) 200ms',
          }}
        >
          <svg width="28" height="24" viewBox="0 0 28 24" fill="none">
            <rect x="2" y="4" width="24" height="16" rx="2" fill="#2D2D2D" stroke="#D4A843" strokeWidth="1" />
            <rect x="6" y="8" width="6" height="4" rx="1" fill="#B4617B" opacity="0.6" />
            <rect x="16" y="8" width="6" height="4" rx="1" fill="#B4617B" opacity="0.6" />
          </svg>
        </div>
        {/* Scent diffuser */}
        <div
          style={{
            opacity: itemsVisible ? 1 : 0,
            transform: itemsVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 400ms ease 300ms, transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1) 300ms',
          }}
        >
          <svg width="24" height="32" viewBox="0 0 24 32" fill="none">
            <rect x="6" y="16" width="12" height="14" rx="2" fill="#E4D5CF" />
            <path d="M4 16 L8 8 L16 8 L20 16" stroke="#B4617B" strokeWidth="1.5" fill="none" />
            <circle cx="12" cy="6" r="2" fill="#D4A843" />
          </svg>
        </div>
        {/* Wrapped soap */}
        <div
          style={{
            opacity: itemsVisible ? 1 : 0,
            transform: itemsVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 400ms ease 400ms, transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1) 400ms',
          }}
        >
          <svg width="28" height="24" viewBox="0 0 28 24" fill="none">
            <rect x="2" y="6" width="24" height="14" rx="2" fill="#B4617B" />
            <path d="M14 6 L14 20" stroke="#D4A843" strokeWidth="2" strokeLinecap="round" />
            <path d="M2 12 L26 12" stroke="#D4A843" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* Confetti */}
      {confettiActive && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 4 }}>
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                left: `${15 + (i * 3.5) % 70}%`,
                top: `${10 + (i * 4) % 50}%`,
                width: 6,
                height: 4,
                backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                transform: `rotate(${(i * 15)}deg)`,
                animation: `confettiFall 2s ease-out ${(i * 0.04)}s forwards`,
                opacity: 0.9,
              }}
            />
          ))}
        </div>
      )}

      {/* Brand text - Jaai */}
      <div
        className="absolute inset-0 flex items-center justify-center pb-40"
        style={{
          opacity: brandVisible ? 1 : 0,
          transition: 'opacity 600ms ease',
          zIndex: 10,
        }}
      >
        <h1 className="font-serif text-4xl md:text-5xl tracking-widest" style={{ color: '#FBF6F3' }}>
          Jaai
        </h1>
      </div>

      <style>{`
        @keyframes confettiFall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
