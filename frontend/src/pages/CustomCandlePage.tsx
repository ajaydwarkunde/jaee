import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { ArrowLeft, ArrowRight, Check, Flame, Palette, Droplets, Box, Type, Send, Sparkles } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { api } from '@/lib/api'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'
import { cn, formatPrice } from '@/lib/utils'
import { Link } from 'react-router-dom'
import { useBuilderOptions, type BuilderOption } from '@/hooks/useBuilderOptions'

const STEPS = [
  { id: 'size', label: 'Size', icon: Flame },
  { id: 'wax', label: 'Wax', icon: Droplets },
  { id: 'scent', label: 'Scent', icon: Sparkles },
  { id: 'color', label: 'Color', icon: Palette },
  { id: 'container', label: 'Container', icon: Box },
  { id: 'label', label: 'Label', icon: Type },
  { id: 'review', label: 'Review', icon: Send },
]

/* ──────── SVG Candle Preview ──────── */

function CandlePreview({ color, container, size }: { color: string; container: string; size: string }) {
  const scale = size === 'small' ? 0.75 : size === 'large' ? 1.15 : 1
  const isLight = isLightColor(color)

  return (
    <div className="flex items-center justify-center">
      <svg width={160 * scale} height={220 * scale} viewBox="0 0 160 220" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="flame-glow" cx="50%" cy="30%" r="50%">
            <stop offset="0%" stopColor="#B4617B" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#B4617B" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="flame-grad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#923C5B" />
            <stop offset="40%" stopColor="#E9868B" />
            <stop offset="80%" stopColor="#F2E3E8" />
            <stop offset="100%" stopColor="#FFF8F0" />
          </linearGradient>
          <linearGradient id="candle-body" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={color} stopOpacity="0.85" />
            <stop offset="30%" stopColor={color} />
            <stop offset="100%" stopColor={darken(color, 15)} />
          </linearGradient>
          <filter id="flame-blur"><feGaussianBlur stdDeviation="1.5" /></filter>
        </defs>
        <circle cx="80" cy="60" r="50" fill="url(#flame-glow)">
          <animate attributeName="r" values="48;54;48" dur="2s" repeatCount="indefinite" />
        </circle>
        <g filter="url(#flame-blur)">
          <path d="M80 25 C85 45,92 55,88 65 C86 72,82 74,80 74 C78 74,74 72,72 65 C68 55,75 45,80 25Z" fill="url(#flame-grad)" opacity="0.9">
            <animate attributeName="d" values="M80 25 C85 45,92 55,88 65 C86 72,82 74,80 74 C78 74,74 72,72 65 C68 55,75 45,80 25Z;M80 22 C87 42,90 54,87 64 C85 71,82 73,80 73 C78 73,75 71,73 64 C70 54,73 42,80 22Z;M80 25 C85 45,92 55,88 65 C86 72,82 74,80 74 C78 74,74 72,72 65 C68 55,75 45,80 25Z" dur="1.2s" repeatCount="indefinite" />
          </path>
        </g>
        <path d="M80 45 C82 55,85 60,84 65 C83 69,81 70,80 70 C79 70,77 69,76 65 C75 60,78 55,80 45Z" fill="#FFF8F0" opacity="0.8">
          <animate attributeName="d" values="M80 45 C82 55,85 60,84 65 C83 69,81 70,80 70 C79 70,77 69,76 65 C75 60,78 55,80 45Z;M80 43 C83 53,84 59,83 64 C82 68,81 69,80 69 C79 69,78 68,77 64 C76 59,77 53,80 43Z;M80 45 C82 55,85 60,84 65 C83 69,81 70,80 70 C79 70,77 69,76 65 C75 60,78 55,80 45Z" dur="0.8s" repeatCount="indefinite" />
        </path>
        <line x1="80" y1="70" x2="80" y2="82" stroke="#3a2a2a" strokeWidth="2" strokeLinecap="round" />
        {container === 'jar' && (
          <g>
            <rect x="40" y="80" width="80" height="110" rx="6" fill="url(#candle-body)" />
            <rect x="36" y="78" width="88" height="114" rx="8" fill="none" stroke={isLight ? '#d4c0b8' : darken(color, 25)} strokeWidth="1.5" opacity="0.6" />
            <rect x="42" y="82" width="14" height="100" rx="3" fill="white" opacity="0.15" />
          </g>
        )}
        {container === 'tin' && (
          <g>
            <rect x="40" y="80" width="80" height="100" rx="4" fill="url(#candle-body)" />
            <rect x="38" y="78" width="84" height="104" rx="5" fill="none" stroke="#999" strokeWidth="1.5" />
            <line x1="38" y1="84" x2="122" y2="84" stroke="#bbb" strokeWidth="0.5" />
          </g>
        )}
        {container === 'ceramic' && (
          <g>
            <path d="M45 85 Q40 85 38 110 Q36 165 45 190 Q50 195 80 195 Q110 195 115 190 Q124 165 122 110 Q120 85 115 85 Z" fill="url(#candle-body)" />
            <path d="M45 85 Q40 85 38 110 Q36 165 45 190 Q50 195 80 195 Q110 195 115 190 Q124 165 122 110 Q120 85 115 85 Z" fill="none" stroke={isLight ? '#c8b8b0' : darken(color, 20)} strokeWidth="1.5" opacity="0.5" />
          </g>
        )}
        {container === 'pillar' && (
          <g>
            <rect x="50" y="80" width="60" height="120" rx="2" fill="url(#candle-body)" />
            <rect x="52" y="82" width="10" height="110" rx="2" fill="white" opacity="0.12" />
          </g>
        )}
        {container === 'votive' && (
          <g>
            <path d="M48 90 L44 190 Q44 195 80 195 Q116 195 116 190 L112 90 Z" fill="url(#candle-body)" />
            <path d="M48 90 L44 190 Q44 195 80 195 Q116 195 116 190 L112 90 Z" fill="none" stroke={isLight ? '#c8b8b0' : darken(color, 20)} strokeWidth="1" opacity="0.4" />
          </g>
        )}
        <ellipse cx="80" cy="82" rx="38" ry="5" fill={color} opacity="0.6" />
        <ellipse cx="80" cy="200" rx="45" ry="6" fill="#923C5B" opacity="0.08">
          <animate attributeName="opacity" values="0.06;0.12;0.06" dur="3s" repeatCount="indefinite" />
        </ellipse>
      </svg>
    </div>
  )
}

