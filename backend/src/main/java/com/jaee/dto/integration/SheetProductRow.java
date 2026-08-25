package com.jaee.dto.integration;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;

import java.math.BigDecimal;
import java.util.List;

/** One normalized product row sent by the Google Apps Script. */
public record SheetProductRow(
        Integer rowNumber,
        String sku,
        String productName,
        String description,
        String size,
        String fragrance,
        String color,
        BigDecimal totalCost,
        BigDecimal websitePrice,
        Integer stockQuantity,
        Boolean active,
        @JsonDeserialize(using = FlexibleStringListDeserializer.class)
        List<String> categories,
        @JsonDeserialize(using = FlexibleStringListDeserializer.class)
        List<String> imageUrls
) {
}
