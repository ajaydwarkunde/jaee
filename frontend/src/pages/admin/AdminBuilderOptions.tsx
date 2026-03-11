import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ArrowLeft, Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Flame, Gift, Save, X } from 'lucide-react'
import { api } from '@/lib/api'
import { formatPrice } from '@/lib/utils'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

interface BuilderOption {
  id: number
  builderType: string
  optionType: string
  optionKey: string
  label: string
  description: string | null
  emoji: string | null
  hexColor: string | null
  colorsJson: string | null
  basePrice: number
  surcharge: number
  active: boolean
  displayOrder: number
}

type FormData = {
  optionKey: string
  label: string
  description: string
  emoji: string
  hexColor: string
  colorsJson: string
  basePrice: string
  surcharge: string
  displayOrder: string
}

const CANDLE_TYPES = ['SIZE', 'WAX', 'SCENT', 'COLOR', 'CONTAINER']
const HAMPER_TYPES = ['SIZE', 'OCCASION', 'ITEM', 'WRAPPING', 'COLOR_THEME']

const TYPE_LABELS: Record<string, string> = {
  SIZE: 'Sizes',
  WAX: 'Wax Types',
  SCENT: 'Scents',
  COLOR: 'Colors',
  CONTAINER: 'Containers',
  OCCASION: 'Occasions',
  ITEM: 'Items',
  WRAPPING: 'Wrapping Styles',
  COLOR_THEME: 'Color Themes',
}

function fetchOptions(builderType: string): Promise<BuilderOption[]> {
  return api.get(`/builder-options/admin/${builderType}`).then(res => res.data.data)
}

