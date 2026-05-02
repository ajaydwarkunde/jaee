package com.jaee.dto.coupon;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ApplyCouponRequest {
    
    @NotBlank(message = "Coupon code is required")
    private String code;

    /** When set, validates against this cart subtotal instead of the server-side cart aggregate. */
    private BigDecimal orderAmount;
}
