package com.jaee.controller;

import com.jaee.dto.common.ApiResponse;
import com.jaee.dto.common.PageResponse;
import com.jaee.dto.order.OrderDto;
import com.jaee.entity.User;
import com.jaee.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Order management")
@SecurityRequirement(name = "bearerAuth")
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    @Operation(summary = "Get current user's orders")
    public ResponseEntity<ApiResponse<PageResponse<OrderDto>>> getUserOrders(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        PageResponse<OrderDto> orders = orderService.getUserOrders(user, page, size);
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    @GetMapping("/{orderId}")
    @Operation(summary = "Get order by ID")
    public ResponseEntity<ApiResponse<OrderDto>> getOrderById(
            @AuthenticationPrincipal User user,
            @PathVariable Long orderId
    ) {
        OrderDto order = orderService.getOrderById(user, orderId);
        return ResponseEntity.ok(ApiResponse.success(order));
    }

    @GetMapping("/razorpay/{razorpayOrderId}")
    @Operation(summary = "Get order by Razorpay order ID")
    public ResponseEntity<ApiResponse<OrderDto>> getOrderByRazorpayOrderId(@PathVariable String razorpayOrderId) {
        OrderDto order = orderService.getOrderByRazorpayOrderId(razorpayOrderId);
        return ResponseEntity.ok(ApiResponse.success(order));
    }
}
