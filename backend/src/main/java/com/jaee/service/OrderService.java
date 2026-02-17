package com.jaee.service;

import com.jaee.dto.common.PageResponse;
import com.jaee.dto.order.OrderDto;
import com.jaee.entity.Order;
import com.jaee.entity.Order.OrderStatus;
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

import java.util.HashMap;
import java.util.Map;

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
}
