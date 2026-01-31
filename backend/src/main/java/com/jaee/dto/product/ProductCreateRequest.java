package com.jaee.dto.product;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ProductCreateRequest {
    
    @NotBlank(message = "Name is required")
    @Size(max = 200, message = "Name must not exceed 200 characters")
    private String name;
    
    @Size(max = 5000, message = "Description must not exceed 5000 characters")
    private String description;
    
    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    private BigDecimal price;
    
    private String currency = "INR";
    
    private Long categoryId;
    
    private List<String> images;
    
    @Min(value = 0, message = "Stock quantity cannot be negative")
    private Integer stockQty = 0;
    
    private Boolean active = true;
}
