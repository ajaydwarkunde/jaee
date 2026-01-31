package com.jaee.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class SmsService {

    @Value("${app.sms.twilio.account-sid:}")
    private String accountSid;

    @Value("${app.sms.twilio.auth-token:}")
    private String authToken;

    @Value("${app.sms.twilio.phone-number:}")
    private String twilioPhoneNumber;

    @Value("${app.sms.enabled:true}")
    private boolean smsEnabled;

    private boolean twilioInitialized = false;

    @PostConstruct
    public void init() {
        if (smsEnabled && !accountSid.isBlank() && !authToken.isBlank()) {
            try {
                Twilio.init(accountSid, authToken);
                twilioInitialized = true;
                log.info("Twilio SMS service initialized");
            } catch (Exception e) {
                log.warn("Failed to initialize Twilio: {}. SMS will be logged to console.", e.getMessage());
            }
        } else {
            log.info("SMS service disabled or credentials not configured. OTPs will be logged to console.");
        }
    }

    /**
     * Send OTP via SMS
     * @return true if SMS was actually sent, false otherwise
     */
    public boolean sendOtp(String to, String otp) {
        String messageBody = "Your Jaee verification code is: " + otp + ". Valid for 5 minutes.";

        if (twilioInitialized && smsEnabled) {
            try {
                Message message = Message.creator(
                        new PhoneNumber(to),
                        new PhoneNumber(twilioPhoneNumber),
                        messageBody
                ).create();
                log.info("SMS sent to {}, SID: {}", maskPhone(to), message.getSid());
                return true;
            } catch (Exception e) {
                log.error("Failed to send SMS to {}: {}", maskPhone(to), e.getMessage());
                log.warn("📱 FALLBACK - OTP for {}: {}", to, otp);
                return false;
            }
        } else {
            log.warn("📱 SMS NOT SENT (disabled/not configured) - OTP for {}: {}", to, otp);
            return false;
        }
    }

    private String maskPhone(String phone) {
        if (phone.length() <= 4) return "****";
        return phone.substring(0, phone.length() - 4) + "****";
    }
}
