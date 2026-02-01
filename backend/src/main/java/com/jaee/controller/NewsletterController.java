package com.jaee.controller;

import com.jaee.dto.common.ApiResponse;
import com.jaee.service.NewsletterService;
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
@RequestMapping("/newsletter")
@RequiredArgsConstructor
@Tag(name = "Newsletter", description = "Newsletter subscription endpoints")
public class NewsletterController {

    private final NewsletterService newsletterService;

    @PostMapping("/subscribe")
    @Operation(summary = "Subscribe to newsletter")
    public ResponseEntity<ApiResponse<SubscribeResponse>> subscribe(@Valid @RequestBody SubscribeRequest request) {
        newsletterService.subscribe(request.getEmail(), request.getSource());
        
        SubscribeResponse response = new SubscribeResponse();
        response.setSubscribed(true);
        response.setMessage("Thank you for subscribing! You'll receive our latest updates and offers.");
        
        return ResponseEntity.ok(ApiResponse.success("Successfully subscribed to newsletter", response));
    }

    @PostMapping("/unsubscribe")
    @Operation(summary = "Unsubscribe from newsletter")
    public ResponseEntity<ApiResponse<Void>> unsubscribe(@Valid @RequestBody UnsubscribeRequest request) {
        boolean unsubscribed = newsletterService.unsubscribe(request.getEmail());
        
        if (unsubscribed) {
            return ResponseEntity.ok(ApiResponse.success("Successfully unsubscribed from newsletter", null));
        } else {
            return ResponseEntity.ok(ApiResponse.success("Email not found in our subscription list", null));
        }
    }

    @Data
    public static class SubscribeRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;
        
        private String source = "website";
    }

    @Data
    public static class UnsubscribeRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;
    }

    @Data
    public static class SubscribeResponse {
        private boolean subscribed;
        private String message;
    }
}
