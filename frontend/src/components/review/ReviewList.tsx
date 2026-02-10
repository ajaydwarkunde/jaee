import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ThumbsUp, CheckCircle, Trash2, Edit2 } from 'lucide-react'
import { reviewService, Review } from '@/services/reviewService'
import { useAuthStore } from '@/stores/authStore'
import StarRating from './StarRating'
import ReviewForm from './ReviewForm'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import toast from 'react-hot-toast'

interface ReviewListProps {
  productId: number
}

export default function ReviewList({ productId }: ReviewListProps) {
  const { user, isAuthenticated } = useAuthStore()
  const queryClient = useQueryClient()
  const [editingReview, setEditingReview] = useState<Review | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null)

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['productReviews', productId],
    queryFn: () => reviewService.getAllProductReviews(productId),
  })

  const helpfulMutation = useMutation({
    mutationFn: reviewService.markHelpful,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productReviews', productId] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: reviewService.deleteReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productReviews', productId] })
      queryClient.invalidateQueries({ queryKey: ['reviewSummary', productId] })
      queryClient.invalidateQueries({ queryKey: ['myReview', productId] })
      toast.success('Review deleted')
      setShowDeleteConfirm(null)
    },
    onError: () => {
      toast.error('Failed to delete review')
    },
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-blush/30 rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-blush rounded w-1/4 mb-2" />
            <div className="h-3 bg-blush rounded w-3/4" />
          </div>
        ))}
      </div>
    )
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-8 text-warm-gray">
        <p>No reviews yet. Be the first to review this product!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="border-b border-blush pb-6 last:border-0">
          {/* Review Header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-3">
                <StarRating rating={review.rating} size="sm" />
                {review.verifiedPurchase && (
                  <span className="flex items-center gap-1 text-xs text-success font-medium">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Verified Purchase
                  </span>
                )}
              </div>
              <p className="text-sm text-warm-gray mt-1">
                <span className="font-medium text-charcoal">{review.userName}</span>
                {' · '}
                {formatDate(review.createdAt)}
              </p>
            </div>

            {/* Edit/Delete for own reviews */}
            {isAuthenticated && user?.id === review.userId && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingReview(review)}
                  className="p-1.5 text-warm-gray hover:text-rose transition-colors"
                  title="Edit review"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(review.id)}
                  className="p-1.5 text-warm-gray hover:text-error transition-colors"
                  title="Delete review"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Review Content */}
          {review.title && (
            <h4 className="font-medium text-charcoal mb-2">{review.title}</h4>
          )}
          {review.comment && (
            <p className="text-warm-gray text-sm leading-relaxed">{review.comment}</p>
          )}

          {/* Helpful Button */}
          <div className="mt-4">
            <button
              onClick={() => helpfulMutation.mutate(review.id)}
              disabled={helpfulMutation.isPending}
              className="flex items-center gap-1.5 text-sm text-warm-gray hover:text-rose transition-colors"
            >
              <ThumbsUp className="w-4 h-4" />
              Helpful ({review.helpfulCount})
            </button>
          </div>
        </div>
      ))}

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingReview}
        onClose={() => setEditingReview(null)}
        title="Edit Your Review"
      >
        {editingReview && (
          <ReviewForm
            productId={productId}
            existingReview={editingReview}
            onSuccess={() => setEditingReview(null)}
            onCancel={() => setEditingReview(null)}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        title="Delete Review"
      >
        <p className="text-warm-gray mb-6">
          Are you sure you want to delete your review? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setShowDeleteConfirm(null)} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={() => showDeleteConfirm && deleteMutation.mutate(showDeleteConfirm)}
            loading={deleteMutation.isPending}
            className="flex-1 bg-error hover:bg-error/90"
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  )
}
