import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { productService } from '@/services/productService'
import { categoryService } from '@/services/categoryService'
import ProductForm from '@/components/admin/ProductForm'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { invalidateCatalogQueries } from '@/lib/catalogQueries'
import toast from 'react-hot-toast'
import type { ProductFormData } from '@/types'

export default function AdminProductFormPage() {
  const { slug } = useParams<{ slug: string }>()
  const isNew = slug === 'new'
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getCategories,
  })

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['admin-product-for-edit', slug],
    queryFn: () => productService.getProductBySlug(slug!),
    enabled: !isNew && !!slug,
  })

  const saveMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      if (isNew) {
        return productService.createProduct(data)
      }
      if (!product) throw new Error('Product not loaded')
      return productService.updateProduct(product.id, data)
    },
    onSuccess: (saved) => {
      invalidateCatalogQueries(queryClient)
      toast.success(isNew ? 'Product created' : 'Product updated')
      if (isNew) {
        navigate(`/admin/products/${saved.slug}/variants`, { replace: true })
      } else {
        navigate('/admin/products')
      }
    },
    onError: () => toast.error('Failed to save product'),
  })

  if (!isNew && isLoading) return <LoadingSpinner fullScreen />
  if (!isNew && (isError || !product)) {
    return (
      <div className="container-custom py-16 text-center">
        <p className="text-error mb-4">Product not found</p>
        <Link to="/admin/products" className="text-rose underline">
          Back to products
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-cream min-h-screen py-8">
      <div className="container-custom max-w-4xl">
        <Link
          to="/admin/products"
          className="inline-flex items-center gap-2 text-warm-gray hover:text-rose mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to products
        </Link>
        <h1 className="heading-2 text-charcoal mb-2">{isNew ? 'Add Product' : 'Edit Product'}</h1>
        <p className="text-warm-gray mb-8">
          {isNew
            ? 'Create the product, then add variants on the next screen.'
            : 'Update product details. Manage variants from the variants page.'}
        </p>
        {!isNew && product && (
          <p className="mb-6">
            <Link
              to={`/admin/products/${product.slug}/variants`}
              className="text-sm font-medium text-rose hover:underline"
            >
              Manage variants →
            </Link>
          </p>
        )}
        <div className="bg-soft-white rounded-xl shadow-soft p-6 md:p-8">
          <ProductForm
            key={product?.id ?? 'new'}
            product={product ?? null}
            categories={categories || []}
            onSubmit={(data) => saveMutation.mutate(data)}
            onCancel={() => navigate('/admin/products')}
            loading={saveMutation.isPending}
          />
        </div>
      </div>
    </div>
  )
}
