import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { ArrowLeft, ArrowRight, Check, Gift, Palette, Package, MessageSquare, Send, Sparkles, Heart, Star } from 'lucide-react'
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
  { id: 'size', label: 'Size', icon: Package },
  { id: 'occasion', label: 'Occasion', icon: Star },
  { id: 'items', label: 'Items', icon: Gift },
  { id: 'wrapping', label: 'Wrapping', icon: Sparkles },
  { id: 'theme', label: 'Theme', icon: Palette },
  { id: 'message', label: 'Message', icon: MessageSquare },
  { id: 'review', label: 'Review', icon: Send },
]

/* ──────── Types ──────── */

interface HamperConfig {
  hamperSize: string
  occasion: string
  items: string[]
  wrapping: string
  colorTheme: string
  messageCard: string
  recipientName: string
  quantity: number
  notes: string
}

/* ──────── Price Calculator ──────── */

function calculatePrice(config: HamperConfig, sizes: BuilderOption[], items: BuilderOption[], wrappings: BuilderOption[]): number {
  const size = sizes.find(s => s.optionKey === config.hamperSize)
  const wrapping = wrappings.find(w => w.optionKey === config.wrapping)

  let price = (size?.basePrice ?? 1999) + (size?.surcharge ?? 0)
  config.items.forEach(itemId => {
    const item = items.find(i => i.optionKey === itemId)
    if (item) price += item.surcharge
  })
  price += wrapping?.surcharge ?? 0
  if (config.messageCard.trim()) price += 50

  return Math.max(price, 0) * config.quantity
}

/* ──────── Hamper Preview SVG ──────── */

function HamperPreview({ themeColors, itemCount, wrapping }: { themeColors: string[]; itemCount: number; wrapping: string }) {
  const colors = themeColors.length >= 3 ? themeColors : ['#B4617B', '#D4A843', '#F2E3E8']
  const isLuxury = wrapping === 'luxury'
  const isFestive = wrapping === 'festive'

  return (
    <div className="flex items-center justify-center">
      <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="hb-box" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={colors[0]} />
            <stop offset="100%" stopColor={colors[1]} />
          </linearGradient>
          <linearGradient id="hb-lid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors[0]} stopOpacity="0.9" />
            <stop offset="100%" stopColor={colors[1]} stopOpacity="0.7" />
          </linearGradient>
          <radialGradient id="hb-glow" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor={colors[0]} stopOpacity="0.15" />
            <stop offset="100%" stopColor={colors[0]} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Glow */}
        <circle cx="100" cy="100" r="80" fill="url(#hb-glow)">
          <animate attributeName="r" values="78;84;78" dur="3s" repeatCount="indefinite" />
        </circle>

        {/* Box body */}
        <rect x="35" y="90" width="130" height="80" rx="6" fill="url(#hb-box)" opacity="0.95" />
        <rect x="35" y="90" width="130" height="80" rx="6" fill="none" stroke={colors[2]} strokeWidth="1" opacity="0.4" />

        {/* Box shine */}
        <rect x="40" y="95" width="15" height="60" rx="3" fill="white" opacity="0.1" />

        {/* Lid */}
        <rect x="30" y="78" width="140" height="16" rx="4" fill="url(#hb-lid)" />
        <rect x="30" y="78" width="140" height="16" rx="4" fill="none" stroke={colors[2]} strokeWidth="0.5" opacity="0.3" />

        {/* Ribbon vertical */}
        <rect x="94" y="78" width="12" height="92" fill={colors[2]} opacity="0.5" />
        {/* Ribbon horizontal */}
        <rect x="30" y="82" width="140" height="8" fill={colors[2]} opacity="0.4" />

        {/* Bow */}
        <ellipse cx="92" cy="68" rx="18" ry="12" fill={colors[0]} opacity="0.8">
          <animate attributeName="ry" values="11;13;11" dur="2s" repeatCount="indefinite" />
        </ellipse>
        <ellipse cx="108" cy="68" rx="18" ry="12" fill={colors[1]} opacity="0.8">
          <animate attributeName="ry" values="13;11;13" dur="2s" repeatCount="indefinite" />
        </ellipse>
        <circle cx="100" cy="70" r="5" fill={colors[2]} opacity="0.9" />

        {isLuxury && (
          <>
            <circle cx="50" cy="105" r="2" fill="#D4A843" opacity="0.6"><animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" /></circle>
            <circle cx="150" cy="130" r="1.5" fill="#D4A843" opacity="0.5"><animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" /></circle>
            <circle cx="70" cy="150" r="1.5" fill="#D4A843" opacity="0.4"><animate attributeName="opacity" values="0.2;0.7;0.2" dur="2.5s" repeatCount="indefinite" /></circle>
          </>
        )}

        {isFestive && (
          <>
            <circle cx="55" cy="55" r="3" fill="#E9868B" opacity="0.6"><animate attributeName="cy" values="55;50;55" dur="2s" repeatCount="indefinite" /></circle>
            <circle cx="145" cy="50" r="2.5" fill="#D4A843" opacity="0.5"><animate attributeName="cy" values="50;45;50" dur="1.8s" repeatCount="indefinite" /></circle>
            <circle cx="100" cy="45" r="2" fill="#6B9E76" opacity="0.5"><animate attributeName="cy" values="45;40;45" dur="2.2s" repeatCount="indefinite" /></circle>
          </>
        )}

        {/* Item count indicator */}
        {itemCount > 0 && (
          <g>
            <circle cx="155" cy="155" r="14" fill={colors[0]} />
            <text x="155" y="160" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
              {itemCount}
            </text>
          </g>
        )}

        {/* Shadow */}
        <ellipse cx="100" cy="178" rx="55" ry="5" fill={colors[0]} opacity="0.08">
          <animate attributeName="opacity" values="0.06;0.12;0.06" dur="3s" repeatCount="indefinite" />
        </ellipse>
      </svg>
    </div>
  )
}

