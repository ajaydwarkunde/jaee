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
            catalogStatusChanged = deleteNonSheetProducts();
        }

        if (catalogStatusChanged || rowsChanged) {
            catalogCacheService.evictAll();
        }
        if (!rows.isEmpty()) {
            rowSyncService.reconcileBatchVariantPlacement(rows);
        }
        return SheetProductSyncResponse.from(results);
    }

    /**
     * Completes an explicit full-sheet sync. Products with no SKUs left in the sheet catalog are
     * deleted. Variant and product active flags come from each row's Active column and are not
     * overridden here.
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
        List<Product> deletedProducts = new ArrayList<>();
        List<Product> changedProducts = new ArrayList<>();

        for (Product product : products) {
            if (!isSheetManaged(product)) {
                deletedProducts.add(product);
                continue;
            }

            List<ProductVariant> variants = variantRepository.findByProductIdWithDetails(product.getId());
            boolean hasCatalogVariant = variants.stream()
                    .anyMatch(variant -> normalizedSkus.contains(
                            GoogleSheetProductRowSyncService.normalizeSku(variant.getSku())));
            if (!hasCatalogVariant) {
                deletedProducts.add(product);
                continue;
            }

            boolean anyActive = variants.stream()
                    .anyMatch(variant -> normalizedSkus.contains(
                            GoogleSheetProductRowSyncService.normalizeSku(variant.getSku()))
                            && Boolean.TRUE.equals(variant.getActive()));
            if (!Boolean.valueOf(anyActive).equals(product.getActive())) {
                product.setActive(anyActive);
                changedProducts.add(product);
            }
        }

        if (!deletedProducts.isEmpty()) {
            productRepository.deleteAll(deletedProducts);
        }
        if (!changedProducts.isEmpty()) {
            productRepository.saveAll(changedProducts);
        }

        log.info(
                "Published Google Sheet catalog: {} SKUs, {} products kept, {} products updated, {} products deleted",
                normalizedSkus.size(),
                products.size() - deletedProducts.size(),
                changedProducts.size(),
                deletedProducts.size()
        );
        return !deletedProducts.isEmpty() || !changedProducts.isEmpty();
    }

    /** Any successful sheet update removes legacy admin/seed products from the database. */
    private boolean deleteNonSheetProducts() {
        List<Product> legacyProducts = productRepository.findAll().stream()
                .filter(product -> !isSheetManaged(product))
                .toList();
        if (legacyProducts.isEmpty()) {
            return false;
        }
        productRepository.deleteAll(legacyProducts);
        log.info("Deleted {} non-sheet products", legacyProducts.size());
        return true;
    }

    private static boolean isSheetManaged(Product product) {
        return product != null
                && product.getSheetSku() != null
                && !product.getSheetSku().isBlank();
    }
}
