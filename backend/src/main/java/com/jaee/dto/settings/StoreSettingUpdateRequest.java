package com.jaee.dto.settings;

import jakarta.validation.constraints.NotBlank;

public record StoreSettingUpdateRequest(
    @NotBlank(message = "Value is required")
    String value
) {}
