package com.jaee.service;

import com.jaee.dto.auth.AuthResponse;
import com.jaee.dto.auth.LoginRequest;
import com.jaee.dto.auth.RefreshTokenRequest;
import com.jaee.dto.auth.RegisterRequest;
import com.jaee.entity.RefreshToken;
import com.jaee.entity.User;
import com.jaee.exception.BadRequestException;
import com.jaee.exception.UnauthorizedException;
import com.jaee.repository.RefreshTokenRepository;
import com.jaee.repository.UserRepository;
import com.jaee.security.JwtService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private FirebaseService firebaseService;

    @InjectMocks
    private AuthService authService;

    @Test
    void registerSuccessWhenFirebaseDisabled() {
        when(firebaseService.isEnabled()).thenReturn(false);
        when(userRepository.existsByEmail("user@example.com")).thenReturn(false);
        when(userRepository.findByMobileNumber("+919876543210")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("password123")).thenReturn("encoded");
        when(jwtService.getRefreshExpirationMs()).thenReturn(604800000L);
        when(jwtService.generateAccessToken(any(User.class))).thenReturn("access-token");

        RegisterRequest request = new RegisterRequest();
        request.setName("Test User");
        request.setEmail("user@example.com");
        request.setMobileNumber("+919876543210");
        request.setPassword("password123");

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("access-token", response.getAccessToken());
        assertNotNull(response.getRefreshToken());
        assertNotNull(response.getUser());
        assertEquals("Test User", response.getUser().getName());
        assertEquals("user@example.com", response.getUser().getEmail());
        assertEquals("+919876543210", response.getUser().getMobileNumber());
        assertEquals("USER", response.getUser().getRole());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void registerThrowsWhenEmailExists() {
        when(userRepository.existsByEmail("user@example.com")).thenReturn(true);

        RegisterRequest request = new RegisterRequest();
        request.setName("Test User");
        request.setEmail("user@example.com");
        request.setMobileNumber("+919876543210");
        request.setPassword("password123");

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Email is already registered");
        verify(userRepository, never()).save(any());
    }

    @Test
    void registerThrowsWhenMobileExists() {
        when(userRepository.existsByEmail("user@example.com")).thenReturn(false);
        when(userRepository.findByMobileNumber("+919876543210")).thenReturn(Optional.of(new User()));

        RegisterRequest request = new RegisterRequest();
        request.setName("Test User");
        request.setEmail("user@example.com");
        request.setMobileNumber("+919876543210");
        request.setPassword("password123");

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Mobile number is already registered");
        verify(userRepository, never()).save(any());
    }

    @Test
    void loginSuccess() {
        when(authenticationManager.authenticate(any())).thenReturn(null);
        User user = User.builder()
                .id(1L)
                .name("Test User")
                .email("user@example.com")
                .mobileNumber("+919876543210")
                .role(User.Role.USER)
                .build();
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(jwtService.getRefreshExpirationMs()).thenReturn(604800000L);
        when(jwtService.generateAccessToken(any(User.class))).thenReturn("access-token");

        LoginRequest request = new LoginRequest();
        request.setEmail("user@example.com");
        request.setPassword("password123");

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("access-token", response.getAccessToken());
        assertNotNull(response.getRefreshToken());
        assertEquals(1L, response.getUser().getId());
        assertEquals("user@example.com", response.getUser().getEmail());
    }

    @Test
    void loginThrowsWhenInvalidCredentials() {
        when(authenticationManager.authenticate(any())).thenThrow(new BadCredentialsException("Bad credentials"));

        LoginRequest request = new LoginRequest();
        request.setEmail("user@example.com");
        request.setPassword("wrong");

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessageContaining("Bad credentials");
        verify(userRepository, never()).findByEmail(anyString());
    }

    @Test
    void refreshTokenSuccess() {
        User user = User.builder()
                .id(1L)
                .name("Test User")
                .email("user@example.com")
                .mobileNumber("+919876543210")
                .role(User.Role.USER)
                .build();
        RefreshToken refreshToken = RefreshToken.builder()
                .id(1L)
                .token("valid-refresh-token")
                .user(user)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .revoked(false)
                .build();
        when(refreshTokenRepository.findByToken("valid-refresh-token")).thenReturn(Optional.of(refreshToken));
        when(jwtService.getRefreshExpirationMs()).thenReturn(604800000L);
        when(jwtService.generateAccessToken(any(User.class))).thenReturn("new-access-token");

        RefreshTokenRequest request = new RefreshTokenRequest();
        request.setRefreshToken("valid-refresh-token");

        AuthResponse response = authService.refreshToken(request);

        assertNotNull(response);
        assertEquals("new-access-token", response.getAccessToken());
        verify(refreshTokenRepository).save(refreshToken);
        assertTrue(refreshToken.getRevoked());
    }

    @Test
    void refreshTokenThrowsWhenInvalid() {
        when(refreshTokenRepository.findByToken("invalid-token")).thenReturn(Optional.empty());

        RefreshTokenRequest request = new RefreshTokenRequest();
        request.setRefreshToken("invalid-token");

        assertThatThrownBy(() -> authService.refreshToken(request))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Invalid refresh token");
    }

    @Test
    void refreshTokenThrowsWhenExpired() {
        RefreshToken refreshToken = RefreshToken.builder()
                .id(1L)
                .token("expired-token")
                .user(User.builder().id(1L).email("user@example.com").build())
                .expiresAt(LocalDateTime.now().minusDays(1))
                .revoked(false)
                .build();
        when(refreshTokenRepository.findByToken("expired-token")).thenReturn(Optional.of(refreshToken));

        RefreshTokenRequest request = new RefreshTokenRequest();
        request.setRefreshToken("expired-token");

        assertThatThrownBy(() -> authService.refreshToken(request))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Refresh token expired or revoked");
        verify(refreshTokenRepository).delete(refreshToken);
    }

    @Test
    void logoutRevokesRefreshToken() {
        User user = User.builder().id(1L).email("user@example.com").build();
        RefreshToken refreshToken = RefreshToken.builder()
                .id(1L)
                .token("refresh-token")
                .user(user)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .revoked(false)
                .build();
        when(refreshTokenRepository.findByToken("refresh-token")).thenReturn(Optional.of(refreshToken));

        authService.logout(user, "refresh-token");

        assertTrue(refreshToken.getRevoked());
        verify(refreshTokenRepository).save(refreshToken);
    }

    @Test
    void logoutWithNullRefreshTokenDoesNotThrow() {
        User user = User.builder().id(1L).email("user@example.com").build();

        assertDoesNotThrow(() -> authService.logout(user, null));
        verify(refreshTokenRepository, never()).findByToken(any());
    }
}
