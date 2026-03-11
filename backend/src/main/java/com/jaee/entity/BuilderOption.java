package com.jaee.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "builder_options", uniqueConstraints = @UniqueConstraint(columnNames = {"builder_type", "option_type", "option_key"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BuilderOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "builder_type", nullable = false, length = 20)
    private String builderType;  // "CANDLE" or "HAMPER"

    @Column(name = "option_type", nullable = false, length = 30)
    private String optionType;   // SIZE, WAX, SCENT, COLOR, CONTAINER, ITEM, WRAPPING, OCCASION, COLOR_THEME

    @Column(name = "option_key", nullable = false, length = 50)
    private String optionKey;    // "soy", "jar", "lavender", etc.

    @Column(nullable = false, length = 100)
    private String label;

    private String description;

    @Column(length = 10)
    private String emoji;

    @Column(name = "hex_color", length = 7)
    private String hexColor;

    @Column(name = "colors_json", length = 255)
    private String colorsJson;   // for color themes: JSON array like ["#B4617B","#D4A843","#F2E3E8"]

    @Column(name = "base_price", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal basePrice = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal surcharge = BigDecimal.ZERO;

    @Builder.Default
    private Boolean active = true;

    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;
}
