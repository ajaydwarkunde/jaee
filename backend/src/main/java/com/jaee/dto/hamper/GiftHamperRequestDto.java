package com.jaee.dto.hamper;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GiftHamperRequestDto {

    @NotBlank(message = "Customer name is required")
    private String customerName;

    @NotBlank(message = "Customer email is required")
    @Email(message = "Invalid email format")
    private String customerEmail;

    private String customerPhone;

    @NotBlank(message = "Hamper size is required")
    private String hamperSize;

    @NotBlank(message = "Occasion is required")
    private String occasion;

    @NotBlank(message = "Items are required")
    private String items;

    @NotBlank(message = "Wrapping is required")
    private String wrapping;

    private String messageCard;

    private String recipientName;

    @NotBlank(message = "Color theme is required")
    private String colorTheme;

    @Builder.Default
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity = 1;

    private String notes;
}
