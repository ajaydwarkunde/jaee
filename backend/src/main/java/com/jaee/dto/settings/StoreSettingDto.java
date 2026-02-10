package com.jaee.dto.settings;

import com.jaee.entity.StoreSetting;

public record StoreSettingDto(
    Long id,
    String key,
    String value,
    String type,
    String description
) {
    public static StoreSettingDto fromEntity(StoreSetting setting) {
        return new StoreSettingDto(
            setting.getId(),
            setting.getKey(),
            setting.getValue(),
            setting.getType().name(),
            setting.getDescription()
        );
    }
}
