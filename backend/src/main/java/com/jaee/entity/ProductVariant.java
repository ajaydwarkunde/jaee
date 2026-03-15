package com.jaee.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "product_variants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    private String sku;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(precision = 10, scale = 2)
    private BigDecimal compareAtPrice;

    @Builder.Default
    private Integer stockQty = 0;

    @Builder.Default
    private Boolean active = true;

    @ElementCollection
    @CollectionTable(name = "product_variant_options", joinColumns = @JoinColumn(name = "variant_id"))
    @MapKeyColumn(name = "option_name")
    @Column(name = "option_value")
    @Builder.Default
    private Map<String, String> optionValues = new HashMap<>();

    @ElementCollection
    @CollectionTable(name = "product_variant_images", joinColumns = @JoinColumn(name = "variant_id"))
    @Column(name = "image_url")
    @Builder.Default
    private List<String> images = new ArrayList<>();

    public boolean isInStock() {
        return stockQty != null && stockQty > 0;
    }
}
