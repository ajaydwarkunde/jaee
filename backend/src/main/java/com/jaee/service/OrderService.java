package com.jaee.service;

import com.jaee.dto.analytics.StoreSalesDto;
import com.jaee.dto.common.PageResponse;
import com.jaee.dto.order.OrderDto;
import com.jaee.entity.Order;
import com.jaee.entity.Order.OrderStatus;
import com.jaee.entity.Cart;
import com.jaee.entity.CartItem;
import com.jaee.entity.OrderItem;
import com.jaee.entity.Product;
import com.jaee.entity.ProductVariant;
import com.jaee.entity.StoreType;
import com.jaee.entity.User;
import com.jaee.exception.BadRequestException;
import com.jaee.exception.NotFoundException;
import com.jaee.repository.CartItemRepository;
import com.jaee.repository.CartRepository;
import com.jaee.repository.OrderRepository;
import com.jaee.util.VariantLabelFormatter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;

    @Transactional(readOnly = true)
    public PageResponse<OrderDto> getUserOrders(User user, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Order> orderPage = orderRepository.findByUserOrderByCreatedAtDesc(user, pageable);
        return PageResponse.from(orderPage, OrderDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public OrderDto getOrderById(User user, Long orderId) {
        Order order = orderRepository.findByIdAndUserWithItems(orderId, user)
                .orElseThrow(() -> new NotFoundException("Order not found"));
        return OrderDto.fromEntity(order);
    }

    @Transactional(readOnly = true)
    public OrderDto getOrderByRazorpayOrderId(String razorpayOrderId) {
        Order order = orderRepository.findByRazorpayOrderIdWithItems(razorpayOrderId)
                .orElseThrow(() -> new NotFoundException("Order not found"));
        return OrderDto.fromEntity(order);
    }

    @Transactional
    public void restoreOrderToCart(User user, Long orderId) {
        Order order = orderRepository.findByIdAndUserWithItems(orderId, user)
                .orElseThrow(() -> new NotFoundException("Order not found"));

        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.CANCELLED) {
            throw new BadRequestException("Only pending or cancelled orders can be modified");
        }
        if (order.getItems() == null || order.getItems().isEmpty()) {
            throw new BadRequestException("This order has no items");
        }

        Cart cart = cartRepository.findByUserWithItems(user)
                .orElseGet(() -> cartRepository.save(Cart.builder().user(user).build()));

        if (cart.getItems() != null && !cart.getItems().isEmpty()) {
            cartItemRepository.deleteByCart(cart);
            cart.getItems().clear();
        }

        int added = 0;
        for (OrderItem oi : order.getItems()) {
            Product product = oi.getProduct();
            if (product == null || !Boolean.TRUE.equals(product.getActive())) {
                continue;
            }

            ProductVariant variant = oi.getVariant();
            if (variant != null && !Boolean.TRUE.equals(variant.getActive())) {
                continue;
            }

            int available = variant != null
                    ? (variant.getStockQty() != null ? variant.getStockQty() : 0)
                    : (product.getStockQty() != null ? product.getStockQty() : 0);
            int qtyToAdd = Math.min(oi.getQty(), available);
            if (qtyToAdd <= 0) {
                continue;
            }

            String variantLabel = variant != null ? VariantLabelFormatter.format(variant) : null;
            CartItem line = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .variant(variant)
                    .variantLabel(variantLabel)
                    .qty(qtyToAdd)
                    .unitPriceSnapshot(variant != null ? variant.getPrice() : product.getPrice())
                    .build();
            cart.addItem(line);
            cartItemRepository.save(line);
            added++;
        }

        if (added == 0) {
            throw new BadRequestException("None of the order items are currently available");
        }

        if (order.getStatus() == OrderStatus.PENDING) {
            order.setStatus(OrderStatus.CANCELLED);
            orderRepository.save(order);
        }

        log.info("Order {} restored to cart for user {} with {} item lines", orderId, user.getId(), added);
    }
    
    // ============================================
    // Admin Methods
    // ============================================
    
    private static final List<OrderStatus> SUCCESSFUL_ORDER_STATUSES = List.of(
            OrderStatus.PAID,
            OrderStatus.PREPARING,
            OrderStatus.PACKAGING,
            OrderStatus.SHIPPED,
            OrderStatus.OUT_FOR_DELIVERY,
            OrderStatus.FULFILLED);

    @Transactional(readOnly = true)
    public PageResponse<OrderDto> getAllOrders(String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Order> orderPage;

        if (status != null && !status.isEmpty() && !status.equals("ALL")) {
            if ("SUCCESS".equalsIgnoreCase(status) || "SUCCESSFUL".equalsIgnoreCase(status)) {
                orderPage = orderRepository.findByStatusInWithUser(SUCCESSFUL_ORDER_STATUSES, pageable);
            } else {
                OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());
                orderPage = orderRepository.findByStatusWithUser(orderStatus, pageable);
            }
        } else {
            orderPage = orderRepository.findAllWithUser(pageable);
        }

        return PageResponse.from(orderPage, OrderDto::fromEntity);
    }
    
    @Transactional(readOnly = true)
    public OrderDto getOrderByIdAdmin(Long orderId) {
        Order order = orderRepository.findByIdWithItemsAndUser(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found"));
        return OrderDto.fromEntity(order);
    }
    
    @Transactional
    public OrderDto updateOrderStatus(Long orderId, String newStatus, String customStatus, boolean updateCustomLabel) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found"));

        OrderStatus status = OrderStatus.valueOf(newStatus.toUpperCase());
        order.setStatus(status);

        if (updateCustomLabel) {
            if (customStatus == null || customStatus.isBlank()) {
                order.setCustomStatus(null);
            } else {
                order.setCustomStatus(customStatus.trim());
            }
        }

        log.info("Order {} status updated to {}, custom={}", orderId, status, order.getCustomStatus());

        Order saved = orderRepository.save(order);
        return OrderDto.fromEntity(saved);
    }

    @Transactional
    public OrderDto appendInternalNote(Long orderId, String note) {
        if (note == null || note.isBlank()) {
            throw new BadRequestException("Note cannot be empty");
        }
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found"));

        String ts = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm").format(LocalDateTime.now());
        String line = "[" + ts + "] " + note.trim();
        String existing = order.getInternalNotes();
        order.setInternalNotes(existing == null || existing.isBlank() ? line : existing + "\n" + line);

        Order saved = orderRepository.save(order);
        log.info("Order {} internal note appended", orderId);
        return OrderDto.fromEntity(saved);
    }
    
    @Transactional
    public OrderDto updateOrderTracking(Long orderId, String trackingNumber, String trackingUrl, String carrier) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found"));
        
        order.setTrackingNumber(trackingNumber);
        order.setTrackingUrl(trackingUrl);
        order.setCarrier(carrier);
        
        log.info("Order {} tracking updated: carrier={}, tracking={}", orderId, carrier, trackingNumber);
        
        Order saved = orderRepository.save(order);
        return OrderDto.fromEntity(saved);
    }

    @Transactional
    public void deleteOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found"));
        orderRepository.delete(order);
        log.info("Order {} deleted by admin", orderId);
    }

    @Transactional(readOnly = true)
    public Map<String, Long> getOrderStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("total", orderRepository.count());
        stats.put("pending", orderRepository.countByStatus(OrderStatus.PENDING));
        stats.put("paid", orderRepository.countByStatus(OrderStatus.PAID));
        stats.put("preparing", orderRepository.countByStatus(OrderStatus.PREPARING));
        stats.put("packaging", orderRepository.countByStatus(OrderStatus.PACKAGING));
        stats.put("shipped", orderRepository.countByStatus(OrderStatus.SHIPPED));
        stats.put("outForDelivery", orderRepository.countByStatus(OrderStatus.OUT_FOR_DELIVERY));
        stats.put("fulfilled", orderRepository.countByStatus(OrderStatus.FULFILLED));
        stats.put("cancelled", orderRepository.countByStatus(OrderStatus.CANCELLED));
        return stats;
    }

    @Transactional(readOnly = true)
    public List<StoreSalesDto> getStoreSales() {
        List<OrderStatus> paidStatuses = SUCCESSFUL_ORDER_STATUSES;
        List<Object[]> revenueRows = orderRepository.getRevenueByStoreType(paidStatuses);

        Map<StoreType, StoreSalesDto> map = new EnumMap<>(StoreType.class);
        for (StoreType st : StoreType.values()) {
            map.put(st, StoreSalesDto.builder()
                    .storeType(st.name())
                    .revenue(BigDecimal.ZERO)
                    .itemsSold(0L)
                    .orderCount(0L)
                    .topProducts(List.of())
                    .build());
        }

        for (Object[] row : revenueRows) {
            StoreType st = (StoreType) row[0];
            StoreSalesDto dto = map.get(st);
            dto.setRevenue((BigDecimal) row[1]);
            dto.setItemsSold(((Number) row[2]).longValue());
            dto.setOrderCount(((Number) row[3]).longValue());
        }

        Pageable top5 = PageRequest.of(0, 5);
        for (StoreType st : StoreType.values()) {
            List<Object[]> topRows = orderRepository.getTopProductsByStoreType(st, paidStatuses, top5);
            List<StoreSalesDto.TopProduct> topProducts = topRows.stream()
                    .map(r -> StoreSalesDto.TopProduct.builder()
                            .name((String) r[0])
                            .qtySold(((Number) r[1]).longValue())
                            .revenue((BigDecimal) r[2])
                            .build())
                    .collect(Collectors.toList());
            map.get(st).setTopProducts(topProducts);
        }

        return new ArrayList<>(map.values());
    }
}
