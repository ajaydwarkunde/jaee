package com.jaee.repository;

import com.jaee.entity.Coupon;
import com.jaee.entity.CouponUsage;
import com.jaee.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CouponUsageRepository extends JpaRepository<CouponUsage, Long> {
    
    boolean existsByCouponAndUser(Coupon coupon, User user);
    
    Optional<CouponUsage> findByCouponAndUser(Coupon coupon, User user);
}
