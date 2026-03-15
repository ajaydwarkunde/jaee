package com.jaee.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;

import java.lang.reflect.Field;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JwtServiceTest {

    private static final String TEST_SECRET = "test-secret-key-at-least-32-chars-long";
    private static final long ACCESS_EXPIRATION_MS = 86400000L;
    private static final long REFRESH_EXPIRATION_MS = 604800000L;

    private JwtService jwtService;

    @Mock
    private UserDetails userDetails;

    @BeforeEach
    void setUp() throws Exception {
        jwtService = new JwtService();
        setField(jwtService, "secretKey", TEST_SECRET);
        setField(jwtService, "accessExpirationMs", ACCESS_EXPIRATION_MS);
        setField(jwtService, "refreshExpirationMs", REFRESH_EXPIRATION_MS);
    }

    private void setField(Object target, String fieldName, Object value) throws Exception {
        Field field = target.getClass().getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(target, value);
    }

    @Test
    void generateAccessTokenAndExtractUsername() {
        when(userDetails.getUsername()).thenReturn("user@example.com");
        String token = jwtService.generateAccessToken(userDetails);
        assertEquals("user@example.com", jwtService.extractUsername(token));
    }

    @Test
    void generateAccessTokenWithExtraClaims() {
        when(userDetails.getUsername()).thenReturn("user@example.com");
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("customKey", "customValue");
        String token = jwtService.generateAccessToken(extraClaims, userDetails);
        assertEquals("user@example.com", jwtService.extractUsername(token));
        assertEquals("customValue", jwtService.extractClaim(token, claims -> claims.get("customKey", String.class)));
    }

    @Test
    void generateRefreshToken() {
        when(userDetails.getUsername()).thenReturn("user@example.com");
        String token = jwtService.generateRefreshToken(userDetails);
        assertEquals("user@example.com", jwtService.extractUsername(token));
    }

    @Test
    void tokenValidationSucceedsWithCorrectUser() {
        when(userDetails.getUsername()).thenReturn("user@example.com");
        String token = jwtService.generateAccessToken(userDetails);
        assertTrue(jwtService.isTokenValid(token, userDetails));
    }

    @Test
    void tokenValidationFailsWithWrongUser() {
        when(userDetails.getUsername()).thenReturn("user@example.com");
        String token = jwtService.generateAccessToken(userDetails);
        UserDetails wrongUser = org.springframework.security.core.userdetails.User
                .withUsername("other@example.com")
                .password("password")
                .authorities("ROLE_USER")
                .build();
        assertFalse(jwtService.isTokenValid(token, wrongUser));
    }

    @Test
    void tokenExpirationCheck() throws Exception {
        setField(jwtService, "accessExpirationMs", 1L);
        when(userDetails.getUsername()).thenReturn("user@example.com");
        String token = jwtService.generateAccessToken(userDetails);
        Thread.sleep(10);
        assertThrows(io.jsonwebtoken.ExpiredJwtException.class,
                () -> jwtService.isTokenValid(token, userDetails));
    }

    @Test
    void generateAndValidatePasswordResetToken() {
        String email = "user@example.com";
        String token = jwtService.generatePasswordResetToken(email);
        assertEquals(email, jwtService.validatePasswordResetToken(token));
    }

    @Test
    void validatePasswordResetTokenReturnsNullForExpiredToken() {
        String email = "user@example.com";
        String expiredToken = Jwts.builder()
                .claim("type", "password_reset")
                .subject(email)
                .issuedAt(new java.util.Date(System.currentTimeMillis() - 20000))
                .expiration(new java.util.Date(System.currentTimeMillis() - 10000))
                .signWith(Keys.hmacShaKeyFor(TEST_SECRET.getBytes()))
                .compact();
        assertNull(jwtService.validatePasswordResetToken(expiredToken));
    }

    @Test
    void validatePasswordResetTokenReturnsNullForWrongType() {
        when(userDetails.getUsername()).thenReturn("user@example.com");
        String accessToken = jwtService.generateAccessToken(userDetails);
        assertNull(jwtService.validatePasswordResetToken(accessToken));
    }

    @Test
    void getRefreshExpirationMsReturnsConfiguredValue() {
        assertEquals(REFRESH_EXPIRATION_MS, jwtService.getRefreshExpirationMs());
    }
}
