package com.jaee.service;

import com.jaee.dto.common.PageResponse;
import com.jaee.dto.order.OrderDto;
import com.jaee.entity.Order;
import com.jaee.entity.User;
import com.jaee.exception.NotFoundException;
import com.jaee.repository.OrderRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @InjectMocks
    private OrderService orderService;

    @Test
    void getUserOrdersReturnsPaginatedOrders() {
        User user = User.builder().id(1L).build();
        Order order = Order.builder()
                .id(1L)
                .user(user)
                .status(Order.OrderStatus.PAID)
                .totalAmount(BigDecimal.valueOf(999))
                .build();
        Page<Order> orderPage = new PageImpl<>(List.of(order), PageRequest.of(0, 10), 1);

        when(orderRepository.findByUserOrderByCreatedAtDesc(eq(user), any(Pageable.class)))
                .thenReturn(orderPage);

        PageResponse<OrderDto> result = orderService.getUserOrders(user, 0, 10);

        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getId()).isEqualTo(1L);
        assertThat(result.getTotalElements()).isEqualTo(1);
        verify(orderRepository).findByUserOrderByCreatedAtDesc(eq(user), any(Pageable.class));
    }

    @Test
    void getOrderByIdSuccess() {
        User user = User.builder().id(1L).build();
        Order order = Order.builder()
                .id(1L)
                .user(user)
                .status(Order.OrderStatus.PAID)
                .totalAmount(BigDecimal.valueOf(999))
                .build();

        when(orderRepository.findByIdAndUserWithItems(1L, user)).thenReturn(Optional.of(order));

        OrderDto result = orderService.getOrderById(user, 1L);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getTotalAmount()).isEqualByComparingTo(BigDecimal.valueOf(999));
        verify(orderRepository).findByIdAndUserWithItems(1L, user);
    }

    @Test
    void getOrderByIdNotFoundThrowsNotFoundException() {
        User user = User.builder().id(1L).build();
        when(orderRepository.findByIdAndUserWithItems(999L, user)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.getOrderById(user, 999L))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("Order not found");

        verify(orderRepository).findByIdAndUserWithItems(999L, user);
    }

    @Test
    void updateOrderStatusSuccess() {
        Order order = Order.builder()
                .id(1L)
                .status(Order.OrderStatus.PENDING)
                .totalAmount(BigDecimal.valueOf(999))
                .build();

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        OrderDto result = orderService.updateOrderStatus(1L, "PAID", null, false);

        assertThat(order.getStatus()).isEqualTo(Order.OrderStatus.PAID);
        assertThat(result).isNotNull();
        verify(orderRepository).save(order);
    }

    @Test
    void updateOrderStatusNotFoundThrowsNotFoundException() {
        when(orderRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.updateOrderStatus(999L, "PAID", null, false))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("Order not found");

        verify(orderRepository).findById(999L);
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    void updateOrderTrackingSuccess() {
        Order order = Order.builder()
                .id(1L)
                .status(Order.OrderStatus.PAID)
                .totalAmount(BigDecimal.valueOf(999))
                .build();

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        OrderDto result = orderService.updateOrderTracking(1L, "TRK123", "https://track.example/TRK123", "DHL");

        assertThat(order.getTrackingNumber()).isEqualTo("TRK123");
        assertThat(order.getTrackingUrl()).isEqualTo("https://track.example/TRK123");
        assertThat(order.getCarrier()).isEqualTo("DHL");
        assertThat(result).isNotNull();
        verify(orderRepository).save(order);
    }

    @Test
    void getOrderStatsReturnsCorrectCounts() {
        when(orderRepository.count()).thenReturn(100L);
        when(orderRepository.countByStatus(Order.OrderStatus.PENDING)).thenReturn(20L);
        when(orderRepository.countByStatus(Order.OrderStatus.PAID)).thenReturn(30L);
        when(orderRepository.countByStatus(Order.OrderStatus.PREPARING)).thenReturn(5L);
        when(orderRepository.countByStatus(Order.OrderStatus.PACKAGING)).thenReturn(4L);
        when(orderRepository.countByStatus(Order.OrderStatus.SHIPPED)).thenReturn(25L);
        when(orderRepository.countByStatus(Order.OrderStatus.OUT_FOR_DELIVERY)).thenReturn(3L);
        when(orderRepository.countByStatus(Order.OrderStatus.FULFILLED)).thenReturn(15L);
        when(orderRepository.countByStatus(Order.OrderStatus.CANCELLED)).thenReturn(10L);

        Map<String, Long> stats = orderService.getOrderStats();

        assertThat(stats).containsEntry("total", 100L);
        assertThat(stats).containsEntry("pending", 20L);
        assertThat(stats).containsEntry("paid", 30L);
        assertThat(stats).containsEntry("preparing", 5L);
        assertThat(stats).containsEntry("packaging", 4L);
        assertThat(stats).containsEntry("shipped", 25L);
        assertThat(stats).containsEntry("outForDelivery", 3L);
        assertThat(stats).containsEntry("fulfilled", 15L);
        assertThat(stats).containsEntry("cancelled", 10L);
    }
}
