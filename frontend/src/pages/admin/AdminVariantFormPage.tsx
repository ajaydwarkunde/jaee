import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { productService } from '@/services/productService'
import { variantService } from '@/services/variantService'
import VariantForm, {
  emptyVariantFormValues,
  variantFormToRequest,
  variantToFormValues,
  type VariantFormValues,
} from '@/components/admin/VariantForm'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { invalidateCatalogQueries } from '@/lib/catalogQueries'
import toast from 'react-hot-toast'
import { getErrorMessage } from '@/lib/api'

export default function AdminVariantFormPage() {
  const { slug, variantId } = useParams<{ slug: string; variantId: string }>()
  const [searchParams] = useSearchParams()
  const cloneFromId = searchParams.get('cloneFrom')
  const isNew = !variantId
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: ['admin-product-for-variants', slug],
    queryFn: () => productService.getProductBySlug(slug!),
    enabled: !!slug,
    staleTime: 0,
  })

  const { data: variants = [], isLoading: variantsLoading } = useQuery({
    queryKey: ['variants', product?.id],
    queryFn: () => variantService.getVariants(product!.id),
    enabled: !!product?.id,
    staleTime: 0,
  })

  const sourceVariant = useMemo(() => {
    if (!isNew) {
      return variants.find((v) => String(v.id) === variantId)
    }
    if (cloneFromId) {
      return variants.find((v) => String(v.id) === cloneFromId)
    }
    return undefined
  }, [variants, variantId, isNew, cloneFromId])

  const options = product?.options?.length ? product.options : []

  const initialValues = useMemo(() => {
    if (sourceVariant) {
      const base = variantToFormValues(sourceVariant, options)
      if (isNew && cloneFromId) {
        return {
          ...base,
          sku: base.sku ? `${base.sku}-copy` : '',
          optionValues: { ...base.optionValues },
        }
      }
      return base
    }
    return emptyVariantFormValues(options)
  }, [sourceVariant, options, isNew, cloneFromId])

  const [values, setValues] = useState<VariantFormValues | null>(null)
  const formValues = values ?? initialValues

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!product) throw new Error('No product')
      const payload = variantFormToRequest(formValues)
      if (isNew) {
        return variantService.createVariant(product.id, payload)
      }
      return variantService.updateVariant(Number(variantId), payload)
    },
    onSuccess: () => {
      invalidateCatalogQueries(queryClient)
      toast.success(isNew ? 'Variant created' : 'Variant saved')
      navigate(`/admin/products/${slug}/variants`)
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const handleSubmit = () => {
    if (formValues.price <= 0 || formValues.weightKg <= 0) {
      toast.error('Price and weight are required')
      return
    }
    if (Object.values(formValues.optionValues).some((v) => !v.trim())) {
      toast.error('Fill in all option values')
      return
    }
    saveMutation.mutate()
  }

  if (productLoading || variantsLoading) return <LoadingSpinner fullScreen />
  if (!product) {
    return <div className="container-custom py-16 text-center text-error">Product not found</div>
  }
  if (!isNew && !sourceVariant) {
    return <div className="container-custom py-16 text-center text-error">Variant not found</div>
  }

  const title = isNew
    ? cloneFromId
      ? 'Clone variant'
      : 'Add variant'
    : 'Edit variant'

  return (
    <div className="bg-cream min-h-screen py-8">
      <div className="container-custom max-w-4xl">
        <Link
          to={`/admin/products/${slug}/variants`}
          className="inline-flex items-center gap-2 text-warm-gray hover:text-rose mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to variants
        </Link>
        <h1 className="heading-2 text-charcoal mb-8">{title}</h1>
        <VariantForm
          productName={product.name}
          options={options}
          values={formValues}
          onChange={setValues}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/admin/products/${slug}/variants`)}
          loading={saveMutation.isPending}
          submitLabel={isNew ? 'Create variant' : 'Save changes'}
        />
      </div>
    </div>
  )
}
