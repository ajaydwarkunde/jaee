package com.jaee.controller;

import com.jaee.service.CheckoutService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/webhooks")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Webhooks", description = "External webhook handlers")
public class WebhookController {

    private final CheckoutService checkoutService;

    @PostMapping("/razorpay")
    @Operation(summary = "Handle Razorpay webhook events")
    public ResponseEntity<String> handleRazorpayWebhook(
            @RequestBody String payload,
            @RequestHeader("X-Razorpay-Signature") String signature
    ) {
        checkoutService.handleWebhook(payload, signature);
        return ResponseEntity.ok("Received");
    }
}
