import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Copy, GripVertical, Plus, Trash2, Save, Loader2 } from 'lucide-react'
import { getErrorMessage } from '@/lib/api'
import { variantService } from '@/services/variantService'
import type { VariantCreateRequest } from '@/services/variantService'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'
import type { Product, ProductVariant } from '@/types'

interface VariantRow {
  key: string
  sku: string
  price: number
  compareAtPrice: number | ''
  /** Per-unit shipping weight (kg) */
  weightKg: number
  stockQty: number
  active: boolean
  expense: number | ''
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
    weightKg: 0.5,
    stockQty: 0,
    active: true,
    expense: '',
    optionValues,
    images: [],
  }
}

function mapApiToRows(variants: ProductVariant[]): VariantRow[] {
  return [...variants]
    .sort((a, b) => {
      const ao = a.sortOrder ?? 0
      const bo = b.sortOrder ?? 0
      if (ao !== bo) return ao - bo
      return a.id - b.id
    })
    .map(v => ({
      key: `existing-${v.id}`,
      sku: v.sku || '',
      price: v.price,
      compareAtPrice: v.compareAtPrice ?? '',
      weightKg: v.weightKg != null && v.weightKg > 0 ? v.weightKg : 0.5,
      stockQty: v.stockQty,
      active: v.active,
      expense: v.expense ?? '',
      optionValues: v.optionValues,
      images: v.images,
    }))
}

function duplicateVariantRow(row: VariantRow): VariantRow {
  const sku = row.sku.trim()
  return {
    ...row,
    key: crypto.randomUUID(),
    sku: sku ? `${sku}-copy` : '',
    optionValues: { ...row.optionValues },
    images: [...row.images],
  }
}

function SortableVariantRow({
  row,
  options,
  onUpdateRow,
  onUpdateOption,
  onRemove,
  onDuplicate,
}: {
  row: VariantRow
  options: string[]
  onUpdateRow: (key: string, field: string, value: unknown) => void
  onUpdateOption: (key: string, optionName: string, value: string) => void
  onRemove: (key: string) => void
  onDuplicate: (key: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: row.key,
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.82 : 1,
    zIndex: isDragging ? 1 : undefined,
  }

  return (
    <tr ref={setNodeRef} style={style} className="border-b border-blush/50 hover:bg-blush/20">
      <td className="w-10 py-2 px-1 align-middle">
        <button
          type="button"
          className="cursor-grab active:cursor-grabbing p-1.5 text-warm-gray hover:text-charcoal rounded-md hover:bg-blush/40"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder variants"
        >
          <GripVertical className="w-4 h-4" />
        </button>
      </td>
      {options.map(opt => (
        <td key={opt} className="py-2 px-2">
          <input
            type="text"
            value={row.optionValues[opt] || ''}
            onChange={(e) => onUpdateOption(row.key, opt, e.target.value)}
            placeholder={opt}
            className="w-full px-2 py-1.5 border border-blush rounded text-sm text-charcoal bg-soft-white focus:outline-none focus:border-rose"
          />
        </td>
      ))}
      <td className="py-2 px-2">
        <input
          type="number"
          step="0.01"
          value={row.price}
          onChange={(e) => onUpdateRow(row.key, 'price', Number(e.target.value))}
          className="w-20 px-2 py-1.5 border border-blush rounded text-sm text-charcoal bg-soft-white focus:outline-none focus:border-rose"
        />
      </td>
      <td className="py-2 px-2">
        <input
          type="number"
          step="0.01"
          value={row.compareAtPrice}
          onChange={(e) => onUpdateRow(row.key, 'compareAtPrice', e.target.value ? Number(e.target.value) : '')}
          placeholder="—"
          className="w-20 px-2 py-1.5 border border-blush rounded text-sm text-charcoal bg-soft-white focus:outline-none focus:border-rose"
        />
      </td>
      <td className="py-2 px-2">
        <input
          type="number"
          step="0.001"
          min={0.001}
          value={row.weightKg}
          onChange={(e) => onUpdateRow(row.key, 'weightKg', Number(e.target.value))}
          title="Shipping weight per unit"
          className="w-20 px-2 py-1.5 border border-blush rounded text-sm text-charcoal bg-soft-white focus:outline-none focus:border-rose"
        />
      </td>
      <td className="py-2 px-2">
        <input
          type="number"
          value={row.stockQty}
          onChange={(e) => onUpdateRow(row.key, 'stockQty', Number(e.target.value))}
          className="w-16 px-2 py-1.5 border border-blush rounded text-sm text-charcoal bg-soft-white focus:outline-none focus:border-rose"
        />
      </td>
      <td className="py-2 px-2">
        <input
          type="number"
          step="0.01"
          value={row.expense}
          onChange={(e) => onUpdateRow(row.key, 'expense', e.target.value ? Number(e.target.value) : '')}
          placeholder="—"
          title="Per-unit cost/expense"
          className="w-20 px-2 py-1.5 border border-blush rounded text-sm text-charcoal bg-soft-white focus:outline-none focus:border-rose"
        />
      </td>
      <td className="py-2 px-2">
        <input
          type="text"
          value={row.sku}
          onChange={(e) => onUpdateRow(row.key, 'sku', e.target.value)}
          placeholder="Optional"
          className="w-24 px-2 py-1.5 border border-blush rounded text-sm text-charcoal bg-soft-white focus:outline-none focus:border-rose"
        />
      </td>
      <td className="py-2 px-2 whitespace-nowrap">
        <button
          type="button"
          onClick={() => onDuplicate(row.key)}
          className="p-1.5 text-warm-gray hover:text-rose transition-colors mr-1"
          title="Duplicate variant"
          aria-label="Duplicate variant"
        >
          <Copy className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onRemove(row.key)}
          className="p-1.5 text-warm-gray hover:text-error transition-colors"
          aria-label="Remove variant"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </td>
    </tr>
  )
}

