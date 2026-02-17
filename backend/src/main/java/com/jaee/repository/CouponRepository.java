package com.jaee.repository;

import com.jaee.entity.Coupon;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long> {
    
    Optional<Coupon> findByCodeIgnoreCase(String code);
    
    boolean existsByCodeIgnoreCase(String code);
    
    @Query("SELECT c FROM Coupon c WHERE c.active = true ORDER BY c.createdAt DESC")
    Page<Coupon> findAllActive(Pageable pageable);
    
    Page<Coupon> findAllByOrderByCreatedAtDesc(Pageable pageable);
    
    @Query("SELECT c FROM Coupon c WHERE c.active = true AND " +
           "(c.validFrom IS NULL OR c.validFrom <= CURRENT_TIMESTAMP) AND " +
           "(c.validUntil IS NULL OR c.validUntil >= CURRENT_TIMESTAMP) AND " +
           "(c.usageLimit IS NULL OR c.usedCount < c.usageLimit)")
    Page<Coupon> findAllValidCoupons(Pageable pageable);
}
