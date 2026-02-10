package com.jaee.repository;

import com.jaee.entity.ProductReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductReviewRepository extends JpaRepository<ProductReview, Long> {

    @Query("SELECT r FROM ProductReview r JOIN FETCH r.product JOIN FETCH r.user WHERE r.product.id = :productId ORDER BY r.createdAt DESC")
    Page<ProductReview> findByProductIdOrderByCreatedAtDesc(@Param("productId") Long productId, Pageable pageable);

    @Query("SELECT r FROM ProductReview r JOIN FETCH r.product JOIN FETCH r.user WHERE r.product.id = :productId ORDER BY r.createdAt DESC")
    List<ProductReview> findByProductIdOrderByCreatedAtDesc(@Param("productId") Long productId);

    @Query("SELECT r FROM ProductReview r JOIN FETCH r.product JOIN FETCH r.user WHERE r.product.id = :productId AND r.user.id = :userId")
    Optional<ProductReview> findByProductIdAndUserId(@Param("productId") Long productId, @Param("userId") Long userId);

    boolean existsByProductIdAndUserId(Long productId, Long userId);

    @Query("SELECT AVG(r.rating) FROM ProductReview r WHERE r.product.id = :productId")
    Double getAverageRatingByProductId(@Param("productId") Long productId);

    @Query("SELECT COUNT(r) FROM ProductReview r WHERE r.product.id = :productId")
    Long getReviewCountByProductId(@Param("productId") Long productId);

    @Query("SELECT r.rating, COUNT(r) FROM ProductReview r WHERE r.product.id = :productId GROUP BY r.rating ORDER BY r.rating DESC")
    List<Object[]> getRatingDistributionByProductId(@Param("productId") Long productId);

    @Query("SELECT r FROM ProductReview r JOIN FETCH r.product JOIN FETCH r.user WHERE r.user.id = :userId ORDER BY r.createdAt DESC")
    List<ProductReview> findByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId);

    @Query("SELECT CASE WHEN COUNT(o) > 0 THEN true ELSE false END " +
           "FROM Order o JOIN o.items i " +
           "WHERE o.user.id = :userId AND i.product.id = :productId AND o.status = 'PAID'")
    boolean hasUserPurchasedProduct(@Param("userId") Long userId, @Param("productId") Long productId);
}
