package com.jaee.dto.candle;

import com.jaee.entity.CustomCandleRequest;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomCandleResponseDto {

    private Long id;
    private Long userId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String size;
    private String waxType;
    private String scent;
    private String color;
    private String container;
    private String labelText;
    private Integer quantity;
    private BigDecimal estimatedPrice;
    private String notes;
    private String status;
    private LocalDateTime createdAt;

    public static CustomCandleResponseDto fromEntity(CustomCandleRequest entity) {
        return CustomCandleResponseDto.builder()
                .id(entity.getId())
                .userId(entity.getUser() != null ? entity.getUser().getId() : null)
                .customerName(entity.getCustomerName())
                .customerEmail(entity.getCustomerEmail())
                .customerPhone(entity.getCustomerPhone())
                .size(entity.getSize())
                .waxType(entity.getWaxType())
                .scent(entity.getScent())
                .color(entity.getColor())
                .container(entity.getContainer())
                .labelText(entity.getLabelText())
                .quantity(entity.getQuantity())
                .estimatedPrice(entity.getEstimatedPrice())
                .notes(entity.getNotes())
                .status(entity.getStatus().name())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
