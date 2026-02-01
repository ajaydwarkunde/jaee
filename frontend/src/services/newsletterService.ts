import { api } from '@/lib/api'
import type { ApiResponse } from '@/types'

interface SubscribeResponse {
  subscribed: boolean
  message: string
}

export const newsletterService = {
  subscribe: async (email: string, source: string = 'website'): Promise<SubscribeResponse> => {
    const response = await api.post<ApiResponse<SubscribeResponse>>('/newsletter/subscribe', {
      email,
      source,
    })
    return response.data.data
  },

  unsubscribe: async (email: string): Promise<void> => {
    await api.post('/newsletter/unsubscribe', { email })
  },
}
