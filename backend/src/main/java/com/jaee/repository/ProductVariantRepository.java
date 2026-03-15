package com.jaee.repository;

import com.jaee.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {

    @Query("SELECT v FROM ProductVariant v LEFT JOIN FETCH v.optionValues LEFT JOIN FETCH v.images WHERE v.product.id = :productId ORDER BY v.price ASC")
    List<ProductVariant> findByProductIdWithDetails(@Param("productId") Long productId);

    void deleteAllByProductId(Long productId);
}
