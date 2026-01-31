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

    @Column(nullable = false)
    private String nameSnapshot;

    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal priceSnapshot;

    @Column(nullable = false)
    private Integer qty;

    private String imageUrl;

    public BigDecimal getSubtotal() {
        return priceSnapshot.multiply(BigDecimal.valueOf(qty));
    }
}
