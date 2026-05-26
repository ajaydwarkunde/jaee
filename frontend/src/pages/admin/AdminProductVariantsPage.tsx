import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Copy, Pencil, Plus } from 'lucide-react'
import { productService } from '@/services/productService'
import { variantService } from '@/services/variantService'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { formatPrice } from '@/lib/utils'

export default function AdminProductVariantsPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

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

  if (productLoading || variantsLoading) return <LoadingSpinner fullScreen />
  if (!product) {
    return (
      <div className="container-custom py-16 text-center text-error">Product not found</div>
    )
  }

  const options = product.options?.length ? product.options : []

  return (
    <div className="bg-cream min-h-screen py-8">
      <div className="container-custom max-w-4xl">
        <Link
          to="/admin/products"
          className="inline-flex items-center gap-2 text-warm-gray hover:text-rose mb-4 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to products
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="heading-2 text-charcoal">Variants</h1>
            <p className="text-warm-gray mt-1">{product.name}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/admin/products/${slug}/edit`)}
            >
              Edit product
            </Button>
            <Button
              icon={<Plus className="w-4 h-4" />}
              onClick={() => navigate(`/admin/products/${slug}/variants/new`)}
              disabled={options.length === 0}
            >
              Add variant
            </Button>
          </div>
        </div>

        {options.length === 0 ? (
          <div className="bg-soft-white rounded-xl p-8 text-center text-warm-gray">
            Add option types (e.g. Size, Scent) on the product first, then add variants.
          </div>
        ) : variants.length === 0 ? (
          <div className="bg-soft-white rounded-xl p-8 text-center">
            <p className="text-warm-gray mb-4">No variants yet.</p>
            <Button onClick={() => navigate(`/admin/products/${slug}/variants/new`)}>
              Add first variant
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {variants.map((v) => (
              <div
                key={v.id}
                className="bg-soft-white rounded-xl border border-blush p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <p className="font-medium text-charcoal">
                    {Object.entries(v.optionValues)
                      .map(([k, val]) => `${k}: ${val}`)
                      .join(' · ') || `Variant #${v.id}`}
                  </p>
                  <p className="text-sm text-warm-gray mt-1">
                    {formatPrice(v.price)} · Stock {v.stockQty}
                    {v.sku ? ` · SKU ${v.sku}` : ''}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    icon={<Copy className="w-4 h-4" />}
                    onClick={() =>
                      navigate(`/admin/products/${slug}/variants/new?cloneFrom=${v.id}`)
                    }
                  >
                    Clone
                  </Button>
                  <Button
                    size="sm"
                    icon={<Pencil className="w-4 h-4" />}
                    onClick={() => navigate(`/admin/products/${slug}/variants/${v.id}`)}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
