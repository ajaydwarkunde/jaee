package com.jaee.controller;

import com.jaee.dto.auth.AuthResponse;
import com.jaee.dto.auth.OtpResponseDto;
import com.jaee.dto.common.ApiResponse;
import com.jaee.dto.user.*;
import com.jaee.entity.User;
import com.jaee.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/me")
@RequiredArgsConstructor
@Tag(name = "User", description = "Current user endpoints")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;

    @GetMapping
    @Operation(summary = "Get current user profile")
    public ResponseEntity<ApiResponse<AuthResponse.UserDto>> getCurrentUser(@AuthenticationPrincipal User user) {
        AuthResponse.UserDto userDto = userService.getCurrentUser(user);
        return ResponseEntity.ok(ApiResponse.success(userDto));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update user profile (name)")
    public ResponseEntity<ApiResponse<AuthResponse.UserDto>> updateProfile(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        AuthResponse.UserDto updatedUser = userService.updateProfile(user, request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updatedUser));
    }

    @PostMapping("/change-password")
    @Operation(summary = "Change user password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        userService.changePassword(user, request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }

    @PostMapping("/mobile/request-otp")
    @Operation(summary = "Request OTP to change mobile number")
    public ResponseEntity<ApiResponse<OtpResponseDto>> requestMobileChangeOtp(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ChangeMobileRequest request
    ) {
        String devOtp = userService.requestMobileChangeOtp(user, request);
        OtpResponseDto response = new OtpResponseDto(devOtp);
        String message = devOtp != null 
            ? "OTP generated (Dev Mode - shown on screen)" 
            : "OTP sent successfully";
        return ResponseEntity.ok(ApiResponse.success(message, response));
    }

    @PostMapping("/mobile/verify")
    @Operation(summary = "Verify OTP and update mobile number")
    public ResponseEntity<ApiResponse<AuthResponse.UserDto>> verifyAndChangeMobile(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody VerifyMobileChangeRequest request
    ) {
        AuthResponse.UserDto updatedUser = userService.verifyAndChangeMobile(user, request);
        return ResponseEntity.ok(ApiResponse.success("Mobile number updated successfully", updatedUser));
    }

    @PostMapping("/2fa/setup")
    @Operation(summary = "Setup two-factor authentication")
    public ResponseEntity<ApiResponse<TwoFactorSetupResponse>> setup2FA(@AuthenticationPrincipal User user) {
        TwoFactorSetupResponse response = userService.setup2FA(user);
        return ResponseEntity.ok(ApiResponse.success("Scan the QR code with your authenticator app", response));
    }

    @PostMapping("/2fa/enable")
    @Operation(summary = "Enable two-factor authentication after verifying code")
    public ResponseEntity<ApiResponse<Void>> enable2FA(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody TwoFactorVerifyRequest request
    ) {
        userService.enable2FA(user, request);
        return ResponseEntity.ok(ApiResponse.success("Two-factor authentication enabled successfully", null));
    }

    @PostMapping("/2fa/disable")
    @Operation(summary = "Disable two-factor authentication")
    public ResponseEntity<ApiResponse<Void>> disable2FA(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody TwoFactorVerifyRequest request
    ) {
        userService.disable2FA(user, request);
        return ResponseEntity.ok(ApiResponse.success("Two-factor authentication disabled successfully", null));
    }
}
