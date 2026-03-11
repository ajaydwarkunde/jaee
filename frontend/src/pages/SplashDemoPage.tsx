import { useState, useCallback, lazy, Suspense, type ComponentType } from 'react'
import { Play, RotateCcw } from 'lucide-react'

interface SplashDef {
  id: number
  name: string
  desc: string
  tags: string[]
  loader: () => Promise<{ default: ComponentType<{ onComplete: () => void }> }>
}

const splashes: SplashDef[] = [
  {
    id: 0, name: 'Hamper Unveil',
    desc: 'Line-art gift box draws itself. Lid lifts with warm glow. Elegant product icons float up gracefully. Brand fades in.',
    tags: ['Gift', 'Sleek'],
    loader: () => import('@/components/splashes/Splash0Hamper'),
  },
  {
    id: 1, name: 'Slit',
    desc: 'A thin blade of warm light appears horizontally, casting subtle rays. It widens to fill the screen, revealing the brand.',
    tags: ['Cinematic', 'Minimal'],
    loader: () => import('@/components/splashes/Splash1Unwrap'),
  },
  {
    id: 2, name: 'Ink Bloom',
    desc: 'A drop of gold ink blooms organically from the center using turbulence, spreading outward like ink in water.',
    tags: ['Organic', 'Artsy'],
    loader: () => import('@/components/splashes/Splash2Matchstick'),
  },
  {
    id: 3, name: 'Aurora',
    desc: 'Monogram draws itself in gold. Soft aurora gradients drift across the dark. Particles float and scatter as the brand reveals.',
    tags: ['Premium', 'Ethereal'],
    loader: () => import('@/components/splashes/Splash3WaxSeal'),
  },
  {
    id: 4, name: 'Curtain',
    desc: 'A vertical seam of light splits the dark. Two panels slide apart like theater curtains, revealing the brand on cream.',
    tags: ['Elegant', 'Theatrical'],
    loader: () => import('@/components/splashes/Splash4Pour'),
  },
  {
    id: 5, name: 'Letter Cascade',
    desc: 'Each letter of "Jaai" cascades in with depth. An underline draws. A circular mask wipe reveals the final scene.',
    tags: ['Typographic', 'Modern'],
    loader: () => import('@/components/splashes/Splash5GiftTag'),
  },
]

const tagColors: Record<string, string> = {
  Cinematic: 'bg-amber-50 text-amber-700 border-amber-200',
  Minimal: 'bg-stone-50 text-stone-600 border-stone-200',
  Organic: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Artsy: 'bg-violet-50 text-violet-700 border-violet-200',
  Premium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  Ethereal: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  Elegant: 'bg-rose-50 text-rose-700 border-rose-200',
  Theatrical: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
  Typographic: 'bg-slate-50 text-slate-700 border-slate-200',
  Modern: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  Gift: 'bg-rose-50 text-rose-700 border-rose-200',
  Sleek: 'bg-stone-50 text-stone-600 border-stone-200',
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
    <div className="min-h-screen bg-[#FAFAF8] py-16">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-[11px] tracking-[0.4em] uppercase text-[#B4617B] mb-3 font-medium">Select an Animation</p>
          <h1 className="font-serif text-3xl md:text-4xl text-[#2D2D2D] tracking-wide">Splash Screen</h1>
          <div className="w-12 h-px bg-[#D4A843] mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {splashes.map((splash) => (
            <button
              key={splash.id}
              onClick={() => handlePlay(splash)}
              className="group text-left bg-white rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-xl hover:-translate-y-1 border border-stone-100"
            >
              <div className="relative h-44 bg-[#0a0a0a] flex items-center justify-center overflow-hidden">
                <div
                  className="font-serif text-2xl tracking-[0.3em] transition-all duration-700 group-hover:tracking-[0.5em] group-hover:opacity-60"
                  style={{ color: 'rgba(251,246,243,0.12)' }}
                >
                  Jaai
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                    <Play className="w-5 h-5 text-white/90 ml-0.5" />
                  </div>
                </div>
                <div
                  className="absolute bottom-0 inset-x-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: 'linear-gradient(90deg, transparent, #D4A843, transparent)' }}
                />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-serif text-lg text-[#2D2D2D]">{splash.name}</h3>
                  <RotateCcw className="w-3.5 h-3.5 text-stone-300 group-hover:text-[#B4617B] transition-colors" />
                </div>
                <p className="text-[13px] text-stone-400 leading-relaxed mb-4">{splash.desc}</p>
                <div className="flex gap-2">
                  {splash.tags.map(tag => (
                    <span key={tag} className={`text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-full border ${tagColors[tag] || 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {activeId !== null && SplashComponent && (
        <Suspense fallback={null}>
          <SplashComponent onComplete={handleComplete} />
          <button
            onClick={handleComplete}
            className="fixed top-6 right-6 z-[200] text-white/40 hover:text-white/80 text-xs tracking-widest uppercase transition-colors duration-300"
          >
            Skip
          </button>
        </Suspense>
      )}
    </div>
  )
}
