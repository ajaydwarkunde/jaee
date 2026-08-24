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
    private String sheetSku;
    private LocalDateTime sheetLastSyncedAt;
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
    private Boolean pricingOnRequest;
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
        return fromEntity(product, true);
    }

    /** Storefront mapping hides inactive variants and recomputes option axes from active variants only. */
    public static ProductDto fromStorefrontEntity(Product product) {
        return fromEntity(product, false);
    }

    private static ProductDto fromEntity(Product product, boolean includeInactiveVariants) {
        List<VariantDto> variants = product.getVariants() != null
                ? product.getVariants().stream()
                        .filter(v -> includeInactiveVariants || Boolean.TRUE.equals(v.getActive()))
                        .map(VariantDto::fromEntity)
                        .collect(Collectors.toList())
                : List.of();
        List<String> options = includeInactiveVariants
                ? copyUrlList(product.getOptions())
                : optionsFromVariants(variants);

        return ProductDto.builder()
                .id(product.getId())
                .name(product.getName())
                .slug(product.getSlug())
                .sheetSku(product.getSheetSku())
                .sheetLastSyncedAt(product.getSheetLastSyncedAt())
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
                .options(options)
                .variants(variants)
                .stockQty(product.getStockQty())
                .active(product.getActive())
                .pricingOnRequest(Boolean.TRUE.equals(product.getPricingOnRequest()))
                .customizationEnabled(Boolean.TRUE.equals(product.getCustomizationEnabled()))
                .inStock(product.isInStock())
                .createdAt(product.getCreatedAt())
                .avgRating(product.getAvgRating())
                .reviewCount(product.getReviewCount())
                .build();
    }

    private static List<String> optionsFromVariants(List<VariantDto> variants) {
        if (variants.isEmpty()) {
            return List.of();
        }
        java.util.LinkedHashSet<String> optionNames = new java.util.LinkedHashSet<>();
        for (String preferred : List.of("Size", "Scent", "Color")) {
            boolean present = variants.stream().anyMatch(variant ->
                    variant.getOptionValues() != null
                            && isApplicableOptionValue(variant.getOptionValues().get(preferred)));
            if (present) {
                optionNames.add(preferred);
            }
        }
        variants.stream()
                .map(VariantDto::getOptionValues)
                .filter(java.util.Objects::nonNull)
                .flatMap(values -> values.entrySet().stream())
                .filter(entry -> !"Default".equals(entry.getKey()))
                .filter(entry -> isApplicableOptionValue(entry.getValue()))
                .map(java.util.Map.Entry::getKey)
                .forEach(optionNames::add);
        if (optionNames.isEmpty()) {
            optionNames.add("Default");
        }
        return new ArrayList<>(optionNames);
    }

    private static boolean isApplicableOptionValue(String value) {
        if (value == null || value.isBlank()) {
            return false;
        }
        String normalized = value.trim().toLowerCase(java.util.Locale.ENGLISH);
        return !java.util.Set.of(
                "n/a", "na", "n.a.", "n.a", "not applicable", "not applicable.",
                "none", "nil", "-", "--", "default"
        ).contains(normalized);
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
                .sheetSku(product.getSheetSku())
                .sheetLastSyncedAt(product.getSheetLastSyncedAt())
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
                .pricingOnRequest(Boolean.TRUE.equals(product.getPricingOnRequest()))
                .inStock(product.isInStock())
                .createdAt(product.getCreatedAt())
                .avgRating(product.getAvgRating())
                .reviewCount(product.getReviewCount())
                .build();
    }
}
