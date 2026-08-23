import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload, X, Loader2, Film, Plus, Layers, FileSpreadsheet } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Select from '@/components/ui/Select'
import { imageService } from '@/services/imageService'
import toast from 'react-hot-toast'
import type { Product, Category, ProductFormData } from '@/types'

const productSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z
    .string()
    .trim()
    .min(1, 'Product description is required')
    .max(5000, 'Description must be at most 5000 characters'),
  price: z.coerce.number().min(0.01, 'Enter a selling price greater than 0'),
  compareAtPrice: z.coerce.number().min(0).optional().or(z.literal('')),
  currency: z.string().default('INR'),
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
  const [uploadedVideos, setUploadedVideos] = useState<string[]>(product?.videos || [])
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>(product?.categoryIds || [])
  const [productOptions, setProductOptions] = useState<string[]>(
    product?.options && product.options.length > 0 ? product.options : ['Default']
  )
  const [newOption, setNewOption] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [isUploadingVideo, setIsUploadingVideo] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isDraggingVideo, setIsDraggingVideo] = useState(false)
  const [customizationEnabled, setCustomizationEnabled] = useState(
    Boolean(product?.customizationEnabled),
  )
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

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

  const handleVideoUpload = async (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter((file) => {
      if (!file.type.startsWith('video/')) {
        toast.error(`${file.name} is not a video`)
        return false
      }
      if (file.size > 50 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 50MB)`)
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    setIsUploadingVideo(true)
    try {
      const urls = await imageService.uploadMultipleVideos(validFiles)
      const newVideos = [...uploadedVideos, ...urls]
      setUploadedVideos(newVideos)
      toast.success(`${urls.length} video(s) uploaded`)
    } catch {
      toast.error('Failed to upload videos')
    } finally {
      setIsUploadingVideo(false)
    }
  }

  const handleVideoDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingVideo(false)
    handleVideoUpload(e.dataTransfer.files)
  }

  const removeVideo = (index: number) => {
    setUploadedVideos(uploadedVideos.filter((_, i) => i !== index))
  }

  const handleFormSubmit = (data: ProductFormSchema) => {
    const images = uploadedImages.length > 0
      ? uploadedImages
      : data.images
        ? data.images.split('\n').map((url) => url.trim()).filter(Boolean)
        : []

    const payload: ProductFormData = {
      name: data.name,
      description: data.description.trim(),
      compareAtPrice: data.compareAtPrice ? Number(data.compareAtPrice) : undefined,
      currency: data.currency,
      categoryIds: selectedCategoryIds,
      images,
      videos: uploadedVideos,
      options: productOptions,
      stockQty: data.stockQty,
      active: data.active,
      customizationEnabled,
    }
    payload.price = data.price
    onSubmit(payload)
  }

  const toggleCategory = (catId: number) => {
    setSelectedCategoryIds(prev =>
      prev.includes(catId)
        ? prev.filter(id => id !== catId)
        : [...prev, catId]
    )
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {product?.sheetSku && (
        <div className="rounded-xl border border-success/30 bg-success/10 p-4">
          <div className="flex items-start gap-3">
            <FileSpreadsheet className="h-5 w-5 shrink-0 text-success mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-charcoal">
                Managed by Google Sheet · SKU {product.sheetSku}
              </p>
              <p className="mt-1 text-xs text-warm-gray">
                Name, selling price, stock, cost and variant options are sheet-owned. Description
                and images are overwritten only when their sheet cells are filled; blank cells
                preserve your admin edits. If Website Pricing is blank, the storefront shows an
                Instagram quote instead of Add to Cart.
                {product.sheetLastSyncedAt &&
                  ` Last synced ${new Date(product.sheetLastSyncedAt).toLocaleString()}.`}
              </p>
            </div>
          </div>
        </div>
      )}

      <Input
        label={`Product Name${product?.sheetSku ? ' (Google Sheet managed)' : ''}`}
        {...register('name')}
        error={errors.name?.message}
        required
        placeholder="Enter product name"
      />

      <Textarea
        label={`Product description (storefront)${product?.sheetSku ? ' · Sheet optional' : ''}`}
        {...register('description')}
        rows={6}
        required
        error={errors.description?.message}
        placeholder="Ingredients, burn time, care, scent notes — appears below the title on the public product page."
      />
      <p className="text-xs text-warm-gray -mt-2">
        Required for every product. For sheet-managed products, a non-empty Description cell
        overwrites this value; a blank cell preserves your manual update.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label={`Selling Price (₹)${product?.sheetSku ? ' · Sheet managed' : ''}`}
          type="number"
          step="1"
          {...register('price', { valueAsNumber: true })}
          error={errors.price?.message}
          placeholder="0"
        />
        <Input
          label="Compare at Price"
          type="number"
          step="0.01"
          placeholder="Optional"
          {...register('compareAtPrice')}
        />
      </div>
      <p className="text-xs text-warm-gray -mt-2">
        Set per-SKU weight under Manage Variants after saving — required for accurate shipping.
      </p>
      <Select
        label="Currency"
        options={[
          { value: 'INR', label: 'INR (₹)' },
          { value: 'USD', label: 'USD ($)' },
        ]}
        {...register('currency')}
      />

      {/* Categories (multi-select) */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-charcoal">Categories</label>
        <p className="text-xs text-warm-gray">
          Select one or more categories this product belongs to.
        </p>
        <div className="flex flex-wrap gap-2 p-3 border border-blush rounded-lg bg-soft-white max-h-40 overflow-y-auto">
          {categories.length === 0 ? (
            <p className="text-sm text-warm-gray">No categories available</p>
          ) : (
            categories.map((cat) => {
              const isSelected = selectedCategoryIds.includes(cat.id)
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                    isSelected
                      ? 'border-rose bg-rose/10 text-rose'
                      : 'border-blush bg-blush/30 text-warm-gray hover:border-rose/50'
                  }`}
                >
                  {cat.name}
                </button>
              )
            })
          )}
        </div>
        {selectedCategoryIds.length > 0 && (
          <p className="text-xs text-warm-gray">
            {selectedCategoryIds.length} categor{selectedCategoryIds.length === 1 ? 'y' : 'ies'} selected
          </p>
        )}
      </div>

      {/* Image Upload Section */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-charcoal">Product Images</label>
        <p className="text-xs text-warm-gray">
          Upload files here, paste URLs, or fill the Google Sheet <span className="font-medium">Image URLs</span> column.
          Sheet URLs replace this gallery on the next sync only when that cell is not empty.
        </p>
        
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
              <p className="text-xs text-warm-gray">PNG, JPG, GIF, WebP, SVG (max 5MB)</p>
            </div>
          )}
        </div>

        {/* Uploaded Images Preview */}
        {uploadedImages.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
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

      {/* Video Upload Section */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-charcoal">Product Videos</label>

        <div
          onDrop={handleVideoDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDraggingVideo(true) }}
          onDragLeave={() => setIsDraggingVideo(false)}
          onClick={() => videoInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDraggingVideo
              ? 'border-rose bg-rose/5'
              : 'border-blush hover:border-rose/50 hover:bg-blush/30'
          }`}
        >
          <input
            ref={videoInputRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
            multiple
            onChange={(e) => e.target.files && handleVideoUpload(e.target.files)}
            className="hidden"
          />
          {isUploadingVideo ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-rose animate-spin" />
              <p className="text-sm text-warm-gray">Uploading video...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Film className="w-8 h-8 text-warm-gray" />
              <p className="text-sm text-charcoal font-medium">
                Drop videos here or click to upload
              </p>
              <p className="text-xs text-warm-gray">MP4, WebM, MOV, AVI (max 50MB)</p>
            </div>
          )}
        </div>

        {uploadedVideos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {uploadedVideos.map((url, index) => (
              <div key={index} className="relative group aspect-video">
                <video
                  src={url}
                  className="w-full h-full object-cover rounded-lg border border-blush"
                  muted
                  preload="metadata"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-8 h-8 rounded-full bg-charcoal/60 flex items-center justify-center">
                    <Film className="w-4 h-4 text-soft-white" />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeVideo(index)}
                  className="absolute -top-2 -right-2 p-1 bg-error text-soft-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Variant Options */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-charcoal">
          <span className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Variant Options
          </span>
        </label>
        <p className="text-xs text-warm-gray">
          New products default to a single &quot;Default&quot; option so you can add at least one SKU (price, stock, weight). Rename chips or add option types as needed. Use Manage Variants on the product list for SKU details.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={newOption}
            onChange={(e) => setNewOption(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                const val = newOption.trim()
                if (val && !productOptions.includes(val)) {
                  setProductOptions([...productOptions, val])
                  setNewOption('')
                }
              }
            }}
            placeholder="Type option name and press Enter"
            className="flex-1 px-3 py-2 border border-blush rounded-lg text-sm text-charcoal bg-soft-white focus:outline-none focus:border-rose"
          />
          <button
            type="button"
            onClick={() => {
              const val = newOption.trim()
              if (val && !productOptions.includes(val)) {
                setProductOptions([...productOptions, val])
                setNewOption('')
              }
            }}
            className="px-3 py-2 bg-rose/10 text-rose rounded-lg hover:bg-rose/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {productOptions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {productOptions.map((opt) => (
              <span key={opt} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blush/60 text-charcoal text-sm font-medium rounded-full">
                {opt}
                <button
                  type="button"
                  onClick={() => setProductOptions(productOptions.filter(o => o !== opt))}
                  className="hover:text-error transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-blush/80 bg-blush/20 p-4 space-y-2">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={customizationEnabled}
            onChange={(e) => setCustomizationEnabled(e.target.checked)}
            className="w-5 h-5 mt-0.5 rounded border-blush text-rose focus:ring-rose"
          />
          <span>
            <span className="block text-sm font-medium text-charcoal">
              Enable “Add Your Customization Details Here”
            </span>
            <span className="block text-xs text-warm-gray mt-1">
              When enabled, customers must enter customization text before adding this product to
              the cart. Shown on the product page and saved on the order.
            </span>
          </span>
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label={`Stock Quantity${product?.sheetSku ? ' · Sheet managed' : ''}`}
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
