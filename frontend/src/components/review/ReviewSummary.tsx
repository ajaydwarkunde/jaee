import { useQuery } from '@tanstack/react-query'
import { reviewService } from '@/services/reviewService'
import StarRating from './StarRating'

interface ReviewSummaryProps {
  productId: number
}

export default function ReviewSummary({ productId }: ReviewSummaryProps) {
  const { data: summary, isLoading } = useQuery({
    queryKey: ['reviewSummary', productId],
    queryFn: () => reviewService.getReviewSummary(productId),
  })

  if (isLoading || !summary) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-blush rounded w-24 mb-2" />
        <div className="h-4 bg-blush rounded w-32" />
      </div>
    )
  }

  const totalReviews = summary.totalReviews

  return (
    <div className="flex flex-col md:flex-row md:items-start gap-6">
      {/* Average Rating */}
      <div className="text-center md:text-left">
        <div className="text-5xl font-bold text-charcoal tabular-nums">
          {summary.averageRating.toFixed(1)}
        </div>
        <StarRating rating={summary.averageRating} size="md" />
        <p className="text-sm text-warm-gray mt-1">
          Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
        </p>
      </div>

      {/* Rating Distribution */}
      <div className="flex-1 space-y-2">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = summary.ratingDistribution[star] || 0
          const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0

          return (
            <div key={star} className="flex items-center gap-3">
              <span className="text-sm text-warm-gray w-12">{star} star</span>
              <div className="flex-1 h-2 bg-blush rounded-full overflow-hidden">
                <div
                  className="h-full bg-warning rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-warm-gray w-8 text-right tabular-nums">{count}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
