package com.jaee.controller;

import com.jaee.dto.review.*;
import com.jaee.entity.User;
import com.jaee.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Tag(name = "Reviews", description = "Product review management")
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/products/{productId}/reviews")
    @Operation(summary = "Get product reviews (paginated)")
    public ResponseEntity<Page<ReviewDto>> getProductReviews(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(reviewService.getProductReviews(productId, page, size));
    }

    @GetMapping("/products/{productId}/reviews/all")
    @Operation(summary = "Get all product reviews")
    public ResponseEntity<List<ReviewDto>> getAllProductReviews(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getAllProductReviews(productId));
    }

    @GetMapping("/products/{productId}/reviews/summary")
    @Operation(summary = "Get review summary for a product")
    public ResponseEntity<ReviewSummaryDto> getReviewSummary(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getReviewSummary(productId));
    }

    @PostMapping("/reviews")
    @Operation(summary = "Create a new review")
    public ResponseEntity<ReviewDto> createReview(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CreateReviewRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reviewService.createReview(user, request));
    }

    @PutMapping("/reviews/{reviewId}")
    @Operation(summary = "Update a review")
    public ResponseEntity<ReviewDto> updateReview(
            @AuthenticationPrincipal User user,
            @PathVariable Long reviewId,
            @Valid @RequestBody UpdateReviewRequest request) {
        return ResponseEntity.ok(reviewService.updateReview(user, reviewId, request));
    }

    @DeleteMapping("/reviews/{reviewId}")
    @Operation(summary = "Delete a review")
    public ResponseEntity<Void> deleteReview(
            @AuthenticationPrincipal User user,
            @PathVariable Long reviewId) {
        reviewService.deleteReview(user, reviewId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/products/{productId}/reviews/mine")
    @Operation(summary = "Get current user's review for a product")
    public ResponseEntity<ReviewDto> getMyReview(
            @AuthenticationPrincipal User user,
            @PathVariable Long productId) {
        return reviewService.getUserReviewForProduct(user.getId(), productId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/reviews/mine")
    @Operation(summary = "Get all reviews by current user")
    public ResponseEntity<List<ReviewDto>> getMyReviews(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(reviewService.getUserReviews(user.getId()));
    }

    @PostMapping("/reviews/{reviewId}/helpful")
    @Operation(summary = "Mark a review as helpful")
    public ResponseEntity<ReviewDto> markHelpful(@PathVariable Long reviewId) {
        return ResponseEntity.ok(reviewService.markHelpful(reviewId));
    }

    @GetMapping("/products/{productId}/reviews/can-review")
    @Operation(summary = "Check if current user can review a product")
    public ResponseEntity<Map<String, Boolean>> canReview(
            @AuthenticationPrincipal User user,
            @PathVariable Long productId) {
        boolean canReview = reviewService.canUserReview(user.getId(), productId);
        return ResponseEntity.ok(Map.of("canReview", canReview));
    }
}
