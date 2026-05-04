import { api } from '@/lib/api'
import type { ApiResponse, Cart, GuestCartItem } from '@/types'

export const cartService = {
  getCart: async (addressId?: number, couponCode?: string): Promise<Cart> => {
    const params = new URLSearchParams()
    if (addressId != null) params.set('addressId', String(addressId))
    if (couponCode) params.set('couponCode', couponCode)
    const qs = params.toString()
    const response = await api.get<ApiResponse<Cart>>(qs ? `/cart?${qs}` : '/cart')
    return response.data.data
  },

  addToCart: async (productId: number, qty: number, variantId?: number): Promise<Cart> => {
    const body: { productId: number; qty: number; variantId?: number } = { productId, qty }
    if (variantId != null) {
      body.variantId = variantId
    }
    const response = await api.post<ApiResponse<Cart>>('/cart/items', body)
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
