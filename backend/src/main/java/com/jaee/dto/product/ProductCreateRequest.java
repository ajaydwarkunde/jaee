package com.jaee.dto.product;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ProductCreateRequest {
    
    @NotBlank(message = "Name is required")
    @Size(max = 200, message = "Name must not exceed 200 characters")
    private String name;
    
    @NotBlank(message = "Product description is required")
    @Size(max = 5000, message = "Description must not exceed 5000 characters")
    private String description;
    
    /**
     * Retail price in INR. Optional if {@code baseCost} is set (price is then computed with Razorpay fee).
     */
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    private BigDecimal price;

    /** When set, selling price = ceil(baseCost × (1 + Razorpay fee rate)). */
    @DecimalMin(value = "0.01", message = "Base cost must be greater than 0")
    private BigDecimal baseCost;

    @DecimalMin(value = "0.001", message = "Weight must be positive")
    private BigDecimal weightKg;

    @DecimalMin(value = "0.01", message = "Compare at price must be greater than 0")
    private BigDecimal compareAtPrice;
    
    private String currency = "INR";
    
    private List<Long> categoryIds;
    
    private List<String> images;

    private List<String> videos;

    private List<String> options;
    
    @Min(value = 0, message = "Stock quantity cannot be negative")
    private Integer stockQty = 0;
    
    private Boolean active = true;
}
