package com.jaee.service;

import com.jaee.entity.EmailVerificationToken;
import com.jaee.entity.User;
import com.jaee.exception.BadRequestException;
import com.jaee.exception.NotFoundException;
import com.jaee.repository.EmailVerificationTokenRepository;
import com.jaee.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailVerificationService {

    private final EmailVerificationTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${app.email-verification.expiration-hours:24}")
    private int expirationHours;

    @Transactional
    public void sendVerificationEmail(User user) {
        if (user.getEmailVerified()) {
            throw new BadRequestException("Email is already verified");
        }

        if (user.getEmail() == null || user.getEmail().isBlank()) {
            throw new BadRequestException("User does not have an email address");
        }

        // Delete any existing tokens for this user
        tokenRepository.deleteByUser(user);

        // Create new token
        String token = UUID.randomUUID().toString();
        EmailVerificationToken verificationToken = EmailVerificationToken.builder()
                .user(user)
                .token(token)
                .expiresAt(LocalDateTime.now().plusHours(expirationHours))
                .build();
        tokenRepository.save(verificationToken);

        // Send email
        String verificationLink = frontendUrl + "/verify-email?token=" + token;
        
        String htmlContent = buildVerificationEmail(user.getName(), verificationLink);
        
        emailService.sendEmail(
                user.getEmail(),
                "Verify your email - Jaai",
                htmlContent
        );

        log.info("Verification email sent to: {}", user.getEmail());
    }

    @Transactional
    public void verifyEmail(String token) {
        EmailVerificationToken verificationToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new NotFoundException("Invalid verification token"));

        if (verificationToken.isExpired()) {
            tokenRepository.delete(verificationToken);
            throw new BadRequestException("Verification token has expired. Please request a new one.");
        }

        User user = verificationToken.getUser();
        user.setEmailVerified(true);
        userRepository.save(user);

        // Delete the used token
        tokenRepository.delete(verificationToken);

        log.info("Email verified for user: {}", user.getEmail());
    }

    @Transactional
    public void resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found"));
        
        sendVerificationEmail(user);
    }

    private String buildVerificationEmail(String name, String verificationLink) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #FBF8F5; margin: 0; padding: 20px; }
                    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #C9A87C 0%%, #D4B896 100%%); padding: 40px 30px; text-align: center; }
                    .header h1 { color: white; margin: 0; font-size: 28px; }
                    .content { padding: 40px 30px; }
                    .content p { color: #4A4A4A; font-size: 16px; line-height: 1.6; }
                    .button { display: inline-block; background: #C9A87C; color: white !important; text-decoration: none; padding: 14px 32px; border-radius: 30px; font-weight: 600; margin: 20px 0; }
                    .button:hover { background: #B89969; }
                    .footer { background: #F5F0EB; padding: 20px 30px; text-align: center; }
                    .footer p { color: #8A8A8A; font-size: 14px; margin: 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Welcome to Jaai</h1>
                    </div>
                    <div class="content">
                        <p>Hi %s,</p>
                        <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
                        <p style="text-align: center;">
                            <a href="%s" class="button">Verify Email</a>
                        </p>
                        <p>This link will expire in %d hours.</p>
                        <p>If you didn't create an account with us, please ignore this email.</p>
                        <p>Best regards,<br>The Jaai Team</p>
                    </div>
                    <div class="footer">
                        <p>Jaai - Handcrafted with love</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(name != null ? name : "there", verificationLink, expirationHours);
    }
}
