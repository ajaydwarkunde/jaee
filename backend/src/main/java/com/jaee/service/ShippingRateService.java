package com.jaee.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaee.shipping.ShippingZone;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@Slf4j
public class ShippingRateService {

    private static final BigDecimal MIN_BILLABLE_KG = new BigDecimal("0.5");

    private final ObjectMapper objectMapper = new ObjectMapper();

    private List<BigDecimal> weightBucketsKg = new ArrayList<>();
    private List<BigDecimal[]> ratesByZone = new ArrayList<>();

    @PostConstruct
    public void loadTable() {
        ClassPathResource resource = new ClassPathResource("shipping/weight-zone-rates.json");
        try (InputStream in = resource.getInputStream()) {
            JsonNode root = objectMapper.readTree(in);
            JsonNode rates = root.get("rates");
            if (rates == null || !rates.isArray()) {
                throw new IllegalStateException("Invalid shipping rate file");
            }
            List<JsonNode> sorted = new ArrayList<>();
            rates.forEach(sorted::add);
            sorted.sort(Comparator.comparing(n -> n.get("weightKg").decimalValue()));

            for (JsonNode row : sorted) {
                BigDecimal w = row.get("weightKg").decimalValue();
                weightBucketsKg.add(w);
                ratesByZone.add(new BigDecimal[]{
                        bd(row, "local"),
                        bd(row, "regional"),
                        bd(row, "metro"),
                        bd(row, "national"),
                        bd(row, "remote")
                });
            }
            log.info("Loaded {} shipping weight tiers", weightBucketsKg.size());
        } catch (IOException e) {
            log.error("Failed to load shipping rates: {}", e.getMessage());
            throw new IllegalStateException("Could not load shipping/weight-zone-rates.json", e);
        }
    }

    private static BigDecimal bd(JsonNode row, String field) {
        return row.get(field).decimalValue().setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Total cart weight in kg (sum of product.weightKg × qty). Chooses the smallest published
     * tier whose bucket weight is &gt;= billable weight (same as paying the next slab when over).
     */
    public BigDecimal computeShippingInr(BigDecimal totalWeightKg, ShippingZone zone) {
        if (weightBucketsKg.isEmpty()) {
            return BigDecimal.ZERO;
        }
        BigDecimal billable = totalWeightKg == null ? MIN_BILLABLE_KG : totalWeightKg.max(MIN_BILLABLE_KG);
        int idx = 0;
        for (int i = 0; i < weightBucketsKg.size(); i++) {
            if (weightBucketsKg.get(i).compareTo(billable) >= 0) {
                idx = i;
                break;
            }
            idx = i;
        }
        BigDecimal[] row = ratesByZone.get(idx);
        int z = switch (zone) {
            case LOCAL -> 0;
            case REGIONAL -> 1;
            case METRO -> 2;
            case NATIONAL -> 3;
            case REMOTE -> 4;
        };
        return row[z].setScale(2, RoundingMode.HALF_UP);
    }
}
