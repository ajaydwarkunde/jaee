package com.jaee.dto.builder;

import com.jaee.entity.BuilderOption;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BuilderOptionDto {

    private Long id;

    @NotBlank(message = "Builder type is required")
    private String builderType;

    @NotBlank(message = "Option type is required")
    private String optionType;

    @NotBlank(message = "Option key is required")
    private String optionKey;

    @NotBlank(message = "Label is required")
    private String label;

    private String description;

    private String emoji;

    private String hexColor;

    private String colorsJson;

    @Builder.Default
    private BigDecimal basePrice = BigDecimal.ZERO;

    @Builder.Default
    private BigDecimal surcharge = BigDecimal.ZERO;

    @Builder.Default
    private Boolean active = true;

    @Builder.Default
    private Integer displayOrder = 0;

    public static BuilderOptionDto fromEntity(BuilderOption entity) {
        return BuilderOptionDto.builder()
                .id(entity.getId())
                .builderType(entity.getBuilderType())
                .optionType(entity.getOptionType())
                .optionKey(entity.getOptionKey())
                .label(entity.getLabel())
                .description(entity.getDescription())
                .emoji(entity.getEmoji())
                .hexColor(entity.getHexColor())
                .colorsJson(entity.getColorsJson())
                .basePrice(entity.getBasePrice() != null ? entity.getBasePrice() : BigDecimal.ZERO)
                .surcharge(entity.getSurcharge() != null ? entity.getSurcharge() : BigDecimal.ZERO)
                .active(entity.getActive() != null ? entity.getActive() : true)
                .displayOrder(entity.getDisplayOrder() != null ? entity.getDisplayOrder() : 0)
                .build();
    }
}
