package com.jaee.service;

import com.jaee.dto.analytics.StoreSalesDto;
import com.jaee.dto.common.PageResponse;
import com.jaee.dto.order.OrderDto;
import com.jaee.entity.Order;
import com.jaee.entity.Order.OrderStatus;
import com.jaee.entity.StoreType;
import com.jaee.entity.User;
import com.jaee.exception.NotFoundException;
import com.jaee.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;

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
    
    // ============================================
    // Admin Methods
    // ============================================
    
    @Transactional(readOnly = true)
    public PageResponse<OrderDto> getAllOrders(String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Order> orderPage;
        
        if (status != null && !status.isEmpty() && !status.equals("ALL")) {
            OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());
            orderPage = orderRepository.findByStatusWithUser(orderStatus, pageable);
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
    public OrderDto updateOrderStatus(Long orderId, String newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found"));
        
        OrderStatus status = OrderStatus.valueOf(newStatus.toUpperCase());
        order.setStatus(status);
        
        log.info("Order {} status updated to {}", orderId, status);
        
        Order saved = orderRepository.save(order);
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

    @Transactional(readOnly = true)
    public Map<String, Long> getOrderStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("total", orderRepository.count());
        stats.put("pending", orderRepository.countByStatus(OrderStatus.PENDING));
        stats.put("paid", orderRepository.countByStatus(OrderStatus.PAID));
        stats.put("shipped", orderRepository.countByStatus(OrderStatus.SHIPPED));
        stats.put("fulfilled", orderRepository.countByStatus(OrderStatus.FULFILLED));
        stats.put("cancelled", orderRepository.countByStatus(OrderStatus.CANCELLED));
        return stats;
    }

    @Transactional(readOnly = true)
    public List<StoreSalesDto> getStoreSales() {
        List<OrderStatus> paidStatuses = List.of(OrderStatus.PAID, OrderStatus.SHIPPED, OrderStatus.FULFILLED);
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