export default function VariantEditor({ product, onClose }: { product: Product; onClose: () => void }) {
  const queryClient = useQueryClient()
  const options = product.options || []

  const { data: existingVariants, isLoading } = useQuery({
    queryKey: ['variants', product.id],
    queryFn: () => variantService.getVariants(product.id),
  })

  const initialRows = useMemo(
    () => (existingVariants?.length ? mapApiToRows(existingVariants) : []),
    [existingVariants],
  )

  const [rows, setRows] = useState<VariantRow[] | null>(null)
  const variants = rows ?? initialRows

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const bulkSaveMutation = useMutation({
    mutationFn: (data: VariantCreateRequest[]) => variantService.bulkSaveVariants(product.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variants', product.id] })
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      queryClient.invalidateQueries({ queryKey: ['product'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['products-on-sale'] })
      toast.success('Variants saved!')
      onClose()
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err))
    },
  })

  const addRow = () => {
    setRows([...variants, newVariantRow(options)])
  }

  const removeRow = (key: string) => {
    setRows(variants.filter(v => v.key !== key))
  }

  const duplicateRow = (key: string) => {
    const src = variants.find(v => v.key === key)
    if (!src) return
    const copy = duplicateVariantRow(src)
    const idx = variants.findIndex(v => v.key === key)
    setRows([...variants.slice(0, idx + 1), copy, ...variants.slice(idx + 1)])
  }

  const updateRow = (key: string, field: string, value: unknown) => {
    setRows(variants.map(v =>
      v.key === key ? { ...v, [field]: value } : v
    ))
  }

  const updateOptionValue = (key: string, optionName: string, value: string) => {
    setRows(variants.map(v =>
      v.key === key ? { ...v, optionValues: { ...v.optionValues, [optionName]: value } } : v
    ))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = variants.findIndex(v => v.key === active.id)
    const newIndex = variants.findIndex(v => v.key === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    setRows(arrayMove(variants, oldIndex, newIndex))
  }

  const handleSave = () => {
    const invalid = variants.some(
      (v) =>
        v.price <= 0 ||
        !Number.isFinite(v.weightKg) ||
        v.weightKg <= 0 ||
        Object.values(v.optionValues).some((val) => !val.trim()),
    )
    if (invalid) {
      toast.error('Each variant needs a price, weight (kg), and all option values filled in')
      return
    }
    const data: VariantCreateRequest[] = variants.map((v) => ({
      sku: v.sku || undefined,
      price: v.price,
      weightKg: v.weightKg,
      compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : undefined,
      stockQty: v.stockQty,
      active: v.active,
      expense: v.expense ? Number(v.expense) : undefined,
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
          This product has no option types yet. Edit the product and save — new products default to a &quot;Default&quot;
          option — then add variants with price, weight, and stock here.
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
            Options: {options.join(', ')} · {variants.length} variant(s). Drag rows to set order on the product page.
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
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-blush">
                  <th className="w-10 py-2 px-1" aria-hidden />
                  {options.map(opt => (
                    <th key={opt} className="text-left py-2 px-2 font-medium text-charcoal">{opt}</th>
                  ))}
                  <th className="text-left py-2 px-2 font-medium text-charcoal">Price</th>
                  <th className="text-left py-2 px-2 font-medium text-charcoal">Compare</th>
                  <th className="text-left py-2 px-2 font-medium text-charcoal whitespace-nowrap">Weight (kg)</th>
                  <th className="text-left py-2 px-2 font-medium text-charcoal">Stock</th>
                  <th className="text-left py-2 px-2 font-medium text-charcoal">Expense</th>
                  <th className="text-left py-2 px-2 font-medium text-charcoal">SKU</th>
                  <th className="py-2 px-2 font-medium text-charcoal text-left whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <SortableContext items={variants.map(v => v.key)} strategy={verticalListSortingStrategy}>
                <tbody>
                  {variants.map((v) => (
                    <SortableVariantRow
                      key={v.key}
                      row={v}
                      options={options}
                      onUpdateRow={updateRow}
                      onUpdateOption={updateOptionValue}
                      onRemove={removeRow}
                      onDuplicate={duplicateRow}
                    />
                  ))}
                </tbody>
              </SortableContext>
            </table>
          </div>
        </DndContext>
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
