package com.jaee.dto.cart;

import com.jaee.entity.Cart;
import com.jaee.entity.CartItem;
import com.jaee.entity.ProductVariant;
import com.jaee.util.VariantLabelFormatter;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartDto {
    private Long id;
    private List<CartItemDto> items;
    private BigDecimal subtotal;
    private Integer itemCount;

    /** Sum of (product weight kg × qty) for all lines — same basis as shipping calculation. */
    private BigDecimal totalWeightKg;

    /** Populated when {@code addressId} is passed to GET /cart. */
    private BigDecimal shippingAmount;
    private String shippingZone;
    private Boolean freeShippingApplied;
    
    public static CartDto fromEntity(Cart cart) {
        List<CartItemDto> itemDtos = cart.getItems().stream()
                .map(CartItemDto::fromEntity)
                .collect(Collectors.toList());
        
        BigDecimal subtotal = itemDtos.stream()
                .map(CartItemDto::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        return CartDto.builder()
                .id(cart.getId())
                .items(itemDtos)
                .subtotal(subtotal)
                .itemCount(itemDtos.size())
                .build();
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CartItemDto {
        private Long id;
        private Long productId;
        private String productName;
        private String productSlug;
        private String productImage;
        private BigDecimal unitPrice;
        private Integer qty;
        private BigDecimal subtotal;
        private Boolean inStock;
        private Integer availableQty;
        private Long variantId;
        private String variantLabel;
        private String customizationText;
        
        public static CartItemDto fromEntity(CartItem item) {
            ProductVariant v = item.getVariant();
            boolean inStock;
            int availableQty;
            String image;
            if (v != null) {
                availableQty = v.getStockQty() != null ? v.getStockQty() : 0;
                inStock = v.isInStock();
                image = (v.getImages() != null && !v.getImages().isEmpty())
                        ? v.getImages().get(0)
                        : (item.getProduct().getImages().isEmpty() ? null : item.getProduct().getImages().get(0));
            } else {
                availableQty = item.getProduct().getStockQty();
                inStock = item.getProduct().isInStock();
                image = item.getProduct().getImages().isEmpty() ? null : item.getProduct().getImages().get(0);
            }

            String variantLabel = item.getVariantLabel();
            if ((variantLabel == null || variantLabel.isBlank()) && v != null) {
                variantLabel = VariantLabelFormatter.format(v);
            }

            return CartItemDto.builder()
                    .id(item.getId())
                    .productId(item.getProduct().getId())
                    .productName(item.getProduct().getName())
                    .productSlug(item.getProduct().getSlug())
                    .productImage(image)
                    .unitPrice(item.getUnitPriceSnapshot())
                    .qty(item.getQty())
                    .subtotal(item.getSubtotal())
                    .inStock(inStock)
                    .availableQty(availableQty)
                    .variantId(v != null ? v.getId() : null)
                    .variantLabel(variantLabel)
                    .customizationText(item.getCustomizationText())
                    .build();
        }
    }
}