export default function AdminBuilderOptions() {
  const queryClient = useQueryClient()
  const [builderType, setBuilderType] = useState<'CANDLE' | 'HAMPER'>('CANDLE')
  const [activeType, setActiveType] = useState('SIZE')
  const [showForm, setShowForm] = useState(false)
  const [editingOption, setEditingOption] = useState<BuilderOption | null>(null)

  const optionTypes = builderType === 'CANDLE' ? CANDLE_TYPES : HAMPER_TYPES

  const { data: options, isLoading } = useQuery({
    queryKey: ['builder-options', builderType],
    queryFn: () => fetchOptions(builderType),
  })

  const toggleMutation = useMutation({
    mutationFn: (id: number) => api.patch(`/builder-options/admin/${id}/toggle`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['builder-options'] })
      toast.success('Availability updated')
    },
    onError: () => toast.error('Failed to update'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/builder-options/admin/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['builder-options'] })
      toast.success('Option deleted')
    },
    onError: () => toast.error('Failed to delete'),
  })

  const saveMutation = useMutation({
    mutationFn: (data: { id?: number; body: any }) =>
      data.id
        ? api.put(`/builder-options/admin/${data.id}`, data.body)
        : api.post('/builder-options/admin', data.body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['builder-options'] })
      toast.success(editingOption ? 'Option updated' : 'Option created')
      closeForm()
    },
    onError: () => toast.error('Failed to save'),
  })

  const filteredOptions = (options || [])
    .filter(o => o.optionType === activeType)
    .sort((a, b) => a.displayOrder - b.displayOrder)

  const activeCount = filteredOptions.filter(o => o.active).length
  const totalCount = filteredOptions.length

  const openCreate = () => {
    setEditingOption(null)
    setShowForm(true)
  }

  const openEdit = (opt: BuilderOption) => {
    setEditingOption(opt)
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingOption(null)
  }

  const handleSave = (form: FormData) => {
    const body = {
      builderType,
      optionType: activeType,
      optionKey: form.optionKey,
      label: form.label,
      description: form.description || null,
      emoji: form.emoji || null,
      hexColor: form.hexColor || null,
      colorsJson: form.colorsJson || null,
      basePrice: parseFloat(form.basePrice) || 0,
      surcharge: parseFloat(form.surcharge) || 0,
      displayOrder: parseInt(form.displayOrder) || 0,
      active: editingOption?.active ?? true,
    }
    saveMutation.mutate({ id: editingOption?.id, body })
  }

  const handleDelete = (opt: BuilderOption) => {
    if (confirm(`Delete "${opt.label}"? This cannot be undone.`)) {
      deleteMutation.mutate(opt.id)
    }
  }

  if (isLoading) return <LoadingSpinner fullScreen />

  return (
    <div className="bg-cream min-h-screen py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="p-2 hover:bg-blush rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="heading-2 text-charcoal">Builder Options</h1>
              <p className="text-warm-gray mt-1">Manage what's available in custom candle & hamper builders</p>
            </div>
          </div>
        </div>

        {/* Builder Type Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => { setBuilderType('CANDLE'); setActiveType('SIZE') }}
            className={cn(
              'flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all',
              builderType === 'CANDLE'
                ? 'bg-rose text-soft-white shadow-soft-md'
                : 'bg-soft-white text-charcoal hover:bg-blush'
            )}
          >
            <Flame className="w-4 h-4" />
            Custom Candles
          </button>
          <button
            onClick={() => { setBuilderType('HAMPER'); setActiveType('SIZE') }}
            className={cn(
              'flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all',
              builderType === 'HAMPER'
                ? 'bg-rose text-soft-white shadow-soft-md'
                : 'bg-soft-white text-charcoal hover:bg-blush'
            )}
          >
            <Gift className="w-4 h-4" />
            Gift Hampers
          </button>
        </div>

        {/* Option Type Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {optionTypes.map(type => {
            const count = (options || []).filter(o => o.optionType === type).length
            const activeC = (options || []).filter(o => o.optionType === type && o.active).length
            return (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                  activeType === type
                    ? 'bg-charcoal text-soft-white'
                    : 'bg-soft-white text-charcoal hover:bg-blush'
                )}
              >
                {TYPE_LABELS[type] || type}
                <span className="ml-1.5 text-xs opacity-70">({activeC}/{count})</span>
              </button>
            )
          })}
        </div>

        {/* Section header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-medium text-charcoal">{TYPE_LABELS[activeType]}</h2>
            <p className="text-sm text-warm-gray">
              {activeCount} of {totalCount} available to customers
            </p>
          </div>
          <Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={openCreate}>
            Add Option
          </Button>
        </div>

        {/* Options List */}
        <div className="space-y-3">
          {filteredOptions.map(opt => (
            <div
              key={opt.id}
              className={cn(
                'bg-soft-white rounded-xl p-4 md:p-5 flex flex-col sm:flex-row sm:items-center gap-4 transition-all',
                !opt.active && 'opacity-50'
              )}
            >
              {/* Visual indicator */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {opt.hexColor && (
                  <div
                    className="w-10 h-10 rounded-full border-2 border-blush shrink-0"
                    style={{ backgroundColor: opt.hexColor }}
                  />
                )}
                {opt.colorsJson && !opt.hexColor && (
                  <div className="flex gap-0.5 shrink-0">
                    {JSON.parse(opt.colorsJson).map((c: string, i: number) => (
                      <div key={i} className="w-6 h-6 rounded-full border border-blush/50" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                )}
                {opt.emoji && !opt.hexColor && (
                  <span className="text-2xl shrink-0">{opt.emoji}</span>
                )}
                {!opt.hexColor && !opt.emoji && !opt.colorsJson && (
                  <div className="w-10 h-10 rounded-full bg-blush flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-charcoal">{opt.optionKey.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-charcoal truncate">{opt.label}</p>
                    <span className="text-xs text-warm-gray font-mono">({opt.optionKey})</span>
                  </div>
                  {opt.description && (
                    <p className="text-xs text-warm-gray truncate">{opt.description}</p>
                  )}
                </div>
              </div>

              {/* Price info */}
              <div className="flex items-center gap-6 shrink-0">
                {opt.basePrice > 0 && (
                  <div className="text-right">
                    <p className="text-xs text-warm-gray">Base</p>
                    <p className="text-sm font-bold text-charcoal">{formatPrice(opt.basePrice)}</p>
                  </div>
                )}
                {opt.surcharge !== 0 && (
                  <div className="text-right">
                    <p className="text-xs text-warm-gray">Surcharge</p>
                    <p className={cn('text-sm font-bold', opt.surcharge > 0 ? 'text-rose' : 'text-success')}>
                      {opt.surcharge > 0 ? '+' : ''}{formatPrice(opt.surcharge)}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => toggleMutation.mutate(opt.id)}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    opt.active ? 'text-success hover:bg-success/10' : 'text-warm-gray hover:bg-blush'
                  )}
                  title={opt.active ? 'Active — click to disable' : 'Inactive — click to enable'}
                >
                  {opt.active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => openEdit(opt)}
                  className="p-2 text-warm-gray hover:text-charcoal hover:bg-blush rounded-lg transition-colors"
                  title="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(opt)}
                  className="p-2 text-warm-gray hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {filteredOptions.length === 0 && (
            <div className="bg-soft-white rounded-xl p-12 text-center">
              <p className="text-warm-gray">No options yet. Click "Add Option" to create one.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      <OptionFormModal
        isOpen={showForm}
        onClose={closeForm}
        option={editingOption}
        optionType={activeType}
        onSave={handleSave}
        loading={saveMutation.isPending}
      />
    </div>
  )
}

function OptionFormModal({
  isOpen,
  onClose,
  option,
  optionType,
  onSave,
  loading,
}: {
  isOpen: boolean
  onClose: () => void
  option: BuilderOption | null
  optionType: string
  onSave: (form: FormData) => void
  loading: boolean
}) {
  const [form, setForm] = useState<FormData>({
    optionKey: '',
    label: '',
    description: '',
    emoji: '',
    hexColor: '',
    colorsJson: '',
    basePrice: '0',
    surcharge: '0',
    displayOrder: '0',
  })

  const isEditing = !!option

  const resetForm = (opt: BuilderOption | null) => {
    if (opt) {
      setForm({
        optionKey: opt.optionKey,
        label: opt.label,
        description: opt.description || '',
        emoji: opt.emoji || '',
        hexColor: opt.hexColor || '',
        colorsJson: opt.colorsJson || '',
        basePrice: String(opt.basePrice || 0),
        surcharge: String(opt.surcharge || 0),
        displayOrder: String(opt.displayOrder || 0),
      })
    } else {
      setForm({
        optionKey: '',
        label: '',
        description: '',
        emoji: '',
        hexColor: '',
        colorsJson: '',
        basePrice: '0',
        surcharge: '0',
        displayOrder: '0',
      })
    }
  }

  // Reset form when modal opens
  useState(() => { resetForm(option) })

  // Also reset when option changes
  if (isOpen && option && form.optionKey !== option.optionKey) {
    resetForm(option)
  }
  if (isOpen && !option && form.optionKey !== '') {
    resetForm(null)
  }

  const showEmoji = ['SCENT', 'OCCASION', 'ITEM'].includes(optionType)
  const showHexColor = optionType === 'COLOR'
  const showColorsJson = optionType === 'COLOR_THEME'
  const showBasePrice = optionType === 'SIZE'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit: ${option.label}` : `Add ${TYPE_LABELS[optionType]?.slice(0, -1) || 'Option'}`}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Key (ID)"
            value={form.optionKey}
            onChange={e => setForm(f => ({ ...f, optionKey: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
            placeholder="e.g. soy, lavender"
            disabled={isEditing}
          />
          <Input
            label="Display Label"
            value={form.label}
            onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
            placeholder="e.g. Soy Wax"
          />
        </div>

        <Input
          label="Description (optional)"
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          placeholder="Short description"
        />

        <div className="grid grid-cols-2 gap-4">
          {showBasePrice && (
            <Input
              label="Base Price (₹)"
              type="number"
              value={form.basePrice}
              onChange={e => setForm(f => ({ ...f, basePrice: e.target.value }))}
            />
          )}
          <Input
            label="Surcharge (₹)"
            type="number"
            value={form.surcharge}
            onChange={e => setForm(f => ({ ...f, surcharge: e.target.value }))}
          />
          <Input
            label="Display Order"
            type="number"
            value={form.displayOrder}
            onChange={e => setForm(f => ({ ...f, displayOrder: e.target.value }))}
          />
        </div>

        {showEmoji && (
          <Input
            label="Emoji"
            value={form.emoji}
            onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))}
            placeholder="e.g. 🕯️"
          />
        )}

        {showHexColor && (
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.hexColor || '#FBF6F3'}
                onChange={e => setForm(f => ({ ...f, hexColor: e.target.value }))}
                className="w-10 h-10 rounded-lg border border-blush cursor-pointer"
              />
              <Input
                value={form.hexColor}
                onChange={e => setForm(f => ({ ...f, hexColor: e.target.value }))}
                placeholder="#FBF6F3"
                className="flex-1"
              />
            </div>
          </div>
        )}

        {showColorsJson && (
          <Input
            label="Colors JSON (array of 3 hex values)"
            value={form.colorsJson}
            onChange={e => setForm(f => ({ ...f, colorsJson: e.target.value }))}
            placeholder='["#B4617B","#D4A843","#F2E3E8"]'
          />
        )}

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onClose} icon={<X className="w-4 h-4" />} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={() => onSave(form)}
            loading={loading}
            disabled={!form.optionKey.trim() || !form.label.trim()}
            icon={<Save className="w-4 h-4" />}
            className="flex-1"
          >
            {isEditing ? 'Save Changes' : 'Create'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
