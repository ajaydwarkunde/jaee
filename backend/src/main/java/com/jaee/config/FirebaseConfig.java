package com.jaee.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Configuration
@Slf4j
public class FirebaseConfig {

    @Value("${app.firebase.credentials:}")
    private String firebaseCredentials;

    @Value("${app.firebase.enabled:false}")
    private boolean firebaseEnabled;

    @PostConstruct
    public void initialize() {
        if (!firebaseEnabled) {
            log.info("Firebase is disabled. Phone verification will skip Firebase token validation.");
            return;
        }

        if (firebaseCredentials == null || firebaseCredentials.isBlank()) {
            log.warn("Firebase credentials not configured. Set FIREBASE_CREDENTIALS env var with base64 encoded service account JSON.");
            return;
        }

        try {
            // Decode base64 credentials
            String credentialsJson = new String(
                Base64.getDecoder().decode(firebaseCredentials),
                StandardCharsets.UTF_8
            );

            GoogleCredentials credentials = GoogleCredentials.fromStream(
                new ByteArrayInputStream(credentialsJson.getBytes(StandardCharsets.UTF_8))
            );

            FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(credentials)
                .build();

            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
                log.info("Firebase Admin SDK initialized successfully");
            }
        } catch (IllegalArgumentException e) {
            log.error("Invalid Firebase credentials (bad base64 encoding): {}", e.getMessage());
            log.warn("Firebase will be disabled. Phone verification will be skipped.");
        } catch (IOException e) {
            log.error("Failed to initialize Firebase Admin SDK: {}", e.getMessage());
            log.warn("Firebase will be disabled. Phone verification will be skipped.");
        } catch (Exception e) {
            log.error("Unexpected error initializing Firebase: {}", e.getMessage());
            log.warn("Firebase will be disabled. Phone verification will be skipped.");
        }
    }

    @Bean
    public FirebaseAuth firebaseAuth() {
        if (!firebaseEnabled || FirebaseApp.getApps().isEmpty()) {
            return null;
        }
        return FirebaseAuth.getInstance();
    }
}
