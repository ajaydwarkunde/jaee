package com.jaee.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "gift_hamper_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GiftHamperRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "customer_name", nullable = false)
    private String customerName;

    @Column(name = "customer_email", nullable = false)
    private String customerEmail;

    @Column(name = "customer_phone")
    private String customerPhone;

    @Column(name = "hamper_size", nullable = false)
    private String hamperSize;

    @Column(nullable = false)
    private String occasion;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String items;

    @Column(nullable = false)
    private String wrapping;

    @Column(name = "message_card", columnDefinition = "TEXT")
    private String messageCard;

    @Column(name = "recipient_name")
    private String recipientName;

    @Column(name = "color_theme", nullable = false)
    private String colorTheme;

    @Builder.Default
    private Integer quantity = 1;

    @Column(name = "estimated_price", precision = 10, scale = 2)
    private BigDecimal estimatedPrice;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Status status = Status.PENDING;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum Status {
        PENDING,
        REVIEWED,
        ACCEPTED,
        COMPLETED,
        CANCELLED
    }
}
