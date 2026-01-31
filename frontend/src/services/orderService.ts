import { api } from '@/lib/api'
import type { ApiResponse, PageResponse, Order } from '@/types'

export const orderService = {
  getOrders: async (page: number = 0, size: number = 10): Promise<PageResponse<Order>> => {
    const response = await api.get<ApiResponse<PageResponse<Order>>>(`/orders?page=${page}&size=${size}`)
    return response.data.data
  },

  getOrderById: async (orderId: number): Promise<Order> => {
    const response = await api.get<ApiResponse<Order>>(`/orders/${orderId}`)
    return response.data.data
  },

  getOrderByRazorpayOrderId: async (razorpayOrderId: string): Promise<Order> => {
    const response = await api.get<ApiResponse<Order>>(`/orders/razorpay/${razorpayOrderId}`)
    return response.data.data
  },
}
