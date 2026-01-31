package com.jaee.controller;

import com.jaee.dto.cart.AddToCartRequest;
import com.jaee.dto.cart.CartDto;
import com.jaee.dto.cart.MergeCartRequest;
import com.jaee.dto.cart.UpdateCartItemRequest;
import com.jaee.dto.common.ApiResponse;
import com.jaee.entity.User;
import com.jaee.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
@Tag(name = "Cart", description = "Shopping cart")
@SecurityRequirement(name = "bearerAuth")
public class CartController {

    private final CartService cartService;

    @GetMapping
    @Operation(summary = "Get current user's cart")
    public ResponseEntity<ApiResponse<CartDto>> getCart(@AuthenticationPrincipal User user) {
        CartDto cart = cartService.getCart(user);
        return ResponseEntity.ok(ApiResponse.success(cart));
    }

    @PostMapping("/items")
    @Operation(summary = "Add item to cart")
    public ResponseEntity<ApiResponse<CartDto>> addToCart(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody AddToCartRequest request
    ) {
        CartDto cart = cartService.addToCart(user, request);
        return ResponseEntity.ok(ApiResponse.success("Item added to cart", cart));
    }

    @PatchMapping("/items/{itemId}")
    @Operation(summary = "Update cart item quantity")
    public ResponseEntity<ApiResponse<CartDto>> updateCartItem(
            @AuthenticationPrincipal User user,
            @PathVariable Long itemId,
            @Valid @RequestBody UpdateCartItemRequest request
    ) {
        CartDto cart = cartService.updateCartItem(user, itemId, request);
        return ResponseEntity.ok(ApiResponse.success(cart));
    }

    @DeleteMapping("/items/{itemId}")
    @Operation(summary = "Remove item from cart")
    public ResponseEntity<ApiResponse<CartDto>> removeCartItem(
            @AuthenticationPrincipal User user,
            @PathVariable Long itemId
    ) {
        CartDto cart = cartService.removeCartItem(user, itemId);
        return ResponseEntity.ok(ApiResponse.success(cart));
    }

    @PostMapping("/merge")
    @Operation(summary = "Merge guest cart into user cart")
    public ResponseEntity<ApiResponse<CartDto>> mergeCart(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody MergeCartRequest request
    ) {
        CartDto cart = cartService.mergeCart(user, request);
        return ResponseEntity.ok(ApiResponse.success("Cart merged successfully", cart));
    }
}
