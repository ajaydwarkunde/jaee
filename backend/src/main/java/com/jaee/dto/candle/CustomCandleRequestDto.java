package com.jaee.dto.candle;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomCandleRequestDto {

    @NotBlank(message = "Customer name is required")
    private String customerName;

    @NotBlank(message = "Customer email is required")
    @Email(message = "Invalid email format")
    private String customerEmail;

    private String customerPhone;

    @NotBlank(message = "Size is required")
    private String size;

    @NotBlank(message = "Wax type is required")
    private String waxType;

    @NotBlank(message = "Scent is required")
    private String scent;

    @NotBlank(message = "Color is required")
    private String color;

    @NotBlank(message = "Container is required")
    private String container;

    private String labelText;

    @Builder.Default
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity = 1;

    private String notes;
}
