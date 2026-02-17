package com.jaee.dto.coupon;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ApplyCouponRequest {
    
    @NotBlank(message = "Coupon code is required")
    private String code;
}
