package com.jaee.service;

import com.jaee.dto.integration.SheetProductRow;
import com.jaee.dto.integration.SheetProductSyncResult;
import com.jaee.entity.Category;
import com.jaee.entity.Product;
import com.jaee.entity.ProductVariant;
import com.jaee.repository.CategoryRepository;
import com.jaee.repository.ProductRepository;
import com.jaee.repository.ProductVariantRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GoogleSheetProductRowSyncServiceTest {

    @Mock
    private ProductRepository productRepository;
    @Mock
    private ProductVariantRepository variantRepository;
    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private StockNotificationService stockNotificationService;

    @InjectMocks
    private GoogleSheetProductRowSyncService service;

    @Test
    void createsPublishedProductAndMapsSheetFields() {
        SheetProductRow row = new SheetProductRow(
                5, "j001", "Gulab Ishq", "A floral, hand-poured candle.",
                "Large", "Rose", "Red", BigDecimal.valueOf(29),
                BigDecimal.valueOf(149), 12, null, null, null);
        when(productRepository.findBySheetSkuIgnoreCase("J001")).thenReturn(Optional.empty());
        when(productRepository.findAllByNameIgnoreCase("Gulab Ishq")).thenReturn(List.of());
        when(productRepository.existsBySlug("gulab-ishq")).thenReturn(false);
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> {
            Product product = invocation.getArgument(0);
            product.setId(42L);
            return product;
        });
        when(variantRepository.findByProductIdWithDetails(42L)).thenReturn(List.of());

        SheetProductSyncResult result = service.sync(row);

        assertThat(result.status()).isEqualTo("created");
        assertThat(result.productId()).isEqualTo(42L);

        ArgumentCaptor<Product> productCaptor = ArgumentCaptor.forClass(Product.class);
        verify(productRepository, atLeastOnce()).save(productCaptor.capture());
        Product product = productCaptor.getValue();
        assertThat(product.getSheetSku()).isEqualTo("J001");
        assertThat(product.getName()).isEqualTo("Gulab Ishq");
        assertThat(product.getDescription()).isEqualTo("A floral, hand-poured candle.");
        assertThat(product.getPrice()).isEqualByComparingTo("149");
        assertThat(product.getBaseCost()).isEqualByComparingTo("29");
        assertThat(product.getStockQty()).isEqualTo(12);
        assertThat(product.getActive()).isTrue();
        assertThat(product.getOptions()).containsExactly("Size", "Scent", "Color");

        ArgumentCaptor<ProductVariant> variantCaptor = ArgumentCaptor.forClass(ProductVariant.class);
        verify(variantRepository).save(variantCaptor.capture());
        ProductVariant variant = variantCaptor.getValue();
        assertThat(variant.getSku()).isEqualTo("J001");
        assertThat(variant.getPrice()).isEqualByComparingTo("149");
        assertThat(variant.getExpense()).isEqualByComparingTo("29");
        assertThat(variant.getStockQty()).isEqualTo(12);
        assertThat(variant.getOptionValues())
                .containsEntry("Size", "Large")
                .containsEntry("Scent", "Rose")
                .containsEntry("Color", "Red");
    }

    @Test
    void updatesSheetOwnedFieldsButPreservesWebsiteFields() {
        Product product = Product.builder()
                .id(7L)
                .name("Old name")
                .slug("stable-storefront-url")
                .sheetSku("J001")
                .description("Hand-written storefront copy")
                .price(BigDecimal.TEN)
                .baseCost(BigDecimal.ONE)
                .stockQty(0)
                .active(true)
                .images(new ArrayList<>(List.of("https://example.com/candle.jpg")))
                .options(new ArrayList<>(List.of("Default")))
                .build();
        ProductVariant variant = ProductVariant.builder()
                .id(9L)
                .product(product)
                .sku("J001")
                .price(BigDecimal.TEN)
                .expense(BigDecimal.ONE)
                .stockQty(0)
                .active(true)
                .optionValues(new java.util.HashMap<>())
                .images(new ArrayList<>())
                .build();

        when(productRepository.findBySheetSkuIgnoreCase("J001")).thenReturn(Optional.of(product));
        when(variantRepository.findBySkuIgnoreCase("J001")).thenReturn(Optional.of(variant));
        when(productRepository.findAllByNameIgnoreCase("New name")).thenReturn(List.of());
        when(variantRepository.countByProduct_Id(7L)).thenReturn(1L);
        when(productRepository.save(product)).thenReturn(product);
        when(variantRepository.findByProductIdWithDetails(7L)).thenReturn(List.of(variant));

        SheetProductSyncResult result = service.sync(row("J001", "New name", 199, 40, 5));

        assertThat(result.status()).isEqualTo("updated");
        assertThat(product.getName()).isEqualTo("New name");
        assertThat(product.getSlug()).isEqualTo("stable-storefront-url");
        assertThat(product.getDescription()).isEqualTo("Hand-written storefront copy");
        assertThat(product.getImages()).containsExactly("https://example.com/candle.jpg");
        assertThat(product.getActive()).isTrue();
        verify(stockNotificationService).notifySubscribers(7L);
    }

    @Test
    void skipsIncompleteRowsWithoutWriting() {
        SheetProductRow row = new SheetProductRow(5, "", "Product", null, "", "", "",
                BigDecimal.TEN, BigDecimal.valueOf(100), 1, null, null, null);

        SheetProductSyncResult result = service.sync(row);

        assertThat(result.status()).isEqualTo("skipped");
        assertThat(result.message()).contains("SKU");
        verify(productRepository, never()).save(any());
        verify(variantRepository, never()).save(any());
    }

    @Test
    void skipsAmbiguousInitialNameMatch() {
        SheetProductRow row = row("J001", "Same Name", 149, 29, 12);
        Product first = Product.builder().id(1L).name("Same Name").build();
        Product second = Product.builder().id(2L).name("Same Name").build();
        when(productRepository.findBySheetSkuIgnoreCase("J001")).thenReturn(Optional.empty());
        when(productRepository.findAllByNameIgnoreCase("Same Name")).thenReturn(List.of(first, second));

        SheetProductSyncResult result = service.sync(row);

        assertThat(result.status()).isEqualTo("skipped");
        assertThat(result.message()).contains("More than one");
        verify(productRepository, never()).save(any());
    }

    @Test
    void createsQuoteOnRequestWhenWebsitePriceIsMissing() {
        SheetProductRow row = new SheetProductRow(
                8, "J007", "Mini Pond", null, "", "", "",
                BigDecimal.valueOf(16.30), null, 0, null, null, null);
        when(productRepository.findBySheetSkuIgnoreCase("J007")).thenReturn(Optional.empty());
        when(productRepository.findAllByNameIgnoreCase("Mini Pond")).thenReturn(List.of());
        when(productRepository.existsBySlug("mini-pond")).thenReturn(false);
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> {
            Product product = invocation.getArgument(0);
            product.setId(8L);
            return product;
        });
        when(variantRepository.findByProductIdWithDetails(8L)).thenReturn(List.of());

        SheetProductSyncResult result = service.sync(row);

        assertThat(result.status()).isEqualTo("created");
        ArgumentCaptor<Product> productCaptor = ArgumentCaptor.forClass(Product.class);
        verify(productRepository, atLeastOnce()).save(productCaptor.capture());
        Product product = productCaptor.getValue();
        assertThat(product.getPricingOnRequest()).isTrue();
        assertThat(product.getPrice()).isEqualByComparingTo("0");
        assertThat(product.getBaseCost()).isEqualByComparingTo("16.30");
    }

    @Test
    void replacesImagesWhenSheetUrlsArePresentAndKeepsAdminImagesWhenBlank() {
        Product product = Product.builder()
                .id(7L)
                .name("Gulab Ishq")
                .slug("gulab-ishq")
                .sheetSku("J001")
                .price(BigDecimal.TEN)
                .stockQty(1)
                .active(true)
                .images(new ArrayList<>(List.of("https://admin.example/a.jpg")))
                .options(new ArrayList<>())
                .build();
        ProductVariant variant = ProductVariant.builder()
                .id(9L)
                .product(product)
                .sku("J001")
                .price(BigDecimal.TEN)
                .stockQty(1)
                .active(true)
                .optionValues(new java.util.HashMap<>())
                .images(new ArrayList<>())
                .build();
        when(productRepository.findBySheetSkuIgnoreCase("J001")).thenReturn(Optional.of(product));
        when(variantRepository.findBySkuIgnoreCase("J001")).thenReturn(Optional.of(variant));
        when(productRepository.findAllByNameIgnoreCase("Gulab Ishq")).thenReturn(List.of(product));
        when(productRepository.save(product)).thenReturn(product);
        when(variantRepository.findByProductIdWithDetails(7L)).thenReturn(List.of(variant));

        service.sync(new SheetProductRow(
                5, "J001", "Gulab Ishq", null, "Large", "Rose", "Red",
                BigDecimal.ONE, BigDecimal.TEN, 1, null, null, null));
        assertThat(product.getImages()).containsExactly("https://admin.example/a.jpg");

        service.sync(new SheetProductRow(
                5, "J001", "Gulab Ishq", null, "Large", "Rose", "Red",
                BigDecimal.ONE, BigDecimal.TEN, 1, null, null,
                List.of("https://cdn.example/front.jpg\nhttps://cdn.example/side.jpg")));
        assertThat(product.getImages()).containsExactly(
                "https://cdn.example/front.jpg",
                "https://cdn.example/side.jpg");
    }

    @Test
    void assignsMultipleCategoriesFromSheet() {
        Category candles = Category.builder().id(1L).name("Candles").slug("candles").build();
        Category giftSets = Category.builder().id(2L).name("Gift Sets").slug("gift-sets").build();
        when(categoryRepository.findByNameIgnoreCase("Candle")).thenReturn(Optional.empty());
        when(categoryRepository.findBySlug("candle")).thenReturn(Optional.empty());
        when(categoryRepository.findBySlug("candles")).thenReturn(Optional.of(candles));
        when(categoryRepository.findByNameIgnoreCase("Gift Hamper")).thenReturn(Optional.empty());
        when(categoryRepository.findBySlug("gift-hamper")).thenReturn(Optional.empty());
        when(categoryRepository.findBySlug("gift-sets")).thenReturn(Optional.of(giftSets));

        when(productRepository.findBySheetSkuIgnoreCase("J010")).thenReturn(Optional.empty());
        when(productRepository.findAllByNameIgnoreCase("Gift Candle")).thenReturn(List.of());
        when(productRepository.existsBySlug("gift-candle")).thenReturn(false);
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> {
            Product product = invocation.getArgument(0);
            product.setId(55L);
            return product;
        });
        when(variantRepository.findByProductIdWithDetails(55L)).thenReturn(List.of());

        service.sync(new SheetProductRow(
                5, "J010", "Gift Candle", null, "Large", "Rose", "Red",
                BigDecimal.TEN, BigDecimal.valueOf(199), 3, true,
                List.of("Candle, Gift Hamper"), null));

        ArgumentCaptor<Product> productCaptor = ArgumentCaptor.forClass(Product.class);
        verify(productRepository, atLeastOnce()).save(productCaptor.capture());
        Set<String> categoryNames = new HashSet<>();
        productCaptor.getValue().getCategories()
                .forEach(category -> categoryNames.add(category.getName()));
        assertThat(categoryNames).containsExactlyInAnyOrder("Candles", "Gift Sets");
    }

    private static SheetProductRow row(String sku, String name, int price, int cost, int stock) {
        return new SheetProductRow(
                5,
                sku,
                name,
                null,
                "Large",
                "Rose",
                "Red",
                BigDecimal.valueOf(cost),
                BigDecimal.valueOf(price),
                stock,
                null,
                null,
                null
        );
    }

    @Test
    void honoursActiveColumnNo() {
        SheetProductRow row = new SheetProductRow(
                5, "J002", "Hidden Candle", null, "Large", "Rose", "Red",
                BigDecimal.TEN, BigDecimal.valueOf(100), 1, false, null, null);
        when(productRepository.findBySheetSkuIgnoreCase("J002")).thenReturn(Optional.empty());
        when(variantRepository.findBySkuIgnoreCase("J002")).thenReturn(Optional.empty());
        when(productRepository.findAllByNameIgnoreCase("Hidden Candle")).thenReturn(List.of());
        when(productRepository.existsBySlug("hidden-candle")).thenReturn(false);
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> {
            Product product = invocation.getArgument(0);
            product.setId(99L);
            return product;
        });
        when(variantRepository.findByProductIdWithDetails(99L)).thenReturn(List.of());

        service.sync(row);

        ArgumentCaptor<ProductVariant> variantCaptor = ArgumentCaptor.forClass(ProductVariant.class);
        verify(variantRepository).save(variantCaptor.capture());
        assertThat(variantCaptor.getValue().getActive()).isFalse();

        ArgumentCaptor<Product> productCaptor = ArgumentCaptor.forClass(Product.class);
        verify(productRepository, atLeastOnce()).save(productCaptor.capture());
        assertThat(productCaptor.getValue().getActive()).isFalse();
    }

    @Test
    void parseSheetActiveTreatsBlankAsYes() {
        assertThat(GoogleSheetProductRowSyncService.parseSheetActive((Boolean) null)).isTrue();
        assertThat(GoogleSheetProductRowSyncService.parseSheetActive(true)).isTrue();
        assertThat(GoogleSheetProductRowSyncService.parseSheetActive(false)).isFalse();
    }

    @Test
    void parseCategoryNamesSplitsCommaSeparatedValues() {
        assertThat(GoogleSheetProductRowSyncService.parseCategoryNames(List.of("Candle, Gift Hamper")))
                .containsExactly("Candle", "Gift Hamper");
        assertThat(GoogleSheetProductRowSyncService.parseCategoryNames(null)).isEmpty();
    }
}
