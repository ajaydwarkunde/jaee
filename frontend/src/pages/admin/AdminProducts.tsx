import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { productService } from '@/services/productService'
import { categoryService } from '@/services/categoryService'
import { formatPrice } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ProductForm from '@/components/admin/ProductForm'
import toast from 'react-hot-toast'
import type { Product, ProductFormData } from '@/types'

export default function AdminProducts() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null)

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['admin-products', { search, page }],
    queryFn: () => productService.getProducts({ search: search || undefined, page, size: 10 }),
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getCategories,
  })

  const createMutation = useMutation({
    mutationFn: (data: ProductFormData) => productService.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      toast.success('Product created!')
      setIsFormOpen(false)
    },
    onError: () => {
      toast.error('Failed to create product')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductFormData }) =>
      productService.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      toast.success('Product updated!')
      setEditProduct(null)
      setIsFormOpen(false)
    },
    onError: () => {
      toast.error('Failed to update product')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => productService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      toast.success('Product deleted!')
      setDeleteProduct(null)
    },
    onError: () => {
      toast.error('Failed to delete product')
    },
  })

  const handleSubmit = (data: ProductFormData) => {
    if (editProduct) {
      updateMutation.mutate({ id: editProduct.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleEdit = (product: Product) => {
    setEditProduct(product)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setEditProduct(null)
    setIsFormOpen(false)
  }

  if (isLoading) {
    return <LoadingSpinner fullScreen />
  }

  return (
    <div className="bg-cream min-h-screen py-8">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="heading-2 text-charcoal">Products</h1>
            <p className="text-warm-gray mt-1">
              {productsData?.totalElements || 0} total products
            </p>
          </div>
          <Button onClick={() => setIsFormOpen(true)} icon={<Plus className="w-5 h-5" />}>
            Add Product
          </Button>
        </div>

        {/* Search */}
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

        {/* Products Table */}
        <div className="bg-soft-white rounded-xl shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blush/50">
                <tr>
                  <th className="text-left p-4 font-medium text-charcoal">Product</th>
                  <th className="text-left p-4 font-medium text-charcoal">Category</th>
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
                          src={product.images[0] || 'https://images.unsplash.com/photo-1602523961359-24a68d4e5a9b?w=100'}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium text-charcoal">{product.name}</p>
                          <p className="text-sm text-warm-gray">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-warm-gray">{product.categoryName || '—'}</td>
                    <td className="p-4 font-medium">{formatPrice(product.price)}</td>
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
                          onClick={() => handleEdit(product)}
                          className="p-2 text-warm-gray hover:text-rose transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteProduct(product)}
                          className="p-2 text-warm-gray hover:text-error transition-colors"
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

          {/* Pagination */}
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

        {/* Product Form Modal */}
        <Modal
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          title={editProduct ? 'Edit Product' : 'Add Product'}
          size="lg"
        >
          <ProductForm
            product={editProduct}
            categories={categories || []}
            onSubmit={handleSubmit}
            onCancel={handleCloseForm}
            loading={createMutation.isPending || updateMutation.isPending}
          />
        </Modal>

        {/* Delete Confirmation */}
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
