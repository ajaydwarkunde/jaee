package com.jaee.controller;

import com.jaee.dto.common.ApiResponse;
import com.jaee.dto.integration.SheetProductSyncRequest;
import com.jaee.dto.integration.SheetProductSyncResponse;
import com.jaee.service.GoogleSheetProductSyncService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@RestController
@RequestMapping("/integrations/google-sheets/products")
@RequiredArgsConstructor
public class GoogleSheetProductSyncController {

    private final GoogleSheetProductSyncService syncService;

    @Value("${app.integrations.google-sheets.sync-secret:}")
    private String configuredSecret;

    @PostMapping("/sync")
    public ResponseEntity<ApiResponse<SheetProductSyncResponse>> sync(
            @RequestHeader(value = "X-Sheet-Sync-Secret", required = false) String suppliedSecret,
            @RequestBody(required = false) SheetProductSyncRequest request
    ) {
        if (configuredSecret == null || configuredSecret.isBlank()) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(ApiResponse.error("Google Sheet synchronization is not configured"));
        }
        if (!secureEquals(configuredSecret, suppliedSecret)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid synchronization secret"));
        }

        try {
            SheetProductSyncResponse response = syncService.sync(request);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(ApiResponse.error(exception.getMessage()));
        }
    }

    private static boolean secureEquals(String expected, String supplied) {
        if (supplied == null) return false;
        return MessageDigest.isEqual(
                expected.getBytes(StandardCharsets.UTF_8),
                supplied.getBytes(StandardCharsets.UTF_8)
        );
    }
}