function isLightColor(hex: string): boolean {
  const c = hex.replace('#', '')
  if (c.length < 6) return true
  const r = parseInt(c.substring(0, 2), 16)
  const g = parseInt(c.substring(2, 4), 16)
  const b = parseInt(c.substring(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 155
}

function darken(hex: string, percent: number): string {
  const c = hex.replace('#', '')
  if (c.length < 6) return hex
  const r = Math.max(0, parseInt(c.substring(0, 2), 16) - Math.round(255 * percent / 100))
  const g = Math.max(0, parseInt(c.substring(2, 4), 16) - Math.round(255 * percent / 100))
  const b = Math.max(0, parseInt(c.substring(4, 6), 16) - Math.round(255 * percent / 100))
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

/* ──────── Price Calculator ──────── */

function calculatePrice(
  config: CandleConfig,
  sizes: BuilderOption[],
  waxTypes: BuilderOption[],
  scents: BuilderOption[],
  containers: BuilderOption[],
): number {
  const size = sizes.find(s => s.optionKey === config.size)
  const wax = waxTypes.find(w => w.optionKey === config.waxType)
  const scent = scents.find(s => s.optionKey === config.scent)
  const container = containers.find(c => c.optionKey === config.container)

  let price = (size?.basePrice ?? 799) + (size?.surcharge ?? 0)
  price += wax?.surcharge ?? 0
  price += scent?.surcharge ?? 0
  price += container?.surcharge ?? 0
  if (config.labelText?.trim()) price += 50

  return Math.max(price, 0) * config.quantity
}

interface CandleConfig {
  size: string
  waxType: string
  scent: string
  color: string
  container: string
  labelText: string
  quantity: number
  notes: string
}

/* ──────── Main Page ──────── */

export default function CustomCandlePage() {
  const { user } = useAuthStore()
  const { byType, isLoading } = useBuilderOptions('CANDLE')

  const sizes = byType('SIZE')
  const waxTypes = byType('WAX')
  const scents = byType('SCENT')
  const colors = byType('COLOR')
  const containers = byType('CONTAINER')

  const [step, setStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)

  const [config, setConfig] = useState<CandleConfig>({
    size: '',
    waxType: '',
    scent: '',
    color: '',
    container: '',
    labelText: '',
    quantity: 1,
    notes: '',
  })

  // Set defaults from API once loaded
  const [defaultsSet, setDefaultsSet] = useState(false)
  if (!defaultsSet && sizes.length > 0) {
    setConfig(prev => ({
      ...prev,
      size: prev.size || sizes[0]?.optionKey || '',
      waxType: prev.waxType || waxTypes[0]?.optionKey || '',
      scent: prev.scent || scents[0]?.optionKey || '',
      color: prev.color || colors[0]?.hexColor || colors[0]?.optionKey || '',
      container: prev.container || containers[0]?.optionKey || '',
    }))
    setDefaultsSet(true)
  }

  const [contact, setContact] = useState({
    customerName: user?.name || '',
    customerEmail: user?.email || '',
    customerPhone: '',
  })

  const price = calculatePrice(config, sizes, waxTypes, scents, containers)

  const submitMutation = useMutation({
    mutationFn: () => api.post('/custom-candles', { ...contact, ...config }),
    onSuccess: () => { setSubmitted(true); toast.success('Custom candle request submitted!') },
    onError: () => { toast.error('Failed to submit. Please try again.') },
  })

  const update = (key: keyof CandleConfig, value: string | number) =>
    setConfig(prev => ({ ...prev, [key]: value }))

  const canProceed = () => {
    if (step === 6) return contact.customerName.trim() && contact.customerEmail.trim()
    return true
  }

  if (isLoading) return <LoadingSpinner fullScreen />

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-cream">
        <div className="text-center max-w-md px-4">
          <div className="w-20 h-20 bg-success/15 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-success" />
          </div>
          <h1 className="heading-3 text-charcoal mb-3">Request Submitted!</h1>
          <p className="text-warm-gray mb-2">We've received your custom candle order. Our team will review it and get back to you within 24-48 hours.</p>
          <p className="text-lg font-bold text-rose mb-6">Estimated Price: {formatPrice(price)}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/shop"><Button variant="outline">Continue Shopping</Button></Link>
            <Button onClick={() => { setSubmitted(false); setStep(0) }}>Create Another</Button>
          </div>
        </div>
      </div>
    )
  }

  const findOpt = (list: BuilderOption[], key: string) => list.find(o => o.optionKey === key)
  const findColor = (hex: string) => colors.find(c => c.hexColor === hex || c.optionKey === hex)

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-gradient-to-br from-blush via-cream to-champagne py-12 md:py-16">
        <div className="container-custom text-center">
          <span className="inline-block px-4 py-1.5 bg-rose/10 text-rose text-sm font-medium rounded-full mb-4">Custom Candle Builder</span>
          <h1 className="heading-2 text-charcoal">Design Your Perfect Candle</h1>
          <p className="mt-3 text-warm-gray max-w-lg mx-auto">Choose every detail — from wax to scent to color. Handcrafted just for you.</p>
        </div>
      </div>

      <div className="sticky top-16 md:top-20 z-30 bg-soft-white/95 backdrop-blur-sm border-b border-blush">
        <div className="container-custom py-3">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {STEPS.map((s, i) => {
              const Icon = s.icon
              const isActive = i === step
              const isDone = i < step
              return (
                <button key={s.id} onClick={() => i <= step && setStep(i)}
                  className={cn('flex flex-col items-center gap-1 transition-all', isActive && 'scale-110', i > step && 'opacity-40 cursor-default')}>
                  <div className={cn('w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center transition-colors',
                    isActive ? 'bg-rose text-soft-white' : isDone ? 'bg-rose/20 text-rose' : 'bg-blush text-warm-gray')}>
                    {isDone ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className={cn('text-[10px] md:text-xs font-medium hidden sm:block', isActive ? 'text-rose' : 'text-warm-gray')}>{s.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="container-custom py-8 md:py-12">
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
          <div className="lg:col-span-3">
            <div className="bg-soft-white rounded-xl shadow-soft p-6 md:p-8 min-h-[400px]">

              {step === 0 && (
                <div>
                  <h2 className="heading-4 text-charcoal mb-2">Choose Your Size</h2>
                  <p className="text-warm-gray text-sm mb-6">Select the perfect size for your space</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {sizes.map(s => (
                      <button key={s.optionKey} onClick={() => update('size', s.optionKey)}
                        className={cn('p-5 rounded-xl border-2 text-center transition-all hover:shadow-soft-md',
                          config.size === s.optionKey ? 'border-rose bg-rose/5' : 'border-blush hover:border-rose/30')}>
                        {s.emoji && <span className="text-3xl mb-2 block">{s.emoji}</span>}
                        <p className="font-medium text-charcoal">{s.label}</p>
                        {s.description && <p className="text-xs text-warm-gray mt-1">{s.description}</p>}
                        <p className="text-rose font-bold mt-2">{formatPrice(s.basePrice)}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div>
                  <h2 className="heading-4 text-charcoal mb-2">Select Wax Type</h2>
                  <p className="text-warm-gray text-sm mb-6">Each wax has unique burn characteristics</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {waxTypes.map(w => (
                      <button key={w.optionKey} onClick={() => update('waxType', w.optionKey)}
                        className={cn('p-5 rounded-xl border-2 text-left transition-all hover:shadow-soft-md',
                          config.waxType === w.optionKey ? 'border-rose bg-rose/5' : 'border-blush hover:border-rose/30')}>
                        <p className="font-medium text-charcoal">{w.label}</p>
                        {w.description && <p className="text-xs text-warm-gray mt-1">{w.description}</p>}
                        {w.surcharge > 0 && <p className="text-xs text-rose mt-2">+{formatPrice(w.surcharge)}</p>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h2 className="heading-4 text-charcoal mb-2">Pick a Fragrance</h2>
                  <p className="text-warm-gray text-sm mb-6">Choose from our premium scent collection</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {scents.map(s => (
                      <button key={s.optionKey} onClick={() => update('scent', s.optionKey)}
                        className={cn('p-4 rounded-xl border-2 text-center transition-all hover:shadow-soft-md',
                          config.scent === s.optionKey ? 'border-rose bg-rose/5' : 'border-blush hover:border-rose/30')}>
                        {s.emoji && <span className="text-2xl mb-1 block">{s.emoji}</span>}
                        <p className="text-sm font-medium text-charcoal">{s.label}</p>
                        {s.surcharge > 0 && <p className="text-[10px] text-rose mt-1">+{formatPrice(s.surcharge)}</p>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h2 className="heading-4 text-charcoal mb-2">Choose Your Color</h2>
                  <p className="text-warm-gray text-sm mb-6">Select the perfect shade for your candle</p>
                  <div className="grid grid-cols-5 gap-4">
                    {colors.map(c => {
                      const colorVal = c.hexColor || c.optionKey
                      return (
                        <button key={c.optionKey} onClick={() => update('color', colorVal)} className="flex flex-col items-center gap-2">
                          <div className={cn('w-12 h-12 md:w-14 md:h-14 rounded-full border-2 transition-all shadow-soft',
                            config.color === colorVal ? 'border-rose scale-110 shadow-soft-md' : 'border-blush hover:scale-105')}
                            style={{ backgroundColor: colorVal }} />
                          <span className={cn('text-xs', config.color === colorVal ? 'text-rose font-medium' : 'text-warm-gray')}>{c.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div>
                  <h2 className="heading-4 text-charcoal mb-2">Select Container</h2>
                  <p className="text-warm-gray text-sm mb-6">How should your candle be presented?</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {containers.map(c => (
                      <button key={c.optionKey} onClick={() => update('container', c.optionKey)}
                        className={cn('p-5 rounded-xl border-2 text-left transition-all hover:shadow-soft-md',
                          config.container === c.optionKey ? 'border-rose bg-rose/5' : 'border-blush hover:border-rose/30')}>
                        <p className="font-medium text-charcoal">{c.label}</p>
                        {c.description && <p className="text-xs text-warm-gray mt-1">{c.description}</p>}
                        {c.surcharge !== 0 && (
                          <p className={cn('text-xs mt-2', c.surcharge > 0 ? 'text-rose' : 'text-success')}>
                            {c.surcharge > 0 ? '+' : ''}{formatPrice(c.surcharge)}
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 5 && (
                <div>
                  <h2 className="heading-4 text-charcoal mb-2">Personalize with a Label</h2>
                  <p className="text-warm-gray text-sm mb-6">Add custom text to your candle (optional, +{formatPrice(50)})</p>
                  <Input label="Label Text" value={config.labelText} onChange={e => update('labelText', e.target.value)} placeholder="e.g., Happy Birthday, With Love..." maxLength={40} />
                  <p className="text-xs text-warm-gray mt-2">{config.labelText.length}/40 characters</p>
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-charcoal mb-2">Quantity</label>
                    <div className="flex items-center gap-3">
                      <button onClick={() => update('quantity', Math.max(1, config.quantity - 1))} className="w-10 h-10 rounded-lg border border-blush flex items-center justify-center hover:bg-blush transition-colors text-lg">−</button>
                      <span className="text-lg font-bold text-charcoal w-8 text-center">{config.quantity}</span>
                      <button onClick={() => update('quantity', Math.min(50, config.quantity + 1))} className="w-10 h-10 rounded-lg border border-blush flex items-center justify-center hover:bg-blush transition-colors text-lg">+</button>
                    </div>
                  </div>
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-charcoal mb-2">Additional Notes</label>
                    <textarea value={config.notes} onChange={e => update('notes', e.target.value)} placeholder="Any special requests or preferences..." rows={3} className="w-full px-4 py-3 bg-cream border border-blush rounded-lg focus:outline-none focus:border-rose transition-colors text-sm resize-none" />
                  </div>
                </div>
              )}

              {step === 6 && (
                <div>
                  <h2 className="heading-4 text-charcoal mb-6">Review & Submit</h2>
                  <div className="space-y-3 mb-6">
                    {[
                      { label: 'Size', value: findOpt(sizes, config.size)?.label },
                      { label: 'Wax', value: findOpt(waxTypes, config.waxType)?.label },
                      { label: 'Scent', value: findOpt(scents, config.scent)?.label },
                      { label: 'Color', value: findColor(config.color)?.label },
                      { label: 'Container', value: findOpt(containers, config.container)?.label },
                      { label: 'Label', value: config.labelText || 'None' },
                      { label: 'Quantity', value: config.quantity.toString() },
                    ].map(row => (
                      <div key={row.label} className="flex justify-between items-center py-2 border-b border-blush/50">
                        <span className="text-sm text-warm-gray">{row.label}</span>
                        <span className="text-sm font-medium text-charcoal">{row.value}</span>
                      </div>
                    ))}
                    {config.notes && <div className="py-2"><span className="text-sm text-warm-gray">Notes</span><p className="text-sm text-charcoal mt-1">{config.notes}</p></div>}
                  </div>
                  <div className="bg-rose/5 rounded-xl p-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-charcoal">Estimated Total</span>
                      <span className="text-xl font-bold text-rose">{formatPrice(price)}</span>
                    </div>
                    <p className="text-xs text-warm-gray mt-1">Final price may vary based on customization complexity</p>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-medium text-charcoal">Contact Details</h3>
                    <Input label="Your Name" value={contact.customerName} onChange={e => setContact(prev => ({ ...prev, customerName: e.target.value }))} placeholder="Enter your name" required />
                    <Input label="Email" type="email" value={contact.customerEmail} onChange={e => setContact(prev => ({ ...prev, customerEmail: e.target.value }))} placeholder="you@example.com" required />
                    <Input label="Phone (optional)" value={contact.customerPhone} onChange={e => setContact(prev => ({ ...prev, customerPhone: e.target.value }))} placeholder="+91 98765 43210" />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={step === 0} icon={<ArrowLeft className="w-4 h-4" />}>Back</Button>
              {step < 6 ? (
                <Button onClick={() => setStep(s => s + 1)} icon={<ArrowRight className="w-4 h-4" />}>Next</Button>
              ) : (
                <Button onClick={() => submitMutation.mutate()} loading={submitMutation.isPending} disabled={!canProceed()} icon={<Send className="w-4 h-4" />}>Submit Request</Button>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-36">
              <div className="bg-soft-white rounded-xl shadow-soft p-6 md:p-8">
                <h3 className="font-serif text-lg font-medium text-charcoal text-center mb-4">Your Candle</h3>
                <div className="flex justify-center py-6">
                  <CandlePreview color={config.color} container={config.container} size={config.size} />
                </div>
                {config.labelText && <p className="text-center text-sm font-serif italic text-rose mt-2">"{config.labelText}"</p>}
                <div className="border-t border-blush mt-6 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-warm-gray">Base ({findOpt(sizes, config.size)?.label})</span>
                    <span className="text-charcoal">{formatPrice(findOpt(sizes, config.size)?.basePrice ?? 0)}</span>
                  </div>
                  {(findOpt(waxTypes, config.waxType)?.surcharge ?? 0) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-warm-gray">{findOpt(waxTypes, config.waxType)?.label}</span>
                      <span className="text-charcoal">+{formatPrice(findOpt(waxTypes, config.waxType)?.surcharge ?? 0)}</span>
                    </div>
                  )}
                  {(findOpt(scents, config.scent)?.surcharge ?? 0) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-warm-gray">{findOpt(scents, config.scent)?.label} scent</span>
                      <span className="text-charcoal">+{formatPrice(findOpt(scents, config.scent)?.surcharge ?? 0)}</span>
                    </div>
                  )}
                  {(findOpt(containers, config.container)?.surcharge ?? 0) !== 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-warm-gray">{findOpt(containers, config.container)?.label}</span>
                      <span className="text-charcoal">
                        {(findOpt(containers, config.container)?.surcharge ?? 0) > 0 ? '+' : ''}{formatPrice(findOpt(containers, config.container)?.surcharge ?? 0)}
                      </span>
                    </div>
                  )}
                  {config.labelText.trim() && (
                    <div className="flex justify-between text-sm">
                      <span className="text-warm-gray">Custom label</span>
                      <span className="text-charcoal">+{formatPrice(50)}</span>
                    </div>
                  )}
                  {config.quantity > 1 && (
                    <div className="flex justify-between text-sm"><span className="text-warm-gray">× {config.quantity}</span><span /></div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-blush">
                    <span className="font-medium text-charcoal">Total</span>
                    <span className="text-lg font-bold text-rose">{formatPrice(price)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