/* ──────── Main Page ──────── */

export default function CustomHamperPage() {
  const { user } = useAuthStore()
  const { byType, isLoading } = useBuilderOptions('HAMPER')

  const sizes = byType('SIZE')
  const occasions = byType('OCCASION')
  const items = byType('ITEM')
  const wrappings = byType('WRAPPING')
  const colorThemes = byType('COLOR_THEME')

  const [step, setStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)

  const [config, setConfig] = useState<HamperConfig>({
    hamperSize: '',
    occasion: '',
    items: [],
    wrapping: '',
    colorTheme: '',
    messageCard: '',
    recipientName: '',
    quantity: 1,
    notes: '',
  })

  const [defaultsSet, setDefaultsSet] = useState(false)
  if (!defaultsSet && sizes.length > 0) {
    setConfig(prev => ({
      ...prev,
      hamperSize: prev.hamperSize || sizes[0]?.optionKey || '',
      occasion: prev.occasion || occasions[0]?.optionKey || '',
      items: prev.items.length ? prev.items : [items[0]?.optionKey].filter(Boolean),
      wrapping: prev.wrapping || wrappings[0]?.optionKey || '',
      colorTheme: prev.colorTheme || colorThemes[0]?.optionKey || '',
    }))
    setDefaultsSet(true)
  }

  const [contact, setContact] = useState({
    customerName: user?.name || '',
    customerEmail: user?.email || '',
    customerPhone: '',
  })

  const price = calculatePrice(config, sizes, items, wrappings)

  const submitMutation = useMutation({
    mutationFn: () =>
      api.post('/gift-hampers', {
        ...contact,
        ...config,
        items: config.items.join(','),
      }),
    onSuccess: () => {
      setSubmitted(true)
      toast.success('Gift hamper request submitted!')
    },
    onError: () => {
      toast.error('Failed to submit. Please try again.')
    },
  })

  const toggleItem = (id: string) =>
    setConfig(prev => ({
      ...prev,
      items: prev.items.includes(id)
        ? prev.items.filter(i => i !== id)
        : [...prev.items, id],
    }))

  const update = (key: keyof HamperConfig, value: string | number) =>
    setConfig(prev => ({ ...prev, [key]: value }))

  const canProceed = () => {
    if (step === 2 && config.items.length === 0) return false
    if (step === 6) return contact.customerName.trim() && contact.customerEmail.trim()
    return true
  }

  if (isLoading) return <LoadingSpinner fullScreen />

  const findOpt = (list: BuilderOption[], key: string) => list.find(o => o.optionKey === key)
  const getThemeColors = (key: string): string[] => {
    const t = colorThemes.find(ct => ct.optionKey === key)
    if (t?.colorsJson) { try { return JSON.parse(t.colorsJson) } catch { return ['#B4617B', '#D4A843', '#F2E3E8'] } }
    return ['#B4617B', '#D4A843', '#F2E3E8']
  }

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-cream">
        <div className="text-center max-w-md px-4">
          <div className="w-20 h-20 bg-success/15 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-success" />
          </div>
          <h1 className="heading-3 text-charcoal mb-3">Request Submitted!</h1>
          <p className="text-warm-gray mb-2">
            We've received your gift hamper request. Our team will curate it with care and get back to you within 24-48 hours.
          </p>
          <p className="text-lg font-bold text-rose mb-6">
            Estimated Price: {formatPrice(price)}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/shop">
              <Button variant="outline">Continue Shopping</Button>
            </Link>
            <Button onClick={() => { setSubmitted(false); setStep(0) }}>
              Create Another
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-gradient-to-br from-champagne via-cream to-blush py-12 md:py-16">
        <div className="container-custom text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-rose/10 text-rose text-sm font-medium rounded-full mb-4">
            <Gift className="w-4 h-4" />
            Gift Hamper Builder
          </span>
          <h1 className="heading-2 text-charcoal">Curate the Perfect Gift</h1>
          <p className="mt-3 text-warm-gray max-w-lg mx-auto">
            Pick the occasion, select items, choose wrapping — we'll assemble a beautiful hamper just for you.
          </p>
        </div>
      </div>

      {/* Step indicators */}
      <div className="sticky top-16 md:top-20 z-30 bg-soft-white/95 backdrop-blur-sm border-b border-blush">
        <div className="container-custom py-3">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {STEPS.map((s, i) => {
              const Icon = s.icon
              const isActive = i === step
              const isDone = i < step
              return (
                <button
                  key={s.id}
                  onClick={() => i <= step && setStep(i)}
                  className={cn(
                    'flex flex-col items-center gap-1 transition-all',
                    isActive && 'scale-110',
                    i > step && 'opacity-40 cursor-default'
                  )}
                >
                  <div className={cn(
                    'w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center transition-colors',
                    isActive ? 'bg-rose text-soft-white' : isDone ? 'bg-rose/20 text-rose' : 'bg-blush text-warm-gray'
                  )}>
                    {isDone ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className={cn(
                    'text-[10px] md:text-xs font-medium hidden sm:block',
                    isActive ? 'text-rose' : 'text-warm-gray'
                  )}>
                    {s.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="container-custom py-8 md:py-12">
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">

          {/* Left: Step content */}
          <div className="lg:col-span-3">
            <div className="bg-soft-white rounded-xl shadow-soft p-6 md:p-8 min-h-[400px]">

              {/* Step 0: Size */}
              {step === 0 && (
                <div>
                  <h2 className="heading-4 text-charcoal mb-2">Choose Hamper Size</h2>
                  <p className="text-warm-gray text-sm mb-6">How grand should your gift be?</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {sizes.map(s => (
                      <button
                        key={s.optionKey}
                        onClick={() => update('hamperSize', s.optionKey)}
                        className={cn(
                          'p-5 rounded-xl border-2 text-left transition-all hover:shadow-soft-md',
                          config.hamperSize === s.optionKey ? 'border-rose bg-rose/5' : 'border-blush hover:border-rose/30'
                        )}
                      >
                        <p className="font-medium text-charcoal">{s.label}</p>
                        {s.description && <p className="text-xs text-warm-gray mt-1">{s.description}</p>}
                        <p className="text-rose font-bold mt-2">{formatPrice(s.basePrice)}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 1: Occasion */}
              {step === 1 && (
                <div>
                  <h2 className="heading-4 text-charcoal mb-2">What's the Occasion?</h2>
                  <p className="text-warm-gray text-sm mb-6">We'll tailor the presentation to match</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {occasions.map(o => (
                      <button
                        key={o.optionKey}
                        onClick={() => update('occasion', o.optionKey)}
                        className={cn(
                          'p-4 rounded-xl border-2 text-center transition-all hover:shadow-soft-md',
                          config.occasion === o.optionKey ? 'border-rose bg-rose/5' : 'border-blush hover:border-rose/30'
                        )}
                      >
                        {o.emoji && <span className="text-2xl mb-1 block">{o.emoji}</span>}
                        <p className="text-sm font-medium text-charcoal">{o.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Items */}
              {step === 2 && (
                <div>
                  <h2 className="heading-4 text-charcoal mb-2">Select Items</h2>
                  <p className="text-warm-gray text-sm mb-6">Pick what goes into your hamper (select multiple)</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {items.map(item => {
                      const selected = config.items.includes(item.optionKey)
                      return (
                        <button
                          key={item.optionKey}
                          onClick={() => toggleItem(item.optionKey)}
                          className={cn(
                            'p-4 rounded-xl border-2 text-center transition-all hover:shadow-soft-md relative',
                            selected ? 'border-rose bg-rose/5' : 'border-blush hover:border-rose/30'
                          )}
                        >
                          {selected && (
                            <div className="absolute top-2 right-2 w-5 h-5 bg-rose rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-soft-white" />
                            </div>
                          )}
                          {item.emoji && <span className="text-2xl mb-1 block">{item.emoji}</span>}
                          <p className="text-xs font-medium text-charcoal">{item.label}</p>
                          {item.surcharge > 0 && <p className="text-[10px] text-rose mt-1">+{formatPrice(item.surcharge)}</p>}
                        </button>
                      )
                    })}
                  </div>
                  {config.items.length === 0 && (
                    <p className="text-error text-sm mt-3">Please select at least one item</p>
                  )}
                </div>
              )}

              {/* Step 3: Wrapping */}
              {step === 3 && (
                <div>
                  <h2 className="heading-4 text-charcoal mb-2">Choose Wrapping</h2>
                  <p className="text-warm-gray text-sm mb-6">How should we wrap your gift?</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {wrappings.map(w => (
                      <button
                        key={w.optionKey}
                        onClick={() => update('wrapping', w.optionKey)}
                        className={cn(
                          'p-5 rounded-xl border-2 text-left transition-all hover:shadow-soft-md',
                          config.wrapping === w.optionKey ? 'border-rose bg-rose/5' : 'border-blush hover:border-rose/30'
                        )}
                      >
                        <p className="font-medium text-charcoal">{w.label}</p>
                        {w.description && <p className="text-xs text-warm-gray mt-1">{w.description}</p>}
                        {w.surcharge > 0 && (
                          <p className="text-xs text-rose mt-2">+{formatPrice(w.surcharge)}</p>
                        )}
                        {w.surcharge === 0 && (
                          <p className="text-xs text-success mt-2">Included</p>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Color Theme */}
              {step === 4 && (
                <div>
                  <h2 className="heading-4 text-charcoal mb-2">Pick a Color Theme</h2>
                  <p className="text-warm-gray text-sm mb-6">Sets the mood for the entire hamper</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {colorThemes.map(t => {
                      const tc = t.colorsJson ? (() => { try { return JSON.parse(t.colorsJson) as string[] } catch { return [] } })() : []
                      return (
                        <button
                          key={t.optionKey}
                          onClick={() => update('colorTheme', t.optionKey)}
                          className={cn(
                            'p-5 rounded-xl border-2 flex items-center gap-4 transition-all hover:shadow-soft-md',
                            config.colorTheme === t.optionKey ? 'border-rose bg-rose/5' : 'border-blush hover:border-rose/30'
                          )}
                        >
                          <div className="flex gap-1">
                            {tc.map((c: string, i: number) => (
                              <div key={i} className="w-8 h-8 rounded-full border border-blush/50" style={{ backgroundColor: c }} />
                            ))}
                          </div>
                          <p className="font-medium text-charcoal">{t.label}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Step 5: Message */}
              {step === 5 && (
                <div>
                  <h2 className="heading-4 text-charcoal mb-2">Add a Personal Touch</h2>
                  <p className="text-warm-gray text-sm mb-6">Include a gift message card (+{formatPrice(50)} if added)</p>

                  <Input
                    label="Recipient's Name"
                    value={config.recipientName}
                    onChange={e => update('recipientName', e.target.value)}
                    placeholder="Who is this gift for?"
                  />

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-charcoal mb-2">Gift Message</label>
                    <textarea
                      value={config.messageCard}
                      onChange={e => update('messageCard', e.target.value)}
                      placeholder="Write a heartfelt message..."
                      rows={4}
                      maxLength={200}
                      className="w-full px-4 py-3 bg-cream border border-blush rounded-lg focus:outline-none focus:border-rose transition-colors text-sm resize-none"
                    />
                    <p className="text-xs text-warm-gray mt-1">{config.messageCard.length}/200 characters</p>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-charcoal mb-2">Quantity</label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => update('quantity', Math.max(1, config.quantity - 1))}
                        className="w-10 h-10 rounded-lg border border-blush flex items-center justify-center hover:bg-blush transition-colors text-lg"
                      >
                        −
                      </button>
                      <span className="text-lg font-bold text-charcoal w-8 text-center">{config.quantity}</span>
                      <button
                        onClick={() => update('quantity', Math.min(50, config.quantity + 1))}
                        className="w-10 h-10 rounded-lg border border-blush flex items-center justify-center hover:bg-blush transition-colors text-lg"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-charcoal mb-2">Additional Notes</label>
                    <textarea
                      value={config.notes}
                      onChange={e => update('notes', e.target.value)}
                      placeholder="Dietary restrictions, allergies, special preferences..."
                      rows={2}
                      className="w-full px-4 py-3 bg-cream border border-blush rounded-lg focus:outline-none focus:border-rose transition-colors text-sm resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Step 6: Review */}
              {step === 6 && (
                <div>
                  <h2 className="heading-4 text-charcoal mb-6">Review & Submit</h2>

                  <div className="space-y-3 mb-6">
                    {[
                      { label: 'Size', value: findOpt(sizes, config.hamperSize)?.label },
                      { label: 'Occasion', value: findOpt(occasions, config.occasion)?.label },
                      { label: 'Items', value: config.items.map(i => findOpt(items, i)?.label).filter(Boolean).join(', ') },
                      { label: 'Wrapping', value: findOpt(wrappings, config.wrapping)?.label },
                      { label: 'Color Theme', value: findOpt(colorThemes, config.colorTheme)?.label },
                      { label: 'Recipient', value: config.recipientName || 'Not specified' },
                      { label: 'Message', value: config.messageCard || 'None' },
                      { label: 'Quantity', value: config.quantity.toString() },
                    ].map(row => (
                      <div key={row.label} className="flex justify-between items-start py-2 border-b border-blush/50">
                        <span className="text-sm text-warm-gray">{row.label}</span>
                        <span className="text-sm font-medium text-charcoal text-right max-w-[60%]">{row.value}</span>
                      </div>
                    ))}
                    {config.notes && (
                      <div className="py-2">
                        <span className="text-sm text-warm-gray">Notes</span>
                        <p className="text-sm text-charcoal mt-1">{config.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="bg-rose/5 rounded-xl p-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-charcoal">Estimated Total</span>
                      <span className="text-xl font-bold text-rose">{formatPrice(price)}</span>
                    </div>
                    <p className="text-xs text-warm-gray mt-1">Final price may vary based on item availability</p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium text-charcoal">Your Contact Details</h3>
                    <Input
                      label="Your Name"
                      value={contact.customerName}
                      onChange={e => setContact(prev => ({ ...prev, customerName: e.target.value }))}
                      placeholder="Enter your name"
                      required
                    />
                    <Input
                      label="Email"
                      type="email"
                      value={contact.customerEmail}
                      onChange={e => setContact(prev => ({ ...prev, customerEmail: e.target.value }))}
                      placeholder="you@example.com"
                      required
                    />
                    <Input
                      label="Phone (optional)"
                      value={contact.customerPhone}
                      onChange={e => setContact(prev => ({ ...prev, customerPhone: e.target.value }))}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={() => setStep(s => s - 1)}
                disabled={step === 0}
                icon={<ArrowLeft className="w-4 h-4" />}
              >
                Back
              </Button>

              {step < 6 ? (
                <Button
                  onClick={() => setStep(s => s + 1)}
                  disabled={!canProceed()}
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={() => submitMutation.mutate()}
                  loading={submitMutation.isPending}
                  disabled={!canProceed()}
                  icon={<Send className="w-4 h-4" />}
                >
                  Submit Request
                </Button>
              )}
            </div>
          </div>

          {/* Right: Live preview + price */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-36">
              <div className="bg-soft-white rounded-xl shadow-soft p-6 md:p-8">
                <h3 className="font-serif text-lg font-medium text-charcoal text-center mb-4">Your Hamper</h3>

                <HamperPreview themeColors={getThemeColors(config.colorTheme)} itemCount={config.items.length} wrapping={config.wrapping} />

                {config.recipientName && (
                  <p className="text-center text-sm font-serif italic text-rose mt-2">
                    For {config.recipientName} <Heart className="w-3 h-3 inline text-rose" />
                  </p>
                )}

                {/* Selected items */}
                {config.items.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5 justify-center">
                    {config.items.map(id => {
                      const item = findOpt(items, id)
                      return item ? (
                        <span key={id} className="inline-flex items-center gap-1 px-2 py-1 bg-blush rounded-full text-xs text-charcoal">
                          {item.emoji} {item.label}
                        </span>
                      ) : null
                    })}
                  </div>
                )}

                {/* Price breakdown */}
                <div className="border-t border-blush mt-6 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-warm-gray">Base ({findOpt(sizes, config.hamperSize)?.label})</span>
                    <span className="text-charcoal">{formatPrice(findOpt(sizes, config.hamperSize)?.basePrice ?? 0)}</span>
                  </div>
                  {config.items.map(id => {
                    const item = findOpt(items, id)
                    return item ? (
                      <div key={id} className="flex justify-between text-sm">
                        <span className="text-warm-gray">{item.label}</span>
                        <span className="text-charcoal">+{formatPrice(item.surcharge)}</span>
                      </div>
                    ) : null
                  })}
                  {(findOpt(wrappings, config.wrapping)?.surcharge ?? 0) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-warm-gray">{findOpt(wrappings, config.wrapping)?.label} wrap</span>
                      <span className="text-charcoal">+{formatPrice(findOpt(wrappings, config.wrapping)?.surcharge ?? 0)}</span>
                    </div>
                  )}
                  {config.messageCard.trim() && (
                    <div className="flex justify-between text-sm">
                      <span className="text-warm-gray">Message card</span>
                      <span className="text-charcoal">+{formatPrice(50)}</span>
                    </div>
                  )}
                  {config.quantity > 1 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-warm-gray">× {config.quantity}</span>
                      <span />
                    </div>
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
