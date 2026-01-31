package com.jaee.service;

import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;

@Service
public class TotpService {

    private static final int SECRET_LENGTH = 20;
    private static final int CODE_DIGITS = 6;
    private static final int TIME_STEP_SECONDS = 30;
    private static final String ALGORITHM = "HmacSHA1";
    private static final String ISSUER = "Jaee";

    private final SecureRandom secureRandom = new SecureRandom();

    /**
     * Generate a new TOTP secret key
     */
    public String generateSecret() {
        byte[] bytes = new byte[SECRET_LENGTH];
        secureRandom.nextBytes(bytes);
        return Base64.getEncoder().encodeToString(bytes);
    }

    /**
     * Generate the QR code URL for Google Authenticator
     */
    public String generateQrCodeUrl(String secret, String email) {
        String encodedIssuer = URLEncoder.encode(ISSUER, StandardCharsets.UTF_8);
        String encodedEmail = URLEncoder.encode(email, StandardCharsets.UTF_8);
        
        // Convert base64 secret to base32 for Google Authenticator compatibility
        String base32Secret = base64ToBase32(secret);
        
        String otpAuthUrl = String.format(
            "otpauth://totp/%s:%s?secret=%s&issuer=%s&algorithm=SHA1&digits=%d&period=%d",
            encodedIssuer, encodedEmail, base32Secret, encodedIssuer, CODE_DIGITS, TIME_STEP_SECONDS
        );
        
        // Return URL for QR code generation (using Google Charts API)
        return String.format(
            "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=%s",
            URLEncoder.encode(otpAuthUrl, StandardCharsets.UTF_8)
        );
    }

    /**
     * Get the manual entry key (base32 encoded) for authenticator apps
     */
    public String getManualEntryKey(String secret) {
        return base64ToBase32(secret);
    }

    /**
     * Verify a TOTP code against the secret
     */
    public boolean verifyCode(String secret, String code) {
        if (secret == null || code == null || code.length() != CODE_DIGITS) {
            return false;
        }

        try {
            int providedCode = Integer.parseInt(code);
            long currentTimeStep = System.currentTimeMillis() / 1000 / TIME_STEP_SECONDS;

            // Check current time step and one step before/after for clock skew tolerance
            for (int i = -1; i <= 1; i++) {
                int expectedCode = generateCode(secret, currentTimeStep + i);
                if (expectedCode == providedCode) {
                    return true;
                }
            }
        } catch (NumberFormatException e) {
            return false;
        }

        return false;
    }

    private int generateCode(String secret, long timeStep) {
        try {
            byte[] key = Base64.getDecoder().decode(secret);
            byte[] data = new byte[8];
            
            for (int i = 7; i >= 0; i--) {
                data[i] = (byte) (timeStep & 0xff);
                timeStep >>= 8;
            }

            Mac mac = Mac.getInstance(ALGORITHM);
            mac.init(new SecretKeySpec(key, ALGORITHM));
            byte[] hash = mac.doFinal(data);

            int offset = hash[hash.length - 1] & 0xf;
            int binary = ((hash[offset] & 0x7f) << 24)
                    | ((hash[offset + 1] & 0xff) << 16)
                    | ((hash[offset + 2] & 0xff) << 8)
                    | (hash[offset + 3] & 0xff);

            return binary % (int) Math.pow(10, CODE_DIGITS);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new RuntimeException("Error generating TOTP code", e);
        }
    }

    /**
     * Convert base64 to base32 encoding (required for most authenticator apps)
     */
    private String base64ToBase32(String base64) {
        byte[] bytes = Base64.getDecoder().decode(base64);
        return encodeBase32(bytes);
    }

    private static final String BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

    private String encodeBase32(byte[] data) {
        StringBuilder result = new StringBuilder();
        int buffer = 0;
        int bitsLeft = 0;

        for (byte b : data) {
            buffer = (buffer << 8) | (b & 0xff);
            bitsLeft += 8;

            while (bitsLeft >= 5) {
                int index = (buffer >> (bitsLeft - 5)) & 0x1f;
                result.append(BASE32_ALPHABET.charAt(index));
                bitsLeft -= 5;
            }
        }

        if (bitsLeft > 0) {
            int index = (buffer << (5 - bitsLeft)) & 0x1f;
            result.append(BASE32_ALPHABET.charAt(index));
        }

        return result.toString();
    }
}
