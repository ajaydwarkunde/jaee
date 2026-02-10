import { api } from '@/lib/api'

export interface Review {
  id: number
  productId: number
  productName: string
  userId: number
  userName: string
  rating: number
  title: string | null
  comment: string | null
  verifiedPurchase: boolean
  helpfulCount: number
  createdAt: string
}

export interface ReviewSummary {
  averageRating: number
  totalReviews: number
  ratingDistribution: Record<number, number>
}

export interface CreateReviewData {
  productId: number
  rating: number
  title?: string
  comment?: string
}

export interface UpdateReviewData {
  rating: number
  title?: string
  comment?: string
}

interface PagedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export const reviewService = {
  // Get paginated reviews for a product
  getProductReviews: async (productId: number, page = 0, size = 10): Promise<PagedResponse<Review>> => {
    const response = await api.get<PagedResponse<Review>>(`/products/${productId}/reviews`, {
      params: { page, size },
    })
    return response.data
  },

  // Get all reviews for a product
  getAllProductReviews: async (productId: number): Promise<Review[]> => {
    const response = await api.get<Review[]>(`/products/${productId}/reviews/all`)
    return response.data
  },

  // Get review summary
  getReviewSummary: async (productId: number): Promise<ReviewSummary> => {
    const response = await api.get<ReviewSummary>(`/products/${productId}/reviews/summary`)
    return response.data
  },

  // Create a new review
  createReview: async (data: CreateReviewData): Promise<Review> => {
    const response = await api.post<Review>('/reviews', data)
    return response.data
  },

  // Update a review
  updateReview: async (reviewId: number, data: UpdateReviewData): Promise<Review> => {
    const response = await api.put<Review>(`/reviews/${reviewId}`, data)
    return response.data
  },

  // Delete a review
  deleteReview: async (reviewId: number): Promise<void> => {
    await api.delete(`/reviews/${reviewId}`)
  },

  // Get current user's review for a product
  getMyReview: async (productId: number): Promise<Review | null> => {
    try {
      const response = await api.get<Review>(`/products/${productId}/reviews/mine`)
      return response.data
    } catch {
      return null
    }
  },

  // Get all reviews by current user
  getMyReviews: async (): Promise<Review[]> => {
    const response = await api.get<Review[]>('/reviews/mine')
    return response.data
  },

  // Mark review as helpful
  markHelpful: async (reviewId: number): Promise<Review> => {
    const response = await api.post<Review>(`/reviews/${reviewId}/helpful`)
    return response.data
  },

  // Check if user can review
  canReview: async (productId: number): Promise<boolean> => {
    try {
      const response = await api.get<{ canReview: boolean }>(`/products/${productId}/reviews/can-review`)
      return response.data.canReview
    } catch {
      return false
    }
  },
}
