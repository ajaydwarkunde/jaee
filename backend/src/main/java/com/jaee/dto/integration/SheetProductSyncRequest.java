package com.jaee.dto.integration;

import java.util.List;

public record SheetProductSyncRequest(List<SheetProductRow> rows) {
}
