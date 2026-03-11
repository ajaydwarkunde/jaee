package com.jaee.controller;

import com.jaee.dto.common.ApiResponse;
import com.jaee.dto.candle.CustomCandleRequestDto;
import com.jaee.dto.candle.CustomCandleResponseDto;
import com.jaee.entity.User;
import com.jaee.service.CustomCandleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/custom-candles")
@RequiredArgsConstructor
@Tag(name = "Custom Candle Builder", description = "Custom candle request endpoints")
public class CustomCandleController {

    private final CustomCandleService customCandleService;

    @PostMapping
    @Operation(summary = "Create a custom candle request (public - guests can submit, user attached if authenticated)")
    public ResponseEntity<ApiResponse<CustomCandleResponseDto>> createRequest(
            @Valid @RequestBody CustomCandleRequestDto dto,
            @AuthenticationPrincipal User user
    ) {
        CustomCandleResponseDto response = customCandleService.createRequest(dto, user);
        return ResponseEntity.ok(ApiResponse.success("Request submitted successfully", response));
    }

    @GetMapping("/my-requests")
    @Operation(summary = "Get current user's custom candle requests")
    @PreAuthorize("isAuthenticated()")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<List<CustomCandleResponseDto>>> getMyRequests(
            @AuthenticationPrincipal User user
    ) {
        List<CustomCandleResponseDto> requests = customCandleService.getUserRequests(user);
        return ResponseEntity.ok(ApiResponse.success(requests));
    }

    @GetMapping("/admin/all")
    @Operation(summary = "Get all custom candle requests (admin)")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<List<CustomCandleResponseDto>>> getAllRequests() {
        List<CustomCandleResponseDto> requests = customCandleService.getAllRequests();
        return ResponseEntity.ok(ApiResponse.success(requests));
    }

    @PatchMapping("/admin/{id}/status")
    @Operation(summary = "Update custom candle request status (admin)")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<CustomCandleResponseDto>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request
    ) {
        String status = request.get("status");
        CustomCandleResponseDto response = customCandleService.updateStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Status updated", response));
    }
}
