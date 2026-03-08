package com.jaee.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SocialLoginRequest {

    @NotBlank(message = "Firebase ID token is required")
    private String idToken;

    @NotBlank(message = "Provider is required")
    private String provider;
}
