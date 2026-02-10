package com.jaee.controller;

import com.jaee.dto.settings.StoreSettingDto;
import com.jaee.dto.settings.StoreSettingUpdateRequest;
import com.jaee.service.StoreSettingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class StoreSettingsController {

    private final StoreSettingService settingService;

    public StoreSettingsController(StoreSettingService settingService) {
        this.settingService = settingService;
    }

    /**
     * Public endpoint - Get all settings as key-value pairs (for frontend use)
     */
    @GetMapping("/store/settings")
    public ResponseEntity<Map<String, String>> getPublicSettings() {
        return ResponseEntity.ok(settingService.getSettingsMap());
    }

    /**
     * Admin endpoint - Get all settings with full details
     */
    @GetMapping("/admin/settings")
    public ResponseEntity<List<StoreSettingDto>> getAllSettings() {
        return ResponseEntity.ok(settingService.getAllSettings());
    }

    /**
     * Admin endpoint - Update a single setting
     */
    @PutMapping("/admin/settings/{key}")
    public ResponseEntity<StoreSettingDto> updateSetting(
            @PathVariable String key,
            @Valid @RequestBody StoreSettingUpdateRequest request) {
        return ResponseEntity.ok(settingService.updateSetting(key, request.value()));
    }

    /**
     * Admin endpoint - Batch update multiple settings
     */
    @PutMapping("/admin/settings")
    public ResponseEntity<List<StoreSettingDto>> updateSettings(
            @RequestBody Map<String, String> updates) {
        return ResponseEntity.ok(settingService.updateSettings(updates));
    }
}
