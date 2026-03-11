import { useState, useEffect } from 'react'

type Phase = 'idle' | 'lidLift' | 'glow' | 'brand' | 'fade' | 'done'

const TIMINGS: Record<Phase, number> = {
  idle: 300,
  lidLift: 1200,
  glow: 1000,
  brand: 800,
  fade: 500,
  done: 0,
}

const SPARKLES = Array.from({ length: 12 }, (_, i) => ({
  left: 40 + (i * 5) % 20,
  delay: i * 80,
  size: 2 + (i % 3),
}))

export default function Splash11LidLift({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<Phase>('idle')

  useEffect(() => {
    const phases: Phase[] = ['idle', 'lidLift', 'glow', 'brand', 'fade', 'done']
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

  const lidLifting = phase === 'lidLift' || phase === 'glow' || phase === 'brand' || phase === 'fade'
  const glowing = phase === 'glow' || phase === 'brand' || phase === 'fade'
  const brandVisible = phase === 'brand' || phase === 'fade'
  const fading = phase === 'fade'

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      style={{
        background: fading ? 'transparent' : '#000',
        opacity: fading ? 0 : 1,
        transition: 'background 400ms ease, opacity 500ms ease',
        pointerEvents: 'none',
        perspective: '1200px',
      }}
    >
      {/* Golden glow - expands from box opening */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: glowing
            ? 'radial-gradient(ellipse 80vmax 80vmax at 50% 50%, rgba(212,168,67,0.85) 0%, rgba(212,168,67,0.4) 40%, rgba(180,97,123,0.2) 70%, transparent 100%)'
            : 'radial-gradient(ellipse 80px 80px at 50% 50%, rgba(212,168,67,0.3) 0%, transparent 70%)',
          opacity: glowing ? 1 : 0,
          transition: glowing ? 'all 1000ms cubic-bezier(0.2,0.8,0.3,1)' : 'opacity 200ms ease',
        }}
      />

      {/* Sparkle particles - float upward when lid lifts */}
      {SPARKLES.map((s, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: s.size,
            height: s.size,
            left: `${45 + (i % 5) * 3}%`,
            top: '48%',
            background: 'radial-gradient(circle, #F0D78C 0%, #D4A843 100%)',
            boxShadow: '0 0 6px rgba(240,215,140,0.9)',
            animation: lidLifting ? `sparkleFloat 1.2s cubic-bezier(0.2,0.6,0.4,1) ${s.delay}ms forwards` : 'none',
          }}
        />
      ))}

      {/* 3D Gift Box */}
      <div
        className="absolute"
        style={{
          width: 160,
          height: 120,
          top: '42%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          perspective: '800px',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Box base - front face */}
        <div
          className="absolute"
          style={{
            width: 120,
            height: 80,
            left: 20,
            top: 40,
            background: 'linear-gradient(180deg, #E4D5CF 0%, #C9B5AC 50%, #B8A398 100%)',
            border: '2px solid #D4A843',
            boxShadow: 'inset 0 2px 8px rgba(255,255,255,0.3), 0 4px 20px rgba(0,0,0,0.4)',
            transform: 'rotateX(20deg) translateZ(0px)',
            transformStyle: 'preserve-3d',
          }}
        />
        {/* Box base - right side */}
        <div
          className="absolute"
          style={{
            width: 40,
            height: 80,
            left: 140,
            top: 40,
            background: 'linear-gradient(90deg, #C9B5AC 0%, #A89082 100%)',
            borderTop: '2px solid rgba(212,168,67,0.8)',
            borderBottom: '2px solid rgba(212,168,67,0.6)',
            borderRight: '2px solid rgba(212,168,67,0.9)',
            boxShadow: 'inset -2px 0 8px rgba(0,0,0,0.2)',
            transform: 'rotateY(-65deg) rotateX(20deg) translateZ(0px)',
            transformStyle: 'preserve-3d',
          }}
        />
        {/* Box base - top (opening) */}
        <div
          className="absolute"
          style={{
            width: 120,
            height: 40,
            left: 20,
            top: 0,
            background: 'linear-gradient(180deg, #F2E3E8 0%, #E4D5CF 100%)',
            border: '2px solid #D4A843',
            boxShadow: 'inset 0 -2px 10px rgba(212,168,67,0.2)',
            transform: 'rotateX(-70deg) translateZ(80px) translateY(-40px)',
            transformStyle: 'preserve-3d',
            transformOrigin: 'center bottom',
          }}
        />

        {/* Lid - lifts on back edge */}
        <div
          className="absolute"
          style={{
            width: 124,
            height: 42,
            left: 18,
            top: 0,
            background: 'linear-gradient(180deg, #F2E3E8 0%, #E4D5CF 30%, #D4C4B8 100%)',
            border: '2px solid #D4A843',
            boxShadow: 'inset 0 2px 12px rgba(255,255,255,0.4), 0 0 20px rgba(212,168,67,0.2)',
            transform: lidLifting
              ? 'rotateX(-110deg) translateZ(80px) translateY(-60px)'
              : 'rotateX(-70deg) translateZ(80px) translateY(-40px)',
            transformOrigin: 'center bottom',
            transition: 'transform 1.2s cubic-bezier(0.2,0.7,0.3,1)',
            transformStyle: 'preserve-3d',
          }}
        />
        {/* Lid side (right visible edge) */}
        <div
          className="absolute"
          style={{
            width: 42,
            height: 80,
            left: 142,
            top: -38,
            background: 'linear-gradient(90deg, #E4D5CF 0%, #C9B5AC 100%)',
            borderRight: '2px solid #D4A843',
            transform: lidLifting
              ? 'rotateY(-65deg) rotateX(20deg) translateZ(0px) translateY(-100px)'
              : 'rotateY(-65deg) rotateX(20deg) translateZ(0px)',
            transformOrigin: 'left center',
            transition: 'transform 1.2s cubic-bezier(0.2,0.7,0.3,1)',
            opacity: lidLifting ? 0.3 : 1,
          }}
        />
      </div>

      {/* Jaai text */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          opacity: brandVisible ? 1 : 0,
          transition: 'opacity 600ms ease 200ms',
          zIndex: 10,
        }}
      >
        <h1
          className="font-serif text-5xl md:text-6xl tracking-widest"
          style={{
            color: '#FBF6F3',
            textShadow: '0 0 40px rgba(212,168,67,0.7), 0 0 80px rgba(212,168,67,0.4), 0 2px 12px rgba(0,0,0,0.3)',
          }}
        >
          Jaai
        </h1>
      </div>

      <style>{`
        @keyframes sparkleFloat {
          0% { opacity: 0; transform: translateY(0) scale(0.5); }
          15% { opacity: 1; transform: translateY(-10px) scale(1); }
          100% { opacity: 0; transform: translateY(-140px) scale(0.8); }
        }
      `}</style>
    </div>
  )
}
