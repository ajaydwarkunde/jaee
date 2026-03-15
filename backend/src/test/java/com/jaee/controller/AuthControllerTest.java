package com.jaee.controller;

import com.jaee.dto.auth.AuthResponse;
import com.jaee.dto.auth.LoginRequest;
import com.jaee.dto.auth.RefreshTokenRequest;
import com.jaee.dto.auth.RegisterRequest;
import com.jaee.exception.GlobalExceptionHandler;
import com.jaee.service.AuthService;
import com.jaee.service.EmailOtpService;
import com.jaee.service.EmailVerificationService;
import com.jaee.service.OtpService;
import com.jaee.service.UserService;
import com.jaee.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc(addFilters = false)
@org.springframework.context.annotation.Import(GlobalExceptionHandler.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthService authService;

    @MockBean
    private OtpService otpService;

    @MockBean
    private EmailOtpService emailOtpService;

    @MockBean
    private UserService userService;

    @MockBean
    private EmailVerificationService emailVerificationService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserDetailsService userDetailsService;

    @Test
    void register_success() throws Exception {
        AuthResponse.UserDto userDto = AuthResponse.UserDto.builder()
                .id(1L)
                .name("Test User")
                .email("test@example.com")
                .mobileNumber("+1234567890")
                .role("USER")
                .twoFactorEnabled(false)
                .build();
        AuthResponse authResponse = AuthResponse.builder()
                .accessToken("access-token")
                .refreshToken("refresh-token")
                .user(userDto)
                .build();

        when(authService.register(any(RegisterRequest.class))).thenReturn(authResponse);

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "name": "Test User",
                                    "email": "test@example.com",
                                    "mobileNumber": "+1234567890",
                                    "password": "password123"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Registration successful"))
                .andExpect(jsonPath("$.data.accessToken").value("access-token"))
                .andExpect(jsonPath("$.data.user.id").value(1))
                .andExpect(jsonPath("$.data.user.email").value("test@example.com"));

        verify(authService).register(any(RegisterRequest.class));
    }

    @Test
    void register_validationError_missingEmail() throws Exception {
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "name": "Test User",
                                    "mobileNumber": "+1234567890",
                                    "password": "password123"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.data.email").value("Email is required"));
    }

    @Test
    void login_success() throws Exception {
        AuthResponse.UserDto userDto = AuthResponse.UserDto.builder()
                .id(1L)
                .name("Test User")
                .email("test@example.com")
                .role("USER")
                .twoFactorEnabled(false)
                .build();
        AuthResponse authResponse = AuthResponse.builder()
                .accessToken("jwt-token")
                .refreshToken("refresh-token")
                .user(userDto)
                .build();

        when(authService.login(any(LoginRequest.class))).thenReturn(authResponse);

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "email": "test@example.com",
                                    "password": "password123"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Login successful"))
                .andExpect(jsonPath("$.data.accessToken").value("jwt-token"))
                .andExpect(jsonPath("$.data.user.email").value("test@example.com"));

        verify(authService).login(any(LoginRequest.class));
    }

    @Test
    void login_validationError_missingPassword() throws Exception {
        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "email": "test@example.com"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.data.password").value("Password is required"));
    }

    @Test
    void refresh_success() throws Exception {
        AuthResponse.UserDto userDto = AuthResponse.UserDto.builder()
                .id(1L)
                .email("test@example.com")
                .role("USER")
                .build();
        AuthResponse authResponse = AuthResponse.builder()
                .accessToken("new-access-token")
                .refreshToken("new-refresh-token")
                .user(userDto)
                .build();

        when(authService.refreshToken(any(RefreshTokenRequest.class))).thenReturn(authResponse);

        mockMvc.perform(post("/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "refreshToken": "valid-refresh-token"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").value("new-access-token"));

        verify(authService).refreshToken(any(RefreshTokenRequest.class));
    }

    @Test
    void forgotPassword_success() throws Exception {
        mockMvc.perform(post("/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "email": "user@example.com"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("If an account exists with this email, you will receive a password reset link."));

        verify(userService).requestPasswordReset("user@example.com");
    }
}
