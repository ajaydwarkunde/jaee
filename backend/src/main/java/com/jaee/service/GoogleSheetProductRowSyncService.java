package com.jaee.service;

import com.jaee.dto.integration.SheetProductRow;
import com.jaee.dto.integration.SheetProductSyncResult;
import com.jaee.entity.Category;
import com.jaee.entity.Product;
import com.jaee.entity.ProductVariant;
import com.jaee.entity.StoreType;
import com.jaee.repository.CategoryRepository;
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
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
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
    private final CategoryRepository categoryRepository;
    private final StockNotificationService stockNotificationService;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public SheetProductSyncResult sync(SheetProductRow row) {
        String validationError = validate(row);
        String normalizedSku = normalizeSku(row == null ? null : row.sku());
        if (validationError != null) {
            return result(row, normalizedSku, "skipped", null, validationError);
        }

        ProductVariant existingVariant = variantRepository.findBySkuIgnoreCase(normalizedSku).orElse(null);
        Product legacySkuOwner = existingVariant == null
                ? productRepository.findBySheetSkuIgnoreCase(normalizedSku).orElse(null)
                : existingVariant.getProduct();
        List<Product> nameMatches = productRepository.findAllByNameIgnoreCase(row.productName().trim());

        if (nameMatches.size() > 1 && nameMatches.stream().anyMatch(product -> !isSheetManaged(product))) {
            return result(row, normalizedSku, "skipped", null,
                    "More than one existing product has this name; rename duplicates before syncing variants");
        }

        String rowProductName = row.productName().trim();
        Product product = chooseCanonicalProduct(nameMatches);

        // A SKU synced under "Vanilla Whisper" must not stay on a container already named "Rope Jar".
        if (existingVariant != null) {
            Product currentOwner = existingVariant.getProduct();
            if (currentOwner != null
                    && !currentOwner.getName().equalsIgnoreCase(rowProductName)
                    && product != null
                    && product.getId() != null
                    && product.getId().equals(currentOwner.getId())) {
                product = null;
            }
        }

        if (product == null && legacySkuOwner != null) {
            boolean sameName = legacySkuOwner.getName().equalsIgnoreCase(rowProductName);
            boolean singleVariantOwner = legacySkuOwner.getId() != null
                    && variantRepository.countByProduct_Id(legacySkuOwner.getId()) <= 1;
            if (sameName || singleVariantOwner) {
                product = legacySkuOwner;
            }
        }

        boolean created = false;

        if (product == null) {
            product = createDraft(row, normalizedSku);
            created = true;
        } else if (!nameMatches.isEmpty()) {
            // Older one-SKU-one-product syncs left multiple sheet products with the same name.
            // Fold them into the canonical product so later rows become variants, not siblings.
            for (Product duplicate : nameMatches) {
                if (duplicate.getId() == null || duplicate.getId().equals(product.getId())) {
                    continue;
                }
                if (!isSheetManaged(duplicate)) {
                    continue;
                }
                absorbSheetDuplicate(product, duplicate);
            }
            // Variant instances loaded before the merge may still point at a deleted product.
            existingVariant = variantRepository.findBySkuIgnoreCase(normalizedSku).orElse(null);
        }

        if (existingVariant != null && !existingVariant.getProduct().getId().equals(product.getId())) {
            Product duplicate = existingVariant.getProduct();
            if (!isSafeSheetDuplicate(duplicate)) {
                return result(row, normalizedSku, "skipped", null,
                        "SKU already belongs to another active or manually managed product");
            }
            if (shouldAbsorbDuplicate(product, duplicate)) {
                absorbSheetDuplicate(product, duplicate);
            } else {
                if (product.getId() == null) {
                    product = productRepository.saveAndFlush(product);
                }
                reassignVariantToProduct(existingVariant, product);
            }
            existingVariant = variantRepository.findBySkuIgnoreCase(normalizedSku).orElse(null);
        }

        // sheet_sku is unique on products. A legacy one-SKU product may still own this SKU even
        // when the row is being grouped under a different same-name product — absorb it first.
        String sheetSkuClaimError = claimSheetSku(product, normalizedSku);
        if (sheetSkuClaimError != null) {
            return result(row, normalizedSku, "skipped", product.getId(), sheetSkuClaimError);
        }

        // Variants created before SKUs were globally unique are invisible to the lookup above,
        // so fall back to matching by SKU within the resolved product.
        if (existingVariant == null && product.getId() != null) {
            existingVariant = findVariantBySku(product.getId(), normalizedSku);
        }
        boolean linked = !created && existingVariant == null;

        Map<String, String> rowOptions = optionValues(row);
        if (product.getId() != null
                && clashesWithAnotherVariant(product.getId(), normalizedSku, existingVariant, rowOptions)) {
            return result(row, normalizedSku, "skipped", product.getId(),
                    "Another SKU already uses the same Size, Fragrance and Color combination");
        }

        int oldStock = product.getStockQty() == null ? 0 : product.getStockQty();
        product.setSheetLastSyncedAt(LocalDateTime.now());
        clearStaleStorefrontMetadataIfProductLineChanged(product, row, rowProductName);
        product.setName(rowProductName);
        applyDescriptionIfPresent(product, row.description());
        applyImagesIfPresent(product, row);
        applyCategoriesIfPresent(product, row.categories());

        product = productRepository.save(product);
        ProductVariant savedVariant =
                upsertSingleVariant(product, row, normalizedSku, rowOptions, existingVariant);
        aggregateProductFromVariants(product, savedVariant);
        product = productRepository.save(product);

        if (oldStock <= 0 && product.getStockQty() > 0 && Boolean.TRUE.equals(product.getActive())) {
            stockNotificationService.notifySubscribers(product.getId());
        }

        String status = created ? "created" : linked ? "linked" : "updated";
        log.info("Google Sheet {} product {} ({})", status, product.getId(), normalizedSku);
        return result(row, normalizedSku, status, product.getId(),
                created ? "Product created and published" : linked ? "Linked by exact product name" : "Product updated");
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
                .description(hasText(row.description()) ? row.description().trim() : DRAFT_DESCRIPTION)
                .price(row.websitePrice() == null || row.websitePrice().compareTo(BigDecimal.ZERO) <= 0
                        ? BigDecimal.ZERO
                        : row.websitePrice())
                .pricingOnRequest(row.websitePrice() == null || row.websitePrice().compareTo(BigDecimal.ZERO) <= 0)
                .baseCost(row.totalCost())
                .weightKg(new BigDecimal("0.500"))
                .currency("INR")
                .stockQty(row.stockQuantity() == null ? 0 : row.stockQuantity())
                .active(parseSheetActive(row.active()))
                .options(new ArrayList<>())
                .images(new ArrayList<>(parseImageUrls(row.imageUrls())))
                .build();
    }

    private ProductVariant upsertSingleVariant(
            Product product,
            SheetProductRow row,
            String sku,
            Map<String, String> optionValues,
            ProductVariant variant
    ) {
        if (variant == null) {
            variant = ProductVariant.builder()
                    .product(product)
                    .sortOrder((int) variantRepository.countByProduct_Id(product.getId()))
                    .active(true)
                    .build();
        }

        boolean pricingOnRequest = row.websitePrice() == null
                || row.websitePrice().compareTo(BigDecimal.ZERO) <= 0;
        variant.setProduct(product);
        variant.setSku(sku);
        variant.setPrice(pricingOnRequest ? BigDecimal.ZERO : row.websitePrice());
        variant.setPricingOnRequest(pricingOnRequest);
        variant.setExpense(row.totalCost());
        variant.setStockQty(row.stockQuantity() == null ? 0 : row.stockQuantity());
        variant.setActive(parseSheetActive(row.active()));
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
        return variant;
    }

    private ProductVariant findVariantBySku(Long productId, String sku) {
        return variantRepository.findByProductIdWithDetails(productId).stream()
                .filter(candidate -> candidate.getSku() != null && candidate.getSku().equalsIgnoreCase(sku))
                .findFirst()
                .orElse(null);
    }

    /** Two SKUs sharing one option combination would make the second unreachable in the selector. */
    private boolean clashesWithAnotherVariant(
            Long productId,
            String sku,
            ProductVariant current,
            Map<String, String> rowOptions
    ) {
        return variantRepository.findByProductIdWithDetails(productId).stream()
                .filter(candidate -> !isSameVariant(candidate, current))
                .filter(candidate -> candidate.getSku() == null || !candidate.getSku().equalsIgnoreCase(sku))
                .anyMatch(candidate -> normalizedOptions(candidate.getOptionValues()).equals(rowOptions));
    }

    private static boolean isSameVariant(ProductVariant left, ProductVariant right) {
        if (left == null || right == null) {
            return false;
        }
        if (left == right) {
            return true;
        }
        if (left.getId() != null && left.getId().equals(right.getId())) {
            return true;
        }
        return left.getSku() != null && right.getSku() != null
                && left.getSku().equalsIgnoreCase(right.getSku());
    }

    private void aggregateProductFromVariants(Product product, ProductVariant justSaved) {
        List<ProductVariant> variants =
                new ArrayList<>(variantRepository.findByProductIdWithDetails(product.getId()));
        if (justSaved != null && variants.stream().noneMatch(variant -> isSameVariant(variant, justSaved))) {
            variants.add(justSaved);
        }

        List<ProductVariant> activeVariants = variants.stream()
                .filter(variant -> Boolean.TRUE.equals(variant.getActive()))
                .toList();

        int totalStock = activeVariants.stream()
                .map(ProductVariant::getStockQty)
                .filter(java.util.Objects::nonNull)
                .mapToInt(Integer::intValue)
                .sum();

        List<BigDecimal> sellablePrices = activeVariants.stream()
                .filter(variant -> !Boolean.TRUE.equals(variant.getPricingOnRequest()))
                .map(ProductVariant::getPrice)
                .filter(java.util.Objects::nonNull)
                .filter(price -> price.compareTo(BigDecimal.ZERO) > 0)
                .toList();

        product.setStockQty(totalStock);
        product.setPricingOnRequest(sellablePrices.isEmpty());
        product.setPrice(sellablePrices.stream().min(BigDecimal::compareTo).orElse(BigDecimal.ZERO));
        product.setBaseCost(activeVariants.stream()
                .map(ProductVariant::getExpense)
                .filter(java.util.Objects::nonNull)
                .min(BigDecimal::compareTo)
                .orElse(null));

        Set<String> optionNames = new LinkedHashSet<>();
        for (String preferred : List.of("Size", "Scent", "Color")) {
            if (activeVariants.stream().anyMatch(variant ->
                    variant.getOptionValues() != null
                            && isApplicableOptionValue(variant.getOptionValues().get(preferred)))) {
                optionNames.add(preferred);
            }
        }
        activeVariants.stream()
                .map(ProductVariant::getOptionValues)
                .filter(java.util.Objects::nonNull)
                .flatMap(values -> values.entrySet().stream())
                .filter(entry -> !"Default".equals(entry.getKey()))
                .filter(entry -> isApplicableOptionValue(entry.getValue()))
                .map(Map.Entry::getKey)
                .forEach(optionNames::add);
        if (optionNames.isEmpty()) {
            optionNames.add("Default");
        }

        if (product.getOptions() == null) {
            product.setOptions(new ArrayList<>());
        } else {
            product.getOptions().clear();
        }
        product.getOptions().addAll(optionNames);
        product.setActive(!activeVariants.isEmpty());
    }

    private static Product chooseCanonicalProduct(List<Product> matches) {
        return matches.stream()
                .sorted(Comparator
                        .comparing((Product product) -> !Boolean.TRUE.equals(product.getActive()))
                        .thenComparing(product -> product.getId() == null ? Long.MAX_VALUE : product.getId()))
                .findFirst()
                .orElse(null);
    }

    private static boolean isSheetManaged(Product product) {
        return product != null && hasText(product.getSheetSku());
    }

    private static boolean isSafeSheetDuplicate(Product product) {
        // Active sheet-managed orphans (created before name-based variant grouping) are safe to
        // fold into the canonical product for the shared Product Name.
        return isSheetManaged(product);
    }

    /**
     * Same-name sheet orphans from the old one-SKU model can be merged wholesale. When the sheet
     * Product Name differs, only move the matching SKU — never pull every variant from another
     * product (e.g. Rope Jar rows must not stay under Vanilla Whisper).
     */
    private boolean shouldAbsorbDuplicate(Product target, Product source) {
        if (target == null || source == null) {
            return false;
        }
        if (target.getId() != null && source.getId() != null && target.getId().equals(source.getId())) {
            return false;
        }
        if (target.getName().equalsIgnoreCase(source.getName())) {
            return true;
        }
        return variantRepository.countByProduct_Id(source.getId()) <= 1;
    }

    private void reassignVariantToProduct(ProductVariant variant, Product target) {
        Product source = variant.getProduct();
        variant.setProduct(target);
        variantRepository.save(variant);
        if (source != null && source.getId() != null && !source.getId().equals(target.getId())) {
            refreshProductAggregates(source);
        }
    }

    private void refreshProductAggregates(Product product) {
        List<ProductVariant> remaining = variantRepository.findByProductIdWithDetails(product.getId());
        if (remaining.isEmpty()) {
            product.setActive(false);
            product.setStockQty(0);
            productRepository.save(product);
            return;
        }
        aggregateProductFromVariants(product, null);
        productRepository.save(product);
    }

    /**
     * Move every variant from a same-name sheet orphan onto the canonical product, then delete the
     * orphan. Metadata such as images is merged first so nothing storefront-owned is lost.
     * The orphan's sheet_sku is cleared before delete so the unique index never sees two owners.
     */
    private void absorbSheetDuplicate(Product target, Product source) {
        if (target.getId() == null) {
            target = productRepository.saveAndFlush(target);
        }
        mergeProductMetadata(target, source);

        String releasedSheetSku = source.getSheetSku();
        source.setSheetSku(null);
        productRepository.saveAndFlush(source);

        if (!hasText(target.getSheetSku()) && hasText(releasedSheetSku)) {
            target.setSheetSku(releasedSheetSku);
            productRepository.saveAndFlush(target);
        }

        List<ProductVariant> variants = variantRepository.findByProductIdWithDetails(source.getId());
        for (ProductVariant variant : variants) {
            variant.setProduct(target);
            variantRepository.save(variant);
        }
        variantRepository.flush();
        productRepository.delete(source);
        productRepository.flush();
        log.info("Merged sheet duplicate product {} into {}", source.getId(), target.getId());
    }

    /**
     * Ensure this product may safely use {@code sku} as its sheet_sku. Absorbs a legacy product
     * that still owns the value, otherwise leaves an existing non-blank sheet_sku untouched.
     */
    private String claimSheetSku(Product product, String sku) {
        if (product.getId() == null) {
            productRepository.saveAndFlush(product);
        }

        Product sheetSkuOwner = productRepository.findBySheetSkuIgnoreCase(sku).orElse(null);
        if (sheetSkuOwner != null && !sheetSkuOwner.getId().equals(product.getId())) {
            if (!isSafeSheetDuplicate(sheetSkuOwner)) {
                return "SKU already belongs to another active or manually managed product";
            }
            if (shouldAbsorbDuplicate(product, sheetSkuOwner)) {
                absorbSheetDuplicate(product, sheetSkuOwner);
            } else {
                sheetSkuOwner.setSheetSku(null);
                productRepository.saveAndFlush(sheetSkuOwner);
            }
        }

        if (!hasText(product.getSheetSku())) {
            product.setSheetSku(sku);
            productRepository.saveAndFlush(product);
        }
        return null;
    }

    private static void mergeProductMetadata(Product target, Product source) {
        if ((!hasText(target.getDescription()) || DRAFT_DESCRIPTION.equals(target.getDescription()))
                && hasText(source.getDescription())
                && !DRAFT_DESCRIPTION.equals(source.getDescription())) {
            target.setDescription(source.getDescription());
        }
        if ((target.getImages() == null || target.getImages().isEmpty())
                && source.getImages() != null && !source.getImages().isEmpty()) {
            target.setImages(new ArrayList<>(source.getImages()));
        }
        if ((target.getVideos() == null || target.getVideos().isEmpty())
                && source.getVideos() != null && !source.getVideos().isEmpty()) {
            target.setVideos(new ArrayList<>(source.getVideos()));
        }
        if (target.getCategories() != null && source.getCategories() != null) {
            target.getCategories().addAll(source.getCategories());
        }
        if (Boolean.TRUE.equals(source.getCustomizationEnabled())) {
            target.setCustomizationEnabled(true);
        }
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

    /**
     * Non-empty Category cells replace the product's category set. Blank preserves admin assignments.
     * Values may be comma/semicolon separated (e.g. {@code Candle, Gift Hamper}).
     */
    private void applyCategoriesIfPresent(Product product, List<String> categoryNames) {
        List<String> names = parseCategoryNames(categoryNames);
        if (names.isEmpty()) {
            return;
        }
        Set<Category> resolved = new HashSet<>();
        for (String name : names) {
            resolved.add(resolveOrCreateCategory(name));
        }
        if (product.getCategories() == null) {
            product.setCategories(new HashSet<>());
        } else {
            product.getCategories().clear();
        }
        product.getCategories().addAll(resolved);
        log.info("Sheet categories for product {}: {}", product.getId(),
                resolved.stream().map(Category::getName).toList());
    }

    static List<String> parseCategoryNames(List<String> rawNames) {
        if (rawNames == null || rawNames.isEmpty()) {
            return List.of();
        }
        LinkedHashSet<String> names = new LinkedHashSet<>();
        for (String raw : rawNames) {
            if (raw == null) continue;
            for (String token : raw.split("[,;|/\\n]+")) {
                String name = token.trim().replaceAll("\\s+", " ");
                if (!name.isEmpty()) {
                    names.add(name);
                }
            }
        }
        return new ArrayList<>(names);
    }

    private Category resolveOrCreateCategory(String rawName) {
        String trimmed = rawName.trim().replaceAll("\\s+", " ");
        String slug = toSlug(trimmed);

        Category byName = categoryRepository.findByNameIgnoreCase(trimmed).orElse(null);
        if (byName != null) {
            return byName;
        }
        Category bySlug = categoryRepository.findBySlug(slug).orElse(null);
        if (bySlug != null) {
            return bySlug;
        }

        // Common sheet shorthand → existing seeded categories.
        Category alias = resolveCategoryAlias(trimmed, slug);
        if (alias != null) {
            return alias;
        }

        String displayName = toTitleCase(trimmed);
        Category created = Category.builder()
                .name(displayName)
                .slug(uniqueCategorySlug(slug.isBlank() ? "category" : slug))
                .storeType(inferStoreType(displayName))
                .build();
        return categoryRepository.save(created);
    }

    private Category resolveCategoryAlias(String trimmed, String slug) {
        String key = trimmed.toLowerCase(Locale.ENGLISH);
        String mappedSlug = switch (key) {
            case "candle", "candles" -> "candles";
            case "gift hamper", "gift hampers", "hamper", "hampers", "gift set", "gift sets" -> "gift-sets";
            case "diffuser", "diffusers" -> "diffusers";
            case "home decor", "home décor", "decor", "décor" -> "home-decor";
            default -> null;
        };
        if (mappedSlug == null && (slug.equals("candle") || slug.equals("candles"))) {
            mappedSlug = "candles";
        }
        if (mappedSlug == null) {
            return null;
        }
        return categoryRepository.findBySlug(mappedSlug).orElse(null);
    }

    private String uniqueCategorySlug(String base) {
        String candidate = base;
        int suffix = 1;
        while (categoryRepository.existsBySlug(candidate)) {
            candidate = base + "-" + suffix++;
        }
        return candidate;
    }

    private static StoreType inferStoreType(String name) {
        String lower = name.toLowerCase(Locale.ENGLISH);
        if (lower.contains("hamper") || lower.contains("gift")) {
            return StoreType.HAMPER;
        }
        if (lower.contains("candle")) {
            return StoreType.CANDLE;
        }
        return null;
    }

    private static String toTitleCase(String input) {
        String[] parts = input.toLowerCase(Locale.ENGLISH).split("\\s+");
        StringBuilder out = new StringBuilder();
        for (String part : parts) {
            if (part.isEmpty()) continue;
            if (!out.isEmpty()) out.append(' ');
            out.append(Character.toUpperCase(part.charAt(0)));
            if (part.length() > 1) {
                out.append(part.substring(1));
            }
        }
        return out.toString();
    }

    private static void applyDescriptionIfPresent(Product product, String description) {
        if (hasText(description)) {
            product.setDescription(description.trim());
        }
    }

    /**
     * When a sheet row renames a product line but the slug still reflects an older name (e.g. slug
     * {@code vanilla-whisper} with display name {@code Rope Jar}), drop storefront copy/images that
     * belonged to the previous line unless the row supplies replacements.
     */
    private static void clearStaleStorefrontMetadataIfProductLineChanged(
            Product product,
            SheetProductRow row,
            String rowProductName
    ) {
        if (product == null || product.getId() == null || !hasText(rowProductName)) {
            return;
        }
        // Renaming in progress — slug is often kept for SEO; do not wipe admin copy yet.
        if (product.getName() == null || !product.getName().equalsIgnoreCase(rowProductName)) {
            return;
        }
        String expectedSlug = toSlug(rowProductName);
        String currentSlug = product.getSlug();
        if (currentSlug == null || currentSlug.equals(expectedSlug) || currentSlug.startsWith(expectedSlug + "-")) {
            return;
        }
        if (!hasText(row.description())
                && hasText(product.getDescription())
                && !DRAFT_DESCRIPTION.equals(product.getDescription())) {
            product.setDescription(DRAFT_DESCRIPTION);
        }
        if (parseImageUrls(row.imageUrls()).isEmpty()
                && product.getImages() != null
                && !product.getImages().isEmpty()) {
            product.getImages().clear();
        }
    }

    /**
     * After a multi-row batch, ensure every synced SKU sits under the product named in its sheet row.
     * Catches legacy merges where unrelated variants were folded into one product page.
     */
    public void reconcileBatchVariantPlacement(List<SheetProductRow> rows) {
        if (rows == null || rows.isEmpty()) {
            return;
        }
        Map<String, SheetProductRow> rowBySku = new LinkedHashMap<>();
        for (SheetProductRow row : rows) {
            String sku = normalizeSku(row == null ? null : row.sku());
            if (sku.isBlank() || row == null || !hasText(row.productName())) {
                continue;
            }
            rowBySku.putIfAbsent(sku, row);
        }
        for (SheetProductRow row : rowBySku.values()) {
            String sku = normalizeSku(row.sku());
            ProductVariant variant = variantRepository.findBySkuIgnoreCase(sku).orElse(null);
            if (variant == null) {
                continue;
            }
            Product owner = variant.getProduct();
            String expectedName = row.productName().trim();
            if (owner == null || owner.getName().equalsIgnoreCase(expectedName)) {
                continue;
            }
            sync(row);
        }
    }

    private static boolean hasText(String value) {
        return value != null && !value.isBlank();
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

    private static Map<String, String> normalizedOptions(Map<String, String> options) {
        if (options == null || options.isEmpty()
                || (options.size() == 1 && "Default".equals(options.get("Default")))) {
            return Map.of();
        }
        Map<String, String> normalized = new LinkedHashMap<>();
        options.forEach((key, value) -> {
            if (!"Default".equals(key) && isApplicableOptionValue(value)) {
                normalized.put(key, value.trim());
            }
        });
        return normalized;
    }

    private static void putIfPresent(Map<String, String> target, String key, String value) {
        if (!isApplicableOptionValue(value)) return;
        target.put(key, value.trim());
    }

    private static boolean isApplicableOptionValue(String value) {
        if (value == null || value.isBlank()) return false;
        String normalized = value.trim().toLowerCase(Locale.ENGLISH);
        return !Set.of(
                "n/a",
                "na",
                "n.a.",
                "n.a",
                "not applicable",
                "not applicable.",
                "none",
                "nil",
                "-",
                "--",
                "default"
        ).contains(normalized);
    }

    static boolean parseSheetActive(Boolean active) {
        return active == null || active;
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
