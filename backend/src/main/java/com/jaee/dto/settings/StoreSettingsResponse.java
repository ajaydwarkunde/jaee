package com.jaee.dto.settings;

import java.util.Map;

/**
 * Response DTO for public store settings (key-value pairs only)
 */
public record StoreSettingsResponse(
    Map<String, String> settings
) {}
