import { api } from '@/lib/api'
import type { ApiResponse, Cart, GuestCartItem } from '@/types'

export const cartService = {
  getCart: async (): Promise<Cart> => {
    const response = await api.get<ApiResponse<Cart>>('/cart')
    return response.data.data
  },

  addToCart: async (productId: number, qty: number): Promise<Cart> => {
    const response = await api.post<ApiResponse<Cart>>('/cart/items', { productId, qty })
    return response.data.data
  },

  updateCartItem: async (itemId: number, qty: number): Promise<Cart> => {
    const response = await api.patch<ApiResponse<Cart>>(`/cart/items/${itemId}`, { qty })
    return response.data.data
  },

  removeCartItem: async (itemId: number): Promise<Cart> => {
    const response = await api.delete<ApiResponse<Cart>>(`/cart/items/${itemId}`)
    return response.data.data
  },

  mergeCart: async (guestItems: GuestCartItem[]): Promise<Cart> => {
    const response = await api.post<ApiResponse<Cart>>('/cart/merge', { guestItems })
    return response.data.data
  },
}
