package com.jaee.service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class FirebaseService {

    @Autowired(required = false)
    private FirebaseAuth firebaseAuth;

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
     * Verify a Firebase ID token from social login and extract user profile.
     * Returns null if verification fails or Firebase is disabled.
     */
    public SocialProfile verifySocialToken(String idToken) {
        if (!firebaseEnabled || firebaseAuth == null) {
            log.warn("Firebase not available for social login verification");
            return null;
        }

        if (idToken == null || idToken.isBlank()) {
            log.warn("Empty Firebase token for social login");
            return null;
        }

        try {
            FirebaseToken decoded = firebaseAuth.verifyIdToken(idToken);
            String email = decoded.getEmail();
            String name = decoded.getName();
            String uid = decoded.getUid();
            String picture = decoded.getPicture();

            if (email == null || email.isBlank()) {
                log.warn("Social login token has no email claim");
                return null;
            }

            log.info("Social login verified for: {}", email);
            return new SocialProfile(uid, email, name, picture);
        } catch (FirebaseAuthException e) {
            log.error("Social login token verification failed: {}", e.getMessage());
            return null;
        }
    }

    public record SocialProfile(String uid, String email, String name, String picture) {}

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
