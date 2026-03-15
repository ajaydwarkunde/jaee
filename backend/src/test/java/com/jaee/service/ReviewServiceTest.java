package com.jaee.service;

import com.jaee.dto.review.CreateReviewRequest;
import com.jaee.dto.review.ReviewDto;
import com.jaee.dto.review.UpdateReviewRequest;
import com.jaee.entity.Product;
import com.jaee.entity.ProductReview;
import com.jaee.entity.User;
import com.jaee.exception.BadRequestException;
import com.jaee.exception.ResourceNotFoundException;
import com.jaee.repository.ProductRepository;
import com.jaee.repository.ProductReviewRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock
    private ProductReviewRepository reviewRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ReviewService reviewService;

    @Test
    void createReviewSuccess() {
        User user = User.builder().id(1L).email("user@test.com").build();
        Product product = Product.builder().id(1L).name("Test Product").build();
        CreateReviewRequest request = new CreateReviewRequest(1L, 5, "Great product", "Excellent quality");

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(reviewRepository.existsByProductIdAndUserId(1L, 1L)).thenReturn(false);
        when(reviewRepository.hasUserPurchasedProduct(1L, 1L)).thenReturn(true);

        ProductReview savedReview = ProductReview.builder()
                .id(1L)
                .product(product)
                .user(user)
                .rating(5)
                .title("Great product")
                .comment("Excellent quality")
                .verifiedPurchase(true)
                .helpfulCount(0)
                .build();

        when(reviewRepository.save(any(ProductReview.class))).thenReturn(savedReview);

        ReviewDto result = reviewService.createReview(user, request);

        assertThat(result).isNotNull();
        assertThat(result.rating()).isEqualTo(5);
        assertThat(result.title()).isEqualTo("Great product");
        assertThat(result.comment()).isEqualTo("Excellent quality");
        assertThat(result.verifiedPurchase()).isTrue();
        verify(reviewRepository).save(any(ProductReview.class));
        verify(productRepository).save(product);
    }

    @Test
    void createReviewProductNotFoundThrowsResourceNotFoundException() {
        User user = User.builder().id(1L).build();
        CreateReviewRequest request = new CreateReviewRequest(999L, 5, "Great", "Nice");

        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> reviewService.createReview(user, request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Product not found");

        verify(productRepository).findById(999L);
        verify(reviewRepository, never()).save(any(ProductReview.class));
    }

    @Test
    void createReviewAlreadyReviewedThrowsBadRequestException() {
        User user = User.builder().id(1L).build();
        Product product = Product.builder().id(1L).build();
        CreateReviewRequest request = new CreateReviewRequest(1L, 5, "Great", "Nice");

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(reviewRepository.existsByProductIdAndUserId(1L, 1L)).thenReturn(true);

        assertThatThrownBy(() -> reviewService.createReview(user, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("already reviewed this product");

        verify(reviewRepository, never()).save(any(ProductReview.class));
    }

    @Test
    void updateReviewSuccess() {
        User user = User.builder().id(1L).build();
        Product product = Product.builder().id(1L).build();
        ProductReview review = ProductReview.builder()
                .id(1L)
                .product(product)
                .user(user)
                .rating(4)
                .title("Old title")
                .comment("Old comment")
                .build();

        UpdateReviewRequest request = new UpdateReviewRequest(5, "New title", "New comment");

        when(reviewRepository.findById(1L)).thenReturn(Optional.of(review));
        when(reviewRepository.save(any(ProductReview.class))).thenAnswer(inv -> inv.getArgument(0));

        ReviewDto result = reviewService.updateReview(user, 1L, request);

        assertThat(result).isNotNull();
        assertThat(review.getRating()).isEqualTo(5);
        assertThat(review.getTitle()).isEqualTo("New title");
        assertThat(review.getComment()).isEqualTo("New comment");
        verify(reviewRepository).save(review);
    }

    @Test
    void updateReviewNotOwnerThrowsBadRequestException() {
        User owner = User.builder().id(1L).build();
        User otherUser = User.builder().id(2L).build();
        Product product = Product.builder().id(1L).build();
        ProductReview review = ProductReview.builder()
                .id(1L)
                .product(product)
                .user(owner)
                .rating(4)
                .title("Title")
                .comment("Comment")
                .build();

        UpdateReviewRequest request = new UpdateReviewRequest(5, "New", "New");

        when(reviewRepository.findById(1L)).thenReturn(Optional.of(review));

        assertThatThrownBy(() -> reviewService.updateReview(otherUser, 1L, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("only edit your own reviews");

        verify(reviewRepository, never()).save(any(ProductReview.class));
    }

    @Test
    void deleteReviewOwnerCanDelete() {
        User user = User.builder().id(1L).role(User.Role.USER).build();
        Product product = Product.builder().id(1L).build();
        ProductReview review = ProductReview.builder()
                .id(1L)
                .product(product)
                .user(user)
                .rating(4)
                .build();

        when(reviewRepository.findById(1L)).thenReturn(Optional.of(review));
        doNothing().when(reviewRepository).delete(review);

        reviewService.deleteReview(user, 1L);

        verify(reviewRepository).delete(review);
        verify(productRepository).save(product);
    }

    @Test
    void deleteReviewAdminCanDeleteOthers() {
        User owner = User.builder().id(1L).build();
        User admin = User.builder().id(2L).role(User.Role.ADMIN).build();
        Product product = Product.builder().id(1L).build();
        ProductReview review = ProductReview.builder()
                .id(1L)
                .product(product)
                .user(owner)
                .rating(4)
                .build();

        when(reviewRepository.findById(1L)).thenReturn(Optional.of(review));
        doNothing().when(reviewRepository).delete(review);

        reviewService.deleteReview(admin, 1L);

        verify(reviewRepository).delete(review);
        verify(productRepository).save(product);
    }

    @Test
    void deleteReviewNonOwnerNonAdminThrowsBadRequestException() {
        User owner = User.builder().id(1L).build();
        User otherUser = User.builder().id(2L).role(User.Role.USER).build();
        Product product = Product.builder().id(1L).build();
        ProductReview review = ProductReview.builder()
                .id(1L)
                .product(product)
                .user(owner)
                .rating(4)
                .build();

        when(reviewRepository.findById(1L)).thenReturn(Optional.of(review));

        assertThatThrownBy(() -> reviewService.deleteReview(otherUser, 1L))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("only delete your own reviews");

        verify(reviewRepository, never()).delete(any(ProductReview.class));
    }

    @Test
    void markHelpfulIncrementsCount() {
        Product product = Product.builder().id(1L).build();
        ProductReview review = ProductReview.builder()
                .id(1L)
                .product(product)
                .rating(5)
                .helpfulCount(10)
                .build();

        when(reviewRepository.findById(1L)).thenReturn(Optional.of(review));
        when(reviewRepository.save(any(ProductReview.class))).thenAnswer(inv -> inv.getArgument(0));

        ReviewDto result = reviewService.markHelpful(1L);

        assertThat(review.getHelpfulCount()).isEqualTo(11);
        assertThat(result.helpfulCount()).isEqualTo(11);
        verify(reviewRepository).save(review);
    }

    @Test
    void canUserReviewReturnsTrueWhenNoExistingReview() {
        when(reviewRepository.existsByProductIdAndUserId(1L, 1L)).thenReturn(false);

        boolean result = reviewService.canUserReview(1L, 1L);

        assertThat(result).isTrue();
        verify(reviewRepository).existsByProductIdAndUserId(1L, 1L);
    }

    @Test
    void canUserReviewReturnsFalseWhenAlreadyReviewed() {
        when(reviewRepository.existsByProductIdAndUserId(1L, 1L)).thenReturn(true);

        boolean result = reviewService.canUserReview(1L, 1L);

        assertThat(result).isFalse();
    }
}
