package com.jaee.service;

import com.jaee.dto.review.*;
import com.jaee.entity.Product;
import com.jaee.entity.ProductReview;
import com.jaee.entity.User;
import com.jaee.exception.BadRequestException;
import com.jaee.exception.ResourceNotFoundException;
import com.jaee.repository.ProductRepository;
import com.jaee.repository.ProductReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewService {

    private final ProductReviewRepository reviewRepository;
    private final ProductRepository productRepository;

    /**
     * Get paginated reviews for a product
     */
    public Page<ReviewDto> getProductReviews(Long productId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId, pageable)
                .map(ReviewDto::fromEntity);
    }

    /**
     * Get all reviews for a product (non-paginated)
     */
    public List<ReviewDto> getAllProductReviews(Long productId) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId)
                .stream()
                .map(ReviewDto::fromEntity)
                .toList();
    }

    /**
     * Get review summary (average rating, count, distribution)
     */
    public ReviewSummaryDto getReviewSummary(Long productId) {
        Double avgRating = reviewRepository.getAverageRatingByProductId(productId);
        Long totalReviews = reviewRepository.getReviewCountByProductId(productId);
        
        Map<Integer, Long> distribution = new HashMap<>();
        // Initialize all ratings with 0
        for (int i = 1; i <= 5; i++) {
            distribution.put(i, 0L);
        }
        
        // Fill in actual counts
        List<Object[]> ratingCounts = reviewRepository.getRatingDistributionByProductId(productId);
        for (Object[] row : ratingCounts) {
            Integer rating = (Integer) row[0];
            Long count = (Long) row[1];
            distribution.put(rating, count);
        }

        return new ReviewSummaryDto(
                avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0,
                totalReviews,
                distribution
        );
    }

    /**
     * Create a new review
     */
    @Transactional
    public ReviewDto createReview(User user, CreateReviewRequest request) {
        // Check if product exists
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        // Check if user already reviewed this product
        if (reviewRepository.existsByProductIdAndUserId(request.productId(), user.getId())) {
            throw new BadRequestException("You have already reviewed this product");
        }

        // Check if user has purchased the product (for verified purchase badge)
        boolean verifiedPurchase = reviewRepository.hasUserPurchasedProduct(user.getId(), request.productId());

        ProductReview review = ProductReview.builder()
                .product(product)
                .user(user)
                .rating(request.rating())
                .title(request.title())
                .comment(request.comment())
                .verifiedPurchase(verifiedPurchase)
                .build();

        ProductReview saved = reviewRepository.save(review);
        
        // Update product's average rating and review count
        updateProductRatingStats(product);

        log.info("Review created for product {} by user {}", request.productId(), user.getId());
        return ReviewDto.fromEntity(saved);
    }

    /**
     * Update an existing review
     */
    @Transactional
    public ReviewDto updateReview(User user, Long reviewId, UpdateReviewRequest request) {
        ProductReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        // Ensure user owns the review
        if (!review.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("You can only edit your own reviews");
        }

        review.setRating(request.rating());
        review.setTitle(request.title());
        review.setComment(request.comment());

        ProductReview saved = reviewRepository.save(review);
        
        // Update product's average rating
        updateProductRatingStats(review.getProduct());

        log.info("Review {} updated by user {}", reviewId, user.getId());
        return ReviewDto.fromEntity(saved);
    }

    /**
     * Delete a review
     */
    @Transactional
    public void deleteReview(User user, Long reviewId) {
        ProductReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        // Ensure user owns the review (or is admin)
        if (!review.getUser().getId().equals(user.getId()) && user.getRole() != User.Role.ADMIN) {
            throw new BadRequestException("You can only delete your own reviews");
        }

        Product product = review.getProduct();
        reviewRepository.delete(review);
        
        // Update product's average rating
        updateProductRatingStats(product);

        log.info("Review {} deleted", reviewId);
    }

    /**
     * Get user's review for a specific product
     */
    public Optional<ReviewDto> getUserReviewForProduct(Long userId, Long productId) {
        return reviewRepository.findByProductIdAndUserId(productId, userId)
                .map(ReviewDto::fromEntity);
    }

    /**
     * Get all reviews by a user
     */
    public List<ReviewDto> getUserReviews(Long userId) {
        return reviewRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(ReviewDto::fromEntity)
                .toList();
    }

    /**
     * Mark a review as helpful
     */
    @Transactional
    public ReviewDto markHelpful(Long reviewId) {
        ProductReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        review.setHelpfulCount(review.getHelpfulCount() + 1);
        return ReviewDto.fromEntity(reviewRepository.save(review));
    }

    /**
     * Check if user can review a product
     */
    public boolean canUserReview(Long userId, Long productId) {
        return !reviewRepository.existsByProductIdAndUserId(productId, userId);
    }

    /**
     * Update product's cached rating stats
     */
    private void updateProductRatingStats(Product product) {
        Double avgRating = reviewRepository.getAverageRatingByProductId(product.getId());
        Long reviewCount = reviewRepository.getReviewCountByProductId(product.getId());

        product.setAvgRating(avgRating != null ? 
                BigDecimal.valueOf(avgRating).setScale(1, RoundingMode.HALF_UP) : 
                BigDecimal.ZERO);
        product.setReviewCount(reviewCount != null ? reviewCount.intValue() : 0);
        
        productRepository.save(product);
    }
}
