import { api } from '@/lib/api'
import type { ApiResponse, ProductVariant } from '@/types'

export interface VariantCreateRequest {
  sku?: string
  price: number
  compareAtPrice?: number
  stockQty: number
  active: boolean
  optionValues: Record<string, string>
  images: string[]
}

export const variantService = {
  getVariants: async (productId: number): Promise<ProductVariant[]> => {
    const response = await api.get<ApiResponse<ProductVariant[]>>(`/admin/products/${productId}/variants`)
    return response.data.data
  },

  createVariant: async (productId: number, data: VariantCreateRequest): Promise<ProductVariant> => {
    const response = await api.post<ApiResponse<ProductVariant>>(`/admin/products/${productId}/variants`, data)
    return response.data.data
  },

  bulkSaveVariants: async (productId: number, data: VariantCreateRequest[]): Promise<ProductVariant[]> => {
    const response = await api.put<ApiResponse<ProductVariant[]>>(`/admin/products/${productId}/variants/bulk`, data)
    return response.data.data
  },

  updateVariant: async (variantId: number, data: VariantCreateRequest): Promise<ProductVariant> => {
    const response = await api.put<ApiResponse<ProductVariant>>(`/admin/variants/${variantId}`, data)
    return response.data.data
  },

  deleteVariant: async (variantId: number): Promise<void> => {
    await api.delete(`/admin/variants/${variantId}`)
  },
}
