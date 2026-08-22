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
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
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
        assertThat(created.getActive()).isFalse();
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
