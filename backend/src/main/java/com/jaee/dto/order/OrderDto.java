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
    
    // Coupon fields
    private String couponCode;
    private BigDecimal discountAmount;

    private BigDecimal shippingAmount;
    private String shippingZone;

    // Tracking fields
    private String trackingNumber;
    private String trackingUrl;
    private String carrier;
    
    // Admin fields
    private Long userId;
    private String userName;
    private Integer itemCount;

    /** Sum of line totals before discount and shipping. */
    private BigDecimal itemsSubtotal;

    /** Sum of line weights (kg) when snapshots exist. */
    private BigDecimal totalWeightKg;

    /** Preset workflow status + optional admin label. */
    private String customStatus;
    private String internalNotes;

    /** Primary label for badges: customStatus if set, else workflow status. */
    private String displayStatus;

    /** Sum of per-item expense × qty across all items (admin-only). */
    private BigDecimal totalExpense;
    /** Profit = totalAmount − totalExpense − shippingAmount (null when expense data is absent). */
    private BigDecimal profit;
    
    public static OrderDto fromEntity(Order order) {
        List<OrderItem> items = order.getItems() != null ? order.getItems() : List.of();
        BigDecimal itemsSubtotal = items.stream()
                .map(OrderItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalWeightKg = BigDecimal.ZERO;
        boolean anyWeight = false;
        for (OrderItem it : items) {
            if (it.getWeightKgSnapshot() != null && it.getWeightKgSnapshot().compareTo(BigDecimal.ZERO) > 0) {
                anyWeight = true;
                totalWeightKg = totalWeightKg.add(
                        it.getWeightKgSnapshot().multiply(BigDecimal.valueOf(it.getQty())));
            }
        }

        BigDecimal totalExpense = BigDecimal.ZERO;
        boolean anyExpense = false;
        for (OrderItem it : items) {
            if (it.getExpenseSnapshot() != null) {
                anyExpense = true;
                totalExpense = totalExpense.add(
                        it.getExpenseSnapshot().multiply(BigDecimal.valueOf(it.getQty())));
            }
        }

        BigDecimal profit = null;
        if (anyExpense) {
            BigDecimal shipping = order.getShippingAmount() != null ? order.getShippingAmount() : BigDecimal.ZERO;
            profit = order.getTotalAmount().subtract(totalExpense).subtract(shipping);
        }

        String custom = order.getCustomStatus();
        String display = (custom != null && !custom.isBlank())
                ? custom.trim()
                : order.getStatus().name();

        return OrderDto.builder()
                .id(order.getId())
                .status(order.getStatus().name())
                .totalAmount(order.getTotalAmount())
                .currency(order.getCurrency())
                .items(items.stream()
                        .map(OrderItemDto::fromEntity)
                        .collect(Collectors.toList()))
                .shippingAddress(order.getShippingAddress())
                .customerEmail(order.getCustomerEmail())
                .customerPhone(order.getCustomerPhone())
                .createdAt(order.getCreatedAt())
                .paidAt(order.getPaidAt())
                .couponCode(order.getCouponCode())
                .discountAmount(order.getDiscountAmount())
                .shippingAmount(order.getShippingAmount())
                .shippingZone(order.getShippingZone())
                .trackingNumber(order.getTrackingNumber())
                .trackingUrl(order.getTrackingUrl())
                .carrier(order.getCarrier())
                .userId(order.getUser() != null ? order.getUser().getId() : null)
                .userName(order.getUser() != null ? order.getUser().getName() : null)
                .itemCount(items.size())
                .itemsSubtotal(itemsSubtotal)
                .totalWeightKg(anyWeight ? totalWeightKg : null)
                .customStatus(custom)
                .internalNotes(order.getInternalNotes())
                .displayStatus(display)
                .totalExpense(anyExpense ? totalExpense : null)
                .profit(profit)
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
        private Long variantId;
        private String variantLabel;
        private String sku;
        private BigDecimal compareAtPrice;
        private BigDecimal unitWeightKg;
        private BigDecimal lineWeightKg;
        private BigDecimal expense;
        private BigDecimal lineExpense;

        public static OrderItemDto fromEntity(OrderItem item) {
            BigDecimal unitW = item.getWeightKgSnapshot();
            BigDecimal lineW = null;
            if (unitW != null && item.getQty() != null) {
                lineW = unitW.multiply(BigDecimal.valueOf(item.getQty()));
            }
            BigDecimal exp = item.getExpenseSnapshot();
            BigDecimal lineExp = null;
            if (exp != null && item.getQty() != null) {
                lineExp = exp.multiply(BigDecimal.valueOf(item.getQty()));
            }
            return OrderItemDto.builder()
                    .id(item.getId())
                    .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                    .name(item.getNameSnapshot())
                    .price(item.getPriceSnapshot())
                    .qty(item.getQty())
                    .subtotal(item.getSubtotal())
                    .imageUrl(item.getImageUrl())
                    .variantId(item.getVariant() != null ? item.getVariant().getId() : null)
                    .variantLabel(item.getVariantLabel())
                    .sku(item.getSkuSnapshot())
                    .compareAtPrice(item.getCompareAtPriceSnapshot())
                    .unitWeightKg(unitW)
                    .lineWeightKg(lineW)
                    .expense(exp)
                    .lineExpense(lineExp)
                    .build();
        }
    }
}
