package com.jaee.service;

import com.jaee.dto.integration.SheetProductRow;
import com.jaee.dto.integration.SheetProductSyncRequest;
import com.jaee.dto.integration.SheetProductSyncResponse;
import com.jaee.dto.integration.SheetProductSyncResult;
import com.jaee.repository.ProductRepository;
import com.jaee.repository.ProductVariantRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GoogleSheetProductSyncServiceTest {

    @Mock
    private GoogleSheetProductRowSyncService rowSyncService;
    @Mock
    private CatalogCacheService catalogCacheService;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private ProductVariantRepository variantRepository;

    @InjectMocks
    private GoogleSheetProductSyncService service;

    @Test
    void aggregatesResultsAndEvictsCacheOnce() {
        SheetProductRow first = row(5, "J001");
        SheetProductRow second = row(6, "J002");
        when(rowSyncService.sync(first))
                .thenReturn(new SheetProductSyncResult(5, "J001", "created", 1L, "Draft created"));
        when(rowSyncService.sync(second))
                .thenReturn(new SheetProductSyncResult(6, "J002", "updated", 2L, "Updated"));

        SheetProductSyncResponse response =
                service.sync(new SheetProductSyncRequest(List.of(first, second)));

        assertThat(response.created()).isEqualTo(1);
        assertThat(response.updated()).isEqualTo(1);
        assertThat(response.failed()).isZero();
        verify(rowSyncService).reconcileBatchVariantPlacement(List.of(first, second));
        verify(catalogCacheService).evictAll();
    }

    @Test
    void convertsOneRowFailureWithoutDroppingOtherResults() {
        SheetProductRow first = row(5, "J001");
        SheetProductRow second = row(6, "J002");
        when(rowSyncService.sync(first)).thenThrow(new IllegalStateException("Ambiguous variants"));
        when(rowSyncService.sync(second))
                .thenReturn(new SheetProductSyncResult(6, "J002", "skipped", null, "Missing stock"));

        SheetProductSyncResponse response =
                service.sync(new SheetProductSyncRequest(List.of(first, second)));

        assertThat(response.failed()).isEqualTo(1);
        assertThat(response.skipped()).isEqualTo(1);
        assertThat(response.results().getFirst().message()).contains("Ambiguous variants");
        verify(catalogCacheService, never()).evictAll();
    }

    private static SheetProductRow row(int rowNumber, String sku) {
        return new SheetProductRow(
                rowNumber,
                sku,
                "Product " + sku,
                null,
                "Large",
                "Rose",
                "Red",
                BigDecimal.TEN,
                BigDecimal.valueOf(100),
                1,
                null,
                null,
                null
        );
    }
}
