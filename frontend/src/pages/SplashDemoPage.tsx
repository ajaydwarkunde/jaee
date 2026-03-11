import { useState, useCallback, lazy, Suspense, type ComponentType } from 'react'
import { Play, RotateCcw, Sparkles } from 'lucide-react'

interface SplashDef {
  id: number
  name: string
  desc: string
  vibe: string
  loader: () => Promise<{ default: ComponentType<{ onComplete: () => void }> }>
}

const splashes: SplashDef[] = [
  { id: 1, name: 'Unwrap', desc: 'Gold ribbon pulls apart, wrapping paper tears open from center', vibe: 'Festive & Gift-like', loader: () => import('@/components/splashes/Splash1Unwrap') },
  { id: 2, name: 'Matchstick Strike', desc: 'Match drags across screen, ignites, warm glow expands outward', vibe: 'Dramatic & Warm', loader: () => import('@/components/splashes/Splash2Matchstick') },
  { id: 3, name: 'Wax Seal', desc: 'Rose wax seal cracks apart, envelope flap opens with light', vibe: 'Classic & Elegant', loader: () => import('@/components/splashes/Splash3WaxSeal') },
  { id: 4, name: 'Pour', desc: 'Warm wax pours down from top, fills and then shatters away', vibe: 'Satisfying & Tactile', loader: () => import('@/components/splashes/Splash4Pour') },
  { id: 5, name: 'Gift Tag', desc: 'Minimal tag sways, flips, drops — black curtains split open', vibe: 'Clean & Minimal', loader: () => import('@/components/splashes/Splash5GiftTag') },
  { id: 6, name: 'Fragrance Drift', desc: 'Smoke wisps rise and form logo text, then disperse', vibe: 'Ethereal & Luxe', loader: () => import('@/components/splashes/Splash6Fragrance') },
  { id: 7, name: 'Candle Drip', desc: 'Rose overlay melts away via wax drips from top edge', vibe: 'ASMR & Satisfying', loader: () => import('@/components/splashes/Splash7CandleDrip') },
  { id: 8, name: 'Bloom', desc: 'Flower petals unfurl one by one in brand colors, reveal site', vibe: 'Organic & Feminine', loader: () => import('@/components/splashes/Splash8Bloom') },
  { id: 9, name: 'Stamp & Reveal', desc: 'Gold foil stamp presses down, surface cracks and shatters', vibe: 'Bold & Luxurious', loader: () => import('@/components/splashes/Splash9Stamp') },
  { id: 10, name: 'Thread & Stitch', desc: 'Gold thread stitches out "Jaai" in cursive, frame draws, fabric folds', vibe: 'Handcrafted & Artisanal', loader: () => import('@/components/splashes/Splash10Thread') },
]

const vibeColors: Record<string, string> = {
  'Festive & Gift-like': 'bg-rose/10 text-rose',
  'Dramatic & Warm': 'bg-amber-100 text-amber-700',
  'Classic & Elegant': 'bg-champagne/40 text-charcoal',
  'Satisfying & Tactile': 'bg-blush/40 text-rose',
  'Clean & Minimal': 'bg-warm-gray/10 text-warm-gray',
  'Ethereal & Luxe': 'bg-purple-100 text-purple-700',
  'ASMR & Satisfying': 'bg-pink-100 text-pink-700',
  'Organic & Feminine': 'bg-green-100 text-green-700',
  'Bold & Luxurious': 'bg-yellow-100 text-yellow-700',
  'Handcrafted & Artisanal': 'bg-orange-100 text-orange-700',
}

export default function SplashDemoPage() {
  const [activeId, setActiveId] = useState<number | null>(null)
  const [SplashComponent, setSplashComponent] = useState<ComponentType<{ onComplete: () => void }> | null>(null)

  const handlePlay = useCallback((splash: SplashDef) => {
    const Comp = lazy(splash.loader)
    setSplashComponent(() => Comp)
    setActiveId(splash.id)
  }, [])

  const handleComplete = useCallback(() => {
    setActiveId(null)
    setSplashComponent(null)
  }, [])

  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="container-custom">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-rose/10 text-rose text-sm font-medium px-4 py-1.5 rounded-full mb-4">
            <Sparkles className="w-4 h-4" />
            Preview All Options
          </div>
          <h1 className="heading-2 text-charcoal mb-2">Splash Screen Animations</h1>
          <p className="text-warm-gray max-w-xl mx-auto">
            Click any card to see the full-screen animation. Pick the one that best represents the brand.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {splashes.map((splash) => (
            <div
              key={splash.id}
              className="group bg-soft-white rounded-2xl shadow-soft hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col"
            >
              <div className="relative bg-charcoal h-40 flex items-center justify-center overflow-hidden">
                <span className="absolute top-3 left-3 bg-black/40 backdrop-blur-sm text-white/80 text-xs font-mono px-2 py-0.5 rounded-md">
                  #{splash.id}
                </span>
                <div className="font-serif text-2xl tracking-widest text-soft-white/20 select-none">
                  Jaai
                </div>
                <button
                  onClick={() => handlePlay(splash)}
                  className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors duration-300 cursor-pointer"
                  aria-label={`Play ${splash.name}`}
                >
                  <div className="w-14 h-14 rounded-full bg-soft-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300 shadow-lg">
                    <Play className="w-6 h-6 text-charcoal ml-0.5" />
                  </div>
                </button>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-serif text-lg font-medium text-charcoal">{splash.name}</h3>
                  <button
                    onClick={() => handlePlay(splash)}
                    className="text-warm-gray hover:text-rose transition-colors p-1"
                    aria-label={`Replay ${splash.name}`}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-warm-gray leading-relaxed mb-3 flex-1">{splash.desc}</p>
                <span className={`inline-block self-start text-xs font-medium px-2.5 py-1 rounded-full ${vibeColors[splash.vibe] || 'bg-gray-100 text-gray-600'}`}>
                  {splash.vibe}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {activeId && SplashComponent && (
        <Suspense fallback={null}>
          <SplashComponent onComplete={handleComplete} />
          <button
            onClick={handleComplete}
            className="fixed top-6 right-6 z-[200] bg-soft-white/90 backdrop-blur-sm text-charcoal text-sm font-medium px-4 py-2 rounded-full shadow-lg hover:bg-soft-white transition-colors"
          >
            Skip
          </button>
        </Suspense>
      )}
    </div>
  )
}
