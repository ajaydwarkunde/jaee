package com.jaee.service;

import com.jaee.dto.auth.AuthResponse;
import com.jaee.entity.EmailOtpCode;
import com.jaee.entity.RefreshToken;
import com.jaee.entity.User;
import com.jaee.exception.BadRequestException;
import com.jaee.exception.TooManyRequestsException;
import com.jaee.repository.EmailOtpCodeRepository;
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
public class EmailOtpService {

    private final EmailOtpCodeRepository emailOtpCodeRepository;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;

    @Value("${app.otp.length:6}")
    private int otpLength;

    @Value("${app.otp.expiration-minutes:5}")
    private int expirationMinutes;

    @Value("${app.otp.max-attempts:5}")
    private int maxAttempts;

    @Value("${app.otp.cooldown-seconds:15}")
    private int cooldownSeconds;

    @Transactional
    public void requestOtp(String email) {
        String normalizedEmail = email.toLowerCase().trim();

        emailOtpCodeRepository.findFirstByEmailOrderByCreatedAtDesc(normalizedEmail)
                .ifPresent(existing -> {
                    if (existing.getLastSentAt() != null) {
                        long seconds = ChronoUnit.SECONDS.between(existing.getLastSentAt(), LocalDateTime.now());
                        if (seconds < cooldownSeconds) {
                            throw new TooManyRequestsException(
                                    "Please wait " + (cooldownSeconds - seconds) + " seconds before requesting a new OTP");
                        }
                    }
                });

        String otp = generateOtp();
        String otpHash = passwordEncoder.encode(otp);

        emailOtpCodeRepository.deleteByEmail(normalizedEmail);

        EmailOtpCode otpCode = EmailOtpCode.builder()
                .email(normalizedEmail)
                .otpHash(otpHash)
                .expiresAt(LocalDateTime.now().plusMinutes(expirationMinutes))
                .lastSentAt(LocalDateTime.now())
                .build();
        emailOtpCodeRepository.save(otpCode);

        emailService
                .sendEmailOrError(
                        normalizedEmail,
                        "Your Jaai verification code",
                        buildOtpEmailHtml(otp))
                .ifPresent(
                        msg -> {
                            log.warn(
                                    "Email OTP send failed for {}: {}",
                                    maskEmail(normalizedEmail),
                                    msg);
                            throw new BadRequestException(msg);
                        });

        log.info("Email OTP sent to: {}", maskEmail(normalizedEmail));
    }

    @Transactional
    public AuthResponse verifyOtp(String email, String otp) {
        String normalizedEmail = email.toLowerCase().trim();

        EmailOtpCode otpCode = emailOtpCodeRepository.findFirstByEmailOrderByCreatedAtDesc(normalizedEmail)
                .orElseThrow(() -> new BadRequestException("No OTP found for this email. Please request a new one."));

        if (otpCode.isExpired()) {
            emailOtpCodeRepository.delete(otpCode);
            throw new BadRequestException("OTP has expired. Please request a new one.");
        }

        if (otpCode.getAttempts() >= maxAttempts) {
            emailOtpCodeRepository.delete(otpCode);
            throw new TooManyRequestsException("Too many failed attempts. Please request a new OTP.");
        }

        if (!passwordEncoder.matches(otp, otpCode.getOtpHash())) {
            otpCode.incrementAttempts();
            emailOtpCodeRepository.save(otpCode);
            throw new BadRequestException("Invalid OTP. " + (maxAttempts - otpCode.getAttempts()) + " attempts remaining.");
        }

        emailOtpCodeRepository.delete(otpCode);

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .email(normalizedEmail)
                            .name(normalizedEmail.split("@")[0])
                            .emailVerified(true)
                            .role(User.Role.USER)
                            .build();
                    return userRepository.save(newUser);
                });

        user.setEmailVerified(true);
        userRepository.save(user);

        log.info("Email OTP verified for: {}", maskEmail(normalizedEmail));
        return createAuthResponse(user);
    }

    /**
     * Validates email OTP for registration (consumes code; does not issue tokens).
     */
    @Transactional
    public void validateAndConsumeRegistrationOtp(String email, String otp) {
        String normalizedEmail = email.toLowerCase().trim();

        EmailOtpCode otpCode = emailOtpCodeRepository.findFirstByEmailOrderByCreatedAtDesc(normalizedEmail)
                .orElseThrow(() -> new BadRequestException("No OTP found for this email. Please request a new one."));

        if (otpCode.isExpired()) {
            emailOtpCodeRepository.delete(otpCode);
            throw new BadRequestException("OTP has expired. Please request a new one.");
        }

        if (otpCode.getAttempts() >= maxAttempts) {
            emailOtpCodeRepository.delete(otpCode);
            throw new TooManyRequestsException("Too many failed attempts. Please request a new OTP.");
        }

        if (!passwordEncoder.matches(otp, otpCode.getOtpHash())) {
            otpCode.incrementAttempts();
            emailOtpCodeRepository.save(otpCode);
            throw new BadRequestException("Invalid OTP. " + (maxAttempts - otpCode.getAttempts()) + " attempts remaining.");
        }

        emailOtpCodeRepository.delete(otpCode);
        log.info("Email OTP consumed for registration: {}", maskEmail(normalizedEmail));
    }

    private String generateOtp() {
        SecureRandom random = new SecureRandom();
        StringBuilder otp = new StringBuilder();
        for (int i = 0; i < otpLength; i++) {
            otp.append(random.nextInt(10));
        }
        return otp.toString();
    }

    private String maskEmail(String email) {
        int atIdx = email.indexOf('@');
        if (atIdx <= 2) return "**" + email.substring(atIdx);
        return email.substring(0, 2) + "***" + email.substring(atIdx);
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

    private String buildOtpEmailHtml(String otp) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
            <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #FAF7F2; margin: 0; padding: 20px;">
                <div style="max-width: 480px; margin: 0 auto; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                    <div style="background: linear-gradient(135deg, #E9868B 0%%%%, #D4726F 100%%%%); padding: 40px 30px; text-align: center;">
                        <h1 style="color: #FFFFFF; margin: 0 0 4px 0; font-size: 32px; letter-spacing: 4px; font-weight: 700;">JAAI</h1>
                        <p style="color: rgba(255,255,255,0.85); margin: 0; font-size: 13px; letter-spacing: 1px;">Login Verification</p>
                    </div>
                    <div style="padding: 36px 30px; text-align: center;">
                        <p style="color: #6B6B6B; font-size: 15px; margin: 0 0 24px 0;">Your one-time login code is:</p>
                        <div style="background-color: #FAF7F2; border-radius: 12px; padding: 20px; margin: 0 0 24px 0;">
                            <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #2D2D2D; font-family: monospace;">%s</span>
                        </div>
                        <p style="color: #999; font-size: 13px; margin: 0;">This code expires in 5 minutes.<br>If you didn't request this, please ignore this email.</p>
                    </div>
                    <div style="background-color: #FAF7F2; padding: 16px; text-align: center; color: #999; font-size: 11px;">
                        <p style="margin: 0;">&copy; 2026 Jaai. Made with love in India</p>
                    </div>
                </div>
            </body>
            </html>
            """, otp);
    }
}
