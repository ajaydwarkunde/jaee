package com.jaee.service;

import com.jaee.dto.integration.SheetProductRow;
import com.jaee.dto.integration.SheetProductSyncResult;
import com.jaee.entity.Product;
import com.jaee.entity.ProductVariant;
import com.jaee.repository.ProductRepository;
import com.jaee.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class GoogleSheetProductRowSyncService {

    private static final String DRAFT_DESCRIPTION =
            "Draft imported from Google Sheets. Add storefront details before activating.";
    private static final Pattern NON_SLUG = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("\\s+");

    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final StockNotificationService stockNotificationService;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public SheetProductSyncResult sync(SheetProductRow row) {
        String validationError = validate(row);
        String normalizedSku = normalizeSku(row == null ? null : row.sku());
        if (validationError != null) {
            return result(row, normalizedSku, "skipped", null, validationError);
        }

        Product product = productRepository.findBySheetSkuIgnoreCase(normalizedSku).orElse(null);
        boolean linked = false;
        boolean created = false;

        if (product == null) {
            List<Product> nameMatches = productRepository.findAllByNameIgnoreCase(row.productName().trim())
                    .stream()
                    .filter(candidate -> candidate.getSheetSku() == null || candidate.getSheetSku().isBlank())
                    .toList();
            if (nameMatches.size() > 1) {
                return result(row, normalizedSku, "skipped", null,
                        "More than one existing product has this name; link the SKU manually");
            }
            if (nameMatches.size() == 1) {
                product = nameMatches.getFirst();
                linked = true;
            } else {
                product = createDraft(row, normalizedSku);
                created = true;
            }
        }

        int oldStock = product.getStockQty() == null ? 0 : product.getStockQty();
        boolean pricingOnRequest = row.websitePrice() == null
                || row.websitePrice().compareTo(BigDecimal.ZERO) <= 0;
        int stock = row.stockQuantity() == null ? 0 : row.stockQuantity();
        product.setSheetSku(normalizedSku);
        product.setSheetLastSyncedAt(LocalDateTime.now());
        product.setName(row.productName().trim());
        product.setPricingOnRequest(pricingOnRequest);
        product.setPrice(pricingOnRequest ? BigDecimal.ZERO : row.websitePrice());
        product.setBaseCost(row.totalCost());
        product.setStockQty(stock);
        applyImagesIfPresent(product, row);

        Map<String, String> optionValues = optionValues(row);
        List<String> optionNames = optionValues.isEmpty()
                ? List.of("Default")
                : new ArrayList<>(optionValues.keySet());
        if (product.getOptions() == null) {
            product.setOptions(new ArrayList<>());
        } else {
            product.getOptions().clear();
        }
        product.getOptions().addAll(optionNames);

        product = productRepository.save(product);
        upsertSingleVariant(product, row, normalizedSku, optionValues, linked);

        if (oldStock <= 0 && stock > 0 && Boolean.TRUE.equals(product.getActive())) {
            stockNotificationService.notifySubscribers(product.getId());
        }

        String status = created ? "created" : linked ? "linked" : "updated";
        log.info("Google Sheet {} product {} ({})", status, product.getId(), normalizedSku);
        return result(row, normalizedSku, status, product.getId(),
                created ? "Inactive draft created" : linked ? "Linked by exact product name" : "Product updated");
    }

    static String validate(SheetProductRow row) {
        if (row == null) return "Row payload is missing";
        if (normalizeSku(row.sku()).isBlank()) return "SKU is required";
        if (row.productName() == null || row.productName().isBlank()) return "Product Name is required";
        if (row.websitePrice() != null && row.websitePrice().compareTo(BigDecimal.ZERO) < 0) {
            return "Website Pricing cannot be negative";
        }
        if (row.totalCost() != null && row.totalCost().compareTo(BigDecimal.ZERO) < 0) {
            return "Total Cost cannot be negative";
        }
        if (row.stockQuantity() != null && row.stockQuantity() < 0) {
            return "Stock Quantity must be zero or greater";
        }
        return null;
    }

    private Product createDraft(SheetProductRow row, String sku) {
        String slug = uniqueSlug(row.productName());
        return Product.builder()
                .name(row.productName().trim())
                .slug(slug)
                .sheetSku(sku)
                .sheetLastSyncedAt(LocalDateTime.now())
                .description(DRAFT_DESCRIPTION)
                .price(row.websitePrice() == null || row.websitePrice().compareTo(BigDecimal.ZERO) <= 0
                        ? BigDecimal.ZERO
                        : row.websitePrice())
                .pricingOnRequest(row.websitePrice() == null || row.websitePrice().compareTo(BigDecimal.ZERO) <= 0)
                .baseCost(row.totalCost())
                .weightKg(new BigDecimal("0.500"))
                .currency("INR")
                .stockQty(row.stockQuantity() == null ? 0 : row.stockQuantity())
                .active(false)
                .options(new ArrayList<>())
                .images(new ArrayList<>(parseImageUrls(row.imageUrls())))
                .build();
    }

    private void upsertSingleVariant(
            Product product,
            SheetProductRow row,
            String sku,
            Map<String, String> optionValues,
            boolean newlyLinked
    ) {
        List<ProductVariant> variants = variantRepository.findByProductIdWithDetails(product.getId());
        ProductVariant variant = variants.stream()
                .filter(candidate -> candidate.getSku() != null && candidate.getSku().equalsIgnoreCase(sku))
                .findFirst()
                .orElse(null);

        if (variant == null && variants.size() == 1 && newlyLinked) {
            variant = variants.getFirst();
        }
        if (variant == null && !variants.isEmpty()) {
            throw new IllegalStateException(
                    "Product has existing variants that do not match SKU " + sku + "; no changes were applied");
        }
        if (variant == null) {
            variant = ProductVariant.builder()
                    .product(product)
                    .sortOrder(0)
                    .active(Boolean.TRUE.equals(product.getActive()))
                    .build();
        }

        boolean pricingOnRequest = row.websitePrice() == null
                || row.websitePrice().compareTo(BigDecimal.ZERO) <= 0;
        variant.setSku(sku);
        variant.setPrice(pricingOnRequest ? BigDecimal.ZERO : row.websitePrice());
        variant.setExpense(row.totalCost());
        variant.setStockQty(row.stockQuantity() == null ? 0 : row.stockQuantity());
        if (variant.getWeightKg() == null) {
            variant.setWeightKg(product.getWeightKg());
        }
        if (variant.getOptionValues() == null) {
            variant.setOptionValues(new LinkedHashMap<>());
        } else {
            variant.getOptionValues().clear();
        }
        if (optionValues.isEmpty()) {
            variant.getOptionValues().put("Default", "Default");
        } else {
            variant.getOptionValues().putAll(optionValues);
        }
        variantRepository.save(variant);
    }

    private String uniqueSlug(String productName) {
        String base = toSlug(productName);
        if (base.isBlank()) base = "sheet-product";
        String candidate = base;
        int suffix = 1;
        while (productRepository.existsBySlug(candidate)) {
            candidate = base + "-" + suffix++;
        }
        return candidate;
    }

    private static String toSlug(String input) {
        String noWhitespace = WHITESPACE.matcher(input.trim()).replaceAll("-");
        String normalized = Normalizer.normalize(noWhitespace, Normalizer.Form.NFD);
        return NON_SLUG.matcher(normalized).replaceAll("").toLowerCase(Locale.ENGLISH);
    }

    private static void applyImagesIfPresent(Product product, SheetProductRow row) {
        List<String> images = parseImageUrls(row.imageUrls());
        if (images.isEmpty()) {
            return;
        }
        if (product.getImages() == null) {
            product.setImages(new ArrayList<>());
        } else {
            product.getImages().clear();
        }
        product.getImages().addAll(images);
    }

    static List<String> parseImageUrls(List<String> rawUrls) {
        if (rawUrls == null || rawUrls.isEmpty()) {
            return List.of();
        }
        List<String> images = new ArrayList<>();
        for (String raw : rawUrls) {
            if (raw == null) continue;
            for (String token : raw.split("[,\\n;]+")) {
                String url = token.trim();
                if (url.isEmpty()) continue;
                if (!url.startsWith("https://") && !url.startsWith("http://")) continue;
                if (!images.contains(url)) {
                    images.add(url);
                }
                if (images.size() == 10) {
                    return images;
                }
            }
        }
        return images;
    }

    private static Map<String, String> optionValues(SheetProductRow row) {
        Map<String, String> values = new LinkedHashMap<>();
        putIfPresent(values, "Size", row.size());
        putIfPresent(values, "Scent", row.fragrance());
        putIfPresent(values, "Color", row.color());
        return values;
    }

    private static void putIfPresent(Map<String, String> target, String key, String value) {
        if (value != null && !value.isBlank()) target.put(key, value.trim());
    }

    static String normalizeSku(String sku) {
        return sku == null ? "" : sku.trim().toUpperCase(Locale.ENGLISH);
    }

    private static SheetProductSyncResult result(
            SheetProductRow row,
            String sku,
            String status,
            Long productId,
            String message
    ) {
        return new SheetProductSyncResult(row == null ? null : row.rowNumber(), sku, status, productId, message);
    }
}
