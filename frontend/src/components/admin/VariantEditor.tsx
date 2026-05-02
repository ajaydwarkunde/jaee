import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, Save, Loader2 } from 'lucide-react'
import { variantService } from '@/services/variantService'
import type { VariantCreateRequest } from '@/services/variantService'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'
import type { Product } from '@/types'

interface VariantRow {
  key: string
  sku: string
  price: number
  compareAtPrice: number | ''
  stockQty: number
  active: boolean
  optionValues: Record<string, string>
  images: string[]
}

function newVariantRow(options: string[]): VariantRow {
  const optionValues: Record<string, string> = {}
  options.forEach(opt => { optionValues[opt] = '' })
  return {
    key: crypto.randomUUID(),
    sku: '',
    price: 0,
    compareAtPrice: '',
    stockQty: 0,
    active: true,
    optionValues,
    images: [],
  }
}

export default function VariantEditor({ product, onClose }: { product: Product; onClose: () => void }) {
  const queryClient = useQueryClient()
  const options = product.options || []

  const { data: existingVariants, isLoading } = useQuery({
    queryKey: ['variants', product.id],
    queryFn: () => variantService.getVariants(product.id),
  })

  const [rows, setRows] = useState<VariantRow[] | null>(null)

  const variants = rows ?? (existingVariants || []).map(v => ({
    key: `existing-${v.id}`,
    sku: v.sku || '',
    price: v.price,
    compareAtPrice: v.compareAtPrice ?? '',
    stockQty: v.stockQty,
    active: v.active,
    optionValues: v.optionValues,
    images: v.images,
  } as VariantRow))

  const setVariants = (v: VariantRow[]) => setRows(v)

  const bulkSaveMutation = useMutation({
    mutationFn: (data: VariantCreateRequest[]) => variantService.bulkSaveVariants(product.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variants', product.id] })
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      toast.success('Variants saved!')
      onClose()
    },
    onError: () => {
      toast.error('Failed to save variants')
    },
  })

  const addRow = () => {
    setVariants([...variants, newVariantRow(options)])
  }

  const removeRow = (key: string) => {
    setVariants(variants.filter(v => v.key !== key))
  }

  const updateRow = (key: string, field: string, value: unknown) => {
    setVariants(variants.map(v =>
      v.key === key ? { ...v, [field]: value } : v
    ))
  }

  const updateOptionValue = (key: string, optionName: string, value: string) => {
    setVariants(variants.map(v =>
      v.key === key ? { ...v, optionValues: { ...v.optionValues, [optionName]: value } } : v
    ))
  }

  const handleSave = () => {
    const invalid = variants.some(v => v.price <= 0 || Object.values(v.optionValues).some(val => !val.trim()))
    if (invalid) {
      toast.error('All variants need a price and all option values filled in')
      return
    }
    const data: VariantCreateRequest[] = variants.map(v => ({
      sku: v.sku || undefined,
      price: v.price,
      compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : undefined,
      stockQty: v.stockQty,
      active: v.active,
      optionValues: v.optionValues,
      images: v.images,
    }))
    bulkSaveMutation.mutate(data)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-rose animate-spin" />
      </div>
    )
  }

  if (options.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-warm-gray mb-4">
          This product has no option types yet. Open Edit Product — new products default to Size and Scent — save the product, then return here to add variant rows.
        </p>
        <Button variant="outline" onClick={onClose}>Close</Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-charcoal">
            Variants for "{product.name}"
          </h3>
          <p className="text-xs text-warm-gray mt-1">
            Options: {options.join(', ')} · {variants.length} variant(s)
          </p>
        </div>
        <button
          type="button"
          onClick={addRow}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-rose/10 text-rose text-sm font-medium rounded-lg hover:bg-rose/20 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Variant
        </button>
      </div>

      {variants.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-blush rounded-lg">
          <p className="text-warm-gray mb-3">No variants yet</p>
          <Button size="sm" onClick={addRow} icon={<Plus className="w-4 h-4" />}>
            Add First Variant
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-blush">
                {options.map(opt => (
                  <th key={opt} className="text-left py-2 px-2 font-medium text-charcoal">{opt}</th>
                ))}
                <th className="text-left py-2 px-2 font-medium text-charcoal">Price</th>
                <th className="text-left py-2 px-2 font-medium text-charcoal">Compare</th>
                <th className="text-left py-2 px-2 font-medium text-charcoal">Stock</th>
                <th className="text-left py-2 px-2 font-medium text-charcoal">SKU</th>
                <th className="py-2 px-2"></th>
              </tr>
            </thead>
            <tbody>
              {variants.map((v) => (
                <tr key={v.key} className="border-b border-blush/50 hover:bg-blush/20">
                  {options.map(opt => (
                    <td key={opt} className="py-2 px-2">
                      <input
                        type="text"
                        value={v.optionValues[opt] || ''}
                        onChange={(e) => updateOptionValue(v.key, opt, e.target.value)}
                        placeholder={opt}
                        className="w-full px-2 py-1.5 border border-blush rounded text-sm text-charcoal bg-soft-white focus:outline-none focus:border-rose"
                      />
                    </td>
                  ))}
                  <td className="py-2 px-2">
                    <input
                      type="number"
                      step="0.01"
                      value={v.price}
                      onChange={(e) => updateRow(v.key, 'price', Number(e.target.value))}
                      className="w-20 px-2 py-1.5 border border-blush rounded text-sm text-charcoal bg-soft-white focus:outline-none focus:border-rose"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="number"
                      step="0.01"
                      value={v.compareAtPrice}
                      onChange={(e) => updateRow(v.key, 'compareAtPrice', e.target.value ? Number(e.target.value) : '')}
                      placeholder="—"
                      className="w-20 px-2 py-1.5 border border-blush rounded text-sm text-charcoal bg-soft-white focus:outline-none focus:border-rose"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="number"
                      value={v.stockQty}
                      onChange={(e) => updateRow(v.key, 'stockQty', Number(e.target.value))}
                      className="w-16 px-2 py-1.5 border border-blush rounded text-sm text-charcoal bg-soft-white focus:outline-none focus:border-rose"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="text"
                      value={v.sku}
                      onChange={(e) => updateRow(v.key, 'sku', e.target.value)}
                      placeholder="Optional"
                      className="w-24 px-2 py-1.5 border border-blush rounded text-sm text-charcoal bg-soft-white focus:outline-none focus:border-rose"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <button
                      type="button"
                      onClick={() => removeRow(v.key)}
                      className="p-1.5 text-warm-gray hover:text-error transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex gap-3 pt-4 border-t border-blush">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          loading={bulkSaveMutation.isPending}
          icon={<Save className="w-4 h-4" />}
          className="flex-1"
        >
          Save All Variants
        </Button>
      </div>
    </div>
  )
}
