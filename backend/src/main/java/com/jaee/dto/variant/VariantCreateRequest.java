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

    /** Per-unit weight for shipping (kg). Optional in API; defaults to product-level weight when null. */
    private BigDecimal weightKg;
    
    @Min(value = 0, message = "Stock quantity cannot be negative")
    private Integer stockQty = 0;

    /** Per-unit cost/expense for profit tracking. */
    private BigDecimal expense;
    
    private Boolean active = true;

    @NotNull(message = "Option values are required")
    private Map<String, String> optionValues;

    private List<String> images;

    /** Display/admin ordering (optional on single-variant update). */
    private Integer sortOrder;
}
