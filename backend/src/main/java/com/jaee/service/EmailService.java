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
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

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
                            <span style="font-size: 28px;">&#128274;</span>
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
                        <p style="margin: 0;">&copy; 2026 Jaee. All rights reserved.</p>
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
        sendEmail(order.getCustomerEmail(), "Order Confirmed! - Jaee #" + order.getId(), htmlContent);
    }

    /**
     * Send welcome email to new newsletter subscribers
     */
    @Async
    public void sendNewsletterWelcome(String toEmail) {
        if (!emailEnabled) {
            log.info("Email disabled - Newsletter welcome for {}", toEmail);
            return;
        }

        String baseUrl = frontendUrl.split(",")[0].trim();
        String htmlContent = buildNewsletterWelcomeHtml(baseUrl);
        sendEmail(toEmail, "Welcome to the Jaee Community! ✨", htmlContent);
    }

    private String buildNewsletterWelcomeHtml(String baseUrl) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
            <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #FAF7F2; margin: 0; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                    <div style="background: linear-gradient(135deg, #E9868B 0%%, #D4726F 100%%); padding: 50px 30px; text-align: center;">
                        <h1 style="color: #FFFFFF; margin: 0 0 8px 0; font-size: 36px; letter-spacing: 4px; font-weight: 700;">JAEE</h1>
                        <p style="color: rgba(255,255,255,0.85); margin: 0; font-size: 14px; letter-spacing: 1px;">Premium Candles & Home Decor</p>
                    </div>
                    <div style="padding: 40px 30px; text-align: center;">
                        <div style="font-size: 48px; margin-bottom: 16px;">&#10024;</div>
                        <h2 style="color: #2D2D2D; margin: 0 0 12px 0; font-size: 24px;">Welcome to Our Community!</h2>
                        <p style="color: #6B6B6B; font-size: 15px; line-height: 1.7; margin: 0 0 30px 0;">
                            Thank you for subscribing! You'll be the first to know about<br>
                            new arrivals, exclusive offers, and self-care inspiration.
                        </p>
                        <a href="%s/shop" style="display: inline-block; background: linear-gradient(135deg, #E9868B 0%%, #D4726F 100%%); color: #FFFFFF; text-decoration: none; padding: 14px 36px; border-radius: 30px; font-weight: 600; font-size: 14px; box-shadow: 0 4px 15px rgba(233, 134, 139, 0.3);">
                            Explore Our Collection
                        </a>
                    </div>
                    <div style="background-color: #FAF7F2; padding: 20px; text-align: center; color: #999; font-size: 12px;">
                        <p style="margin: 0;">&copy; 2026 Jaee. Made with love in India</p>
                    </div>
                </div>
            </body>
            </html>
            """, baseUrl);
    }

    private String buildOrderConfirmationHtml(Order order) {
        StringBuilder itemsHtml = new StringBuilder();
        BigDecimal totalSavings = BigDecimal.ZERO;

        for (OrderItem item : order.getItems()) {
            String imageUrl = item.getImageUrl() != null ? item.getImageUrl() : "https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=100";

            // Check for discount
            BigDecimal originalPrice = null;
            if (item.getProduct() != null && item.getProduct().getCompareAtPrice() != null
                    && item.getProduct().getCompareAtPrice().compareTo(item.getPriceSnapshot()) > 0) {
                originalPrice = item.getProduct().getCompareAtPrice();
                BigDecimal savings = originalPrice.subtract(item.getPriceSnapshot()).multiply(BigDecimal.valueOf(item.getQty()));
                totalSavings = totalSavings.add(savings);
            }

            String priceHtml;
            if (originalPrice != null) {
                priceHtml = String.format(
                        "<span style=\"text-decoration: line-through; color: #999; font-size: 12px; margin-right: 6px;\">&#8377;%s</span>" +
                        "<span style=\"color: #E9868B; font-weight: 600;\">&#8377;%s</span>",
                        originalPrice.setScale(0, RoundingMode.HALF_UP),
                        item.getPriceSnapshot().setScale(0, RoundingMode.HALF_UP)
                );
            } else {
                priceHtml = String.format("&#8377;%s", item.getPriceSnapshot().setScale(0, RoundingMode.HALF_UP));
            }

            itemsHtml.append(String.format("""
                <tr>
                    <td style="padding: 16px 0; border-bottom: 1px solid #F5E6E0;">
                        <table cellpadding="0" cellspacing="0" border="0" width="100%%">
                            <tr>
                                <td style="width: 70px; vertical-align: top;">
                                    <img src="%s" alt="%s" style="width: 64px; height: 64px; object-fit: cover; border-radius: 10px; display: block;" />
                                </td>
                                <td style="padding-left: 14px; vertical-align: top;">
                                    <p style="margin: 0 0 4px 0; font-weight: 600; color: #2D2D2D; font-size: 14px;">%s</p>
                                    <p style="margin: 0; color: #6B6B6B; font-size: 13px;">Qty: %d &times; %s</p>
                                </td>
                                <td style="text-align: right; vertical-align: top; white-space: nowrap;">
                                    <span style="font-weight: 700; color: #2D2D2D; font-size: 15px;">&#8377;%s</span>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                """,
                imageUrl,
                item.getNameSnapshot(),
                item.getNameSnapshot(),
                item.getQty(),
                priceHtml,
                item.getSubtotal().setScale(0, RoundingMode.HALF_UP)
            ));
        }

        // Shipping address section
        String shippingHtml = "";
        if (order.getShippingAddress() != null && !order.getShippingAddress().isBlank()) {
            shippingHtml = String.format("""
                <!-- Shipping Address -->
                <div style="margin: 0 30px 20px 30px; background-color: #F8F9FA; border-radius: 12px; padding: 20px; border-left: 4px solid #E9868B;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%%%%">
                        <tr>
                            <td style="vertical-align: top; padding-right: 12px;">
                                <span style="font-size: 20px;">&#128205;</span>
                            </td>
                            <td>
                                <p style="margin: 0 0 6px 0; font-weight: 700; color: #2D2D2D; font-size: 14px;">Shipping Address</p>
                                <p style="margin: 0; color: #6B6B6B; font-size: 13px; line-height: 1.5;">%s</p>
                            </td>
                        </tr>
                    </table>
                </div>
                """, order.getShippingAddress().replace("\n", "<br>"));
        }

        // Savings row
        String savingsHtml = "";
        if (totalSavings.compareTo(BigDecimal.ZERO) > 0) {
            savingsHtml = String.format("""
                <tr>
                    <td style="padding: 8px 0; color: #4CAF50; font-weight: 600;">You Saved</td>
                    <td style="padding: 8px 0; text-align: right; color: #4CAF50; font-weight: 700;">&#8377;%s</td>
                </tr>
                """, totalSavings.setScale(0, RoundingMode.HALF_UP));
        }

        String estimatedDelivery = LocalDate.now().plusDays(5).format(DateTimeFormatter.ofPattern("d MMM yyyy"))
                + " - " + LocalDate.now().plusDays(7).format(DateTimeFormatter.ofPattern("d MMM yyyy"));

        String baseUrl = frontendUrl.split(",")[0].trim();
        String orderLink = baseUrl + "/orders/" + order.getId();

        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #FAF7F2; margin: 0; padding: 20px 0;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                    
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #E9868B 0%%, #D4726F 100%%); padding: 40px 30px; text-align: center;">
                        <h1 style="color: #FFFFFF; margin: 0 0 6px 0; font-size: 34px; letter-spacing: 4px; font-weight: 700;">JAEE</h1>
                        <p style="color: rgba(255,255,255,0.85); margin: 0; font-size: 13px; letter-spacing: 1px;">Premium Candles & Home Decor</p>
                    </div>
                    
                    <!-- Success Banner -->
                    <div style="text-align: center; padding: 32px 30px 0 30px;">
                        <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #E8F5E9 0%%, #C8E6C9 100%%); border-radius: 50%%; margin: 0 auto 16px auto; line-height: 64px; text-align: center;">
                            <span style="font-size: 32px; line-height: 64px;">&#10004;</span>
                        </div>
                        <h2 style="color: #2D2D2D; margin: 0 0 6px 0; font-size: 26px; font-weight: 700;">Order Confirmed!</h2>
                        <p style="color: #6B6B6B; margin: 0; font-size: 15px;">Thank you for shopping with us, we appreciate your trust.</p>
                    </div>
                    
                    <!-- Order Number Card -->
                    <div style="margin: 24px 30px; background: linear-gradient(135deg, #FFF5F5 0%%, #F5E6E0 100%%); border-radius: 14px; padding: 20px; text-align: center;">
                        <p style="margin: 0 0 4px 0; color: #6B6B6B; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px;">Order Number</p>
                        <p style="margin: 0; color: #E9868B; font-size: 30px; font-weight: 800;">#%d</p>
                    </div>

                    <!-- Estimated Delivery -->
                    <div style="margin: 0 30px 20px 30px; background-color: #F0F7FF; border-radius: 12px; padding: 16px 20px; border-left: 4px solid #4A90D9;">
                        <table cellpadding="0" cellspacing="0" border="0" width="100%%%%">
                            <tr>
                                <td style="vertical-align: middle; padding-right: 12px;">
                                    <span style="font-size: 20px;">&#128666;</span>
                                </td>
                                <td>
                                    <p style="margin: 0 0 2px 0; font-weight: 700; color: #2D2D2D; font-size: 13px;">Estimated Delivery</p>
                                    <p style="margin: 0; color: #4A90D9; font-size: 14px; font-weight: 600;">%s</p>
                                </td>
                            </tr>
                        </table>
                    </div>

                    %s
                    
                    <!-- Order Items -->
                    <div style="padding: 0 30px;">
                        <h3 style="color: #2D2D2D; font-size: 15px; margin: 20px 0 12px 0; padding-bottom: 10px; border-bottom: 2px solid #E9868B; letter-spacing: 0.5px;">
                            YOUR ITEMS
                        </h3>
                        <table style="width: 100%%; border-collapse: collapse;">
                            %s
                        </table>
                        
                        <!-- Totals -->
                        <div style="margin-top: 16px; padding-top: 16px; border-top: 2px dashed #F0E6E0;">
                            <table style="width: 100%%;">
                                <tr>
                                    <td style="padding: 6px 0; color: #6B6B6B; font-size: 14px;">Subtotal</td>
                                    <td style="padding: 6px 0; text-align: right; color: #2D2D2D; font-size: 14px;">&#8377;%s</td>
                                </tr>
                                %s
                                <tr>
                                    <td style="padding: 6px 0; color: #6B6B6B; font-size: 14px;">Shipping</td>
                                    <td style="padding: 6px 0; text-align: right; color: #4CAF50; font-weight: 600; font-size: 14px;">FREE</td>
                                </tr>
                                <tr>
                                    <td colspan="2" style="padding: 8px 0 0 0;"><div style="border-top: 1px solid #E0E0E0;"></div></td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 0 6px 0; font-size: 18px; font-weight: 800; color: #2D2D2D;">Total Paid</td>
                                    <td style="padding: 12px 0 6px 0; text-align: right; font-size: 22px; font-weight: 800; color: #E9868B;">&#8377;%s</td>
                                </tr>
                            </table>
                        </div>
                    </div>
                    
                    <!-- CTA Button -->
                    <div style="padding: 30px; text-align: center;">
                        <a href="%s" style="display: inline-block; background: linear-gradient(135deg, #E9868B 0%%, #D4726F 100%%); color: #FFFFFF; text-decoration: none; padding: 14px 36px; border-radius: 30px; font-weight: 700; font-size: 14px; box-shadow: 0 4px 15px rgba(233, 134, 139, 0.3); letter-spacing: 0.5px;">
                            View Order Details &#8594;
                        </a>
                    </div>
                    
                    <!-- What's Next -->
                    <div style="background-color: #FAF7F2; padding: 24px 30px; margin: 0 30px; border-radius: 14px;">
                        <h3 style="margin: 0 0 16px 0; color: #2D2D2D; font-size: 15px; font-weight: 700;">What Happens Next?</h3>
                        <table cellpadding="0" cellspacing="0" border="0" width="100%%%%">
                            <tr>
                                <td style="padding-bottom: 14px;">
                                    <table cellpadding="0" cellspacing="0" border="0">
                                        <tr>
                                            <td style="width: 28px; vertical-align: top;">
                                                <div style="background-color: #E9868B; color: white; width: 24px; height: 24px; border-radius: 50%%; text-align: center; line-height: 24px; font-size: 12px; font-weight: 700;">1</div>
                                            </td>
                                            <td style="padding-left: 10px; color: #6B6B6B; font-size: 13px; line-height: 1.4;">We're carefully preparing your order with love</td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding-bottom: 14px;">
                                    <table cellpadding="0" cellspacing="0" border="0">
                                        <tr>
                                            <td style="width: 28px; vertical-align: top;">
                                                <div style="background-color: #F5E6E0; color: #E9868B; width: 24px; height: 24px; border-radius: 50%%; text-align: center; line-height: 24px; font-size: 12px; font-weight: 700;">2</div>
                                            </td>
                                            <td style="padding-left: 10px; color: #6B6B6B; font-size: 13px; line-height: 1.4;">You'll receive a shipping confirmation with tracking</td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <table cellpadding="0" cellspacing="0" border="0">
                                        <tr>
                                            <td style="width: 28px; vertical-align: top;">
                                                <div style="background-color: #F5E6E0; color: #E9868B; width: 24px; height: 24px; border-radius: 50%%; text-align: center; line-height: 24px; font-size: 12px; font-weight: 700;">3</div>
                                            </td>
                                            <td style="padding-left: 10px; color: #6B6B6B; font-size: 13px; line-height: 1.4;">Your beautiful products arrive at your doorstep!</td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </div>
                    
                    <!-- Footer -->
                    <div style="padding: 28px 30px; text-align: center; border-top: 1px solid #F5E6E0; margin-top: 28px;">
                        <p style="margin: 0 0 8px 0; color: #2D2D2D; font-weight: 700; font-size: 14px;">Need Help?</p>
                        <p style="margin: 0 0 20px 0; color: #6B6B6B; font-size: 13px; line-height: 1.5;">
                            Reply to this email or write to us at
                            <a href="mailto:support@jaee.com" style="color: #E9868B; text-decoration: none; font-weight: 600;">support@jaee.com</a>
                        </p>
                        <p style="margin: 0; color: #BBBBBB; font-size: 11px;">
                            &copy; 2026 Jaee &middot; Made with &#10084; in India &middot; Premium Candles & Home Decor
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """,
            order.getId(),
            estimatedDelivery,
            shippingHtml,
            itemsHtml.toString(),
            order.getTotalAmount().setScale(0, RoundingMode.HALF_UP),
            savingsHtml,
            order.getTotalAmount().setScale(0, RoundingMode.HALF_UP),
            orderLink
        );
    }
}
