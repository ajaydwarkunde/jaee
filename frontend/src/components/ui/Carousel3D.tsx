import { ArrowRight } from 'lucide-react'
import { useState, useRef, useId, useEffect } from 'react'
import { Link } from 'react-router-dom'

interface SlideData {
  title: string
  button: string
  src: string
  href: string
}

interface SlideProps {
  slide: SlideData
  index: number
  current: number
  handleSlideClick: (index: number) => void
}

function Slide({ slide, index, current, handleSlideClick }: SlideProps) {
  const slideRef = useRef<HTMLLIElement>(null)
  const xRef = useRef(0)
  const yRef = useRef(0)
  const frameRef = useRef<number>()

  useEffect(() => {
    const animate = () => {
      if (!slideRef.current) return
      slideRef.current.style.setProperty('--x', `${xRef.current}px`)
      slideRef.current.style.setProperty('--y', `${yRef.current}px`)
      frameRef.current = requestAnimationFrame(animate)
    }
    frameRef.current = requestAnimationFrame(animate)
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [])

  const handleMouseMove = (event: React.MouseEvent) => {
    const el = slideRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    xRef.current = event.clientX - (r.left + Math.floor(r.width / 2))
    yRef.current = event.clientY - (r.top + Math.floor(r.height / 2))
  }

  const handleMouseLeave = () => {
    xRef.current = 0
    yRef.current = 0
  }

  const { src, button, title, href } = slide
  const isActive = current === index

  return (
    <div className="[perspective:1200px] [transform-style:preserve-3d]">
      <li
        ref={slideRef}
        className="flex flex-1 flex-col items-center justify-center relative text-center text-soft-white opacity-100 transition-all duration-300 ease-in-out w-[70vmin] h-[70vmin] mx-[4vmin] z-10"
        onClick={() => handleSlideClick(index)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: isActive ? 'scale(1) rotateX(0deg)' : 'scale(0.98) rotateX(8deg)',
          transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          transformOrigin: 'bottom',
        }}
      >
        <div
          className="absolute top-0 left-0 w-full h-full bg-charcoal rounded-xl overflow-hidden transition-all duration-150 ease-out"
          style={{
            transform: isActive
              ? 'translate3d(calc(var(--x) / 30), calc(var(--y) / 30), 0)'
              : 'none',
          }}
        >
          <img
            className="absolute inset-0 w-[120%] h-[120%] object-cover transition-opacity duration-500 ease-in-out"
            style={{ opacity: isActive ? 1 : 0.5 }}
            alt={title}
            src={src}
            loading="eager"
            decoding="sync"
          />
          {isActive && (
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-charcoal/20 to-transparent transition-all duration-1000" />
          )}
        </div>

        <article
          className={`relative p-[4vmin] transition-opacity duration-1000 ease-in-out mt-auto ${
            isActive ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}
        >
          <h2 className="text-lg md:text-2xl lg:text-4xl font-serif font-semibold drop-shadow-lg">
            {title}
          </h2>
          <div className="flex justify-center">
            <Link
              to={href}
              className="mt-6 px-6 py-3 bg-soft-white text-charcoal text-sm font-medium rounded-full hover:bg-rose hover:text-soft-white transition-colors duration-200 shadow-soft-md flex items-center gap-2"
            >
              {button}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </article>
      </li>
    </div>
  )
}

interface CarouselControlProps {
  type: 'previous' | 'next'
  title: string
  handleClick: () => void
}

function CarouselControl({ type, title, handleClick }: CarouselControlProps) {
  return (
    <button
      className={`w-10 h-10 flex items-center mx-2 justify-center bg-soft-white border-2 border-transparent rounded-full focus:border-rose focus:outline-none hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-200 shadow-soft hover:shadow-soft-md ${
        type === 'previous' ? 'rotate-180' : ''
      }`}
      title={title}
      onClick={handleClick}
    >
      <ArrowRight className="w-5 h-5 text-charcoal" />
    </button>
  )
}

interface Carousel3DProps {
  slides: SlideData[]
}

export default function Carousel3D({ slides }: Carousel3DProps) {
  const [current, setCurrent] = useState(0)
  const id = useId()

  const handlePreviousClick = () => {
    setCurrent((prev) => (prev - 1 < 0 ? slides.length - 1 : prev - 1))
  }

  const handleNextClick = () => {
    setCurrent((prev) => (prev + 1 === slides.length ? 0 : prev + 1))
  }

  const handleSlideClick = (index: number) => {
    if (current !== index) setCurrent(index)
  }

  return (
    <div
      className="relative w-[70vmin] h-[70vmin] mx-auto"
      aria-labelledby={`carousel-heading-${id}`}
    >
      <ul
        className="absolute flex mx-[-4vmin] transition-transform duration-1000 ease-in-out list-none"
        style={{
          transform: `translateX(-${current * (100 / slides.length)}%)`,
        }}
      >
        {slides.map((slide, index) => (
          <Slide
            key={index}
            slide={slide}
            index={index}
            current={current}
            handleSlideClick={handleSlideClick}
          />
        ))}
      </ul>

      <div className="absolute flex justify-center w-full top-[calc(100%+1rem)]">
        <CarouselControl type="previous" title="Go to previous slide" handleClick={handlePreviousClick} />
        <CarouselControl type="next" title="Go to next slide" handleClick={handleNextClick} />
      </div>
    </div>
  )
}
