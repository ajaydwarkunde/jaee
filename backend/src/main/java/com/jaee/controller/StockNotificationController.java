package com.jaee.controller;

import com.jaee.dto.common.ApiResponse;
import com.jaee.service.StockNotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/stock-notifications")
@RequiredArgsConstructor
@Tag(name = "Stock Notifications", description = "Back-in-stock notification endpoints")
public class StockNotificationController {

    private final StockNotificationService stockNotificationService;

    @PostMapping("/subscribe")
    @Operation(summary = "Subscribe to back-in-stock notifications for a product")
    public ResponseEntity<ApiResponse<NotifyResponse>> subscribe(@Valid @RequestBody NotifyRequest request) {
        stockNotificationService.subscribe(request.getProductId(), request.getEmail());

        NotifyResponse response = new NotifyResponse();
        response.setSubscribed(true);
        response.setMessage("We'll notify you when this product is back in stock!");
        response.setWaitlistCount(stockNotificationService.getWaitlistCount(request.getProductId()));

        return ResponseEntity.ok(ApiResponse.success("Successfully subscribed for stock notification", response));
    }

    @GetMapping("/count/{productId}")
    @Operation(summary = "Get waitlist count for a product")
    public ResponseEntity<ApiResponse<Long>> getWaitlistCount(@PathVariable Long productId) {
        long count = stockNotificationService.getWaitlistCount(productId);
        return ResponseEntity.ok(ApiResponse.success(count));
    }

    @Data
    public static class NotifyRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        private Long productId;
    }

    @Data
    public static class NotifyResponse {
        private boolean subscribed;
        private String message;
        private long waitlistCount;
    }
}
