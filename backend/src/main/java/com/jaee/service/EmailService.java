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
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #FAF7F2; margin: 0; padding: 20px; }
                    .container { max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                    .header { background-color: #D4A5A5; padding: 30px; text-align: center; }
                    .header h1 { color: #FFFFFF; margin: 0; font-size: 28px; letter-spacing: 2px; }
                    .content { padding: 30px; text-align: center; }
                    .btn { display: inline-block; background-color: #D4A5A5; color: #FFFFFF; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: bold; margin: 20px 0; }
                    .footer { background-color: #FAF7F2; padding: 20px; text-align: center; color: #6B6B6B; font-size: 14px; }
                    .note { color: #888; font-size: 13px; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>JAEE</h1>
                    </div>
                    <div class="content">
                        <h2 style="color: #2D2D2D;">Reset Your Password</h2>
                        <p style="color: #6B6B6B; font-size: 16px;">
                            We received a request to reset your password. Click the button below to create a new password.
                        </p>
                        <a href="%s" class="btn">Reset Password</a>
                        <p class="note">
                            This link will expire in 15 minutes.<br>
                            If you didn't request this, you can safely ignore this email.
                        </p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2024 Jaee. All rights reserved.</p>
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
            itemsHtml.append(String.format("""
                <tr>
                    <td style="padding: 12px; border-bottom: 1px solid #f0f0f0;">
                        <strong>%s</strong><br>
                        <span style="color: #666;">Qty: %d</span>
                    </td>
                    <td style="padding: 12px; border-bottom: 1px solid #f0f0f0; text-align: right;">
                        ₹%s
                    </td>
                </tr>
                """,
                item.getNameSnapshot(),
                item.getQty(),
                item.getSubtotal().setScale(2, RoundingMode.HALF_UP)
            ));
        }

        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #FAF7F2; margin: 0; padding: 20px; }
                    .container { max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                    .header { background-color: #D4A5A5; padding: 30px; text-align: center; }
                    .header h1 { color: #FFFFFF; margin: 0; font-size: 28px; letter-spacing: 2px; }
                    .content { padding: 30px; }
                    .order-number { background-color: #F5E6E0; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center; }
                    .order-number h2 { margin: 0; color: #2D2D2D; font-size: 18px; }
                    table { width: 100%%; border-collapse: collapse; }
                    .total { font-size: 18px; font-weight: bold; color: #2D2D2D; }
                    .footer { background-color: #FAF7F2; padding: 20px; text-align: center; color: #6B6B6B; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>JAEE</h1>
                    </div>
                    <div class="content">
                        <p style="font-size: 16px; color: #2D2D2D;">Thank you for your order!</p>

                        <div class="order-number">
                            <h2>Order #%d</h2>
                        </div>

                        <h3 style="color: #2D2D2D; border-bottom: 2px solid #D4A5A5; padding-bottom: 10px;">Order Details</h3>

                        <table>
                            %s
                            <tr>
                                <td style="padding: 15px 12px; font-weight: bold;">Total</td>
                                <td style="padding: 15px 12px; text-align: right;" class="total">₹%s</td>
                            </tr>
                        </table>

                        <p style="margin-top: 30px; color: #6B6B6B;">
                            We'll send you another email when your order ships.
                        </p>
                    </div>
                    <div class="footer">
                        <p>Questions? Contact us at support@jaee.com</p>
                        <p>&copy; 2024 Jaee. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """,
            order.getId(),
            itemsHtml.toString(),
            order.getTotalAmount().setScale(2, RoundingMode.HALF_UP)
        );
    }
}
