import { useRef, useEffect, useCallback } from 'react'
import lottie, { type AnimationItem } from 'lottie-web'

interface LottieSplashProps {
  onComplete: () => void
  src?: string
}

const PREFERS_REDUCED_MOTION =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function LottieSplash({
  onComplete,
  src = '/assets/hamper-open.json',
}: LottieSplashProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<AnimationItem | null>(null)
  const hasCompleted = useRef(false)

  const finish = useCallback(() => {
    if (hasCompleted.current) return
    hasCompleted.current = true
    onComplete()
  }, [onComplete])

  useEffect(() => {
    if (!containerRef.current) return

    if (PREFERS_REDUCED_MOTION) {
      const anim = lottie.loadAnimation({
        container: containerRef.current,
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: src,
      })
      anim.addEventListener('DOMLoaded', () => {
        anim.goToAndStop(anim.totalFrames - 1, true)
      })
      animRef.current = anim

      const timer = setTimeout(finish, 800)
      return () => {
        clearTimeout(timer)
        anim.destroy()
      }
    }

    const anim = lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'svg',
      loop: false,
      autoplay: true,
      path: src,
    })

    anim.addEventListener('complete', () => {
      setTimeout(finish, 400)
    })

    anim.addEventListener('error', finish)

    const fallbackTimer = setTimeout(finish, 6000)

    animRef.current = anim
    return () => {
      clearTimeout(fallbackTimer)
      anim.destroy()
    }
  }, [src, finish])

  const handleReplay = useCallback(() => {
    animRef.current?.goToAndPlay(0, true)
  }, [])

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{
        background: '#0B0B0F',
        pointerEvents: hasCompleted.current ? 'none' : 'all',
      }}
      onMouseEnter={handleReplay}
    >
      <div
        ref={containerRef}
        className="w-full h-full max-w-[1920px] max-h-[1080px]"
        style={{ aspectRatio: '16 / 9' }}
      />
    </div>
  )
}
