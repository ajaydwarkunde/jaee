import { useState, useEffect } from 'react'

type Phase = 'box' | 'tissue1' | 'tissue2' | 'tissue3' | 'glow' | 'items' | 'brand' | 'fade' | 'done'

const TIMINGS: Record<Phase, number> = {
  box: 400,
  tissue1: 600,
  tissue2: 600,
  tissue3: 600,
  glow: 800,
  items: 800,
  brand: 600,
  fade: 400,
  done: 0,
}

export default function Splash14TissueReveal({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<Phase>('box')
  const [sceneReady, setSceneReady] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setSceneReady(true), 50)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const phases: Phase[] = ['box', 'tissue1', 'tissue2', 'tissue3', 'glow', 'items', 'brand', 'fade', 'done']
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

  const tissue1Active = phase === 'tissue1' || phase === 'tissue2' || phase === 'tissue3' || phase === 'glow' || phase === 'items' || phase === 'brand' || phase === 'fade'
  const tissue2Active = phase === 'tissue2' || phase === 'tissue3' || phase === 'glow' || phase === 'items' || phase === 'brand' || phase === 'fade'
  const tissue3Active = phase === 'tissue3' || phase === 'glow' || phase === 'items' || phase === 'brand' || phase === 'fade'
  const glowActive = phase === 'glow' || phase === 'items' || phase === 'brand' || phase === 'fade'
  const itemsVisible = phase === 'items' || phase === 'brand' || phase === 'fade'
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
      {/* Gift box - top-down rose/gold rectangular outline */}
      <div
        className="absolute"
        style={{
          top: '45%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 180,
          height: 140,
          opacity: sceneReady ? 1 : 0,
          transition: 'opacity 400ms ease',
          zIndex: 1,
        }}
      >
        <svg viewBox="0 0 180 140" fill="none" className="w-full h-full">
          <defs>
            <linearGradient id="boxGradient14" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#B4617B" />
              <stop offset="50%" stopColor="#D4A843" />
              <stop offset="100%" stopColor="#B4617B" />
            </linearGradient>
          </defs>
          <rect x="10" y="10" width="160" height="120" rx="4" stroke="url(#boxGradient14)" strokeWidth="2.5" fill="transparent" />
        </svg>
      </div>

      {/* Warm glow from inside box */}
      <div
        className="absolute rounded-lg"
        style={{
          top: '45%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 2,
          width: 200,
          height: 160,
          background: 'radial-gradient(ellipse at center, rgba(212,168,67,0.6) 0%, rgba(180,97,123,0.3) 40%, transparent 70%)',
          opacity: glowActive ? 1 : 0,
          transition: 'opacity 800ms ease',
          filter: 'blur(8px)',
        }}
      />

      {/* Tissue paper 1 - irregular shape */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '42%',
          left: '50%',
          transform: tissue1Active
            ? 'translate(-50%, -50%) translate(-120px, -80px) scale(0.4) rotate(-35deg)'
            : 'translate(-50%, -50%) scale(1) rotate(0deg)',
          filter: 'drop-shadow(0 4px 12px rgba(242,227,232,0.5))',
          opacity: sceneReady && !tissue1Active ? 1 : 0,
          transition: 'transform 600ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 600ms ease',
          zIndex: 3,
        }}
      >
        <svg width="100" height="80" viewBox="0 0 100 80" fill="none">
          <path
            d="M15 20 Q40 5 65 15 Q90 25 85 45 Q80 65 50 70 Q20 75 10 50 Q0 25 15 20"
            fill="#F2E3E8"
            stroke="#E4D5CF"
            strokeWidth="0.5"
          />
        </svg>
      </div>

      {/* Tissue paper 2 */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '44%',
          left: '50%',
          transform: tissue2Active
            ? 'translate(-50%, -50%) translate(100px, -100px) scale(0.35) rotate(42deg)'
            : 'translate(-50%, -50%) scale(1) rotate(0deg)',
          filter: 'drop-shadow(0 4px 12px rgba(242,227,232,0.5))',
          opacity: sceneReady && !tissue2Active ? 1 : 0,
          transition: 'transform 600ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 600ms ease',
          transitionDelay: tissue1Active ? '100ms' : '0ms',
          zIndex: 4,
        }}
      >
        <svg width="90" height="75" viewBox="0 0 90 75" fill="none">
          <path
            d="M20 10 Q55 0 75 20 Q95 40 70 60 Q45 80 25 55 Q5 30 20 10"
            fill="#FBF6F3"
            stroke="#E4D5CF"
            strokeWidth="0.5"
          />
        </svg>
      </div>

      {/* Tissue paper 3 */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '46%',
          left: '50%',
          transform: tissue3Active
            ? 'translate(-50%, -50%) translate(0, 130px) scale(0.3) rotate(-20deg)'
            : 'translate(-50%, -50%) scale(1) rotate(0deg)',
          filter: 'drop-shadow(0 4px 12px rgba(242,227,232,0.5))',
          opacity: sceneReady && !tissue3Active ? 1 : 0,
          transition: 'transform 600ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 600ms ease',
          transitionDelay: tissue2Active ? '150ms' : '0ms',
          zIndex: 5,
        }}
      >
        <svg width="95" height="70" viewBox="0 0 95 70" fill="none">
          <path
            d="M10 35 Q35 5 70 25 Q95 50 80 65 Q65 80 35 60 Q5 40 10 35"
            fill="#F2E3E8"
            stroke="#E4D5CF"
            strokeWidth="0.5"
          />
        </svg>
      </div>

      {/* Product silhouettes - candle, soap, scent bottle */}
      <div
        className="absolute flex items-end justify-center gap-6"
        style={{
          top: '45%',
          left: '50%',
          transform: itemsVisible ? 'translate(-50%, -50%) translateY(0)' : 'translate(-50%, -50%) translateY(40px)',
          opacity: itemsVisible ? 1 : 0,
          transition: 'opacity 600ms ease, transform 800ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {/* Candle */}
        <svg width="28" height="45" viewBox="0 0 28 45" fill="none" style={{ opacity: itemsVisible ? 1 : 0, transition: 'opacity 400ms ease 100ms' }}>
          <rect x="6" y="25" width="16" height="18" rx="2" fill="#D4A843" opacity="0.9" />
          <ellipse cx="14" cy="22" rx="6" ry="4" fill="#FBF6F3" />
          <line x1="14" y1="5" x2="14" y2="18" stroke="#FBF6F3" strokeWidth="2" strokeLinecap="round" />
        </svg>
        {/* Soap */}
        <svg width="32" height="24" viewBox="0 0 32 24" fill="none" style={{ opacity: itemsVisible ? 1 : 0, transition: 'opacity 400ms ease 250ms' }}>
          <rect x="2" y="4" width="28" height="16" rx="3" fill="#B4617B" opacity="0.9" />
          <ellipse cx="16" cy="12" rx="10" ry="5" fill="#F2E3E8" opacity="0.6" />
        </svg>
        {/* Scent bottle */}
        <svg width="22" height="48" viewBox="0 0 22 48" fill="none" style={{ opacity: itemsVisible ? 1 : 0, transition: 'opacity 400ms ease 400ms' }}>
          <path d="M6 4 L6 20 L4 20 L4 44 L18 44 L18 20 L16 20 L16 4 Z" fill="#E4D5CF" />
          <rect x="5" y="22" width="12" height="20" rx="1" fill="#B4617B" opacity="0.8" />
          <path d="M7 0 L15 0 L15 4 L7 4 Z" fill="#D4A843" />
        </svg>
      </div>

      {/* Brand text */}
      <div
        className="absolute inset-0 flex items-center justify-center pt-32"
        style={{
          opacity: brandVisible ? 1 : 0,
          transition: 'opacity 600ms ease',
          zIndex: 10,
        }}
      >
        <div className="text-center">
          <h1 className="font-serif text-3xl md:text-4xl tracking-widest" style={{ color: '#FBF6F3' }}>
            Jaai
          </h1>
          <p className="mt-2 text-sm md:text-base tracking-widest" style={{ color: '#E4D5CF' }}>
            Gifts Crafted with Love
          </p>
        </div>
      </div>

      {/* Full-screen glow overlay on fade */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(212,168,67,0.4) 0%, rgba(180,97,123,0.2) 50%, transparent 70%)',
          opacity: fading ? 1 : 0,
          transition: 'opacity 400ms ease',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
