import { useState, useEffect } from 'react'

type Phase = 'pour1' | 'pour2' | 'streams' | 'reveal' | 'emboss' | 'fade' | 'done'

const TIMINGS: Record<Phase, number> = {
  pour1: 800,
  pour2: 600,
  streams: 900,
  reveal: 700,
  emboss: 600,
  fade: 500,
  done: 0,
}

export default function Splash4Pour({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<Phase>('pour1')

  useEffect(() => {
    const phases: Phase[] = ['pour1', 'pour2', 'streams', 'reveal', 'emboss', 'fade', 'done']
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

  const pour1 = phase === 'pour1' || phase === 'pour2' || phase === 'streams' || phase === 'reveal' || phase === 'emboss' || phase === 'fade'
  const pour2 = phase === 'pour2' || phase === 'streams' || phase === 'reveal' || phase === 'emboss' || phase === 'fade'
  const streams = phase === 'streams' || phase === 'reveal' || phase === 'emboss' || phase === 'fade'
  const reveal = phase === 'reveal' || phase === 'emboss' || phase === 'fade'
  const emboss = phase === 'emboss' || phase === 'fade'
  const fading = phase === 'fade'

  const waxHeight = pour1 ? '100%' : '0%'
  const stream2Height = pour2 ? '100%' : '0%'
  const stream3Height = streams ? '100%' : '0%'

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      style={{
        background: fading ? 'transparent' : '#000',
        opacity: fading ? 0 : 1,
        transition: 'opacity 500ms ease',
        pointerEvents: 'none',
      }}
    >
      {/* Main pour - from top center */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 overflow-hidden"
        style={{
          width: 60,
          height: '100%',
          transition: 'opacity 300ms ease',
        }}
      >
        <div
          className="absolute bottom-0 left-0 w-full rounded-t-[30px]"
          style={{
            height: waxHeight,
            transition: 'height 800ms cubic-bezier(0.2,0.8,0.3,1)',
            background: 'linear-gradient(180deg, #D4A843 0%, #B4617B 40%, #8a3558 100%)',
            boxShadow: 'inset 0 0 30px rgba(255,255,255,0.1)',
          }}
        />
      </div>

      {/* Second stream - left */}
      <div
        className="absolute top-0 left-[30%] -translate-x-1/2 overflow-hidden"
        style={{ width: 35, height: '100%' }}
      >
        <div
          className="absolute bottom-0 left-0 w-full rounded-t-[18px]"
          style={{
            height: stream2Height,
            transition: 'height 600ms cubic-bezier(0.2,0.8,0.3,1) 200ms',
            background: 'linear-gradient(180deg, #c9957a 0%, #B4617B 60%, #8a3558 100%)',
          }}
        />
      </div>

      {/* Third stream - right */}
      <div
        className="absolute top-0 left-[70%] -translate-x-1/2 overflow-hidden"
        style={{ width: 35, height: '100%' }}
      >
        <div
          className="absolute bottom-0 left-0 w-full rounded-t-[18px]"
          style={{
            height: stream3Height,
            transition: 'height 600ms cubic-bezier(0.2,0.8,0.3,1) 400ms',
            background: 'linear-gradient(180deg, #c9957a 0%, #B4617B 60%, #8a3558 100%)',
          }}
        />
      </div>

      {/* Overlay transitions to transparent as wax reaches bottom */}
      <div
        className="absolute inset-0"
        style={{
          background: reveal ? 'transparent' : '#000',
          transition: 'background 700ms ease',
        }}
      />

      {/* Remaining wax layer - bottom strip with embossed Jaai */}
      <div
        className="absolute bottom-0 left-0 right-0 overflow-hidden"
        style={{
          height: emboss ? 120 : 0,
          opacity: emboss ? 1 : 0,
          transition: 'height 400ms ease, opacity 400ms ease',
        }}
      >
        <div
          className="absolute inset-x-0 bottom-0 h-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(180deg, transparent, rgba(180,97,123,0.95) 20%, rgba(138,53,88,0.98) 100%)',
          }}
        >
          <h1
            className="font-serif text-3xl md:text-4xl tracking-widest"
            style={{
              color: 'rgba(255,255,255,0.9)',
              textShadow: '0 2px 0 rgba(0,0,0,0.3), 0 -1px 0 rgba(255,255,255,0.2)',
            }}
          >
            Jaai
          </h1>
        </div>
      </div>
    </div>
  )
}
