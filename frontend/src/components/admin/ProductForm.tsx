import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Select from '@/components/ui/Select'
import type { Product, Category, ProductFormData } from '@/types'

const productSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().optional(),
  price: z.coerce.number().positive('Price must be greater than 0'),
  compareAtPrice: z.coerce.number().min(0).optional().or(z.literal('')),
  currency: z.string().default('INR'),
  categoryId: z.coerce.number().optional(),
  images: z.string().optional(),
  stockQty: z.coerce.number().int().min(0, 'Stock cannot be negative'),
  active: z.boolean().default(true),
})

type ProductFormSchema = z.infer<typeof productSchema>

interface ProductFormProps {
  product?: Product | null
  categories: Category[]
  onSubmit: (data: ProductFormData) => void
  onCancel: () => void
  loading?: boolean
}

export default function ProductForm({
  product,
  categories,
  onSubmit,
  onCancel,
  loading,
}: ProductFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormSchema>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price || 0,
      compareAtPrice: product?.compareAtPrice || '',
      currency: product?.currency || 'INR',
      categoryId: product?.categoryId || undefined,
      images: product?.images.join('\n') || '',
      stockQty: product?.stockQty || 0,
      active: product?.active ?? true,
    },
  })

  const handleFormSubmit = (data: ProductFormSchema) => {
    const images = data.images
      ? data.images.split('\n').map((url) => url.trim()).filter(Boolean)
      : []

    onSubmit({
      name: data.name,
      description: data.description,
      price: data.price,
      compareAtPrice: data.compareAtPrice ? Number(data.compareAtPrice) : undefined,
      currency: data.currency,
      categoryId: data.categoryId,
      images,
      stockQty: data.stockQty,
      active: data.active,
    })
  }

  const categoryOptions = [
    { value: '', label: 'No category' },
    ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
  ]

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Input
        label="Product Name"
        {...register('name')}
        error={errors.name?.message}
      />

      <Textarea
        label="Description"
        {...register('description')}
        rows={4}
        error={errors.description?.message}
      />

      <div className="grid grid-cols-3 gap-4">
        <Input
          label="Selling Price"
          type="number"
          step="0.01"
          {...register('price')}
          error={errors.price?.message}
        />
        <Input
          label="Compare at Price"
          type="number"
          step="0.01"
          placeholder="Original price (optional)"
          {...register('compareAtPrice')}
        />
        <Select
          label="Currency"
          options={[
            { value: 'INR', label: 'INR (₹)' },
            { value: 'USD', label: 'USD ($)' },
          ]}
          {...register('currency')}
        />
      </div>

      <Select
        label="Category"
        options={categoryOptions}
        {...register('categoryId')}
      />

      <Textarea
        label="Image URLs (one per line)"
        {...register('images')}
        rows={3}
        placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Stock Quantity"
          type="number"
          {...register('stockQty')}
          error={errors.stockQty?.message}
        />
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register('active')}
              className="w-5 h-5 rounded border-blush text-rose focus:ring-rose"
            />
            <span className="text-sm font-medium text-charcoal">Active</span>
          </label>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" loading={loading} className="flex-1">
          {product ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  )
}
