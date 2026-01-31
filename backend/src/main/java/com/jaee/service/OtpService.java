package com.jaee.service;

import com.jaee.dto.auth.AuthResponse;
import com.jaee.dto.auth.OtpRequestDto;
import com.jaee.dto.auth.OtpVerifyRequest;
import com.jaee.entity.OtpCode;
import com.jaee.entity.RefreshToken;
import com.jaee.entity.User;
import com.jaee.exception.BadRequestException;
import com.jaee.exception.TooManyRequestsException;
import com.jaee.repository.OtpCodeRepository;
import com.jaee.repository.RefreshTokenRepository;
import com.jaee.repository.UserRepository;
import com.jaee.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class OtpService {

    private final OtpCodeRepository otpCodeRepository;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final SmsService smsService;

    @Value("${app.otp.length:6}")
    private int otpLength;

    @Value("${app.otp.expiration-minutes:5}")
    private int expirationMinutes;

    @Value("${app.otp.max-attempts:5}")
    private int maxAttempts;

    @Value("${app.otp.cooldown-seconds:60}")
    private int cooldownSeconds;

    @Value("${app.sms.enabled:true}")
    private boolean smsEnabled;

    @Value("${spring.profiles.active:dev}")
    private String activeProfile;

    /**
     * Request OTP for mobile login
     * @return OTP code in dev mode (for testing), null in production
     */
    @Transactional
    public String requestOtp(OtpRequestDto request) {
        String mobileNumber = normalizePhoneNumber(request.getMobileNumber());

        // Check cooldown
        otpCodeRepository.findFirstByMobileNumberOrderByCreatedAtDesc(mobileNumber)
                .ifPresent(existingOtp -> {
                    if (existingOtp.getLastSentAt() != null) {
                        long secondsSinceLastSend = ChronoUnit.SECONDS.between(
                                existingOtp.getLastSentAt(), LocalDateTime.now());
                        if (secondsSinceLastSend < cooldownSeconds) {
                            throw new TooManyRequestsException(
                                    "Please wait " + (cooldownSeconds - secondsSinceLastSend) + " seconds before requesting a new OTP");
                        }
                    }
                });

        // Generate OTP
        String otp = generateOtp();
        String otpHash = passwordEncoder.encode(otp);

        // Delete old OTPs for this number
        otpCodeRepository.deleteByMobileNumber(mobileNumber);

        // Save new OTP
        OtpCode otpCode = OtpCode.builder()
                .mobileNumber(mobileNumber)
                .otpHash(otpHash)
                .expiresAt(LocalDateTime.now().plusMinutes(expirationMinutes))
                .lastSentAt(LocalDateTime.now())
                .build();
        otpCodeRepository.save(otpCode);

        // Send OTP via SMS (if configured)
        boolean smsSent = false;
        if (smsEnabled) {
            smsSent = smsService.sendOtp(mobileNumber, otp);
        }

        // In dev mode or if SMS not sent, log and return OTP for testing
        boolean isDevMode = "dev".equals(activeProfile) || !smsSent;
        if (isDevMode) {
            log.warn("🔐 DEV MODE - OTP for {}: {}", mobileNumber, otp);
        }

        log.info("OTP sent to: {}", maskPhoneNumber(mobileNumber));
        
        // Return OTP only in dev mode (for UI display)
        return isDevMode ? otp : null;
    }

    @Transactional
    public AuthResponse verifyOtp(OtpVerifyRequest request) {
        String mobileNumber = normalizePhoneNumber(request.getMobileNumber());

        OtpCode otpCode = otpCodeRepository.findFirstByMobileNumberOrderByCreatedAtDesc(mobileNumber)
                .orElseThrow(() -> new BadRequestException("No OTP found for this number. Please request a new one."));

        // Check if expired
        if (otpCode.isExpired()) {
            otpCodeRepository.delete(otpCode);
            throw new BadRequestException("OTP has expired. Please request a new one.");
        }

        // Check attempts
        if (otpCode.getAttempts() >= maxAttempts) {
            otpCodeRepository.delete(otpCode);
            throw new TooManyRequestsException("Too many failed attempts. Please request a new OTP.");
        }

        // Verify OTP
        if (!passwordEncoder.matches(request.getOtp(), otpCode.getOtpHash())) {
            otpCode.incrementAttempts();
            otpCodeRepository.save(otpCode);
            throw new BadRequestException("Invalid OTP. " + (maxAttempts - otpCode.getAttempts()) + " attempts remaining.");
        }

        // OTP verified - delete it
        otpCodeRepository.delete(otpCode);

        // Find or create user
        User user = userRepository.findByMobileNumber(mobileNumber)
                .orElseGet(() -> createUserWithMobile(mobileNumber));

        user.setMobileVerified(true);
        userRepository.save(user);

        log.info("OTP verified for: {}", maskPhoneNumber(mobileNumber));
        return createAuthResponse(user);
    }

    private User createUserWithMobile(String mobileNumber) {
        User user = User.builder()
                .mobileNumber(mobileNumber)
                .mobileVerified(true)
                .role(User.Role.USER)
                .build();
        return userRepository.save(user);
    }

    private String generateOtp() {
        SecureRandom random = new SecureRandom();
        StringBuilder otp = new StringBuilder();
        for (int i = 0; i < otpLength; i++) {
            otp.append(random.nextInt(10));
        }
        return otp.toString();
    }

    private String normalizePhoneNumber(String phoneNumber) {
        // Remove all non-digit characters except leading +
        String normalized = phoneNumber.replaceAll("[^+\\d]", "");
        if (!normalized.startsWith("+")) {
            // Assume Indian number if no country code
            normalized = "+91" + normalized;
        }
        return normalized;
    }

    private String maskPhoneNumber(String phoneNumber) {
        if (phoneNumber.length() <= 4) return "****";
        return phoneNumber.substring(0, phoneNumber.length() - 4) + "****";
    }

    private AuthResponse createAuthResponse(User user) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = createRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(AuthResponse.UserDto.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .mobileNumber(user.getMobileNumber())
                        .role(user.getRole().name())
                        .twoFactorEnabled(user.getTwoFactorEnabled())
                        .build())
                .build();
    }

    private String createRefreshToken(User user) {
        String token = UUID.randomUUID().toString();

        RefreshToken refreshToken = RefreshToken.builder()
                .token(token)
                .user(user)
                .expiresAt(LocalDateTime.now().plusSeconds(jwtService.getRefreshExpirationMs() / 1000))
                .build();

        refreshTokenRepository.save(refreshToken);
        return token;
    }

    /**
     * Request OTP for mobile number change (used by UserService)
     * @return OTP code in dev mode (for testing), null in production
     */
    @Transactional
    public String requestOtpForMobileChange(String newMobileNumber) {
        String mobileNumber = normalizePhoneNumber(newMobileNumber);

        // Check cooldown
        otpCodeRepository.findFirstByMobileNumberOrderByCreatedAtDesc(mobileNumber)
                .ifPresent(existingOtp -> {
                    if (existingOtp.getLastSentAt() != null) {
                        long secondsSinceLastSend = ChronoUnit.SECONDS.between(
                                existingOtp.getLastSentAt(), LocalDateTime.now());
                        if (secondsSinceLastSend < cooldownSeconds) {
                            throw new TooManyRequestsException(
                                    "Please wait " + (cooldownSeconds - secondsSinceLastSend) + " seconds before requesting a new OTP");
                        }
                    }
                });

        // Generate OTP
        String otp = generateOtp();
        String otpHash = passwordEncoder.encode(otp);

        // Delete old OTPs for this number
        otpCodeRepository.deleteByMobileNumber(mobileNumber);

        // Save new OTP
        OtpCode otpCode = OtpCode.builder()
                .mobileNumber(mobileNumber)
                .otpHash(otpHash)
                .expiresAt(LocalDateTime.now().plusMinutes(expirationMinutes))
                .lastSentAt(LocalDateTime.now())
                .build();
        otpCodeRepository.save(otpCode);

        // Send OTP via SMS (if configured)
        boolean smsSent = false;
        if (smsEnabled) {
            smsSent = smsService.sendOtp(mobileNumber, otp);
        }

        // In dev mode or if SMS not sent, log and return OTP for testing
        boolean isDevMode = "dev".equals(activeProfile) || !smsSent;
        if (isDevMode) {
            log.warn("🔐 DEV MODE - Mobile Change OTP for {}: {}", mobileNumber, otp);
        }

        log.info("Mobile change OTP sent to: {}", maskPhoneNumber(mobileNumber));
        
        return isDevMode ? otp : null;
    }

    /**
     * Verify OTP for mobile number change (returns boolean)
     */
    @Transactional
    public boolean verifyOtpForMobileChange(String newMobileNumber, String otp) {
        String mobileNumber = normalizePhoneNumber(newMobileNumber);

        OtpCode otpCode = otpCodeRepository.findFirstByMobileNumberOrderByCreatedAtDesc(mobileNumber)
                .orElse(null);

        if (otpCode == null) {
            return false;
        }

        // Check if expired
        if (otpCode.isExpired()) {
            otpCodeRepository.delete(otpCode);
            return false;
        }

        // Check attempts
        if (otpCode.getAttempts() >= maxAttempts) {
            otpCodeRepository.delete(otpCode);
            return false;
        }

        // Verify OTP
        if (!passwordEncoder.matches(otp, otpCode.getOtpHash())) {
            otpCode.incrementAttempts();
            otpCodeRepository.save(otpCode);
            return false;
        }

        // OTP verified - delete it
        otpCodeRepository.delete(otpCode);
        log.info("Mobile change OTP verified for: {}", maskPhoneNumber(mobileNumber));
        return true;
    }
}
