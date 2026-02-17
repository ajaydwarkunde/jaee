package com.jaee.controller;

import com.jaee.dto.common.ApiResponse;
import com.jaee.dto.coupon.ApplyCouponRequest;
import com.jaee.dto.coupon.CouponValidationResponse;
import com.jaee.entity.User;
import com.jaee.service.CartService;
import com.jaee.service.CouponService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/coupons")
@RequiredArgsConstructor
@Tag(name = "Coupons", description = "Coupon validation endpoints")
@SecurityRequirement(name = "bearerAuth")
public class CouponController {

    private final CouponService couponService;
    private final CartService cartService;

    @PostMapping("/validate")
    @Operation(summary = "Validate a coupon code against cart total")
    public ResponseEntity<ApiResponse<CouponValidationResponse>> validateCoupon(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ApplyCouponRequest request
    ) {
        // Get cart total for the user
        BigDecimal cartTotal = cartService.getCartTotal(user);
        
        CouponValidationResponse response = couponService.validateCoupon(
                request.getCode(),
                cartTotal,
                user
        );
        
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/validate/{code}")
    @Operation(summary = "Quick validate a coupon code")
    public ResponseEntity<ApiResponse<CouponValidationResponse>> quickValidateCoupon(
            @AuthenticationPrincipal User user,
            @PathVariable String code,
            @RequestParam(required = false) BigDecimal orderAmount
    ) {
        BigDecimal amount = orderAmount != null ? orderAmount : cartService.getCartTotal(user);
        
        CouponValidationResponse response = couponService.validateCoupon(code, amount, user);
        
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
