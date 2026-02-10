import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Star } from 'lucide-react'
import { reviewService, Review, CreateReviewData, UpdateReviewData } from '@/services/reviewService'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import toast from 'react-hot-toast'

interface ReviewFormProps {
  productId: number
  existingReview?: Review | null
  onSuccess?: () => void
  onCancel?: () => void
}

export default function ReviewForm({ productId, existingReview, onSuccess, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [title, setTitle] = useState(existingReview?.title || '')
  const [comment, setComment] = useState(existingReview?.comment || '')

  const queryClient = useQueryClient()
  const isEditing = !!existingReview

  const createMutation = useMutation({
    mutationFn: (data: CreateReviewData) => reviewService.createReview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productReviews', productId] })
      queryClient.invalidateQueries({ queryKey: ['reviewSummary', productId] })
      queryClient.invalidateQueries({ queryKey: ['product'] })
      toast.success('Review submitted successfully!')
      onSuccess?.()
    },
    onError: () => {
      toast.error('Failed to submit review')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: UpdateReviewData) => reviewService.updateReview(existingReview!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productReviews', productId] })
      queryClient.invalidateQueries({ queryKey: ['reviewSummary', productId] })
      queryClient.invalidateQueries({ queryKey: ['myReview', productId] })
      toast.success('Review updated successfully!')
      onSuccess?.()
    },
    onError: () => {
      toast.error('Failed to update review')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }

    if (isEditing) {
      updateMutation.mutate({ rating, title: title || undefined, comment: comment || undefined })
    } else {
      createMutation.mutate({ productId, rating, title: title || undefined, comment: comment || undefined })
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Star Rating */}
      <div>
        <label className="block text-sm font-medium text-charcoal mb-2">
          Your Rating <span className="text-error">*</span>
        </label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              onMouseEnter={() => setHoveredRating(value)}
              onMouseLeave={() => setHoveredRating(0)}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star
                className={`w-8 h-8 ${
                  value <= (hoveredRating || rating)
                    ? 'fill-warning text-warning'
                    : 'text-blush'
                }`}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm text-warm-gray">
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <Input
        label="Review Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Summarize your experience"
        maxLength={200}
      />

      {/* Comment */}
      <Textarea
        label="Your Review"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Tell others about your experience with this product..."
        rows={4}
        maxLength={2000}
      />

      {/* Actions */}
      <div className="flex gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        )}
        <Button type="submit" loading={isPending} className="flex-1">
          {isEditing ? 'Update Review' : 'Submit Review'}
        </Button>
      </div>
    </form>
  )
}
