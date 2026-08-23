package com.jaee.dto.integration;

import java.util.List;

public record SheetProductSyncResponse(
        int created,
        int updated,
        int linked,
        int skipped,
        int failed,
        List<SheetProductSyncResult> results
) {
    public static SheetProductSyncResponse from(List<SheetProductSyncResult> results) {
        return new SheetProductSyncResponse(
                count(results, "created"),
                count(results, "updated"),
                count(results, "linked"),
                count(results, "skipped"),
                count(results, "failed"),
                List.copyOf(results)
        );
    }

    private static int count(List<SheetProductSyncResult> results, String status) {
        return (int) results.stream().filter(result -> status.equals(result.status())).count();
    }
}
