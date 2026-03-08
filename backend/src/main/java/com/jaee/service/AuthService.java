package com.jaee.service;

import com.jaee.dto.auth.*;
import com.jaee.entity.RefreshToken;
import com.jaee.entity.User;
import com.jaee.exception.BadRequestException;
import com.jaee.exception.UnauthorizedException;
import com.jaee.repository.RefreshTokenRepository;
import com.jaee.repository.UserRepository;
import com.jaee.security.JwtService;
import com.jaee.service.FirebaseService.SocialProfile;
import com.jaee.util.PasswordUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final FirebaseService firebaseService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        // Decode password if it was encoded by the frontend
        String decodedPassword = PasswordUtil.decodeIfEncoded(request.getPassword());

        // Check if mobile number is already in use
        if (request.getMobileNumber() != null && !request.getMobileNumber().isBlank()) {
            if (userRepository.findByMobileNumber(request.getMobileNumber()).isPresent()) {
                throw new BadRequestException("Mobile number is already registered");
            }
        }

        // Verify Firebase phone token if Firebase is enabled
        if (firebaseService.isEnabled()) {
            if (request.getFirebaseToken() == null || request.getFirebaseToken().isBlank()) {
                throw new BadRequestException("Phone verification is required");
            }
            
            if (!firebaseService.verifyPhoneMatches(request.getFirebaseToken(), request.getMobileNumber())) {
                throw new BadRequestException("Phone verification failed. Please verify your phone number.");
            }
            log.info("Phone number verified via Firebase for: {}", request.getEmail());
        } else {
            log.debug("Firebase disabled - skipping phone verification for: {}", request.getEmail());
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail().toLowerCase())
                .mobileNumber(request.getMobileNumber())
                .passwordHash(passwordEncoder.encode(decodedPassword))
                .role(User.Role.USER)
                .mobileVerified(firebaseService.isEnabled()) // Mark as verified if Firebase validated
                .build();

        userRepository.save(user);
        log.info("New user registered: {}", user.getEmail());

        return createAuthResponse(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        // Decode password if it was encoded by the frontend
        String decodedPassword = PasswordUtil.decodeIfEncoded(request.getPassword());

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail().toLowerCase(),
                        decodedPassword
                )
        );

        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        log.info("User logged in: {}", user.getEmail());
        return createAuthResponse(user);
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        if (!refreshToken.isValid()) {
            refreshTokenRepository.delete(refreshToken);
            throw new UnauthorizedException("Refresh token expired or revoked");
        }

        User user = refreshToken.getUser();
        
        // Revoke old token and create new one
        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);

        return createAuthResponse(user);
    }

    @Transactional
    public void logout(User user, String refreshToken) {
        if (refreshToken != null && !refreshToken.isBlank()) {
            refreshTokenRepository.findByToken(refreshToken)
                    .ifPresent(token -> {
                        token.setRevoked(true);
                        refreshTokenRepository.save(token);
                    });
        }
        log.info("User logged out: {}", user.getUsername());
    }

    @Transactional
    public AuthResponse socialLogin(SocialLoginRequest request) {
        SocialProfile profile = firebaseService.verifySocialToken(request.getIdToken());
        if (profile == null) {
            throw new UnauthorizedException("Social login verification failed. Please try again.");
        }

        User.AuthProvider provider;
        try {
            provider = User.AuthProvider.valueOf(request.getProvider().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Unsupported provider: " + request.getProvider());
        }

        if (provider == User.AuthProvider.LOCAL) {
            throw new BadRequestException("Use email/password login for local accounts");
        }

        String email = profile.email().toLowerCase();

        User user = userRepository.findByEmail(email).orElse(null);

        if (user != null) {
            if (user.getAuthProvider() == User.AuthProvider.LOCAL) {
                user.setAuthProvider(provider);
                user.setProviderId(profile.uid());
                user.setEmailVerified(true);
                userRepository.save(user);
                log.info("Linked {} provider to existing local account: {}", provider, email);
            }
        } else {
            user = User.builder()
                    .name(profile.name() != null ? profile.name() : email.split("@")[0])
                    .email(email)
                    .authProvider(provider)
                    .providerId(profile.uid())
                    .emailVerified(true)
                    .role(User.Role.USER)
                    .build();
            userRepository.save(user);
            log.info("New social user registered via {}: {}", provider, email);
        }

        return createAuthResponse(user);
    }

    private AuthResponse createAuthResponse(User user) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = createRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(AuthResponse.UserDto.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .mobileNumber(user.getMobileNumber())
                        .role(user.getRole().name())
                        .twoFactorEnabled(user.getTwoFactorEnabled())
                        .build())
                .build();
    }

    private String createRefreshToken(User user) {
        String token = UUID.randomUUID().toString();
        
        RefreshToken refreshToken = RefreshToken.builder()
                .token(token)
                .user(user)
                .expiresAt(LocalDateTime.now().plusSeconds(jwtService.getRefreshExpirationMs() / 1000))
                .build();

        refreshTokenRepository.save(refreshToken);
        return token;
    }
}
