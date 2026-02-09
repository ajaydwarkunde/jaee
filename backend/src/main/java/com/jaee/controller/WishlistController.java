package com.jaee.controller;

import com.jaee.dto.common.ApiResponse;
import com.jaee.dto.wishlist.WishlistItemDto;
import com.jaee.entity.User;
import com.jaee.service.WishlistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/wishlist")
@RequiredArgsConstructor
@Tag(name = "Wishlist", description = "Wishlist management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    @Operation(summary = "Get user's wishlist")
    public ResponseEntity<ApiResponse<List<WishlistItemDto>>> getWishlist(
            @AuthenticationPrincipal User user
    ) {
        List<WishlistItemDto> wishlist = wishlistService.getWishlist(user);
        return ResponseEntity.ok(ApiResponse.success(wishlist));
    }

    @PostMapping("/{productId}")
    @Operation(summary = "Add product to wishlist")
    public ResponseEntity<ApiResponse<WishlistItemDto>> addToWishlist(
            @AuthenticationPrincipal User user,
            @PathVariable Long productId
    ) {
        WishlistItemDto item = wishlistService.addToWishlist(user, productId);
        return ResponseEntity.ok(ApiResponse.success("Added to wishlist", item));
    }

    @DeleteMapping("/{productId}")
    @Operation(summary = "Remove product from wishlist")
    public ResponseEntity<ApiResponse<Void>> removeFromWishlist(
            @AuthenticationPrincipal User user,
            @PathVariable Long productId
    ) {
        wishlistService.removeFromWishlist(user, productId);
        return ResponseEntity.ok(ApiResponse.success("Removed from wishlist", null));
    }

    @GetMapping("/check/{productId}")
    @Operation(summary = "Check if product is in wishlist")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkWishlist(
            @AuthenticationPrincipal User user,
            @PathVariable Long productId
    ) {
        boolean inWishlist = wishlistService.isInWishlist(user, productId);
        return ResponseEntity.ok(ApiResponse.success(Map.of("inWishlist", inWishlist)));
    }

    @GetMapping("/product-ids")
    @Operation(summary = "Get all product IDs in user's wishlist")
    public ResponseEntity<ApiResponse<List<Long>>> getWishlistProductIds(
            @AuthenticationPrincipal User user
    ) {
        List<Long> ids = wishlistService.getWishlistProductIds(user);
        return ResponseEntity.ok(ApiResponse.success(ids));
    }

    @GetMapping("/count")
    @Operation(summary = "Get wishlist item count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getWishlistCount(
            @AuthenticationPrincipal User user
    ) {
        long count = wishlistService.getWishlistCount(user);
        return ResponseEntity.ok(ApiResponse.success(Map.of("count", count)));
    }
}
