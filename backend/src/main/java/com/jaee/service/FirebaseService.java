package com.jaee.service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class FirebaseService {

    private final FirebaseAuth firebaseAuth;

    @Value("${app.firebase.enabled:false}")
    private boolean firebaseEnabled;

    /**
     * Verify Firebase ID token and extract phone number
     * @param idToken The Firebase ID token from client
     * @return The verified phone number, or null if verification fails/disabled
     */
    public String verifyPhoneToken(String idToken) {
        if (!firebaseEnabled) {
            log.debug("Firebase disabled - skipping phone token verification");
            return null;
        }

        if (firebaseAuth == null) {
            log.warn("FirebaseAuth not initialized - skipping verification");
            return null;
        }

        if (idToken == null || idToken.isBlank()) {
            log.warn("Empty Firebase token provided");
            return null;
        }

        try {
            FirebaseToken decodedToken = firebaseAuth.verifyIdToken(idToken);
            String phoneNumber = decodedToken.getClaims().get("phone_number") != null 
                ? decodedToken.getClaims().get("phone_number").toString() 
                : null;

            if (phoneNumber != null) {
                log.info("Firebase phone verification successful for: {}", maskPhone(phoneNumber));
                return phoneNumber;
            } else {
                log.warn("Firebase token verified but no phone_number claim found");
                return null;
            }
        } catch (FirebaseAuthException e) {
            log.error("Firebase token verification failed: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Check if a phone number matches the one from Firebase token
     * @param idToken Firebase ID token
     * @param expectedPhone The phone number user claims to have
     * @return true if phone matches, false otherwise
     */
    public boolean verifyPhoneMatches(String idToken, String expectedPhone) {
        String verifiedPhone = verifyPhoneToken(idToken);
        
        if (verifiedPhone == null) {
            // If Firebase is disabled, we trust the phone number
            // In production, you should enable Firebase
            return !firebaseEnabled;
        }

        // Normalize both numbers for comparison (remove spaces, hyphens)
        String normalizedVerified = normalizePhone(verifiedPhone);
        String normalizedExpected = normalizePhone(expectedPhone);

        boolean matches = normalizedVerified.equals(normalizedExpected);
        if (!matches) {
            log.warn("Phone number mismatch - verified: {}, expected: {}", 
                maskPhone(verifiedPhone), maskPhone(expectedPhone));
        }
        return matches;
    }

    /**
     * Check if Firebase verification is enabled
     */
    public boolean isEnabled() {
        return firebaseEnabled && firebaseAuth != null;
    }

    private String normalizePhone(String phone) {
        if (phone == null) return "";
        // Remove all non-digits except the leading +
        String normalized = phone.replaceAll("[^+\\d]", "");
        // Ensure it starts with +91 for Indian numbers
        if (!normalized.startsWith("+") && normalized.length() == 10) {
            normalized = "+91" + normalized;
        }
        return normalized;
    }

    private String maskPhone(String phone) {
        if (phone == null || phone.length() < 4) return "****";
        return phone.substring(0, phone.length() - 4) + "****";
    }
}
