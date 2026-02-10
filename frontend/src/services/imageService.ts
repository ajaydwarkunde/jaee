import api from '@/lib/api'

export interface ImageUploadResponse {
  imageUrl: string
}

export interface MultipleImageUploadResponse {
  imageUrls: string[]
}

export const imageService = {
  /**
   * Upload a single image
   */
  uploadImage: async (file: File, type: 'product' | 'category' = 'product'): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    const response = await api.post<{ data: ImageUploadResponse }>('/images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.data.imageUrl
  },

  /**
   * Upload multiple images
   */
  uploadMultipleImages: async (files: File[], type: 'product' | 'category' = 'product'): Promise<string[]> => {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append('files', file)
    })
    formData.append('type', type)

    const response = await api.post<{ data: MultipleImageUploadResponse }>('/images/upload-multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.data.imageUrls
  },
}
