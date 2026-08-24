package com.jaee.controller;

import com.jaee.entity.Product;
import com.jaee.repository.ProductRepository;
import com.jaee.repository.ProductVariantRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class GoogleSheetProductSyncIntegrationTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private ProductVariantRepository variantRepository;

    @AfterEach
    void cleanUp() {
        productRepository.findBySheetSkuIgnoreCase("J001").ifPresent(productRepository::delete);
        productRepository.findAllByNameIgnoreCase("Variant Group Candle")
                .forEach(productRepository::delete);
        productRepository.findAllByNameIgnoreCase("Grouped Pond")
                .forEach(productRepository::delete);
        productRepository.findAllByNameIgnoreCase("Legacy J010 Name")
                .forEach(productRepository::delete);
        productRepository.findBySheetSkuIgnoreCase("VT-A").ifPresent(productRepository::delete);
        productRepository.findBySheetSkuIgnoreCase("J010").ifPresent(productRepository::delete);
        productRepository.findBySheetSkuIgnoreCase("J010-BASE").ifPresent(productRepository::delete);
        productRepository.findAllByNameIgnoreCase("Vanilla Whisper")
                .forEach(productRepository::delete);
        productRepository.findAllByNameIgnoreCase("Rope Jar")
                .forEach(productRepository::delete);
    }

    @Test
    void sameProductNameClaimsLegacySheetSkuWithoutUniqueViolation() throws Exception {
        // Legacy one-SKU product that still owns sheet_sku J010 under a different display name.
        mockMvc.perform(post("/integrations/google-sheets/products/sync")
                        .header("X-Sheet-Sync-Secret", "test-sheet-secret")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "rows": [{
                                    "rowNumber": 5,
                                    "sku": "J010",
                                    "productName": "Legacy J010 Name",
                                    "size": "Small",
                                    "fragrance": "Rose",
                                    "color": "Red",
                                    "totalCost": 10,
                                    "websitePrice": 100,
                                    "stockQuantity": 1
                                  }]
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.created").value(1));

        // Group that SKU under a shared Product Name that already has another variant.
        String payload = """
                {
                  "rows": [
                    {
                      "rowNumber": 6,
                      "sku": "J010-BASE",
                      "productName": "Grouped Pond",
                      "size": "Medium",
                      "fragrance": "Lotus",
                      "color": "Blue",
                      "totalCost": 20,
                      "websitePrice": 200,
                      "stockQuantity": 2
                    },
                    {
                      "rowNumber": 7,
                      "sku": "J010",
                      "productName": "Grouped Pond",
                      "size": "Large",
                      "fragrance": "Jasmine",
                      "color": "White",
                      "totalCost": 30,
                      "websitePrice": 300,
                      "stockQuantity": 4
                    }
                  ]
                }
                """;

        mockMvc.perform(post("/integrations/google-sheets/products/sync")
                        .header("X-Sheet-Sync-Secret", "test-sheet-secret")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.failed").value(0))
                .andExpect(jsonPath("$.data.skipped").value(0));

        assertThat(productRepository.findAllByNameIgnoreCase("Grouped Pond")).hasSize(1);
        assertThat(productRepository.findAllByNameIgnoreCase("Legacy J010 Name")).isEmpty();
        Product grouped = productRepository.findAllByNameIgnoreCase("Grouped Pond").getFirst();
        assertThat(variantRepository.findByProductIdWithDetails(grouped.getId()))
                .extracting(v -> v.getSku().toUpperCase())
                .contains("J010", "J010-BASE");
    }

    @Test
    void differentProductNameMovesSingleVariantWithoutAbsorbingSiblings() throws Exception {
        mockMvc.perform(post("/integrations/google-sheets/products/sync")
                        .header("X-Sheet-Sync-Secret", "test-sheet-secret")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "rows": [
                                    {
                                      "rowNumber": 5,
                                      "sku": "VW-1",
                                      "productName": "Vanilla Whisper",
                                      "size": "Small",
                                      "fragrance": "Vanilla",
                                      "color": "White",
                                      "totalCost": 10,
                                      "websitePrice": 100,
                                      "stockQuantity": 1
                                    },
                                    {
                                      "rowNumber": 6,
                                      "sku": "RJ-1",
                                      "productName": "Vanilla Whisper",
                                      "size": "Medium",
                                      "fragrance": "Unscented",
                                      "color": "Cream",
                                      "totalCost": 12,
                                      "websitePrice": 120,
                                      "stockQuantity": 2
                                    }
                                  ]
                                }
                                """))
                .andExpect(status().isOk());

        mockMvc.perform(post("/integrations/google-sheets/products/sync")
                        .header("X-Sheet-Sync-Secret", "test-sheet-secret")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "rows": [
                                    {
                                      "rowNumber": 7,
                                      "sku": "RJ-1",
                                      "productName": "Rope Jar",
                                      "size": "Not Applicable",
                                      "fragrance": "Lavender",
                                      "color": "Cream",
                                      "totalCost": 12,
                                      "websitePrice": 120,
                                      "stockQuantity": 2
                                    },
                                    {
                                      "rowNumber": 8,
                                      "sku": "RJ-2",
                                      "productName": "Rope Jar",
                                      "size": "N/A",
                                      "fragrance": "Rose",
                                      "color": "Cream",
                                      "totalCost": 12,
                                      "websitePrice": 120,
                                      "stockQuantity": 3
                                    }
                                  ]
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.failed").value(0))
                .andExpect(jsonPath("$.data.skipped").value(0));

        assertThat(productRepository.findAllByNameIgnoreCase("Vanilla Whisper")).hasSize(1);
        assertThat(productRepository.findAllByNameIgnoreCase("Rope Jar")).hasSize(1);

        Product vanilla = productRepository.findAllByNameIgnoreCase("Vanilla Whisper").getFirst();
        Product ropeJar = productRepository.findAllByNameIgnoreCase("Rope Jar").getFirst();

        assertThat(variantRepository.findByProductIdWithDetails(vanilla.getId()))
                .extracting(v -> v.getSku().toUpperCase())
                .containsExactly("VW-1");
        assertThat(variantRepository.findByProductIdWithDetails(ropeJar.getId()))
                .extracting(v -> v.getSku().toUpperCase())
                .containsExactlyInAnyOrder("RJ-1", "RJ-2");

        mockMvc.perform(get("/products/" + ropeJar.getSlug()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.variants.length()").value(2))
                .andExpect(jsonPath("$.data.options").value(org.hamcrest.Matchers.not(org.hamcrest.Matchers.hasItem("Size"))));
    }

    @Test
    void sameProductNameWithDifferentOptionsCreatesOneProductWithTwoVariants() throws Exception {
        String payload = """
                {
                  "rows": [
                    {
                      "rowNumber": 5,
                      "sku": "VT-A",
                      "productName": "Variant Group Candle",
                      "size": "Small",
                      "fragrance": "Rose",
                      "color": "Red",
                      "totalCost": 20,
                      "websitePrice": 199,
                      "stockQuantity": 3
                    },
                    {
                      "rowNumber": 6,
                      "sku": "VT-B",
                      "productName": "Variant Group Candle",
                      "size": "Large",
                      "fragrance": "Jasmine",
                      "color": "White",
                      "totalCost": 35,
                      "websitePrice": 299,
                      "stockQuantity": 5
                    }
                  ]
                }
                """;

        mockMvc.perform(post("/integrations/google-sheets/products/sync")
                        .header("X-Sheet-Sync-Secret", "test-sheet-secret")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.created").value(1))
                .andExpect(jsonPath("$.data.linked").value(1))
                .andExpect(jsonPath("$.data.failed").value(0))
                .andExpect(jsonPath("$.data.skipped").value(0));

        assertThat(productRepository.findAllByNameIgnoreCase("Variant Group Candle")).hasSize(1);
        Product product = productRepository.findAllByNameIgnoreCase("Variant Group Candle").getFirst();
        assertThat(product.getActive()).isTrue();
        assertThat(product.getStockQty()).isEqualTo(8);

        var variants = variantRepository.findByProductIdWithDetails(product.getId());
        assertThat(variants).hasSize(2);
        assertThat(variants).extracting(v -> v.getSku().toUpperCase())
                .containsExactlyInAnyOrder("VT-A", "VT-B");
        assertThat(variants)
                .anySatisfy(v -> assertThat(v.getOptionValues())
                        .containsEntry("Size", "Small")
                        .containsEntry("Scent", "Rose")
                        .containsEntry("Color", "Red"));
        assertThat(variants)
                .anySatisfy(v -> assertThat(v.getOptionValues())
                        .containsEntry("Size", "Large")
                        .containsEntry("Scent", "Jasmine")
                        .containsEntry("Color", "White"));

        mockMvc.perform(get("/products/" + product.getSlug()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.variants.length()").value(2))
                .andExpect(jsonPath("$.data.options").value(org.hamcrest.Matchers.containsInAnyOrder(
                        "Size", "Scent", "Color")));
    }

    @Test
    void webhookCreatesThenIdempotentlyUpdatesProduct() throws Exception {
        mockMvc.perform(post("/integrations/google-sheets/products/sync")
                        .header("X-Sheet-Sync-Secret", "test-sheet-secret")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload(149, 29, 4)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.created").value(1))
                .andExpect(jsonPath("$.data.failed").value(0));

        Product created = productRepository.findBySheetSkuIgnoreCase("J001").orElseThrow();
        assertThat(created.getActive()).isTrue();
        assertThat(created.getPrice()).isEqualByComparingTo("149");
        assertThat(variantRepository.findByProductIdWithDetails(created.getId())).hasSize(1);

        mockMvc.perform(post("/integrations/google-sheets/products/sync")
                        .header("X-Sheet-Sync-Secret", "test-sheet-secret")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload(199, 35, 8)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.updated").value(1))
                .andExpect(jsonPath("$.data.created").value(0));

        Product updated = productRepository.findBySheetSkuIgnoreCase("J001").orElseThrow();
        assertThat(updated.getId()).isEqualTo(created.getId());
        assertThat(updated.getPrice()).isEqualByComparingTo("199");
        assertThat(updated.getBaseCost()).isEqualByComparingTo("35");
        assertThat(updated.getStockQty()).isEqualTo(8);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void syncedProductIsVisiblePubliclyAndToAdmin() throws Exception {
        mockMvc.perform(post("/integrations/google-sheets/products/sync")
                        .header("X-Sheet-Sync-Secret", "test-sheet-secret")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload(149, 29, 4)))
                .andExpect(status().isOk());

        Product product = productRepository.findBySheetSkuIgnoreCase("J001").orElseThrow();
        assertThat(product.getActive()).isTrue();

        // Sheet products are published automatically.
        mockMvc.perform(get("/products").param("search", "Gulab Ishq Wax Sachet").param("pageSize", "50"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[?(@.sheetSku == 'J001')]").isNotEmpty());

        // Admin sees the same published state.
        mockMvc.perform(get("/admin/products").param("search", "J001").param("pageSize", "50"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[?(@.sheetSku == 'J001')]").isNotEmpty())
                .andExpect(jsonPath("$.data.content[0].active").value(true))
                .andExpect(jsonPath("$.data.content[0].name").value("Gulab Ishq Wax Sachet"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void adminListingSearchesBySheetSkuAndName() throws Exception {
        mockMvc.perform(post("/integrations/google-sheets/products/sync")
                        .header("X-Sheet-Sync-Secret", "test-sheet-secret")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload(149, 29, 4)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/admin/products").param("search", "j001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[?(@.sheetSku == 'J001')]").isNotEmpty());

        mockMvc.perform(get("/admin/products").param("search", "gulab ishq"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[?(@.sheetSku == 'J001')]").isNotEmpty());
    }

    @Test
    @WithMockUser(roles = "USER")
    void adminListingIsForbiddenForRegularUser() throws Exception {
        mockMvc.perform(get("/admin/products"))
                .andExpect(status().isForbidden());
    }

    @Test
    void webhookRejectsWrongSecret() throws Exception {
        mockMvc.perform(post("/integrations/google-sheets/products/sync")
                        .header("X-Sheet-Sync-Secret", "wrong")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload(149, 29, 4)))
                .andExpect(status().isUnauthorized());
    }

    private static String payload(int price, int cost, int stock) {
        return """
                {
                  "rows": [{
                    "rowNumber": 5,
                    "sku": "J001",
                    "productName": "Gulab Ishq Wax Sachet",
                    "size": "Not Applicable",
                    "fragrance": "Jasmine",
                    "color": "",
                    "totalCost": %d,
                    "websitePrice": %d,
                    "stockQuantity": %d
                  }]
                }
                """.formatted(cost, price, stock);
    }
}
