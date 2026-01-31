import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { categoryService } from '@/services/categoryService'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'
import type { Category, CategoryFormData } from '@/types'

export default function AdminCategories() {
  const queryClient = useQueryClient()
  const [editCategory, setEditCategory] = useState<Category | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    imageUrl: '',
  })

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getCategories,
  })

  const createMutation = useMutation({
    mutationFn: (data: CategoryFormData) => categoryService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Category created!')
      handleCloseForm()
    },
    onError: () => {
      toast.error('Failed to create category')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategoryFormData }) =>
      categoryService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Category updated!')
      handleCloseForm()
    },
    onError: () => {
      toast.error('Failed to update category')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => categoryService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Category deleted!')
      setDeleteCategory(null)
    },
    onError: () => {
      toast.error('Failed to delete category. Make sure no products are using it.')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editCategory) {
      updateMutation.mutate({ id: editCategory.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleEdit = (category: Category) => {
    setEditCategory(category)
    setFormData({
      name: category.name,
      description: category.description || '',
      imageUrl: category.imageUrl || '',
    })
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setEditCategory(null)
    setFormData({ name: '', description: '', imageUrl: '' })
    setIsFormOpen(false)
  }

  if (isLoading) {
    return <LoadingSpinner fullScreen />
  }

  return (
    <div className="bg-cream min-h-screen py-8">
      <div className="container-custom max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="heading-2 text-charcoal">Categories</h1>
            <p className="text-warm-gray mt-1">{categories?.length || 0} categories</p>
          </div>
          <Button onClick={() => setIsFormOpen(true)} icon={<Plus className="w-5 h-5" />}>
            Add Category
          </Button>
        </div>

        {/* Categories List */}
        <div className="bg-soft-white rounded-xl shadow-soft overflow-hidden">
          {categories?.map((category, idx) => (
            <div
              key={category.id}
              className={`flex items-center gap-4 p-4 ${
                idx !== categories.length - 1 ? 'border-b border-blush' : ''
              }`}
            >
              <img
                src={category.imageUrl || 'https://images.unsplash.com/photo-1602523961359-24a68d4e5a9b?w=100'}
                alt={category.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h3 className="font-medium text-charcoal">{category.name}</h3>
                <p className="text-sm text-warm-gray">{category.slug}</p>
                {category.description && (
                  <p className="text-sm text-warm-gray mt-1 line-clamp-1">
                    {category.description}
                  </p>
                )}
              </div>
              <span className="text-sm text-warm-gray">{category.productCount} products</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(category)}
                  className="p-2 text-warm-gray hover:text-rose transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteCategory(category)}
                  className="p-2 text-warm-gray hover:text-error transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Category Form Modal */}
        <Modal
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          title={editCategory ? 'Edit Category' : 'Add Category'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Textarea
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
            <Input
              label="Image URL"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://..."
            />
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseForm} className="flex-1">
                Cancel
              </Button>
              <Button
                type="submit"
                loading={createMutation.isPending || updateMutation.isPending}
                className="flex-1"
              >
                {editCategory ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation */}
        <Modal
          isOpen={!!deleteCategory}
          onClose={() => setDeleteCategory(null)}
          title="Delete Category"
          size="sm"
        >
          <p className="text-warm-gray mb-6">
            Are you sure you want to delete "{deleteCategory?.name}"? Products in this category will become uncategorized.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setDeleteCategory(null)} className="flex-1">
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => deleteCategory && deleteMutation.mutate(deleteCategory.id)}
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
