import { useState, useEffect, useRef } from 'react'

export default function Splash1Unwrap({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(0)
  const rafRef = useRef<number>(0)
  const startRef = useRef(0)

  useEffect(() => {
    startRef.current = performance.now()
    const animate = (now: number) => {
      const elapsed = now - startRef.current
      if (elapsed < 400) setPhase(0)
      else if (elapsed < 1600) setPhase(1)
      else if (elapsed < 2800) setPhase(2)
      else if (elapsed < 3800) setPhase(3)
      else if (elapsed < 4600) setPhase(4)
      else { onComplete(); return }
      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-[100]" style={{ pointerEvents: phase >= 4 ? 'none' : 'all' }}>
      {/* Deep black base */}
      <div
        className="absolute inset-0"
        style={{
          background: '#0a0a0a',
          opacity: phase >= 4 ? 0 : 1,
          transition: 'opacity 800ms cubic-bezier(0.4, 0, 0, 1)',
        }}
      />

      {/* Horizontal slit of light */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          style={{
            width: phase >= 1 ? '100vw' : '0px',
            height: phase >= 2 ? '100vh' : phase >= 1 ? '2px' : '0px',
            background: phase >= 2
              ? 'radial-gradient(ellipse at center, rgba(212,168,67,0.15) 0%, transparent 70%)'
              : 'linear-gradient(90deg, transparent, #D4A843, #F2E3E8, #D4A843, transparent)',
            boxShadow: phase >= 1 && phase < 3
              ? '0 0 60px 20px rgba(212,168,67,0.3), 0 0 120px 40px rgba(180,97,123,0.15)'
              : 'none',
            transition: phase >= 2
              ? 'width 800ms cubic-bezier(0.4, 0, 0, 1), height 1000ms cubic-bezier(0.4, 0, 0, 1)'
              : 'width 1000ms cubic-bezier(0.16, 1, 0.3, 1), height 200ms ease',
          }}
        />
      </div>

      {/* Subtle light rays */}
      {phase >= 1 && phase < 4 && (
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                width: '1px',
                height: phase >= 2 ? '0' : '40vh',
                background: `linear-gradient(180deg, transparent, rgba(212,168,67,${0.08 - i * 0.01}), transparent)`,
                transform: `rotate(${-40 + i * 20}deg)`,
                opacity: phase >= 2 ? 0 : 1,
                transition: 'height 1200ms ease, opacity 600ms ease',
              }}
            />
          ))}
        </div>
      )}

      {/* Brand text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <h1
          className="font-serif tracking-[0.3em] text-4xl md:text-5xl"
          style={{
            color: '#FBF6F3',
            opacity: phase >= 3 ? 1 : 0,
            transform: phase >= 3 ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 900ms cubic-bezier(0.4, 0, 0, 1), transform 900ms cubic-bezier(0.4, 0, 0, 1)',
            mixBlendMode: 'difference',
          }}
        >
          Jaai
        </h1>
        <div
          className="mt-4 h-px"
          style={{
            width: phase >= 3 ? '80px' : '0px',
            background: 'linear-gradient(90deg, transparent, #D4A843, transparent)',
            transition: 'width 800ms cubic-bezier(0.4, 0, 0, 1) 200ms',
          }}
        />
      </div>

      {/* Final fade */}
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
