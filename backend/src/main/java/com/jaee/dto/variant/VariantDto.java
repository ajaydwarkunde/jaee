package com.jaee.dto.variant;

import com.jaee.entity.ProductVariant;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VariantDto {
    private Long id;
    private Long productId;
    private String sku;
    private BigDecimal price;
    private BigDecimal compareAtPrice;
    private Integer discountPercent;
    private Integer stockQty;
    private Boolean active;
    private Boolean inStock;
    private Map<String, String> optionValues;
    private List<String> images;

    private static Integer calculateDiscount(BigDecimal price, BigDecimal compareAtPrice) {
        if (compareAtPrice == null || compareAtPrice.compareTo(price) <= 0) return null;
        return compareAtPrice.subtract(price)
                .multiply(BigDecimal.valueOf(100))
                .divide(compareAtPrice, 0, java.math.RoundingMode.HALF_UP)
                .intValue();
    }

    public static VariantDto fromEntity(ProductVariant variant) {
        return VariantDto.builder()
                .id(variant.getId())
                .productId(variant.getProduct().getId())
                .sku(variant.getSku())
                .price(variant.getPrice())
                .compareAtPrice(variant.getCompareAtPrice())
                .discountPercent(calculateDiscount(variant.getPrice(), variant.getCompareAtPrice()))
                .stockQty(variant.getStockQty())
                .active(variant.getActive())
                .inStock(variant.isInStock())
                .optionValues(variant.getOptionValues())
                .images(variant.getImages())
                .build();
    }
}
