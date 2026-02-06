package com.jaee.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(precision = 10, scale = 2)
    private BigDecimal compareAtPrice;

    @Builder.Default
    private String currency = "INR";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @ElementCollection
    @CollectionTable(name = "product_images", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "image_url")
    @Builder.Default
    private List<String> images = new ArrayList<>();

    @Builder.Default
    private Integer stockQty = 0;

    @Builder.Default
    private Boolean active = true;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public boolean isInStock() {
        return stockQty != null && stockQty > 0;
    }

    public void reduceStock(int quantity) {
        if (this.stockQty >= quantity) {
            this.stockQty -= quantity;
        } else {
            throw new IllegalStateException("Insufficient stock for product: " + name);
        }
    }
}
