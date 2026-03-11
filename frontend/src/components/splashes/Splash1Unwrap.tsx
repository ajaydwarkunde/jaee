import { useState, useEffect } from 'react'

type Phase = 'wrap' | 'ribbonPull' | 'reveal' | 'logo' | 'fade' | 'done'

const TIMINGS: Record<Phase, number> = {
  wrap: 600,
  ribbonPull: 900,
  reveal: 800,
  logo: 700,
  fade: 500,
  done: 0,
}

export default function Splash1Unwrap({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<Phase>('wrap')

  useEffect(() => {
    const phases: Phase[] = ['wrap', 'ribbonPull', 'reveal', 'logo', 'fade', 'done']
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

  const ribbonPull = phase === 'ribbonPull' || phase === 'reveal' || phase === 'logo' || phase === 'fade'
  const reveal = phase === 'reveal' || phase === 'logo' || phase === 'fade'
  const logoVisible = phase === 'logo' || phase === 'fade'
  const fading = phase === 'fade'

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      style={{
        background: fading ? 'transparent' : '#000',
        opacity: fading ? 0 : 1,
        transition: 'background 400ms ease, opacity 500ms ease',
        pointerEvents: 'none',
      }}
    >
      {/* Wrapping paper (rose/gold) - splits from center outward */}
      <div
        className="absolute inset-0 flex"
        style={{ overflow: 'hidden' }}
      >
        <div
          className="absolute inset-y-0 left-0 w-1/2 origin-right"
          style={{
            background: 'linear-gradient(135deg, #B4617B 0%, #8A3558 40%, #D4A843 100%)',
            transform: reveal ? 'scaleX(0)' : 'scaleX(1)',
            transition: 'transform 800ms cubic-bezier(0.4,0,0.2,1)',
          }}
        />
        <div
          className="absolute inset-y-0 right-0 w-1/2 origin-left"
          style={{
            background: 'linear-gradient(225deg, #B4617B 0%, #6E2D44 60%, #D4A843 100%)',
            transform: reveal ? 'scaleX(0)' : 'scaleX(1)',
            transition: 'transform 800ms cubic-bezier(0.4,0,0.2,1)',
          }}
        />
      </div>

      {/* Gold ribbon cross - pulls apart */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ zIndex: 2 }}
      >
        {/* Vertical ribbon - pulls up/down */}
        <div
          className="absolute w-2"
          style={{
            height: '120%',
            top: ribbonPull ? '-10%' : '50%',
            left: '50%',
            transform: 'translateX(-50%) translateY(-50%)',
            transition: 'top 900ms cubic-bezier(0.4,0,0.2,1)',
            background: 'linear-gradient(180deg, transparent, #D4A843 20%, #F0D78C 50%, #D4A843 80%, transparent)',
            boxShadow: '0 0 20px rgba(212,168,67,0.4)',
          }}
        />
        {/* Horizontal ribbon - pulls left/right */}
        <div
          className="absolute h-2"
          style={{
            width: '120%',
            left: ribbonPull ? '-10%' : '50%',
            top: '50%',
            transform: 'translateY(-50%) translateX(-50%)',
            transition: 'left 900ms cubic-bezier(0.4,0,0.2,1)',
            background: 'linear-gradient(90deg, transparent, #D4A843 20%, #F0D78C 50%, #D4A843 80%, transparent)',
            boxShadow: '0 0 20px rgba(212,168,67,0.4)',
          }}
        />
      </div>

      {/* Jaai logo in the gap */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          opacity: logoVisible ? 1 : 0,
          transition: 'opacity 400ms ease',
          zIndex: 5,
        }}
      >
        <h1
          className="font-serif text-4xl md:text-5xl tracking-widest"
          style={{
            color: '#FBF6F3',
            textShadow: '0 0 30px rgba(212,168,67,0.5), 0 2px 10px rgba(0,0,0,0.3)',
          }}
        >
          Jaai
        </h1>
      </div>
    </div>
  )
}
