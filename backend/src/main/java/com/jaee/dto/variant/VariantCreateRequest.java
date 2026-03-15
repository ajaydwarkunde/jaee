package com.jaee.dto.variant;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
public class VariantCreateRequest {
    
    private String sku;
    
    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    private BigDecimal price;

    @DecimalMin(value = "0.01", message = "Compare at price must be greater than 0")
    private BigDecimal compareAtPrice;
    
    @Min(value = 0, message = "Stock quantity cannot be negative")
    private Integer stockQty = 0;
    
    private Boolean active = true;

    @NotNull(message = "Option values are required")
    private Map<String, String> optionValues;

    private List<String> images;
}
