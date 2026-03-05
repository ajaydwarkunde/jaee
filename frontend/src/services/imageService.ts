import { api } from '@/lib/api'

export interface ImageUploadResponse {
  url: string
}

export interface MultipleImageUploadResponse {
  urls: string[]
}

export const imageService = {
  uploadImage: async (file: File, type: 'product' | 'category' = 'product'): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    const response = await api.post<{ data: ImageUploadResponse }>('/images/upload', formData)
    return response.data.data.url
  },

  uploadMultipleImages: async (files: File[], type: 'product' | 'category' = 'product'): Promise<string[]> => {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append('files', file)
    })
    formData.append('type', type)

    const response = await api.post<{ data: MultipleImageUploadResponse }>('/images/upload/multiple', formData)
    return response.data.data.urls
  },
}
