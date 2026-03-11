import { useState, useEffect, useMemo } from 'react'

const PARTICLES = Array.from({ length: 24 }, () => ({
  x: 35 + Math.random() * 30,
  y: 30 + Math.random() * 25,
  size: 1 + Math.random() * 2.5,
  delay: Math.random() * 1200,
  duration: 1800 + Math.random() * 1200,
  drift: (Math.random() - 0.5) * 20,
  opacity: 0.3 + Math.random() * 0.5,
}))

const SPARKLES = Array.from({ length: 8 }, () => ({
  x: 25 + Math.random() * 50,
  y: 20 + Math.random() * 40,
  delay: 400 + Math.random() * 1000,
  size: 2 + Math.random() * 3,
}))

export default function Splash0Hamper({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 900),
      setTimeout(() => setPhase(3), 1800),
      setTimeout(() => setPhase(4), 3000),
      setTimeout(() => setPhase(5), 4000),
      setTimeout(() => setPhase(6), 4800),
      setTimeout(() => onComplete(), 5600),
    ]
    return () => timers.forEach(clearTimeout)
  }, [onComplete])

  const styleTag = useMemo(() => `
    @keyframes sp0-float {
      0% { transform: translateY(0) translateX(0); opacity: 0; }
      15% { opacity: var(--sp0-op); }
      85% { opacity: var(--sp0-op); }
      100% { transform: translateY(-60px) translateX(var(--sp0-drift)); opacity: 0; }
    }
    @keyframes sp0-twinkle {
      0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
      50% { opacity: 0.9; transform: scale(1) rotate(180deg); }
    }
    @keyframes sp0-glow-pulse {
      0%, 100% { opacity: 0.12; }
      50% { opacity: 0.22; }
    }
    @keyframes sp0-push-in {
      0% { transform: scale(1); }
      100% { transform: scale(1.03); }
    }
    @keyframes sp0-vignette-breathe {
      0%, 100% { opacity: 0.85; }
      50% { opacity: 0.75; }
    }
  `, [])

  if (phase > 6) return null

  const ribbonLoose = phase >= 1
  const lidOpen = phase >= 2
  const glowOn = phase >= 3
  const brandShow = phase >= 4
  const fadeStart = phase >= 5

  return (
    <div
      className="fixed inset-0 z-[100] overflow-hidden"
      style={{ pointerEvents: fadeStart ? 'none' : 'all' }}
    >
      <style>{styleTag}</style>

      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #0a0a0a 0%, #111111 40%, #0d0b09 100%)',
          opacity: phase >= 6 ? 0 : 1,
          transition: 'opacity 800ms cubic-bezier(0.4, 0, 0, 1)',
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 48%, transparent 30%, rgba(0,0,0,0.7) 100%)',
          animation: 'sp0-vignette-breathe 4s ease-in-out infinite',
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 40% 15% at 50% 72%, rgba(212,168,67,0.06) 0%, transparent 100%)',
          opacity: phase >= 1 ? 1 : 0,
          transition: 'opacity 1500ms ease',
        }}
      />

      {glowOn && (
        <div className="absolute inset-0" style={{ opacity: fadeStart ? 0 : 1, transition: 'opacity 600ms ease' }}>
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                left: `${42 + i * 4}%`,
                top: '25%',
                width: '1px',
                height: '30vh',
                background: `linear-gradient(180deg, rgba(212,168,67,${0.08 - i * 0.01}) 0%, transparent 100%)`,
                transform: `rotate(${-8 + i * 4}deg)`,
                transformOrigin: 'top center',
                filter: 'blur(3px)',
                opacity: 0,
                animation: `sp0-glow-pulse 2s ease-in-out ${i * 150}ms infinite`,
              }}
            />
          ))}
        </div>
      )}

      <div
        className="absolute"
        style={{
          left: '50%',
          top: '42%',
          width: 300,
          height: 200,
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(ellipse at center, rgba(212,168,67,0.08) 0%, transparent 60%)',
          filter: 'blur(30px)',
          opacity: glowOn && !fadeStart ? 1 : 0,
          transition: 'opacity 1000ms ease',
        }}
      />

      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ animation: phase >= 1 ? 'sp0-push-in 5s cubic-bezier(0.4, 0, 0, 1) forwards' : 'none' }}
      >
        <div className="relative" style={{ width: 340, height: 380 }}>
          <svg viewBox="0 0 300 260" fill="none" className="absolute" style={{ width: '100%', bottom: 10, left: 0 }}>
            <defs>
              <linearGradient id="d-box-front" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2a2a2a" /><stop offset="50%" stopColor="#1a1a1a" /><stop offset="100%" stopColor="#111111" /></linearGradient>
              <linearGradient id="d-box-side" x1="0" y1="0" x2="1" y2="0.5"><stop offset="0%" stopColor="#1e1e1e" /><stop offset="100%" stopColor="#0f0f0f" /></linearGradient>
              <linearGradient id="d-lid-top" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#2e2e2e" /><stop offset="100%" stopColor="#1a1a1a" /></linearGradient>
              <linearGradient id="d-lid-front" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#252525" /><stop offset="100%" stopColor="#1a1a1a" /></linearGradient>
              <linearGradient id="d-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#C4953A" /><stop offset="30%" stopColor="#F0D78C" /><stop offset="50%" stopColor="#D4A843" /><stop offset="70%" stopColor="#F0D78C" /><stop offset="100%" stopColor="#C4953A" /></linearGradient>
              <linearGradient id="d-gold-v" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#F0D78C" /><stop offset="50%" stopColor="#D4A843" /><stop offset="100%" stopColor="#C4953A" /></linearGradient>
              <linearGradient id="d-candle" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1a1a1a" /><stop offset="100%" stopColor="#0d0d0d" /></linearGradient>
              <linearGradient id="d-diffuser" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1e1e1e" /><stop offset="100%" stopColor="#0a0a0a" /></linearGradient>
              <linearGradient id="d-amber" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#B8860B" /><stop offset="100%" stopColor="#8B6508" /></linearGradient>
              <filter id="d-glow"><feGaussianBlur stdDeviation="4" /></filter>
              <filter id="d-shadow"><feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.5" /></filter>
            </defs>

            <ellipse cx="150" cy="248" rx="100" ry="8" fill="#000" opacity="0.4" filter="url(#d-glow)" />

            <path d="M55 130 L55 240 L245 240 L245 130 Z" fill="url(#d-box-front)" />
            <path d="M245 130 L245 240 L270 225 L270 118 Z" fill="url(#d-box-side)" />
            <line x1="55" y1="240" x2="245" y2="240" stroke="url(#d-gold)" strokeWidth="0.8" opacity="0.5" />
            <line x1="245" y1="240" x2="270" y2="225" stroke="url(#d-gold)" strokeWidth="0.5" opacity="0.3" />
            <line x1="245" y1="130" x2="245" y2="240" stroke="url(#d-gold-v)" strokeWidth="0.5" opacity="0.2" />

            <g style={{ opacity: ribbonLoose ? 0.3 : 0.8, transform: ribbonLoose ? 'translateX(8px)' : 'translateX(0)', transition: 'opacity 800ms ease, transform 800ms cubic-bezier(0.4,0,0,1)' }}>
              <rect x="143" y="130" width="14" height="110" fill="url(#d-gold)" opacity="0.6" />
              <rect x="55" y="175" width="190" height="12" fill="url(#d-gold)" opacity="0.5" />
              <path d="M245 175 L270 163 L270 173 L245 187 Z" fill="url(#d-gold)" opacity="0.35" />
            </g>

            <g style={{ opacity: lidOpen ? 1 : 0, transition: 'opacity 800ms ease 200ms' }}>
              <rect x="58" y="115" width="184" height="20" fill="#0a0808" opacity="0.9" />
              {[...Array(12)].map((_, i) => (
                <path key={`dp-${i}`} d={`M${70 + i * 14} ${125 + (i % 3) * 2} q${3 + (i % 4)} ${-4 - (i % 3)} ${8 + (i % 5)} ${-1 + (i % 2)}`} stroke="#D4A843" strokeWidth="1.2" fill="none" opacity={0.15 + (i % 3) * 0.08} />
              ))}
              <g style={{ transform: glowOn ? 'translateY(-6px)' : 'translateY(0)', transition: 'transform 1200ms cubic-bezier(0.4,0,0,1)' }} filter="url(#d-shadow)">
                <g><rect x="72" y="98" width="36" height="30" rx="2" fill="url(#d-candle)" stroke="#2a2a2a" strokeWidth="0.5" /><rect x="70" y="94" width="40" height="6" rx="1.5" fill="url(#d-gold)" opacity="0.8" /><rect x="70" y="94" width="40" height="1" fill="#F0D78C" opacity="0.3" /><rect x="78" y="106" width="24" height="8" rx="1" fill="none" stroke="url(#d-gold)" strokeWidth="0.4" opacity="0.4" /></g>
                <g><rect x="118" y="88" width="24" height="40" rx="3" fill="url(#d-diffuser)" stroke="#222" strokeWidth="0.5" /><rect x="118" y="92" width="24" height="3" fill="url(#d-gold)" opacity="0.5" />{[0,1,2,3,4].map(r => <line key={`dr-${r}`} x1={125+r*3} y1="88" x2={122+r*4} y2={68+(r%2)*4} stroke="#3a3530" strokeWidth="1" strokeLinecap="round" />)}</g>
                <g><rect x="152" y="95" width="20" height="33" rx="3" fill="url(#d-amber)" opacity="0.85" /><rect x="155" y="98" width="3" height="20" rx="1" fill="white" opacity="0.06" /><rect x="157" y="86" width="10" height="11" rx="2" fill="#1a1a1a" stroke="#2a2a2a" strokeWidth="0.5" /><rect x="160" y="82" width="4" height="5" rx="1" fill="#222" /><rect x="152" y="93" width="20" height="2.5" rx="1" fill="url(#d-gold)" opacity="0.4" /></g>
                <g><rect x="182" y="105" width="30" height="22" rx="4" fill="#F5F0EB" stroke="#E8E0D8" strokeWidth="0.5" /><rect x="180" y="100" width="34" height="7" rx="2" fill="#FDFBF9" stroke="#E8E0D8" strokeWidth="0.3" /><rect x="190" y="112" width="14" height="1" fill="url(#d-gold)" opacity="0.4" /></g>
                <g><rect x="220" y="108" width="28" height="18" rx="1.5" fill="#1e1a16" stroke="#2a2520" strokeWidth="0.5" /><rect x="220" y="115" width="28" height="3" fill="url(#d-gold)" opacity="0.5" /><rect x="231" y="108" width="4" height="18" fill="url(#d-gold)" opacity="0.4" /><circle cx="233" cy="115" r="2" fill="#D4A843" opacity="0.6" /></g>
              </g>
              <rect x="60" y="100" width="180" height="40" rx="4" fill="#D4A843" opacity={glowOn ? 0.06 : 0} style={{ transition: 'opacity 1000ms ease', filter: 'blur(10px)' }} />
            </g>

            <g style={{ transform: lidOpen ? 'rotate(-45deg)' : 'rotate(0deg)', transformOrigin: '270px 118px', transition: 'transform 1000ms cubic-bezier(0.4,0,0.2,1)' }}>
              <path d="M50 118 L270 118 L295 105 L75 105 Z" fill="url(#d-lid-top)" />
              <path d="M50 118 L50 130 L245 130 L245 118 Z" fill="url(#d-lid-front)" />
              <path d="M245 118 L245 130 L270 118 L295 105 Z" fill="#151515" />
              <line x1="50" y1="130" x2="245" y2="130" stroke="url(#d-gold)" strokeWidth="0.8" opacity="0.4" />
              <line x1="245" y1="130" x2="270" y2="118" stroke="url(#d-gold)" strokeWidth="0.5" opacity="0.2" />
              <g style={{ opacity: lidOpen ? 0 : 0.7, transition: 'opacity 400ms ease' }}>
                <rect x="143" y="118" width="14" height="12" fill="url(#d-gold)" opacity="0.5" />
                <ellipse cx="145" cy="112" rx="12" ry="6" fill="#D4A843" opacity="0.5" />
                <ellipse cx="160" cy="112" rx="12" ry="6" fill="#F0D78C" opacity="0.4" />
                <circle cx="152" cy="113" r="3.5" fill="#C4953A" opacity="0.7" />
                <circle cx="152" cy="113" r="1.5" fill="#F0D78C" opacity="0.5" />
                <path d="M148 117 Q140 125 134 122" stroke="#D4A843" strokeWidth="1.5" fill="none" opacity="0.4" strokeLinecap="round" />
                <path d="M156 117 Q164 125 170 122" stroke="#D4A843" strokeWidth="1.5" fill="none" opacity="0.4" strokeLinecap="round" />
              </g>
            </g>
          </svg>

          <div className="absolute" style={{ left: '15%', bottom: 90, width: '70%', height: 50, background: 'radial-gradient(ellipse at center, rgba(212,168,67,0.2) 0%, transparent 70%)', filter: 'blur(15px)', opacity: glowOn && !fadeStart ? 1 : 0, transition: 'opacity 1000ms ease' }} />

          {glowOn && !fadeStart && PARTICLES.map((p, i) => (
            <div key={`p-${i}`} className="absolute rounded-full" style={{ left: `${p.x}%`, bottom: 100, width: p.size, height: p.size, background: 'radial-gradient(circle, #F0D78C, #D4A843)', '--sp0-drift': `${p.drift}px`, '--sp0-op': p.opacity, animation: `sp0-float ${p.duration}ms ease-in-out ${p.delay}ms infinite`, filter: 'blur(0.3px)' } as React.CSSProperties} />
          ))}

          {glowOn && !fadeStart && SPARKLES.map((s, i) => (
            <svg key={`s-${i}`} className="absolute" width={s.size * 4} height={s.size * 4} viewBox="0 0 20 20" style={{ left: `${s.x}%`, top: `${s.y}%`, animation: `sp0-twinkle ${1600 + i * 200}ms ease-in-out ${s.delay}ms infinite` }}>
              <path d="M10 0 L11 8 L20 10 L11 12 L10 20 L9 12 L0 10 L9 8 Z" fill="#F0D78C" opacity="0.7" />
            </svg>
          ))}

          <div className="absolute w-full text-center" style={{ bottom: -35 }}>
            <h1 className="font-serif tracking-[0.35em] text-3xl md:text-4xl" style={{ color: '#FBF6F3', opacity: brandShow && !fadeStart ? 1 : 0, transform: brandShow ? 'translateY(0)' : 'translateY(10px)', transition: 'opacity 900ms cubic-bezier(0.4,0,0,1), transform 900ms cubic-bezier(0.4,0,0,1)', textShadow: '0 0 40px rgba(212,168,67,0.2)' }}>Jaai</h1>
            <div className="flex items-center justify-center gap-3 mt-3" style={{ opacity: brandShow && !fadeStart ? 1 : 0, transition: 'opacity 800ms ease 300ms' }}>
              <div className="h-px" style={{ width: brandShow ? 28 : 0, background: 'linear-gradient(90deg, transparent, rgba(212,168,67,0.4))', transition: 'width 700ms ease 400ms' }} />
              <p className="text-[9px] tracking-[0.45em] uppercase" style={{ color: 'rgba(240,215,140,0.4)' }}>Gifts Crafted with Love</p>
              <div className="h-px" style={{ width: brandShow ? 28 : 0, background: 'linear-gradient(90deg, rgba(212,168,67,0.4), transparent)', transition: 'width 700ms ease 400ms' }} />
            </div>
          </div>
        </div>
      </div>

      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.035, mixBlendMode: 'overlay' }}>
        <filter id="sp0-grain"><feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="4" stitchTiles="stitch" /></filter>
        <rect width="100%" height="100%" filter="url(#sp0-grain)" />
      </svg>

      <div className="absolute inset-0" style={{ background: '#FBF6F3', opacity: phase >= 6 ? 1 : 0, transition: 'opacity 800ms cubic-bezier(0.4,0,0,1)' }} />
    </div>
  )
}
