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
    
    /** Retail selling price in INR (includes any payment fees you choose to bake in). */
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    private BigDecimal price;

    /** Optional landed cost for margin tracking only; does not change {@code price}. */
    @DecimalMin(value = "0.01", message = "Base cost must be greater than 0")
    private BigDecimal baseCost;

    /** Legacy fallback for shipping when variants omit weight; prefer variant-level weight. */
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

    /** When true, customers must enter customization details before add-to-cart. */
    private Boolean customizationEnabled = false;
}
