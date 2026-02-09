import { api } from '@/lib/api'
import type { ApiResponse, Product } from '@/types'

export interface WishlistItem {
  id: number
  product: Product
  addedAt: string
}

export const wishlistService = {
  getWishlist: async (): Promise<WishlistItem[]> => {
    const response = await api.get<ApiResponse<WishlistItem[]>>('/wishlist')
    return response.data.data
  },

  addToWishlist: async (productId: number): Promise<WishlistItem> => {
    const response = await api.post<ApiResponse<WishlistItem>>(`/wishlist/${productId}`)
    return response.data.data
  },

  removeFromWishlist: async (productId: number): Promise<void> => {
    await api.delete(`/wishlist/${productId}`)
  },

  checkWishlist: async (productId: number): Promise<boolean> => {
    const response = await api.get<ApiResponse<{ inWishlist: boolean }>>(`/wishlist/check/${productId}`)
    return response.data.data.inWishlist
  },

  getWishlistProductIds: async (): Promise<number[]> => {
    const response = await api.get<ApiResponse<number[]>>('/wishlist/product-ids')
    return response.data.data
  },

  getWishlistCount: async (): Promise<number> => {
    const response = await api.get<ApiResponse<{ count: number }>>('/wishlist/count')
    return response.data.data.count
  },
}
