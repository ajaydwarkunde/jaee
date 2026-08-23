package com.jaee.dto.integration;

public record SheetProductSyncResult(
        Integer rowNumber,
        String sku,
        String status,
        Long productId,
        String message
) {
    public boolean changed() {
        return "created".equals(status) || "updated".equals(status) || "linked".equals(status);
    }
}
