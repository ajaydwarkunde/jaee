package com.jaee.dto.product;

import com.jaee.entity.Product;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDto {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private BigDecimal price;
    private BigDecimal compareAtPrice;
    private Integer discountPercent;
    private String currency;
    private Long categoryId;
    private String categoryName;
    private List<String> images;
    private Integer stockQty;
    private Boolean active;
    private Boolean inStock;
    private LocalDateTime createdAt;
    
    private static Integer calculateDiscount(BigDecimal price, BigDecimal compareAtPrice) {
        if (compareAtPrice == null || compareAtPrice.compareTo(price) <= 0) return null;
        return compareAtPrice.subtract(price)
                .multiply(java.math.BigDecimal.valueOf(100))
                .divide(compareAtPrice, 0, java.math.RoundingMode.HALF_UP)
                .intValue();
    }

    public static ProductDto fromEntity(Product product) {
        return ProductDto.builder()
                .id(product.getId())
                .name(product.getName())
                .slug(product.getSlug())
                .description(product.getDescription())
                .price(product.getPrice())
                .compareAtPrice(product.getCompareAtPrice())
                .discountPercent(calculateDiscount(product.getPrice(), product.getCompareAtPrice()))
                .currency(product.getCurrency())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .images(product.getImages())
                .stockQty(product.getStockQty())
                .active(product.getActive())
                .inStock(product.isInStock())
                .createdAt(product.getCreatedAt())
                .build();
    }
}
