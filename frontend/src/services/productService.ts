import { api } from '@/lib/api'
import type { ApiResponse, PageResponse, Product, ProductFilters, ProductFormData } from '@/types'

export const productService = {
  getProducts: async (filters: ProductFilters = {}): Promise<PageResponse<Product>> => {
    const params = new URLSearchParams()
    
    if (filters.categoryId) params.append('categoryId', filters.categoryId.toString())
    if (filters.minPrice) params.append('minPrice', filters.minPrice.toString())
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString())
    if (filters.search) params.append('search', filters.search)
    if (filters.sortBy) params.append('sortBy', filters.sortBy)
    if (filters.sortDir) params.append('sortDir', filters.sortDir)
    params.append('page', (filters.page ?? 0).toString())
    params.append('size', (filters.size ?? 12).toString())

    const response = await api.get<ApiResponse<PageResponse<Product>>>(`/products?${params}`)
    return response.data.data
  },

  getProductBySlug: async (slug: string): Promise<Product> => {
    const response = await api.get<ApiResponse<Product>>(`/products/${slug}`)
    return response.data.data
  },

  getFeaturedProducts: async (limit: number = 8): Promise<Product[]> => {
    const response = await api.get<ApiResponse<Product[]>>(`/products/featured?limit=${limit}`)
    return response.data.data
  },

  getOnSaleProducts: async (page: number = 0, size: number = 12): Promise<PageResponse<Product>> => {
    const response = await api.get<ApiResponse<PageResponse<Product>>>(`/products/on-sale?page=${page}&size=${size}`)
    return response.data.data
  },

  // Admin endpoints
  createProduct: async (data: ProductFormData): Promise<Product> => {
    const response = await api.post<ApiResponse<Product>>('/admin/products', data)
    return response.data.data
  },

  updateProduct: async (id: number, data: ProductFormData): Promise<Product> => {
    const response = await api.put<ApiResponse<Product>>(`/admin/products/${id}`, data)
    return response.data.data
  },

  deleteProduct: async (id: number): Promise<void> => {
    await api.delete(`/admin/products/${id}`)
  },
}
