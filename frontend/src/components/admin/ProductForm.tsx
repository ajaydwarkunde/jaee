import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload, X, Loader2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Select from '@/components/ui/Select'
import { imageService } from '@/services/imageService'
import toast from 'react-hot-toast'
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
  const [uploadedImages, setUploadedImages] = useState<string[]>(product?.images || [])
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
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

  const handleFileUpload = async (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`)
        return false
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`)
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    setIsUploading(true)
    try {
      const urls = await imageService.uploadMultipleImages(validFiles, 'product')
      const newImages = [...uploadedImages, ...urls]
      setUploadedImages(newImages)
      setValue('images', newImages.join('\n'))
      toast.success(`${urls.length} image(s) uploaded`)
    } catch {
      toast.error('Failed to upload images')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileUpload(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const removeImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index)
    setUploadedImages(newImages)
    setValue('images', newImages.join('\n'))
  }

  const handleFormSubmit = (data: ProductFormSchema) => {
    // Use uploadedImages state which is always up-to-date
    const images = uploadedImages.length > 0
      ? uploadedImages
      : data.images
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
        required
        placeholder="Enter product name"
      />

      <Textarea
        label="Description"
        {...register('description')}
        rows={4}
        error={errors.description?.message}
        placeholder="Describe your product..."
      />

      <div className="grid grid-cols-3 gap-4">
        <Input
          label="Selling Price"
          type="number"
          step="0.01"
          {...register('price')}
          error={errors.price?.message}
          required
          placeholder="0.00"
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

      {/* Image Upload Section */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-charcoal">Product Images</label>
        
        {/* Upload Area */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-rose bg-rose/5'
              : 'border-blush hover:border-rose/50 hover:bg-blush/30'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            className="hidden"
          />
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-rose animate-spin" />
              <p className="text-sm text-warm-gray">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-warm-gray" />
              <p className="text-sm text-charcoal font-medium">
                Drop images here or click to upload
              </p>
              <p className="text-xs text-warm-gray">PNG, JPG, GIF, WebP (max 5MB)</p>
            </div>
          )}
        </div>

        {/* Uploaded Images Preview */}
        {uploadedImages.length > 0 && (
          <div className="grid grid-cols-4 gap-3">
            {uploadedImages.map((url, index) => (
              <div key={index} className="relative group aspect-square">
                <img
                  src={url}
                  alt={`Product ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg border border-blush"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 p-1 bg-error text-soft-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
                {index === 0 && (
                  <span className="absolute bottom-1 left-1 text-xs bg-charcoal/80 text-soft-white px-2 py-0.5 rounded">
                    Main
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Manual URL Input (Alternative) */}
        <details className="text-sm">
          <summary className="text-warm-gray cursor-pointer hover:text-charcoal">
            Or add image URLs manually
          </summary>
          <Textarea
            {...register('images')}
            rows={3}
            placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
            className="mt-2"
            onChange={(e) => {
              const urls = e.target.value.split('\n').filter(Boolean)
              setUploadedImages(urls)
            }}
          />
        </details>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Stock Quantity"
          type="number"
          {...register('stockQty')}
          error={errors.stockQty?.message}
          required
          placeholder="0"
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
