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
            review.getProduct().getId(),
            review.getProduct().getName(),
            review.getUser().getId(),
            review.getUser().getName() != null ? review.getUser().getName() : "Anonymous",
            review.getRating(),
            review.getTitle(),
            review.getComment(),
            review.getVerifiedPurchase(),
            review.getHelpfulCount(),
            review.getCreatedAt()
        );
    }
}
