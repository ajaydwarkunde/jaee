import { api } from '@/lib/api'
import type { ApiResponse } from '@/types'

interface ImageUploadResponse {
  url: string
}

interface MultipleImageUploadResponse {
  urls: string[]
}

export const imageService = {
  /**
   * Upload a single image
   * @param file - The image file to upload
   * @param type - The type of image (product, category, general)
   */
  uploadImage: async (file: File, type: 'product' | 'category' | 'general' = 'general'): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    const response = await api.post<ApiResponse<ImageUploadResponse>>('/images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.data.url
  },

  /**
   * Upload multiple images
   * @param files - Array of image files to upload
   * @param type - The type of images (product, category, general)
   */
  uploadMultipleImages: async (files: File[], type: 'product' | 'category' | 'general' = 'product'): Promise<string[]> => {
    const formData = new FormData()
    files.forEach(file => {
      formData.append('files', file)
    })
    formData.append('type', type)

    const response = await api.post<ApiResponse<MultipleImageUploadResponse>>('/images/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.data.urls
  },

  /**
   * Delete an image by URL
   * @param url - The URL of the image to delete
   */
  deleteImage: async (url: string): Promise<void> => {
    await api.delete('/images', { params: { url } })
  },

  /**
   * Validate file before upload
   */
  validateFile: (file: File): { valid: boolean; error?: string } => {
    const maxSize = 5 * 1024 * 1024 // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

    if (file.size > maxSize) {
      return { valid: false, error: 'File size exceeds 5MB limit' }
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP' }
    }

    return { valid: true }
  },
}
