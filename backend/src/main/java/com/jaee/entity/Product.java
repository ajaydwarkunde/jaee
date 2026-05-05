package com.jaee.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

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

    /** Optional landed cost — for admin margin tracking only. */
    @Column(precision = 10, scale = 2)
    private BigDecimal baseCost;

    /** Billable shipping weight per unit (kg). */
    @Column(nullable = false, precision = 8, scale = 3)
    @Builder.Default
    private BigDecimal weightKg = new BigDecimal("0.5");

    @Column(precision = 10, scale = 2)
    private BigDecimal compareAtPrice;

    @Builder.Default
    private String currency = "INR";

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "product_categories",
            joinColumns = @JoinColumn(name = "product_id"),
            inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    @Builder.Default
    private Set<Category> categories = new HashSet<>();

    @ElementCollection
    @CollectionTable(name = "product_images", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "image_url")
    @Builder.Default
    private List<String> images = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "product_videos", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "video_url")
    @Builder.Default
    private List<String> videos = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "product_option_names", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "option_name")
    @Builder.Default
    private List<String> options = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC, id ASC")
    @Builder.Default
    private List<ProductVariant> variants = new ArrayList<>();

    @Builder.Default
    private Integer stockQty = 0;

    @Builder.Default
    private Boolean active = true;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    // Review statistics (cached for performance)
    @Column(precision = 2, scale = 1)
    @Builder.Default
    private BigDecimal avgRating = BigDecimal.ZERO;

    @Builder.Default
    private Integer reviewCount = 0;

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
