import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useStoreSettings } from '@/hooks/useStoreSettings'

export default function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(false)
  const [slideIndex, setSlideIndex] = useState(0)
  const { announcementBarSlide1, announcementBarSlide2 } = useStoreSettings()

  const slides = useMemo(() => {
    const s = [announcementBarSlide1, announcementBarSlide2].filter((t) => t && t.trim().length > 0)
    return s.length > 0 ? s : ['Use code JAAI10 for 10% off on your first order', 'Free shipping on orders above 1499 Rs']
  }, [announcementBarSlide1, announcementBarSlide2])

  const goPrev = () => {
    setSlideIndex((i) => (i - 1 + slides.length) % slides.length)
  }

  const goNext = () => {
    setSlideIndex((i) => (i + 1) % slides.length)
  }

  if (dismissed) return null

  const showNav = slides.length > 1

  return (
    <div className="bg-rose text-soft-white py-2 px-4 text-sm relative">
      <div className="flex items-center justify-center gap-2 md:gap-4 min-h-[2rem] pr-8 md:pr-10">
        {showNav && (
          <button
            type="button"
            onClick={goPrev}
            className="shrink-0 p-1.5 rounded-full hover:bg-soft-white/20 transition-colors"
            aria-label="Previous announcement"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
        <p className="font-medium text-center flex-1 px-1 leading-snug">
          {slides[slideIndex]}
        </p>
        {showNav && (
          <button
            type="button"
            onClick={goNext}
            className="shrink-0 p-1.5 rounded-full hover:bg-soft-white/20 transition-colors"
            aria-label="Next announcement"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-soft-white/20 rounded-full transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
