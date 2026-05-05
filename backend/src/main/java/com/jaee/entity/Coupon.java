package com.jaee.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "coupons")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    private String description;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private DiscountType discountType = DiscountType.PERCENTAGE;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal discountValue;

    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal minOrderAmount = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal maxDiscountAmount;

    private Integer usageLimit;

    /** When true (default), block reuse by same user — includes unpaid/pending orders so coupons cannot be stacked across retries. */
    @Column(name = "limit_one_use_per_customer", nullable = false)
    @Builder.Default
    private Boolean limitOneUsePerCustomer = true;

    @Builder.Default
    private Integer usedCount = 0;

    @Builder.Default
    private LocalDateTime validFrom = LocalDateTime.now();

    private LocalDateTime validUntil;

    @Builder.Default
    private Boolean active = true;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum DiscountType {
        PERCENTAGE,
        FIXED
    }

    public boolean isValid() {
        if (!active) return false;
        
        LocalDateTime now = LocalDateTime.now();
        if (validFrom != null && now.isBefore(validFrom)) return false;
        if (validUntil != null && now.isAfter(validUntil)) return false;
        if (usageLimit != null && usedCount >= usageLimit) return false;
        
        return true;
    }

    public BigDecimal calculateDiscount(BigDecimal orderAmount) {
        if (orderAmount.compareTo(minOrderAmount) < 0) {
            return BigDecimal.ZERO;
        }

        BigDecimal discount;
        if (discountType == DiscountType.PERCENTAGE) {
            discount = orderAmount.multiply(discountValue).divide(BigDecimal.valueOf(100));
            if (maxDiscountAmount != null && discount.compareTo(maxDiscountAmount) > 0) {
                discount = maxDiscountAmount;
            }
        } else {
            discount = discountValue;
        }

        // Discount cannot exceed order amount
        if (discount.compareTo(orderAmount) > 0) {
            discount = orderAmount;
        }

        return discount;
    }
}
