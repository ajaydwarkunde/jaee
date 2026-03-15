package com.jaee.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StoreSalesDto {
    private String storeType;
    private BigDecimal revenue;
    private Long itemsSold;
    private Long orderCount;
    private List<TopProduct> topProducts;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopProduct {
        private String name;
        private Long qtySold;
        private BigDecimal revenue;
    }
}
