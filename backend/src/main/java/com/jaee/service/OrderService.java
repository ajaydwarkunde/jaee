package com.jaee.service;

import com.jaee.dto.common.PageResponse;
import com.jaee.dto.order.OrderDto;
import com.jaee.entity.Order;
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
}
