import { api } from '@/lib/api'
import type { ApiResponse, Address, AddressFormData } from '@/types'

export const addressService = {
  getAddresses: async (): Promise<Address[]> => {
    const response = await api.get<ApiResponse<Address[]>>('/addresses')
    return response.data.data
  },

  createAddress: async (data: AddressFormData): Promise<Address> => {
    const response = await api.post<ApiResponse<Address>>('/addresses', data)
    return response.data.data
  },

  updateAddress: async (addressId: number, data: AddressFormData): Promise<Address> => {
    const response = await api.put<ApiResponse<Address>>(`/addresses/${addressId}`, data)
    return response.data.data
  },

  deleteAddress: async (addressId: number): Promise<void> => {
    await api.delete(`/addresses/${addressId}`)
  },

  setDefault: async (addressId: number): Promise<Address> => {
    const response = await api.patch<ApiResponse<Address>>(`/addresses/${addressId}/default`)
    return response.data.data
  },
}
