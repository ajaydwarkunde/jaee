import { CandleFlameLoader, GlowRingLoader, PetalBloomLoader, WaxDripLoader, OrbitLoader } from '@/components/ui/LoaderPreview'
import KineticDotsLoader from '@/components/ui/KineticDotsLoader'
import CandleLoader from '@/components/ui/CandleLoader'

const loaders = [
  { name: '⭐ 3D Candle (NEW)', desc: 'Full 3D candle that lights up with flame, glow, wax drips & smoke', component: <CandleLoader size="md" />, featured: true },
  { name: '1. Candle Flame Pulse', desc: 'A flickering flame — directly on-brand for candles', component: <CandleFlameLoader /> },
  { name: '2. Breathing Glow Ring', desc: 'Expanding/contracting rings like a candle\'s warm aura', component: <GlowRingLoader /> },
  { name: '3. Petal Bloom', desc: 'Dots blooming outward in a flower pattern', component: <PetalBloomLoader /> },
  { name: '4. Wax Drip Bars', desc: 'Bars filling like melting wax with a wave effect', component: <WaxDripLoader /> },
  { name: '5. Elegant Orbit', desc: 'Two dots orbiting with rose gradient trails', component: <OrbitLoader /> },
  { name: '6. Kinetic Dots (current)', desc: 'The bouncing dots loader currently in use', component: <KineticDotsLoader size="md" /> },
]

export default function LoaderDemoPage() {
  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="container-custom">
        <h1 className="heading-2 text-charcoal text-center mb-2">Loader Options</h1>
        <p className="text-warm-gray text-center mb-12">Pick the one that best suits the brand</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {loaders.map((loader) => (
            <div key={loader.name} className={`bg-soft-white rounded-xl shadow-soft p-8 flex flex-col items-center ${
              'featured' in loader && loader.featured ? 'ring-2 ring-rose sm:col-span-2 lg:col-span-1' : ''
            }`}>
              <div className="min-h-[200px] flex items-center justify-center">
                {loader.component}
              </div>
              <h3 className="font-serif text-lg font-medium text-charcoal mt-6">{loader.name}</h3>
              <p className="text-sm text-warm-gray mt-1 text-center">{loader.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
