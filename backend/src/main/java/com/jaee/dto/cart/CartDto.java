package com.jaee.dto.cart;

import com.jaee.entity.Cart;
import com.jaee.entity.CartItem;
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
        
        public static CartItemDto fromEntity(CartItem item) {
            return CartItemDto.builder()
                    .id(item.getId())
                    .productId(item.getProduct().getId())
                    .productName(item.getProduct().getName())
                    .productSlug(item.getProduct().getSlug())
                    .productImage(item.getProduct().getImages().isEmpty() ? null : item.getProduct().getImages().get(0))
                    .unitPrice(item.getUnitPriceSnapshot())
                    .qty(item.getQty())
                    .subtotal(item.getSubtotal())
                    .inStock(item.getProduct().isInStock())
                    .availableQty(item.getProduct().getStockQty())
                    .build();
        }
    }
}
