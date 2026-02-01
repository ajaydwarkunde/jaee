package com.jaee.service;

import com.jaee.dto.auth.AuthResponse;
import com.jaee.dto.user.*;
import com.jaee.entity.User;
import com.jaee.exception.BadRequestException;
import com.jaee.exception.UnauthorizedException;
import com.jaee.repository.UserRepository;
import com.jaee.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TotpService totpService;
    private final OtpService otpService;
    private final JwtService jwtService;
    private final EmailService emailService;

    /**
     * Update user profile (name only - email/mobile require verification)
     */
    @Transactional
    public AuthResponse.UserDto updateProfile(User user, UpdateProfileRequest request) {
        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName().trim());
        }

        userRepository.save(user);
        log.info("Profile updated for user: {}", user.getId());

        return toUserDto(user);
    }

    /**
     * Change user password
     */
    @Transactional
    public void changePassword(User user, ChangePasswordRequest request) {
        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Current password is incorrect");
        }

        // Ensure new password is different
        if (passwordEncoder.matches(request.getNewPassword(), user.getPasswordHash())) {
            throw new BadRequestException("New password must be different from current password");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordChangedAt(LocalDateTime.now());
        userRepository.save(user);

        log.info("Password changed for user: {}", user.getId());
    }

    /**
     * Request OTP for mobile number change
     */
    public String requestMobileChangeOtp(User user, ChangeMobileRequest request) {
        String newMobile = request.getNewMobileNumber();

        // Check if mobile is already in use by another user
        if (userRepository.existsByMobileNumber(newMobile)) {
            User existingUser = userRepository.findByMobileNumber(newMobile).orElse(null);
            if (existingUser != null && !existingUser.getId().equals(user.getId())) {
                throw new BadRequestException("This mobile number is already registered");
            }
        }

        // Use existing OTP service to send OTP
        return otpService.requestOtpForMobileChange(newMobile);
    }

    /**
     * Verify OTP and update mobile number
     */
    @Transactional
    public AuthResponse.UserDto verifyAndChangeMobile(User user, VerifyMobileChangeRequest request) {
        String newMobile = request.getNewMobileNumber();

        // Verify OTP
        if (!otpService.verifyOtpForMobileChange(newMobile, request.getOtp())) {
            throw new UnauthorizedException("Invalid or expired OTP");
        }

        // Double-check mobile isn't taken
        if (userRepository.existsByMobileNumber(newMobile)) {
            User existingUser = userRepository.findByMobileNumber(newMobile).orElse(null);
            if (existingUser != null && !existingUser.getId().equals(user.getId())) {
                throw new BadRequestException("This mobile number is already registered");
            }
        }

        user.setMobileNumber(newMobile);
        user.setMobileVerified(true);
        userRepository.save(user);

        log.info("Mobile number changed for user: {} to: {}", user.getId(), newMobile);

        return toUserDto(user);
    }

    /**
     * Setup 2FA - generate secret and return QR code
     */
    public TwoFactorSetupResponse setup2FA(User user) {
        if (Boolean.TRUE.equals(user.getTwoFactorEnabled())) {
            throw new BadRequestException("Two-factor authentication is already enabled");
        }

        String secret = totpService.generateSecret();
        String email = user.getEmail() != null ? user.getEmail() : user.getMobileNumber();
        String qrCodeUrl = totpService.generateQrCodeUrl(secret, email);
        String manualKey = totpService.getManualEntryKey(secret);

        // Store secret temporarily (not enabled yet)
        user.setTotpSecret(secret);
        userRepository.save(user);

        return TwoFactorSetupResponse.builder()
                .secret(secret)
                .qrCodeUrl(qrCodeUrl)
                .manualEntryKey(manualKey)
                .build();
    }

    /**
     * Enable 2FA after verifying the code
     */
    @Transactional
    public void enable2FA(User user, TwoFactorVerifyRequest request) {
        if (user.getTotpSecret() == null) {
            throw new BadRequestException("Please setup 2FA first");
        }

        if (!totpService.verifyCode(user.getTotpSecret(), request.getCode())) {
            throw new UnauthorizedException("Invalid verification code");
        }

        user.setTwoFactorEnabled(true);
        userRepository.save(user);

        log.info("2FA enabled for user: {}", user.getId());
    }

    /**
     * Disable 2FA
     */
    @Transactional
    public void disable2FA(User user, TwoFactorVerifyRequest request) {
        if (!Boolean.TRUE.equals(user.getTwoFactorEnabled())) {
            throw new BadRequestException("Two-factor authentication is not enabled");
        }

        if (!totpService.verifyCode(user.getTotpSecret(), request.getCode())) {
            throw new UnauthorizedException("Invalid verification code");
        }

        user.setTwoFactorEnabled(false);
        user.setTotpSecret(null);
        userRepository.save(user);

        log.info("2FA disabled for user: {}", user.getId());
    }

    /**
     * Verify 2FA code during login
     */
    public boolean verify2FACode(User user, String code) {
        if (!Boolean.TRUE.equals(user.getTwoFactorEnabled()) || user.getTotpSecret() == null) {
            return true; // 2FA not enabled, always pass
        }
        return totpService.verifyCode(user.getTotpSecret(), code);
    }

    /**
     * Get current user profile
     */
    public AuthResponse.UserDto getCurrentUser(User user) {
        return toUserDto(user);
    }

    /**
     * Request password reset - sends email with reset link
     */
    public void requestPasswordReset(String email) {
        User user = userRepository.findByEmail(email).orElse(null);
        
        // Always return success to prevent email enumeration
        if (user == null) {
            log.info("Password reset requested for non-existent email: {}", email);
            return;
        }

        String resetToken = jwtService.generatePasswordResetToken(email);
        emailService.sendPasswordResetEmail(email, resetToken);
        
        log.info("Password reset email sent to: {}", email);
    }

    /**
     * Reset password using token
     */
    @Transactional
    public void resetPassword(String token, String newPassword) {
        String email = jwtService.validatePasswordResetToken(token);
        
        if (email == null) {
            throw new BadRequestException("Invalid or expired reset link. Please request a new one.");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setPasswordChangedAt(LocalDateTime.now());
        userRepository.save(user);

        log.info("Password reset successful for user: {}", user.getId());
    }

    private AuthResponse.UserDto toUserDto(User user) {
        return AuthResponse.UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .mobileNumber(user.getMobileNumber())
                .role(user.getRole().name())
                .twoFactorEnabled(user.getTwoFactorEnabled())
                .build();
    }
}
