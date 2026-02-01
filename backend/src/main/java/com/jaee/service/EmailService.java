package com.jaee.service;

import com.jaee.entity.Order;
import com.jaee.entity.OrderItem;
import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@Slf4j
public class EmailService {

    private final OkHttpClient httpClient;

    @Value("${app.email.api-key:}")
    private String apiKey;

    @Value("${app.email.from}")
    private String fromEmail;

    @Value("${app.email.from-name}")
    private String fromName;

    @Value("${app.email.enabled:true}")
    private boolean emailEnabled;

    @Value("${app.cors.allowed-origins:http://localhost:5173}")
    private String frontendUrl;

    public EmailService() {
        this.httpClient = new OkHttpClient.Builder()
                .connectTimeout(30, java.util.concurrent.TimeUnit.SECONDS)
                .writeTimeout(30, java.util.concurrent.TimeUnit.SECONDS)
                .readTimeout(30, java.util.concurrent.TimeUnit.SECONDS)
                .build();
    }

    /**
     * Send email using Resend HTTP API
     */
    private boolean sendEmail(String toEmail, String subject, String htmlContent) {
        if (!emailEnabled || apiKey == null || apiKey.isBlank()) {
            log.info("Email disabled or API key not configured. Would send to: {} subject: {}", toEmail, subject);
            return false;
        }

        try {
            String jsonBody = String.format("""
                {
                    "from": "%s <%s>",
                    "to": ["%s"],
                    "subject": "%s",
                    "html": %s
                }
                """,
                fromName,
                fromEmail,
                toEmail,
                subject,
                escapeJsonString(htmlContent)
            );

            RequestBody body = RequestBody.create(
                    jsonBody,
                    MediaType.parse("application/json")
            );

            Request request = new Request.Builder()
                    .url("https://api.resend.com/emails")
                    .addHeader("Authorization", "Bearer " + apiKey)
                    .addHeader("Content-Type", "application/json")
                    .post(body)
                    .build();

            try (Response response = httpClient.newCall(request).execute()) {
                if (response.isSuccessful()) {
                    log.info("Email sent successfully to {}", toEmail);
                    return true;
                } else {
                    String responseBody = response.body() != null ? response.body().string() : "No response body";
                    log.error("Failed to send email. Status: {}, Response: {}", response.code(), responseBody);
                    return false;
                }
            }
        } catch (IOException e) {
            log.error("Failed to send email to {}: {}", toEmail, e.getMessage());
            return false;
        }
    }

    /**
     * Escape string for JSON
     */
    private String escapeJsonString(String input) {
        return "\"" + input
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t")
                + "\"";
    }

    /**
     * Send password reset email
     */
    @Async
    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        if (!emailEnabled) {
            log.info("Email disabled - Password reset token for {}: {}", toEmail, resetToken);
            return;
        }

        String baseUrl = frontendUrl.split(",")[0].trim();
        String resetLink = baseUrl + "/reset-password?token=" + resetToken;
        String htmlContent = buildPasswordResetHtml(resetLink);

