package com.jaee.dto.review;

import com.jaee.entity.ProductReview;

import java.time.LocalDateTime;

public record ReviewDto(
    Long id,
    Long productId,
    String productName,
    Long userId,
    String userName,
    Integer rating,
    String title,
    String comment,
    Boolean verifiedPurchase,
    Integer helpfulCount,
    LocalDateTime createdAt
) {
    public static ReviewDto fromEntity(ProductReview review) {
        return new ReviewDto(
            review.getId(),
            review.getProduct() != null ? review.getProduct().getId() : null,
            review.getProduct() != null ? review.getProduct().getName() : "Unknown Product",
            review.getUser() != null ? review.getUser().getId() : null,
            review.getUser() != null && review.getUser().getName() != null ? review.getUser().getName() : "Anonymous",
            review.getRating(),
            review.getTitle(),
            review.getComment(),
            review.getVerifiedPurchase() != null ? review.getVerifiedPurchase() : false,
            review.getHelpfulCount() != null ? review.getHelpfulCount() : 0,
            review.getCreatedAt()
        );
    }
}
