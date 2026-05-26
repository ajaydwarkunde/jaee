import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import type { VariantCreateRequest } from '@/services/variantService'

export interface VariantFormValues {
  sku: string
  price: number
  compareAtPrice: number | ''
  weightKg: number
  stockQty: number
  active: boolean
  expense: number | ''
  optionValues: Record<string, string>
  images: string[]
}

interface VariantFormProps {
  productName: string
  options: string[]
  values: VariantFormValues
  onChange: (values: VariantFormValues) => void
  onSubmit: () => void
  onCancel: () => void
  loading?: boolean
  submitLabel?: string
}

export default function VariantForm({
  productName,
  options,
  values,
  onChange,
  onSubmit,
  onCancel,
  loading,
  submitLabel = 'Save Variant',
}: VariantFormProps) {
  const setField = <K extends keyof VariantFormValues>(key: K, val: VariantFormValues[K]) => {
    onChange({ ...values, [key]: val })
  }

  const setOption = (name: string, val: string) => {
    onChange({ ...values, optionValues: { ...values.optionValues, [name]: val } })
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <p className="text-warm-gray text-sm">
        Product: <span className="font-medium text-charcoal">{productName}</span>
      </p>

      <section className="bg-soft-white rounded-xl border border-blush p-6 space-y-4">
        <h2 className="font-serif text-lg text-charcoal">Options</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {options.map((opt) => (
            <div key={opt}>
              <label className="block text-sm font-medium text-charcoal mb-1">{opt}</label>
              <Input
                value={values.optionValues[opt] || ''}
                onChange={(e) => setOption(opt, e.target.value)}
                placeholder={opt}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="bg-soft-white rounded-xl border border-blush p-6 space-y-4">
        <h2 className="font-serif text-lg text-charcoal">Pricing & inventory</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">Price (₹) *</label>
            <Input
              type="number"
              step="0.01"
              value={values.price}
              onChange={(e) => setField('price', Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">Compare at (₹)</label>
            <Input
              type="number"
              step="0.01"
              value={values.compareAtPrice}
              onChange={(e) =>
                setField('compareAtPrice', e.target.value ? Number(e.target.value) : '')
              }
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">Expense (₹)</label>
            <Input
              type="number"
              step="0.01"
              value={values.expense}
              onChange={(e) => setField('expense', e.target.value ? Number(e.target.value) : '')}
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">Weight (kg) *</label>
            <Input
              type="number"
              step="0.001"
              min={0.001}
              value={values.weightKg}
              onChange={(e) => setField('weightKg', Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">Stock *</label>
            <Input
              type="number"
              value={values.stockQty}
              onChange={(e) => setField('stockQty', Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">SKU</label>
            <Input
              value={values.sku}
              onChange={(e) => setField('sku', e.target.value)}
              placeholder="Optional"
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-charcoal">
          <input
            type="checkbox"
            checked={values.active}
            onChange={(e) => setField('active', e.target.checked)}
            className="rounded border-blush text-rose focus:ring-rose"
          />
          Active (visible on storefront)
        </label>
      </section>

      <div className="flex flex-wrap gap-3 pt-2 border-t border-blush">
        <Button type="button" onClick={onSubmit} loading={loading}>
          {submitLabel}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )
}

export function variantFormToRequest(values: VariantFormValues): VariantCreateRequest {
  return {
    sku: values.sku || undefined,
    price: values.price,
    weightKg: values.weightKg,
    compareAtPrice: values.compareAtPrice ? Number(values.compareAtPrice) : undefined,
    stockQty: values.stockQty,
    active: values.active,
    expense: values.expense ? Number(values.expense) : undefined,
    optionValues: values.optionValues,
    images: values.images,
  }
}

export function variantToFormValues(
  variant: {
    sku: string | null
    price: number
    compareAtPrice: number | null
    weightKg?: number | null
    stockQty: number
    active: boolean
    expense?: number | null
    optionValues: Record<string, string>
    images: string[]
  },
  options: string[],
): VariantFormValues {
  const optionValues: Record<string, string> = {}
  options.forEach((o) => {
    optionValues[o] = variant.optionValues[o] || ''
  })
  return {
    sku: variant.sku || '',
    price: variant.price,
    compareAtPrice: variant.compareAtPrice ?? '',
    weightKg: variant.weightKg != null && variant.weightKg > 0 ? variant.weightKg : 0.5,
    stockQty: variant.stockQty,
    active: variant.active,
    expense: variant.expense ?? '',
    optionValues,
    images: variant.images || [],
  }
}

export function emptyVariantFormValues(options: string[]): VariantFormValues {
  const optionValues: Record<string, string> = {}
  options.forEach((o) => {
    optionValues[o] = ''
  })
  return {
    sku: '',
    price: 0,
    compareAtPrice: '',
    weightKg: 0.5,
    stockQty: 0,
    active: true,
    expense: '',
    optionValues,
    images: [],
  }
}
