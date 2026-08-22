package com.jaee.dto.integration;

import java.math.BigDecimal;

/** One normalized product row sent by the Google Apps Script. */
public record SheetProductRow(
        Integer rowNumber,
        String sku,
        String productName,
        String size,
        String fragrance,
        String color,
        BigDecimal totalCost,
        BigDecimal websitePrice,
        Integer stockQuantity
) {
}
