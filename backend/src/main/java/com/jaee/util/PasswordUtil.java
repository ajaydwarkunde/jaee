package com.jaee.util;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

/**
 * Utility for decoding client-side encoded passwords.
 * Passwords prefixed with "enc:" are Base64 encoded by the frontend
 * to prevent plaintext visibility in browser DevTools Network tab.
 */
public class PasswordUtil {

    private static final String ENCODING_PREFIX = "enc:";

    /**
     * Decode a password if it was encoded by the frontend.
     * Supports both encoded (prefixed with "enc:") and plain passwords
     * for backwards compatibility.
     */
    public static String decodeIfEncoded(String password) {
        if (password != null && password.startsWith(ENCODING_PREFIX)) {
            String encoded = password.substring(ENCODING_PREFIX.length());
            byte[] decoded = Base64.getDecoder().decode(encoded);
            return new String(decoded, StandardCharsets.UTF_8);
        }
        return password;
    }

    private PasswordUtil() {
        // Utility class
    }
}
