package com.jaee.dto.coupon;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class CouponCreateRequest {
    
    @NotBlank(message = "Coupon code is required")
    private String code;
    
    private String description;
    
    @NotNull(message = "Discount type is required")
    private String discountType; // PERCENTAGE or FIXED
    
    @NotNull(message = "Discount value is required")
    @Positive(message = "Discount value must be positive")
    private BigDecimal discountValue;
    
    private BigDecimal minOrderAmount = BigDecimal.ZERO;
    
    private BigDecimal maxDiscountAmount;
    
    private Integer usageLimit;

    /** When true, each customer may use this coupon only once (also blocked while a non-cancelled order holds it). Default true on server if omitted. */
    private Boolean limitOneUsePerCustomer;
    
    private LocalDateTime validFrom;
    
    private LocalDateTime validUntil;
    
    private Boolean active = true;
}
