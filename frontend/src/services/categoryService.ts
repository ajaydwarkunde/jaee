import { api } from '@/lib/api'
import type { ApiResponse, Category, CategoryFormData } from '@/types'

export const categoryService = {
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get<ApiResponse<Category[]>>('/categories')
    return response.data.data
  },

  getCategoryBySlug: async (slug: string): Promise<Category> => {
    const response = await api.get<ApiResponse<Category>>(`/categories/${slug}`)
    return response.data.data
  },

  // Admin endpoints
  createCategory: async (data: CategoryFormData): Promise<Category> => {
    const response = await api.post<ApiResponse<Category>>('/admin/categories', data)
    return response.data.data
  },

  updateCategory: async (id: number, data: CategoryFormData): Promise<Category> => {
    const response = await api.put<ApiResponse<Category>>(`/admin/categories/${id}`, data)
    return response.data.data
  },

  deleteCategory: async (id: number): Promise<void> => {
    await api.delete(`/admin/categories/${id}`)
  },
}
