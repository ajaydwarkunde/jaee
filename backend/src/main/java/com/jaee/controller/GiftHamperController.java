package com.jaee.controller;

import com.jaee.dto.common.ApiResponse;
import com.jaee.dto.hamper.GiftHamperRequestDto;
import com.jaee.dto.hamper.GiftHamperResponseDto;
import com.jaee.entity.User;
import com.jaee.service.GiftHamperService;
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
@RequestMapping("/gift-hampers")
@RequiredArgsConstructor
@Tag(name = "Custom Gift Hamper Builder", description = "Custom gift hamper request endpoints")
public class GiftHamperController {

    private final GiftHamperService giftHamperService;

    @PostMapping
    @Operation(summary = "Create a custom gift hamper request (public - guests can submit, user attached if authenticated)")
    public ResponseEntity<ApiResponse<GiftHamperResponseDto>> createRequest(
            @Valid @RequestBody GiftHamperRequestDto dto,
            @AuthenticationPrincipal User user
    ) {
        GiftHamperResponseDto response = giftHamperService.createRequest(dto, user);
        return ResponseEntity.ok(ApiResponse.success("Request submitted successfully", response));
    }

    @GetMapping("/my-requests")
    @Operation(summary = "Get current user's custom gift hamper requests")
    @PreAuthorize("isAuthenticated()")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<List<GiftHamperResponseDto>>> getMyRequests(
            @AuthenticationPrincipal User user
    ) {
        List<GiftHamperResponseDto> requests = giftHamperService.getUserRequests(user);
        return ResponseEntity.ok(ApiResponse.success(requests));
    }

    @GetMapping("/admin/all")
    @Operation(summary = "Get all custom gift hamper requests (admin)")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<List<GiftHamperResponseDto>>> getAllRequests() {
        List<GiftHamperResponseDto> requests = giftHamperService.getAllRequests();
        return ResponseEntity.ok(ApiResponse.success(requests));
    }

    @PatchMapping("/admin/{id}/status")
    @Operation(summary = "Update custom gift hamper request status (admin)")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<GiftHamperResponseDto>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request
    ) {
        String status = request.get("status");
        GiftHamperResponseDto response = giftHamperService.updateStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Status updated", response));
    }
}
