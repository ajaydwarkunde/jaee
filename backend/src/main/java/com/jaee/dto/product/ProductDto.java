package com.jaee.dto.product;

import com.jaee.dto.variant.VariantDto;
import com.jaee.entity.Category;
import com.jaee.entity.Product;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

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
    /** Per-unit weight for delivery estimates (kg). */
    private BigDecimal weightKg;
    private BigDecimal compareAtPrice;
    private Integer discountPercent;
    private String currency;
    private List<Long> categoryIds;
    private List<String> categoryNames;
    private List<String> images;
    private List<String> videos;
    private List<String> options;
    private List<VariantDto> variants;
    private Integer stockQty;
    private Boolean active;
    private Boolean customizationEnabled;
    private Boolean inStock;
    private LocalDateTime createdAt;
    private BigDecimal avgRating;
    private Integer reviewCount;
    
    private static Integer calculateDiscount(BigDecimal price, BigDecimal compareAtPrice) {
        if (compareAtPrice == null || compareAtPrice.compareTo(price) <= 0) return null;
        return compareAtPrice.subtract(price)
                .multiply(java.math.BigDecimal.valueOf(100))
                .divide(compareAtPrice, 0, java.math.RoundingMode.HALF_UP)
                .intValue();
    }

    /** Detach Hibernate element-collection bags so JSON serialization never touches lazy proxies. */
    private static List<String> copyUrlList(List<String> urls) {
        if (urls == null || urls.isEmpty()) {
            return List.of();
        }
        return new ArrayList<>(urls);
    }

    public static ProductDto fromEntity(Product product) {
        return ProductDto.builder()
                .id(product.getId())
                .name(product.getName())
                .slug(product.getSlug())
                .description(product.getDescription())
                .price(product.getPrice())
                .weightKg(product.getWeightKg())
                .compareAtPrice(product.getCompareAtPrice())
                .discountPercent(calculateDiscount(product.getPrice(), product.getCompareAtPrice()))
                .currency(product.getCurrency())
                .categoryIds(product.getCategories() != null
                        ? product.getCategories().stream().map(Category::getId).collect(Collectors.toList())
                        : List.of())
                .categoryNames(product.getCategories() != null
                        ? product.getCategories().stream().map(Category::getName).collect(Collectors.toList())
                        : List.of())
                .images(copyUrlList(product.getImages()))
                .videos(copyUrlList(product.getVideos()))
                .options(copyUrlList(product.getOptions()))
                .variants(product.getVariants() != null
                        ? product.getVariants().stream().map(VariantDto::fromEntity).collect(Collectors.toList())
                        : List.of())
                .stockQty(product.getStockQty())
                .active(product.getActive())
                .customizationEnabled(Boolean.TRUE.equals(product.getCustomizationEnabled()))
                .inStock(product.isInStock())
                .createdAt(product.getCreatedAt())
                .avgRating(product.getAvgRating())
                .reviewCount(product.getReviewCount())
                .build();
    }

    /**
     * Lightweight mapping for list/grid endpoints where variant-level details are not needed.
     * This avoids triggering expensive lazy loads for fields not rendered on listing cards.
     */
    public static ProductDto fromListingEntity(Product product) {
        return ProductDto.builder()
                .id(product.getId())
                .name(product.getName())
                .slug(product.getSlug())
                .description(product.getDescription())
                .price(product.getPrice())
                .weightKg(product.getWeightKg())
                .compareAtPrice(product.getCompareAtPrice())
                .discountPercent(calculateDiscount(product.getPrice(), product.getCompareAtPrice()))
                .currency(product.getCurrency())
                .categoryIds(product.getCategories() != null
                        ? product.getCategories().stream().map(Category::getId).collect(Collectors.toList())
                        : List.of())
                .categoryNames(product.getCategories() != null
                        ? product.getCategories().stream().map(Category::getName).collect(Collectors.toList())
                        : List.of())
                .images(copyUrlList(product.getImages()))
                .videos(List.of())
                .options(List.of())
                .variants(List.of())
                .stockQty(product.getStockQty())
                .active(product.getActive())
                .inStock(product.isInStock())
                .createdAt(product.getCreatedAt())
                .avgRating(product.getAvgRating())
                .reviewCount(product.getReviewCount())
                .build();
    }
}
