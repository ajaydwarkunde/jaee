package com.jaee.controller;

import com.jaee.dto.auth.*;
import com.jaee.dto.common.ApiResponse;
import com.jaee.entity.User;
import com.jaee.service.AuthService;
import com.jaee.service.EmailOtpService;
import com.jaee.service.EmailVerificationService;
import com.jaee.service.OtpService;
import com.jaee.service.UserService;
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
    private final EmailOtpService emailOtpService;
    private final UserService userService;
    private final EmailVerificationService emailVerificationService;

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

    @PostMapping("/phone")
    @Operation(summary = "Login or register with Firebase phone verification")
    public ResponseEntity<ApiResponse<AuthResponse>> phoneLogin(@Valid @RequestBody PhoneLoginRequest request) {
        AuthResponse response = authService.phoneLogin(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/social")
    @Operation(summary = "Login or register with social provider (Google, GitHub)")
    public ResponseEntity<ApiResponse<AuthResponse>> socialLogin(@Valid @RequestBody SocialLoginRequest request) {
        AuthResponse response = authService.socialLogin(request);
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

    @PostMapping("/email-otp/request")
    @Operation(summary = "Request OTP via email for passwordless login")
    public ResponseEntity<ApiResponse<Void>> requestEmailOtp(@Valid @RequestBody EmailOtpRequest request) {
        emailOtpService.requestOtp(request.getEmail());
        return ResponseEntity.ok(ApiResponse.success("OTP sent to your email", null));
    }

    @PostMapping("/email-otp/verify")
    @Operation(summary = "Verify email OTP and login")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyEmailOtp(@Valid @RequestBody EmailOtpVerifyRequest request) {
        AuthResponse response = emailOtpService.verifyOtp(request.getEmail(), request.getOtp());
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Request password reset email")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        userService.requestPasswordReset(request.getEmail());
        return ResponseEntity.ok(ApiResponse.success("If an account exists with this email, you will receive a password reset link.", null));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password using token")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        userService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok(ApiResponse.success("Password has been reset successfully. You can now login with your new password.", null));
    }

    @PostMapping("/verify-email/send")
    @Operation(summary = "Send email verification link")
    public ResponseEntity<ApiResponse<Void>> sendVerificationEmail(@AuthenticationPrincipal User user) {
        emailVerificationService.sendVerificationEmail(user);
        return ResponseEntity.ok(ApiResponse.success("Verification email sent successfully", null));
    }

    @GetMapping("/verify-email")
    @Operation(summary = "Verify email with token")
    public ResponseEntity<ApiResponse<Void>> verifyEmail(@RequestParam String token) {
        emailVerificationService.verifyEmail(token);
        return ResponseEntity.ok(ApiResponse.success("Email verified successfully", null));
    }

    @PostMapping("/verify-email/resend")
    @Operation(summary = "Resend verification email")
    public ResponseEntity<ApiResponse<Void>> resendVerificationEmail(@RequestBody ResendVerificationRequest request) {
        emailVerificationService.resendVerificationEmail(request.getEmail());
        return ResponseEntity.ok(ApiResponse.success("Verification email sent successfully", null));
    }
}
