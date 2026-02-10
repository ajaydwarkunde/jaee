import api from '@/lib/api'

export interface StoreSetting {
  id: number
  key: string
  value: string
  type: 'STRING' | 'NUMBER' | 'BOOLEAN'
  description: string
}

export interface StoreSettings {
  free_shipping_enabled: string
  free_shipping_threshold: string
  return_days: string
  return_policy_text: string
  cod_enabled: string
  cod_charges: string
  shipping_charges: string
  estimated_delivery_days: string
  support_email: string
  support_phone: string
  instagram_handle: string
  announcement_text: string
  announcement_enabled: string
  [key: string]: string
}

export const settingsService = {
  // Public endpoint - get settings as key-value map
  getPublicSettings: async (): Promise<StoreSettings> => {
    const response = await api.get<StoreSettings>('/store/settings')
    return response.data
  },

  // Admin endpoint - get all settings with details
  getAllSettings: async (): Promise<StoreSetting[]> => {
    const response = await api.get<StoreSetting[]>('/admin/settings')
    return response.data
  },

  // Admin endpoint - update a single setting
  updateSetting: async (key: string, value: string): Promise<StoreSetting> => {
    const response = await api.put<StoreSetting>(`/admin/settings/${key}`, { value })
    return response.data
  },

  // Admin endpoint - batch update settings
  updateSettings: async (updates: Record<string, string>): Promise<StoreSetting[]> => {
    const response = await api.put<StoreSetting[]>('/admin/settings', updates)
    return response.data
  },
}
