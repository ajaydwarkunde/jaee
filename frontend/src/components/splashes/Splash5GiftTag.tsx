import { useState, useEffect } from 'react'

type Phase = 'sway' | 'flip' | 'drop' | 'curtains' | 'done'

const TIMINGS: Record<Phase, number> = {
  sway: 800,
  flip: 500,
  drop: 400,
  curtains: 500,
  done: 0,
}

export default function Splash5GiftTag({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<Phase>('sway')

  useEffect(() => {
    const phases: Phase[] = ['sway', 'flip', 'drop', 'curtains', 'done']
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

  const flipped = phase === 'flip' || phase === 'drop' || phase === 'curtains'
  const dropped = phase === 'drop' || phase === 'curtains'
  const curtainsOpen = phase === 'curtains'

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      style={{
        background: curtainsOpen ? 'transparent' : '#000',
        opacity: curtainsOpen ? 0 : 1,
        transition: curtainsOpen ? 'opacity 300ms ease' : 'none',
        pointerEvents: 'none',
      }}
    >
      {/* Curtain halves - slide apart */}
      <div
        className="absolute inset-0 flex"
        style={{ zIndex: 10 }}
      >
        <div
          className="absolute left-0 inset-y-0 bg-black w-1/2"
          style={{
            transform: curtainsOpen ? 'translateX(-100%)' : 'translateX(0)',
            transition: 'transform 500ms cubic-bezier(0.4,0,0.2,1)',
          }}
        />
        <div
          className="absolute right-0 inset-y-0 bg-black w-1/2"
          style={{
            transform: curtainsOpen ? 'translateX(100%)' : 'translateX(0)',
            transition: 'transform 500ms cubic-bezier(0.4,0,0.2,1)',
          }}
        />
      </div>

      {/* Gift tag */}
      <div
        className="absolute"
        style={{
          top: dropped ? '70%' : '45%',
          left: '50%',
          transform: `translate(-50%, ${dropped ? '-50%' : '-60%'})`,
          transition: 'top 400ms cubic-bezier(0.4,0,0.2,1)',
          zIndex: 5,
        }}
      >
        {/* Gold string */}
        <div
          className="absolute -top-8 left-1/2 -translate-x-1/2 w-0.5 h-8 rounded"
          style={{
            background: 'linear-gradient(180deg, #F0D78C, #D4A843)',
            transformOrigin: 'center top',
            animation: phase === 'sway' ? 'sway 1.5s ease-in-out infinite' : 'none',
          }}
        />

        {/* Tag - 3D flip */}
        <div
          className="relative"
          style={{
            perspective: 400,
          }}
        >
          <div
            className="w-24 h-14 rounded-md flex items-center justify-center shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #FBF6F3 0%, #F2E3E8 100%)',
              border: '1px solid rgba(212,168,67,0.5)',
              transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              transformStyle: 'preserve-3d',
              transition: 'transform 500ms cubic-bezier(0.4,0,0.2,1)',
              backfaceVisibility: 'hidden',
            }}
          >
            <h1
              className="font-serif text-lg tracking-widest"
              style={{
                color: '#B4617B',
                transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              Jaai
            </h1>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes sway {
          0%, 100% { transform: translateX(-50%) rotate(-4deg); }
          50% { transform: translateX(-50%) rotate(4deg); }
        }
      `}</style>
    </div>
  )
}