        sendEmail(toEmail, "Reset Your Password - Jaee", htmlContent);
    }

    private String buildPasswordResetHtml(String resetLink) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #FAF7F2; margin: 0; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <div style="background: linear-gradient(135deg, #E9868B 0%%, #D4726F 100%%); padding: 40px 30px; text-align: center;">
                        <h1 style="color: #FFFFFF; margin: 0; font-size: 32px; letter-spacing: 3px; font-weight: 700;">JAEE</h1>
                    </div>
                    <div style="padding: 40px 30px; text-align: center;">
                        <div style="width: 60px; height: 60px; background-color: #FFF5F5; border-radius: 50%%; margin: 0 auto 20px auto; display: flex; align-items: center; justify-content: center;">
                            <span style="font-size: 28px;">🔐</span>
                        </div>
                        <h2 style="color: #2D2D2D; margin: 0 0 15px 0; font-size: 22px;">Reset Your Password</h2>
                        <p style="color: #6B6B6B; font-size: 15px; line-height: 1.6; margin: 0 0 25px 0;">
                            We received a request to reset your password.<br>Click the button below to create a new password.
                        </p>
                        <a href="%s" style="display: inline-block; background: linear-gradient(135deg, #E9868B 0%%, #D4726F 100%%); color: #FFFFFF; text-decoration: none; padding: 16px 40px; border-radius: 30px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 15px rgba(233, 134, 139, 0.4);">
                            Reset Password
                        </a>
                        <p style="color: #999; font-size: 13px; margin-top: 25px; line-height: 1.5;">
                            This link will expire in 15 minutes.<br>
                            If you didn't request this, you can safely ignore this email.
                        </p>
                    </div>
                    <div style="background-color: #FAF7F2; padding: 20px; text-align: center; color: #6B6B6B; font-size: 13px;">
                        <p style="margin: 0;">&copy; 2024 Jaee. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """, resetLink);
    }

    @Async
    public void sendOrderConfirmation(Order order) {
        if (!emailEnabled || order.getCustomerEmail() == null) {
            log.info("Email disabled or no customer email for order {}", order.getId());
            return;
        }

        String htmlContent = buildOrderConfirmationHtml(order);
        sendEmail(order.getCustomerEmail(), "Order Confirmation - Jaee #" + order.getId(), htmlContent);
    }

    private String buildOrderConfirmationHtml(Order order) {
        StringBuilder itemsHtml = new StringBuilder();
        for (OrderItem item : order.getItems()) {
            String imageUrl = item.getImageUrl() != null ? item.getImageUrl() : "https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=100";
            itemsHtml.append(String.format("""
                <tr>
                    <td style="padding: 16px 12px; border-bottom: 1px solid #F5E6E0;">
                        <div style="display: flex; align-items: center;">
                            <img src="%s" alt="%s" style="width: 70px; height: 70px; object-fit: cover; border-radius: 8px; margin-right: 16px;" />
                            <div>
                                <p style="margin: 0; font-weight: 600; color: #2D2D2D; font-size: 15px;">%s</p>
                                <p style="margin: 4px 0 0 0; color: #6B6B6B; font-size: 13px;">Qty: %d × ₹%s</p>
                            </div>
                        </div>
                    </td>
                    <td style="padding: 16px 12px; border-bottom: 1px solid #F5E6E0; text-align: right; vertical-align: middle;">
                        <span style="font-weight: 600; color: #2D2D2D; font-size: 15px;">₹%s</span>
                    </td>
                </tr>
                """,
                imageUrl,
                item.getNameSnapshot(),
                item.getNameSnapshot(),
                item.getQty(),
                item.getPriceSnapshot().setScale(2, RoundingMode.HALF_UP),
                item.getSubtotal().setScale(2, RoundingMode.HALF_UP)
            ));
        }

        String baseUrl = frontendUrl.split(",")[0].trim();
        String orderLink = baseUrl + "/orders/" + order.getId();

        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #FAF7F2; margin: 0; padding: 0;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF;">
                    <!-- Header with gradient -->
                    <div style="background: linear-gradient(135deg, #E9868B 0%%, #D4726F 100%%); padding: 40px 30px; text-align: center;">
                        <h1 style="color: #FFFFFF; margin: 0; font-size: 32px; letter-spacing: 3px; font-weight: 700;">JAEE</h1>
                        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Premium Candles & Home Decor</p>
                    </div>
                    
                    <!-- Success Icon -->
                    <div style="text-align: center; padding: 30px 30px 0 30px;">
                        <div style="width: 70px; height: 70px; background-color: #E8F5E9; border-radius: 50%%; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
                            <span style="font-size: 36px;">✓</span>
                        </div>
                        <h2 style="color: #2D2D2D; margin: 20px 0 8px 0; font-size: 24px;">Order Confirmed!</h2>
                        <p style="color: #6B6B6B; margin: 0; font-size: 15px;">Thank you for shopping with us</p>
                    </div>
                    
                    <!-- Order Info Card -->
                    <div style="margin: 25px 30px; background: linear-gradient(135deg, #FFF5F5 0%%, #F5E6E0 100%%); border-radius: 12px; padding: 20px; text-align: center;">
                        <p style="margin: 0 0 5px 0; color: #6B6B6B; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Order Number</p>
                        <p style="margin: 0; color: #E9868B; font-size: 28px; font-weight: 700;">#%d</p>
                    </div>
                    
                    <!-- Order Items -->
                    <div style="padding: 0 30px;">
                        <h3 style="color: #2D2D2D; font-size: 16px; margin: 25px 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #E9868B;">
                            🛍️ Your Items
                        </h3>
                        <table style="width: 100%%; border-collapse: collapse;">
                            %s
                        </table>
                        
                        <!-- Totals -->
                        <div style="margin-top: 20px; padding-top: 15px; border-top: 2px dashed #F5E6E0;">
                            <table style="width: 100%%;">
                                <tr>
                                    <td style="padding: 8px 0; color: #6B6B6B;">Subtotal</td>
                                    <td style="padding: 8px 0; text-align: right; color: #2D2D2D;">₹%s</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #6B6B6B;">Shipping</td>
                                    <td style="padding: 8px 0; text-align: right; color: #4CAF50; font-weight: 600;">FREE</td>
                                </tr>
                                <tr>
                                    <td style="padding: 15px 0 8px 0; font-size: 18px; font-weight: 700; color: #2D2D2D;">Total</td>
                                    <td style="padding: 15px 0 8px 0; text-align: right; font-size: 22px; font-weight: 700; color: #E9868B;">₹%s</td>
                                </tr>
                            </table>
                        </div>
                    </div>
                    
                    <!-- Track Order Button -->
                    <div style="padding: 30px; text-align: center;">
                        <a href="%s" style="display: inline-block; background: linear-gradient(135deg, #E9868B 0%%, #D4726F 100%%); color: #FFFFFF; text-decoration: none; padding: 16px 40px; border-radius: 30px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 15px rgba(233, 134, 139, 0.4);">
                            View Order Details →
                        </a>
                    </div>
                    
                    <!-- What's Next -->
                    <div style="background-color: #FAF7F2; padding: 30px; margin: 0 30px; border-radius: 12px;">
                        <h3 style="margin: 0 0 15px 0; color: #2D2D2D; font-size: 16px;">📦 What's Next?</h3>
                        <div style="display: flex; margin-bottom: 12px;">
                            <span style="background-color: #E9868B; color: white; width: 24px; height: 24px; border-radius: 50%%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; margin-right: 12px; flex-shrink: 0;">1</span>
                            <p style="margin: 0; color: #6B6B6B; font-size: 14px;">We're preparing your order with care</p>
                        </div>
                        <div style="display: flex; margin-bottom: 12px;">
                            <span style="background-color: #F5E6E0; color: #E9868B; width: 24px; height: 24px; border-radius: 50%%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; margin-right: 12px; flex-shrink: 0;">2</span>
                            <p style="margin: 0; color: #6B6B6B; font-size: 14px;">You'll receive a shipping confirmation email</p>
                        </div>
                        <div style="display: flex;">
                            <span style="background-color: #F5E6E0; color: #E9868B; width: 24px; height: 24px; border-radius: 50%%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; margin-right: 12px; flex-shrink: 0;">3</span>
                            <p style="margin: 0; color: #6B6B6B; font-size: 14px;">Your beautiful products will arrive at your door!</p>
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div style="padding: 30px; text-align: center; border-top: 1px solid #F5E6E0; margin-top: 30px;">
                        <p style="margin: 0 0 10px 0; color: #2D2D2D; font-weight: 600;">Need Help?</p>
                        <p style="margin: 0 0 20px 0; color: #6B6B6B; font-size: 14px;">
                            Reply to this email or contact us at<br>
                            <a href="mailto:support@jaee.com" style="color: #E9868B; text-decoration: none;">support@jaee.com</a>
                        </p>
                        <div style="margin: 20px 0;">
                            <a href="#" style="display: inline-block; margin: 0 8px; color: #E9868B; text-decoration: none;">Instagram</a>
                            <span style="color: #ddd;">|</span>
                            <a href="#" style="display: inline-block; margin: 0 8px; color: #E9868B; text-decoration: none;">Facebook</a>
                            <span style="color: #ddd;">|</span>
                            <a href="%s" style="display: inline-block; margin: 0 8px; color: #E9868B; text-decoration: none;">Website</a>
                        </div>
                        <p style="margin: 20px 0 0 0; color: #999; font-size: 12px;">
                            &copy; 2024 Jaee. Made with ❤️ in India<br>
                            Premium Candles & Home Decor
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """,
            order.getId(),
            itemsHtml.toString(),
            order.getTotalAmount().setScale(2, RoundingMode.HALF_UP),
            order.getTotalAmount().setScale(2, RoundingMode.HALF_UP),
            orderLink,
            baseUrl
        );
    }
}
