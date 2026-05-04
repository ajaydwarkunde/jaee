package com.jaee.util;

import com.jaee.entity.ProductVariant;

import java.util.Map;
import java.util.stream.Collectors;

public final class VariantLabelFormatter {

    private VariantLabelFormatter() {
    }

    public static String format(ProductVariant variant) {
        if (variant == null || variant.getOptionValues() == null || variant.getOptionValues().isEmpty()) {
            return null;
        }
        return variant.getOptionValues().entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> e.getKey() + ": " + e.getValue())
                .collect(Collectors.joining(" · "));
    }
}
