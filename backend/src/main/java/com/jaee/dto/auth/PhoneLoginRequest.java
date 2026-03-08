package com.jaee.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PhoneLoginRequest {

    @NotBlank(message = "Firebase ID token is required")
    private String idToken;
}
