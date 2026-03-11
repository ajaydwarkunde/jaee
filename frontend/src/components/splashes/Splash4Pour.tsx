import { useState, useEffect } from 'react'

export default function Splash4Pour({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 100),
      setTimeout(() => setPhase(2), 2000),
      setTimeout(() => setPhase(3), 3400),
      setTimeout(() => setPhase(4), 4400),
      setTimeout(() => onComplete(), 5200),
    ]
    return () => timers.forEach(clearTimeout)
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-[100]" style={{ pointerEvents: phase >= 4 ? 'none' : 'all' }}>
      <div
        className="absolute inset-0"
        style={{
          background: '#0a0a0a',
          opacity: phase >= 4 ? 0 : 1,
          transition: 'opacity 800ms cubic-bezier(0.4, 0, 0, 1)',
        }}
      />

      {/* Gradient curtain wipe — two panels sliding apart */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-y-0 left-0"
          style={{
            width: '50.5%',
            background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 50%, #1a1218 100%)',
            transform: phase >= 2 ? 'translateX(-102%)' : 'translateX(0)',
            transition: 'transform 1200ms cubic-bezier(0.7, 0, 0.3, 1)',
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(90deg, transparent 70%, rgba(212,168,67,0.08) 100%)',
            }}
          />
        </div>
        <div
          className="absolute inset-y-0 right-0"
          style={{
            width: '50.5%',
            background: 'linear-gradient(225deg, #1a1a1a 0%, #0a0a0a 50%, #1a1218 100%)',
            transform: phase >= 2 ? 'translateX(102%)' : 'translateX(0)',
            transition: 'transform 1200ms cubic-bezier(0.7, 0, 0.3, 1)',
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(270deg, transparent 70%, rgba(180,97,123,0.08) 100%)',
            }}
          />
        </div>
      </div>

      {/* Center line that grows then fades */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          style={{
            width: '1px',
            height: phase >= 1 ? '60vh' : '0',
            background: 'linear-gradient(180deg, transparent, rgba(212,168,67,0.5), rgba(180,97,123,0.3), transparent)',
            opacity: phase >= 2 ? 0 : 1,
            transition: phase >= 2
              ? 'opacity 400ms ease'
              : 'height 1600ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </div>

      {/* Edge glow during split */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          style={{
            width: phase >= 2 ? '4px' : '1px',
            height: '100vh',
            background: 'linear-gradient(180deg, transparent, rgba(212,168,67,0.4), rgba(180,97,123,0.2), transparent)',
            filter: 'blur(8px)',
            opacity: phase >= 2 && phase < 3 ? 1 : 0,
            transition: 'opacity 600ms ease, width 400ms ease',
          }}
        />
      </div>

      {/* Brand */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <h1
          className="font-serif tracking-[0.35em] text-4xl md:text-5xl"
          style={{
            color: '#2D2D2D',
            opacity: phase >= 3 ? 1 : 0,
            transform: phase >= 3 ? 'translateY(0)' : 'translateY(6px)',
            transition: 'opacity 900ms cubic-bezier(0.4, 0, 0, 1), transform 900ms cubic-bezier(0.4, 0, 0, 1)',
          }}
        >
          Jaai
        </h1>
        <p
          className="mt-4 text-[10px] tracking-[0.4em] uppercase"
          style={{
            color: 'rgba(180,97,123,0.5)',
            opacity: phase >= 3 ? 1 : 0,
            transition: 'opacity 800ms ease 300ms',
          }}
        >
          Gifts Crafted with Love
        </p>
      </div>

      <div
        className="absolute inset-0 bg-[#FBF6F3]"
        style={{
          opacity: phase >= 4 ? 1 : 0,
          transition: 'opacity 700ms cubic-bezier(0.4, 0, 0, 1)',
        }}
      />
    </div>
  )
}
