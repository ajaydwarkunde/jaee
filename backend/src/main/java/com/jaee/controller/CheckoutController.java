package com.jaee.controller;

import com.jaee.dto.common.ApiResponse;
import com.jaee.entity.User;
import com.jaee.service.CheckoutService;
import com.razorpay.RazorpayException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/checkout")
@RequiredArgsConstructor
@Tag(name = "Checkout", description = "Checkout and payment")
@SecurityRequirement(name = "bearerAuth")
public class CheckoutController {

    private final CheckoutService checkoutService;

    @PostMapping("/create-order")
    @Operation(summary = "Create Razorpay order for checkout")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createOrder(
            @AuthenticationPrincipal User user,
            @RequestBody(required = false) CreateOrderRequest request
    ) throws RazorpayException {
        Long addressId = request != null ? request.getAddressId() : null;
        Map<String, Object> orderData = checkoutService.createOrder(user, addressId);
        return ResponseEntity.ok(ApiResponse.success("Order created successfully", orderData));
    }

    @Data
    public static class CreateOrderRequest {
        private Long addressId;
    }

    @PostMapping("/verify-payment")
    @Operation(summary = "Verify Razorpay payment after checkout")
    public ResponseEntity<ApiResponse<Map<String, Object>>> verifyPayment(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody PaymentVerificationRequest request
    ) {
        Map<String, Object> result = checkoutService.verifyPayment(
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature()
        );
        return ResponseEntity.ok(ApiResponse.success("Payment verified successfully", result));
    }

    @Data
    public static class PaymentVerificationRequest {
        @NotBlank(message = "Razorpay order ID is required")
        private String razorpayOrderId;

        @NotBlank(message = "Razorpay payment ID is required")
        private String razorpayPaymentId;

        @NotBlank(message = "Razorpay signature is required")
        private String razorpaySignature;
    }
}
