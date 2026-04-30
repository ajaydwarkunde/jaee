package com.jaee.service;

import com.jaee.dto.settings.StoreSettingDto;
import com.jaee.entity.StoreSetting;
import com.jaee.repository.StoreSettingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.TreeMap;

@Service
public class StoreSettingService {

    private static final String CANONICAL_SUPPORT_EMAIL = "jaaistore1212@gmail.com";
    private static final String CANONICAL_INSTAGRAM_HANDLE = "@jaai_candle_studio";

    /** Former defaults still stored in many databases — map to current public contact. */
    private static final Set<String> LEGACY_SUPPORT_EMAILS = Set.of(
        "jaeestudio12@gmail.com",
        "jaaistudio12@gmail.com"
    );

    private static final Set<String> LEGACY_INSTAGRAM_HANDLES = Set.of(
        "@jaai.studio",
        "@jaee.studio"
    );

    private final StoreSettingRepository settingRepository;

    /**
     * Settings that may be missing from older databases — merged into admin list and created on first update.
     */
    private static final Map<String, DefaultSettingMeta> OPTIONAL_SETTINGS = Map.of(
        "feature_hamper_public",
        new DefaultSettingMeta(
            StoreSetting.SettingType.BOOLEAN,
            "false",
            "Show hamper store (nav, hero, gift sets, builders) on the public site"
        ),
        "feature_custom_candle",
        new DefaultSettingMeta(
            StoreSetting.SettingType.BOOLEAN,
            "false",
            "Show custom candle builder links and CTAs"
        ),
        "feature_two_stores_section",
        new DefaultSettingMeta(
            StoreSetting.SettingType.BOOLEAN,
            "false",
            "Show the “Two Stores, One Destination” section on the homepage"
        )
    );

    private record DefaultSettingMeta(StoreSetting.SettingType type, String defaultValue, String description) {}

    public StoreSettingService(StoreSettingRepository settingRepository) {
        this.settingRepository = settingRepository;
    }

    /**
     * Get all settings as DTOs (for admin panel)
     */
    public List<StoreSettingDto> getAllSettings() {
        Map<String, StoreSettingDto> byKey = new TreeMap<>();
        for (StoreSetting s : settingRepository.findAllByOrderByKeyAsc()) {
            byKey.put(s.getKey(), StoreSettingDto.fromEntity(s));
        }
        for (var e : OPTIONAL_SETTINGS.entrySet()) {
            byKey.putIfAbsent(
                e.getKey(),
                new StoreSettingDto(
                    null,
                    e.getKey(),
                    e.getValue().defaultValue(),
                    e.getValue().type().name(),
                    e.getValue().description()
                )
            );
        }
        return new ArrayList<>(byKey.values());
    }

    /**
     * Get all settings as a simple key-value map (for public/frontend use)
     */
    public Map<String, String> getSettingsMap() {
        Map<String, String> settings = new HashMap<>();
        settingRepository.findAll().forEach(setting ->
            settings.put(setting.getKey(), setting.getValue())
        );
        for (var e : OPTIONAL_SETTINGS.entrySet()) {
            settings.putIfAbsent(e.getKey(), e.getValue().defaultValue());
        }
        normalizeLegacyPublicContact(settings);
        return settings;
    }

    /**
     * Ensure public API returns current contact info even when DB still holds retired values.
     */
    private static void normalizeLegacyPublicContact(Map<String, String> settings) {
        String email = settings.get("support_email");
        if (email != null && LEGACY_SUPPORT_EMAILS.contains(email.trim())) {
            settings.put("support_email", CANONICAL_SUPPORT_EMAIL);
        }
        String ig = settings.get("instagram_handle");
        if (ig != null && LEGACY_INSTAGRAM_HANDLES.contains(ig.trim())) {
            settings.put("instagram_handle", CANONICAL_INSTAGRAM_HANDLE);
        }
    }

    /**
     * Get a single setting by key
     */
    public Optional<StoreSetting> getSetting(String key) {
        return settingRepository.findByKey(key);
    }

    /**
     * Get setting value as string (with default fallback)
     */
    public String getStringValue(String key, String defaultValue) {
        return settingRepository.findByKey(key)
            .map(StoreSetting::getValue)
            .orElse(defaultValue);
    }

    /**
     * Get setting value as boolean
     */
    public boolean getBooleanValue(String key, boolean defaultValue) {
        return settingRepository.findByKey(key)
            .map(StoreSetting::getBooleanValue)
            .orElse(defaultValue);
    }

    /**
     * Get setting value as integer
     */
    public int getIntValue(String key, int defaultValue) {
        return settingRepository.findByKey(key)
            .map(StoreSetting::getIntValue)
            .orElse(defaultValue);
    }

    /**
     * Update a setting value
     */
    @Transactional
    public StoreSettingDto updateSetting(String key, String newValue) {
        StoreSetting setting = settingRepository.findByKey(key).orElse(null);
        if (setting == null) {
            DefaultSettingMeta meta = OPTIONAL_SETTINGS.get(key);
            if (meta == null) {
                throw new IllegalArgumentException("Setting not found: " + key);
            }
            setting = new StoreSetting();
            setting.setKey(key);
            setting.setType(meta.type());
            setting.setDescription(meta.description());
        }

        validateValue(setting, newValue);
        setting.setValue(newValue);
        StoreSetting saved = settingRepository.save(setting);
        return StoreSettingDto.fromEntity(saved);
    }

    /**
     * Batch update multiple settings
     */
    @Transactional
    public List<StoreSettingDto> updateSettings(Map<String, String> updates) {
        updates.forEach(this::updateSetting);
        return getAllSettings();
    }

    private void validateValue(StoreSetting setting, String value) {
        switch (setting.getType()) {
            case BOOLEAN:
                if (!value.equalsIgnoreCase("true") && !value.equalsIgnoreCase("false")) {
                    throw new IllegalArgumentException("Invalid boolean value for " + setting.getKey());
                }
                break;
            case NUMBER:
                try {
                    Double.parseDouble(value);
                } catch (NumberFormatException e) {
                    throw new IllegalArgumentException("Invalid number value for " + setting.getKey());
                }
                break;
            case STRING:
                // No validation needed for strings
                break;
        }
    }

    // Convenience methods for common settings
    public boolean isFreeShippingEnabled() {
        return getBooleanValue("free_shipping_enabled", true);
    }

    public int getFreeShippingThreshold() {
        return getIntValue("free_shipping_threshold", 999);
    }

    public int getReturnDays() {
        return getIntValue("return_days", 7);
    }

    public String getReturnPolicyText() {
        return getStringValue("return_policy_text", "7 Days Easy Returns");
    }

    public int getShippingCharges() {
        return getIntValue("shipping_charges", 99);
    }

    public boolean isCodEnabled() {
        return getBooleanValue("cod_enabled", false);
    }

    public int getCodCharges() {
        return getIntValue("cod_charges", 50);
    }

    public String getEstimatedDeliveryDays() {
        return getStringValue("estimated_delivery_days", "5-7");
    }
}
