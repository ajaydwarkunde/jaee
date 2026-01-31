package com.jaee.controller;

import com.jaee.dto.auth.*;
import com.jaee.dto.common.ApiResponse;
import com.jaee.entity.User;
import com.jaee.service.AuthService;
import com.jaee.service.OtpService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "User authentication endpoints")
public class AuthController {

    private final AuthService authService;
    private final OtpService otpService;

    @PostMapping("/register")
    @Operation(summary = "Register a new user with email and password")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success("Registration successful", response));
    }

    @PostMapping("/login")
    @Operation(summary = "Login with email and password")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout user")
    public ResponseEntity<ApiResponse<Void>> logout(
            @AuthenticationPrincipal User user,
            @RequestBody(required = false) RefreshTokenRequest request
    ) {
        authService.logout(user, request != null ? request.getRefreshToken() : null);
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully", null));
    }

    @PostMapping("/otp/request")
    @Operation(summary = "Request OTP for mobile login")
    public ResponseEntity<ApiResponse<OtpResponseDto>> requestOtp(@Valid @RequestBody OtpRequestDto request) {
        String devOtp = otpService.requestOtp(request);
        OtpResponseDto response = new OtpResponseDto(devOtp);
        String message = devOtp != null 
            ? "OTP generated (Dev Mode - shown on screen)" 
            : "OTP sent successfully";
        return ResponseEntity.ok(ApiResponse.success(message, response));
    }

    @PostMapping("/otp/verify")
    @Operation(summary = "Verify OTP and login")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyOtp(@Valid @RequestBody OtpVerifyRequest request) {
        AuthResponse response = otpService.verifyOtp(request);
        return ResponseEntity.ok(ApiResponse.success("OTP verified successfully", response));
    }
}
