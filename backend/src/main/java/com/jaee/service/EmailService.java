package com.jaee.service;

import com.jaee.entity.Order;
import com.jaee.entity.OrderItem;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.email.from}")
    private String fromEmail;

    @Value("${app.email.from-name}")
    private String fromName;

    @Value("${app.email.enabled:true}")
    private boolean emailEnabled;

    @Async
    public void sendOrderConfirmation(Order order) {
        if (!emailEnabled || order.getCustomerEmail() == null) {
            log.info("Email disabled or no customer email for order {}", order.getId());
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, fromName);
            helper.setTo(order.getCustomerEmail());
            helper.setSubject("Order Confirmation - Jaee #" + order.getId());
            helper.setText(buildOrderConfirmationHtml(order), true);

            mailSender.send(message);
            log.info("Order confirmation email sent to {} for order {}", order.getCustomerEmail(), order.getId());
        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            log.error("Failed to send order confirmation email: {}", e.getMessage());
        }
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
                item.getSubtotal().setScale(2, BigDecimal.ROUND_HALF_UP)
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
                        <p style="font-size: 16px; color: #2D2D2D;">Thank you for your order! 💕</p>
                        
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
                        <p>© 2024 Jaee. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """,
            order.getId(),
            itemsHtml.toString(),
            order.getTotalAmount().setScale(2, BigDecimal.ROUND_HALF_UP)
        );
    }
}
