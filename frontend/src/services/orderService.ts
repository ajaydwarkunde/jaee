import { api } from '@/lib/api'
import type { ApiResponse, PageResponse, Order } from '@/types'

export interface OrderStats {
  total: number
  pending: number
  paid: number
  shipped: number
  fulfilled: number
  cancelled: number
}

export interface StoreSales {
  storeType: string
  revenue: number
  itemsSold: number
  orderCount: number
  topProducts: { name: string; qtySold: number; revenue: number }[]
}

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
  
  // Admin methods
  getAllOrders: async (params: { status?: string; page?: number; size?: number } = {}): Promise<PageResponse<Order>> => {
    const { status, page = 0, size = 20 } = params
    const queryParams = new URLSearchParams()
    queryParams.append('page', page.toString())
    queryParams.append('size', size.toString())
    if (status && status !== 'ALL') queryParams.append('status', status)
    
    const response = await api.get<ApiResponse<PageResponse<Order>>>(`/admin/orders?${queryParams}`)
    return response.data.data
  },
  
  getOrderStats: async (): Promise<OrderStats> => {
    const response = await api.get<ApiResponse<OrderStats>>('/admin/orders/stats')
    return response.data.data
  },
  
  getOrderByIdAdmin: async (orderId: number): Promise<Order> => {
    const response = await api.get<ApiResponse<Order>>(`/admin/orders/${orderId}`)
    return response.data.data
  },
  
  updateOrderStatus: async (
    orderId: number,
    body: { status: string; customStatus?: string },
  ): Promise<Order> => {
    const response = await api.patch<ApiResponse<Order>>(`/admin/orders/${orderId}/status`, body)
    return response.data.data
  },

  appendOrderNote: async (orderId: number, note: string): Promise<Order> => {
    const response = await api.post<ApiResponse<Order>>(`/admin/orders/${orderId}/notes`, { note })
    return response.data.data
  },

  updateOrderTracking: async (orderId: number, tracking: { trackingNumber: string; trackingUrl: string; carrier: string }): Promise<Order> => {
    const response = await api.patch<ApiResponse<Order>>(`/admin/orders/${orderId}/tracking`, tracking)
    return response.data.data
  },

  getStoreSales: async (): Promise<StoreSales[]> => {
    const response = await api.get<ApiResponse<StoreSales[]>>('/admin/analytics/store-sales')
    return response.data.data
  },
}
