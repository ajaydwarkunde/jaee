import { useState, useEffect } from 'react'

export default function Splash3WaxSeal({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 1600),
      setTimeout(() => setPhase(3), 3000),
      setTimeout(() => setPhase(4), 4000),
      setTimeout(() => onComplete(), 4800),
    ]
    return () => timers.forEach(clearTimeout)
  }, [onComplete])

  const particles = Array.from({ length: 40 }, (_, i) => ({
    x: Math.cos((i / 40) * Math.PI * 2) * (60 + Math.random() * 80),
    y: Math.sin((i / 40) * Math.PI * 2) * (60 + Math.random() * 80),
    size: 1 + Math.random() * 2,
    delay: Math.random() * 600,
    opacity: 0.2 + Math.random() * 0.5,
  }))

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

      {/* Floating particles */}
      <div className="absolute inset-0 flex items-center justify-center">
        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              background: i % 3 === 0 ? '#D4A843' : i % 3 === 1 ? '#B4617B' : '#E4D5CF',
              transform: phase >= 2
                ? `translate(${p.x * 2}px, ${p.y * 2 - 40}px)`
                : `translate(${p.x * 0.3}px, ${p.y * 0.3}px)`,
              opacity: phase >= 1 && phase < 4 ? p.opacity : 0,
              transition: `transform ${1400 + p.delay}ms cubic-bezier(0.4, 0, 0, 1) ${p.delay}ms, opacity 600ms ease ${p.delay}ms`,
              filter: 'blur(0.5px)',
            }}
          />
        ))}
      </div>

      {/* Gradient aurora waves */}
      <div className="absolute inset-0 overflow-hidden">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="absolute w-full"
            style={{
              height: '40%',
              top: `${20 + i * 15}%`,
              background: `linear-gradient(${90 + i * 30}deg, transparent, ${
                ['rgba(180,97,123,0.08)', 'rgba(212,168,67,0.06)', 'rgba(228,213,207,0.05)'][i]
              }, transparent)`,
              transform: phase >= 1
                ? `translateX(${(i % 2 === 0 ? 10 : -10)}%) scaleY(${phase >= 2 ? 1.5 : 1})`
                : 'translateX(0)',
              opacity: phase >= 1 && phase < 4 ? 1 : 0,
              transition: `transform 3000ms cubic-bezier(0.4, 0, 0, 1), opacity 800ms ease`,
              filter: 'blur(40px)',
            }}
          />
        ))}
      </div>

      {/* Brand */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {/* Monogram circle */}
        <div
          className="relative flex items-center justify-center mb-8"
          style={{
            width: 80,
            height: 80,
            opacity: phase >= 1 && phase < 3 ? 1 : 0,
            transform: phase >= 2 ? 'scale(0.8)' : phase >= 1 ? 'scale(1)' : 'scale(0.9)',
            transition: 'opacity 600ms ease, transform 600ms ease',
          }}
        >
          <svg viewBox="0 0 80 80" className="absolute inset-0">
            <circle
              cx="40" cy="40" r="38"
              fill="none"
              stroke="#D4A843"
              strokeWidth="0.5"
              strokeDasharray={240}
              strokeDashoffset={phase >= 1 ? 0 : 240}
              style={{ transition: 'stroke-dashoffset 1200ms cubic-bezier(0.4, 0, 0, 1)' }}
            />
          </svg>
          <span
            className="font-serif text-3xl"
            style={{ color: '#D4A843', opacity: phase >= 1 ? 1 : 0, transition: 'opacity 800ms ease 400ms' }}
          >
            J
          </span>
        </div>

        <h1
          className="font-serif tracking-[0.35em] text-4xl md:text-5xl"
          style={{
            color: '#FBF6F3',
            opacity: phase >= 3 ? 1 : 0,
            transform: phase >= 3 ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 800ms cubic-bezier(0.4, 0, 0, 1), transform 800ms cubic-bezier(0.4, 0, 0, 1)',
          }}
        >
          Jaai
        </h1>
        <div
          className="flex items-center gap-4 mt-5"
          style={{
            opacity: phase >= 3 ? 1 : 0,
            transition: 'opacity 800ms ease 300ms',
          }}
        >
          <div className="w-8 h-px" style={{ background: 'rgba(212,168,67,0.4)' }} />
          <p className="text-[10px] tracking-[0.5em] uppercase" style={{ color: 'rgba(212,168,67,0.5)' }}>
            Illuminate Your Space
          </p>
          <div className="w-8 h-px" style={{ background: 'rgba(212,168,67,0.4)' }} />
        </div>
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
