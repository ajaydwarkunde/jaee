package com.jaee.dto.order;

import com.jaee.entity.Order;
import com.jaee.entity.OrderItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDto {
    private Long id;
    private String status;
    private BigDecimal totalAmount;
    private String currency;
    private List<OrderItemDto> items;
    private String shippingAddress;
    private String customerEmail;
    private String customerPhone;
    private LocalDateTime createdAt;
    private LocalDateTime paidAt;
    
    public static OrderDto fromEntity(Order order) {
        return OrderDto.builder()
                .id(order.getId())
                .status(order.getStatus().name())
                .totalAmount(order.getTotalAmount())
                .currency(order.getCurrency())
                .items(order.getItems().stream()
                        .map(OrderItemDto::fromEntity)
                        .collect(Collectors.toList()))
                .shippingAddress(order.getShippingAddress())
                .customerEmail(order.getCustomerEmail())
                .customerPhone(order.getCustomerPhone())
                .createdAt(order.getCreatedAt())
                .paidAt(order.getPaidAt())
                .build();
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemDto {
        private Long id;
        private Long productId;
        private String name;
        private BigDecimal price;
        private Integer qty;
        private BigDecimal subtotal;
        private String imageUrl;
        
        public static OrderItemDto fromEntity(OrderItem item) {
            return OrderItemDto.builder()
                    .id(item.getId())
                    .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                    .name(item.getNameSnapshot())
                    .price(item.getPriceSnapshot())
                    .qty(item.getQty())
                    .subtotal(item.getSubtotal())
                    .imageUrl(item.getImageUrl())
                    .build();
        }
    }
}
