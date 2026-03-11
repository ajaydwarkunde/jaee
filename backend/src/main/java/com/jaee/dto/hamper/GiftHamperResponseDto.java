package com.jaee.dto.hamper;

import com.jaee.entity.GiftHamperRequest;
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
public class GiftHamperResponseDto {

    private Long id;
    private Long userId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String hamperSize;
    private String occasion;
    private String items;
    private String wrapping;
    private String messageCard;
    private String recipientName;
    private String colorTheme;
    private Integer quantity;
    private BigDecimal estimatedPrice;
    private String notes;
    private String status;
    private LocalDateTime createdAt;

    public static GiftHamperResponseDto fromEntity(GiftHamperRequest entity) {
        return GiftHamperResponseDto.builder()
                .id(entity.getId())
                .userId(entity.getUser() != null ? entity.getUser().getId() : null)
                .customerName(entity.getCustomerName())
                .customerEmail(entity.getCustomerEmail())
                .customerPhone(entity.getCustomerPhone())
                .hamperSize(entity.getHamperSize())
                .occasion(entity.getOccasion())
                .items(entity.getItems())
                .wrapping(entity.getWrapping())
                .messageCard(entity.getMessageCard())
                .recipientName(entity.getRecipientName())
                .colorTheme(entity.getColorTheme())
                .quantity(entity.getQuantity())
                .estimatedPrice(entity.getEstimatedPrice())
                .notes(entity.getNotes())
                .status(entity.getStatus().name())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
