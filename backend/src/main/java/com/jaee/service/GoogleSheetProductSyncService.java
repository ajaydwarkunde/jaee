package com.jaee.service;

import com.jaee.dto.integration.SheetProductRow;
import com.jaee.dto.integration.SheetProductSyncRequest;
import com.jaee.dto.integration.SheetProductSyncResponse;
import com.jaee.dto.integration.SheetProductSyncResult;
import com.jaee.entity.Product;
import com.jaee.entity.ProductVariant;
import com.jaee.repository.ProductRepository;
import com.jaee.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class GoogleSheetProductSyncService {

    private static final int MAX_ROWS_PER_REQUEST = 500;

    private final GoogleSheetProductRowSyncService rowSyncService;
    private final CatalogCacheService catalogCacheService;
    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;

    @Transactional
    public SheetProductSyncResponse sync(SheetProductSyncRequest request) {
        List<SheetProductRow> rows = request == null || request.rows() == null
                ? List.of()
                : request.rows();
        if (rows.size() > MAX_ROWS_PER_REQUEST) {
            throw new IllegalArgumentException("A sync request may contain at most " + MAX_ROWS_PER_REQUEST + " rows");
        }

        List<SheetProductSyncResult> results = new ArrayList<>();
        for (SheetProductRow row : rows) {
            try {
                results.add(rowSyncService.sync(row));
            } catch (Exception exception) {
                String sku = GoogleSheetProductRowSyncService.normalizeSku(row == null ? null : row.sku());
                Integer rowNumber = row == null ? null : row.rowNumber();
                log.error("Google Sheet row {} ({}) failed: {}", rowNumber, sku, exception.getMessage(), exception);
                results.add(new SheetProductSyncResult(
                        rowNumber,
                        sku,
                        "failed",
                        null,
                        exception.getMessage() == null ? "Unexpected synchronization error" : exception.getMessage()
                ));
            }
        }

        boolean rowsChanged = results.stream().anyMatch(SheetProductSyncResult::changed);
        boolean catalogStatusChanged = false;
        if (request != null && request.catalogSkus() != null) {
            catalogStatusChanged = publishOnlySheetCatalog(request.catalogSkus());
        } else if (rowsChanged) {
            catalogStatusChanged = hideNonSheetProducts();
        }

        if (catalogStatusChanged || rowsChanged) {
            catalogCacheService.evictAll();
        }
        return SheetProductSyncResponse.from(results);
    }

    /**
     * Completes an explicit full-sheet sync. Sheet-managed variants missing from the supplied
     * catalog are retired, their parent products are hidden, and every non-sheet product is
     * hidden. Single-row edit-trigger syncs omit catalogSkus and therefore never perform this
     * global catalog switch.
     */
    private boolean publishOnlySheetCatalog(List<String> catalogSkus) {
        if (catalogSkus.size() > MAX_ROWS_PER_REQUEST) {
            throw new IllegalArgumentException(
                    "A full catalog may contain at most " + MAX_ROWS_PER_REQUEST + " SKUs");
        }

        Set<String> normalizedSkus = new HashSet<>();
        for (String sku : catalogSkus) {
            String normalized = GoogleSheetProductRowSyncService.normalizeSku(sku);
            if (!normalized.isBlank()) {
                normalizedSkus.add(normalized);
            }
        }

        List<Product> products = productRepository.findAll();
        Set<Long> sheetManagedProductIds = new HashSet<>();
        for (Product product : products) {
            if (product.getSheetSku() != null && !product.getSheetSku().isBlank()) {
                sheetManagedProductIds.add(product.getId());
            }
        }

        Set<Long> publishedProductIds = new HashSet<>();
        List<ProductVariant> changedVariants = new ArrayList<>();
        for (ProductVariant variant : variantRepository.findAll()) {
            Long productId = variant.getProduct().getId();
            if (!sheetManagedProductIds.contains(productId)) {
                continue;
            }

            boolean shouldBeActive = normalizedSkus.contains(
                    GoogleSheetProductRowSyncService.normalizeSku(variant.getSku()));
            if (shouldBeActive) {
                publishedProductIds.add(productId);
            }
            if (!Boolean.valueOf(shouldBeActive).equals(variant.getActive())) {
                variant.setActive(shouldBeActive);
                changedVariants.add(variant);
            }
        }

        List<Product> changedProducts = new ArrayList<>();
        for (Product product : products) {
            boolean shouldBeActive = publishedProductIds.contains(product.getId());
            if (!Boolean.valueOf(shouldBeActive).equals(product.getActive())) {
                product.setActive(shouldBeActive);
                changedProducts.add(product);
            }
        }

        if (!changedVariants.isEmpty()) {
            variantRepository.saveAll(changedVariants);
        }
        if (!changedProducts.isEmpty()) {
            productRepository.saveAll(changedProducts);
        }

        log.info(
                "Published Google Sheet catalog: {} SKUs, {} products active, {} products changed, {} variants changed",
                normalizedSkus.size(),
                publishedProductIds.size(),
                changedProducts.size(),
                changedVariants.size()
        );
        return !changedProducts.isEmpty() || !changedVariants.isEmpty();
    }

    /**
     * Any successful sheet update establishes the sheet as the publication source, even when an
     * older Apps Script does not yet send the full catalog SKU list. A later explicit full sync
     * additionally retires sheet-managed variants that were removed from the sheet.
     */
    private boolean hideNonSheetProducts() {
        List<Product> changedProducts = productRepository.findAll().stream()
                .filter(product -> product.getSheetSku() == null || product.getSheetSku().isBlank())
                .filter(product -> Boolean.TRUE.equals(product.getActive()))
                .peek(product -> product.setActive(false))
                .toList();
        if (changedProducts.isEmpty()) {
            return false;
        }
        productRepository.saveAll(changedProducts);
        log.info("Made {} non-sheet products inactive", changedProducts.size());
        return true;
    }
}
