package com.jaee.service;

import com.jaee.dto.integration.SheetProductRow;
import com.jaee.dto.integration.SheetProductSyncRequest;
import com.jaee.dto.integration.SheetProductSyncResponse;
import com.jaee.dto.integration.SheetProductSyncResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class GoogleSheetProductSyncService {

    private static final int MAX_ROWS_PER_REQUEST = 500;

    private final GoogleSheetProductRowSyncService rowSyncService;
    private final CatalogCacheService catalogCacheService;

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

        if (results.stream().anyMatch(SheetProductSyncResult::changed)) {
            catalogCacheService.evictAll();
        }
        return SheetProductSyncResponse.from(results);
    }
}
