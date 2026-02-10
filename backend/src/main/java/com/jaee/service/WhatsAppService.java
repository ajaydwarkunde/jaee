package com.jaee.service;

import com.jaee.entity.Order;
import com.jaee.entity.OrderItem;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.RoundingMode;
import java.time.format.DateTimeFormatter;

@Service
@Slf4j
public class WhatsAppService {

    @Value("${app.sms.twilio.account-sid:}")
    private String accountSid;

    @Value("${app.sms.twilio.auth-token:}")
    private String authToken;

    @Value("${app.whatsapp.from-number:}")
    private String whatsappFromNumber;

    @Value("${app.whatsapp.enabled:false}")
    private boolean whatsappEnabled;

    private boolean twilioInitialized = false;

    @PostConstruct
    public void init() {
        if (whatsappEnabled && !accountSid.isBlank() && !authToken.isBlank() && !whatsappFromNumber.isBlank()) {
            try {
                Twilio.init(accountSid, authToken);
                twilioInitialized = true;
                log.info("WhatsApp service initialized with number: {}", whatsappFromNumber);
            } catch (Exception e) {
                log.warn("Failed to initialize WhatsApp service: {}", e.getMessage());
            }
        } else {
            log.info("WhatsApp service disabled or credentials not configured.");
        }
    }

    /**
     * Send order confirmation via WhatsApp
     * @return true if message was sent successfully
     */
    public boolean sendOrderConfirmation(Order order) {
        String customerPhone = order.getCustomerPhone();
        
        if (customerPhone == null || customerPhone.isBlank()) {
            log.debug("No phone number for order {}, skipping WhatsApp", order.getId());
            return false;
        }

        String normalizedPhone = normalizePhoneNumber(customerPhone);
        String messageBody = buildOrderConfirmationMessage(order);

        if (twilioInitialized && whatsappEnabled) {
            try {
                Message message = Message.creator(
                        new PhoneNumber("whatsapp:" + normalizedPhone),
                        new PhoneNumber("whatsapp:" + whatsappFromNumber),
                        messageBody
                ).create();
                
                log.info("WhatsApp sent to {} for order {}, SID: {}", 
                        maskPhone(normalizedPhone), order.getId(), message.getSid());
                return true;
            } catch (Exception e) {
                log.error("Failed to send WhatsApp to {} for order {}: {}", 
                        maskPhone(normalizedPhone), order.getId(), e.getMessage());
                return false;
            }
        } else {
            log.debug("WhatsApp not configured. Would send to {}: {}", normalizedPhone, messageBody);
            return false;
        }
    }

    /**
     * Send order shipped notification via WhatsApp
     */
    public boolean sendShippingNotification(Order order, String trackingNumber, String courierName) {
        String customerPhone = order.getCustomerPhone();
        
        if (customerPhone == null || customerPhone.isBlank()) {
            return false;
        }

        String normalizedPhone = normalizePhoneNumber(customerPhone);
        String messageBody = buildShippingMessage(order, trackingNumber, courierName);

        if (twilioInitialized && whatsappEnabled) {
            try {
                Message message = Message.creator(
                        new PhoneNumber("whatsapp:" + normalizedPhone),
                        new PhoneNumber("whatsapp:" + whatsappFromNumber),
                        messageBody
                ).create();
                
                log.info("WhatsApp shipping notification sent for order {}", order.getId());
                return true;
            } catch (Exception e) {
                log.error("Failed to send WhatsApp shipping notification: {}", e.getMessage());
                return false;
            }
        }
        return false;
    }

    private String buildOrderConfirmationMessage(Order order) {
        StringBuilder sb = new StringBuilder();
        
        sb.append("🎉 *Order Confirmed!*\n\n");
        sb.append("Hi").append(order.getUser().getName() != null ? " " + order.getUser().getName() : "").append(",\n");
        sb.append("Thank you for your order!\n\n");
        
        sb.append("📦 *Order #").append(order.getId()).append("*\n");
        sb.append("📅 ").append(order.getCreatedAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a"))).append("\n\n");
        
        sb.append("*Items:*\n");
        for (OrderItem item : order.getItems()) {
            sb.append("• ").append(item.getNameSnapshot())
              .append(" x").append(item.getQty())
              .append(" - ₹").append(item.getSubtotal().setScale(0, RoundingMode.HALF_UP))
              .append("\n");
        }
        
        sb.append("\n💰 *Total: ₹").append(order.getTotalAmount().setScale(0, RoundingMode.HALF_UP)).append("*\n\n");
        
        if (order.getShippingAddress() != null) {
            sb.append("📍 *Delivering to:*\n");
            sb.append(order.getShippingAddress()).append("\n\n");
        }
        
        sb.append("🚚 Expected delivery: 5-7 business days\n\n");
        sb.append("Questions? Reply to this message or email jaeestudio12@gmail.com\n\n");
        sb.append("Thank you for shopping with *Jaee*! 🕯️✨");
        
        return sb.toString();
    }

    private String buildShippingMessage(Order order, String trackingNumber, String courierName) {
        StringBuilder sb = new StringBuilder();
        
        sb.append("🚚 *Your order is on the way!*\n\n");
        sb.append("Order #").append(order.getId()).append(" has been shipped.\n\n");
        
        if (courierName != null && !courierName.isBlank()) {
            sb.append("📦 Courier: ").append(courierName).append("\n");
        }
        if (trackingNumber != null && !trackingNumber.isBlank()) {
            sb.append("🔍 Tracking: ").append(trackingNumber).append("\n");
        }
        
        sb.append("\n📍 Delivering to:\n").append(order.getShippingAddress()).append("\n\n");
        sb.append("Thank you for shopping with *Jaee*! 🕯️");
        
        return sb.toString();
    }

    private String normalizePhoneNumber(String phoneNumber) {
        String normalized = phoneNumber.replaceAll("[^+\\d]", "");
        if (!normalized.startsWith("+")) {
            normalized = "+91" + normalized;
        }
        return normalized;
    }

    private String maskPhone(String phone) {
        if (phone.length() <= 4) return "****";
        return phone.substring(0, phone.length() - 4) + "****";
    }

    public boolean isEnabled() {
        return whatsappEnabled && twilioInitialized;
    }
}
