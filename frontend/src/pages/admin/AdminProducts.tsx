import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Search, Layers, FileSpreadsheet } from 'lucide-react'
import { productService } from '@/services/productService'
import { formatPrice } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { invalidateCatalogQueries } from '@/lib/catalogQueries'
import toast from 'react-hot-toast'
import type { Product } from '@/types'

export default function AdminProducts() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null)

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['admin-products', { search, page }],
    queryFn: () =>
      productService.getAdminProducts({ search: search || undefined, page, pageSize: 10 }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => productService.deleteProduct(id),
    onSuccess: () => {
      invalidateCatalogQueries(queryClient)
      toast.success('Product deleted!')
      setDeleteProduct(null)
    },
    onError: () => toast.error('Failed to delete product'),
  })

  if (isLoading) {
    return <LoadingSpinner fullScreen />
  }

  return (
    <div className="bg-cream min-h-screen py-8">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="heading-2 text-charcoal">Products</h1>
            <p className="text-warm-gray mt-1">{productsData?.totalElements || 0} total products</p>
          </div>
          <Button onClick={() => navigate('/admin/products/new')} icon={<Plus className="w-5 h-5" />}>
            Add Product
          </Button>
        </div>

        <div className="mb-6">
          <Input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(0)
            }}
            icon={<Search className="w-5 h-5" />}
            className="max-w-md"
          />
        </div>

        <div className="bg-soft-white rounded-xl shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blush/50">
                <tr>
                  <th className="text-left p-4 font-medium text-charcoal">Product</th>
                  <th className="text-left p-4 font-medium text-charcoal">Category</th>
                  <th className="text-left p-4 font-medium text-charcoal min-w-[200px] max-w-[280px]">
                    Description
                  </th>
                  <th className="text-left p-4 font-medium text-charcoal">Price</th>
                  <th className="text-left p-4 font-medium text-charcoal">Stock</th>
                  <th className="text-left p-4 font-medium text-charcoal">Status</th>
                  <th className="text-right p-4 font-medium text-charcoal">Actions</th>
                </tr>
              </thead>
              <tbody>
                {productsData?.content.map((product) => (
                  <tr key={product.id} className="border-t border-blush hover:bg-blush/20">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            product.images[0] ||
                            'https://images.unsplash.com/photo-1602523961359-24a68d4e5a9b?w=100'
                          }
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-serif text-base font-semibold text-rose">{product.name}</p>
                            {product.sheetSku && (
                              <Badge variant="success" className="gap-1" title="Managed by Google Sheet">
                                <FileSpreadsheet className="h-3 w-3" />
                                Sheet
                              </Badge>
                            )}
                            {product.variants && product.variants.length > 0 && (
                              <span className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">
                                {product.variants.length} variant{product.variants.length > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-warm-gray">{product.slug}</p>
                          {product.sheetSku && (
                            <p className="mt-0.5 text-xs text-warm-gray">
                              Initial SKU {product.sheetSku} · variants have individual SKUs
                              {product.sheetLastSyncedAt &&
                                ` · Synced ${new Date(product.sheetLastSyncedAt).toLocaleString()}`}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-warm-gray">
                      {product.categoryNames?.length > 0 ? product.categoryNames.join(', ') : '—'}
                    </td>
                    <td className="p-4 max-w-[280px]">
                      {product.description?.trim() ? (
                        <p className="text-sm text-charcoal/80 line-clamp-2" title={product.description}>
                          {product.description}
                        </p>
                      ) : (
                        <span className="text-xs text-error/90 font-medium">Add description</span>
                      )}
                    </td>
                    <td className="p-4 font-bold tabular-nums">{formatPrice(product.price)}</td>
                    <td className="p-4">{product.stockQty}</td>
                    <td className="p-4">
                      {product.active ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="error">Inactive</Badge>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/admin/products/${product.slug}/variants`)}
                          className="p-2 text-warm-gray hover:text-amber-600 transition-colors"
                          title="Manage variants"
                        >
                          <Layers className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/products/${product.slug}/edit`)}
                          className="p-2 text-warm-gray hover:text-rose transition-colors"
                          title="Edit product"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteProduct(product)}
                          className="p-2 text-warm-gray hover:text-error transition-colors"
                          title="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {productsData && productsData.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 p-4 border-t border-blush">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((p) => p - 1)}
                disabled={productsData.first}
              >
                Previous
              </Button>
              <span className="text-sm text-warm-gray">
                Page {productsData.page + 1} of {productsData.totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={productsData.last}
              >
                Next
              </Button>
            </div>
          )}
        </div>

        <Modal
          isOpen={!!deleteProduct}
          onClose={() => setDeleteProduct(null)}
          title="Delete Product"
          size="sm"
        >
          <p className="text-warm-gray mb-6">
            Are you sure you want to delete "{deleteProduct?.name}"? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setDeleteProduct(null)} className="flex-1">
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => deleteProduct && deleteMutation.mutate(deleteProduct.id)}
              loading={deleteMutation.isPending}
              className="flex-1"
            >
              Delete
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  )
}
