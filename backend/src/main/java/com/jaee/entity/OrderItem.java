package com.jaee.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id")
    private ProductVariant variant;

    @Column(length = 500)
    private String variantLabel;

    @Column(nullable = false)
    private String nameSnapshot;

    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal priceSnapshot;

    @Column(nullable = false)
    private Integer qty;

    private String imageUrl;

    /** SKU captured at checkout (variant or product-level). */
    @Column(name = "sku_snapshot", length = 120)
    private String skuSnapshot;

    /** Compare-at / MRP at checkout for retail reference. */
    @Column(name = "compare_at_price_snapshot", precision = 10, scale = 2)
    private BigDecimal compareAtPriceSnapshot;

    /** Unit weight (kg) at checkout for shipping / admin totals. */
    @Column(name = "weight_kg_snapshot", precision = 10, scale = 3)
    private BigDecimal weightKgSnapshot;

    /** Per-unit expense captured at checkout for profit calculation. */
    @Column(name = "expense_snapshot", precision = 10, scale = 2)
    private BigDecimal expenseSnapshot;

    public BigDecimal getSubtotal() {
        return priceSnapshot.multiply(BigDecimal.valueOf(qty));
    }
}
