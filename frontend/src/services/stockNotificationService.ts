import { api } from '@/lib/api'
import type { ApiResponse } from '@/types'

interface NotifyResponse {
  subscribed: boolean
  message: string
  waitlistCount: number
}

export const stockNotificationService = {
  subscribe: async (productId: number, email: string): Promise<NotifyResponse> => {
    const response = await api.post<ApiResponse<NotifyResponse>>('/stock-notifications/subscribe', {
      productId,
      email,
    })
    return response.data.data
  },

  getWaitlistCount: async (productId: number): Promise<number> => {
    const response = await api.get<ApiResponse<number>>(`/stock-notifications/count/${productId}`)
    return response.data.data
  },
}
