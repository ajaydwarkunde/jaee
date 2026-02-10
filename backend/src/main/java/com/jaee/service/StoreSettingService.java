package com.jaee.service;

import com.jaee.dto.settings.StoreSettingDto;
import com.jaee.entity.StoreSetting;
import com.jaee.repository.StoreSettingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class StoreSettingService {

    private final StoreSettingRepository settingRepository;

    public StoreSettingService(StoreSettingRepository settingRepository) {
        this.settingRepository = settingRepository;
    }

    /**
     * Get all settings as DTOs (for admin panel)
     */
    public List<StoreSettingDto> getAllSettings() {
        return settingRepository.findAllByOrderByKeyAsc()
            .stream()
            .map(StoreSettingDto::fromEntity)
            .toList();
    }

    /**
     * Get all settings as a simple key-value map (for public/frontend use)
     */
    public Map<String, String> getSettingsMap() {
        Map<String, String> settings = new HashMap<>();
        settingRepository.findAll().forEach(setting -> 
            settings.put(setting.getKey(), setting.getValue())
        );
        return settings;
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
        StoreSetting setting = settingRepository.findByKey(key)
            .orElseThrow(() -> new IllegalArgumentException("Setting not found: " + key));
        
        // Validate based on type
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
