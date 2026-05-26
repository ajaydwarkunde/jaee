package com.jaee.controller;

import com.jaee.dto.analytics.StoreSalesDto;
import com.jaee.dto.category.CategoryCreateRequest;
import com.jaee.dto.category.CategoryDto;
import com.jaee.dto.common.ApiResponse;
import com.jaee.dto.common.PageResponse;
import com.jaee.dto.variant.VariantCreateRequest;
import com.jaee.dto.variant.VariantDto;
import com.jaee.dto.coupon.CouponCreateRequest;
import com.jaee.dto.coupon.CouponDto;
import com.jaee.dto.order.OrderDto;
import com.jaee.dto.product.ProductCreateRequest;
import com.jaee.dto.product.ProductDto;
import com.jaee.service.CategoryService;
import com.jaee.service.CouponService;
import com.jaee.service.OrderService;
import com.jaee.service.ProductService;
import com.jaee.service.VariantService;
import com.jaee.exception.BadRequestException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin", description = "Admin management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {

    private final CategoryService categoryService;
    private final ProductService productService;
    private final OrderService orderService;
    private final CouponService couponService;
    private final VariantService variantService;

    // Category endpoints
    @PostMapping("/categories")
    @Operation(summary = "Create a new category")
    public ResponseEntity<ApiResponse<CategoryDto>> createCategory(@Valid @RequestBody CategoryCreateRequest request) {
        CategoryDto category = categoryService.createCategory(request);
        return ResponseEntity.ok(ApiResponse.success("Category created", category));
    }

    @PutMapping("/categories/{id}")
    @Operation(summary = "Update a category")
    public ResponseEntity<ApiResponse<CategoryDto>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryCreateRequest request
    ) {
        CategoryDto category = categoryService.updateCategory(id, request);
        return ResponseEntity.ok(ApiResponse.success("Category updated", category));
    }

    @DeleteMapping("/categories/{id}")
    @Operation(summary = "Delete a category")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success("Category deleted", null));
    }

    // Product endpoints
    @PostMapping("/products")
    @Operation(summary = "Create a new product")
    public ResponseEntity<ApiResponse<ProductDto>> createProduct(@Valid @RequestBody ProductCreateRequest request) {
        ProductDto product = productService.createProduct(request);
        return ResponseEntity.ok(ApiResponse.success("Product created", product));
    }

    @PutMapping("/products/{id}")
    @Operation(summary = "Update a product")
    public ResponseEntity<ApiResponse<ProductDto>> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductCreateRequest request
    ) {
        ProductDto product = productService.updateProduct(id, request);
        return ResponseEntity.ok(ApiResponse.success("Product updated", product));
    }

    @DeleteMapping("/products/{id}")
    @Operation(summary = "Delete a product")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Product deleted", null));
    }

    // ============================================
    // Product Variants
    // ============================================

    @GetMapping("/products/{productId}/variants")
    @Operation(summary = "Get all variants for a product")
    public ResponseEntity<ApiResponse<List<VariantDto>>> getVariants(@PathVariable Long productId) {
        List<VariantDto> variants = variantService.getVariantsByProductId(productId);
        return ResponseEntity.ok(ApiResponse.success(variants));
    }

    @PostMapping("/products/{productId}/variants")
    @Operation(summary = "Add a variant to a product")
    public ResponseEntity<ApiResponse<VariantDto>> createVariant(
            @PathVariable Long productId,
            @Valid @RequestBody VariantCreateRequest request
    ) {
        VariantDto variant = variantService.createVariant(productId, request);
        return ResponseEntity.ok(ApiResponse.success("Variant created", variant));
    }

    @PutMapping("/products/{productId}/variants/bulk")
    @Operation(summary = "Replace all variants for a product")
    public ResponseEntity<ApiResponse<List<VariantDto>>> bulkSaveVariants(
            @PathVariable Long productId,
            @RequestBody List<@Valid VariantCreateRequest> requests
    ) {
        List<VariantDto> variants = variantService.bulkSaveVariants(productId, requests);
        return ResponseEntity.ok(ApiResponse.success("Variants saved", variants));
    }

    @PutMapping("/variants/{variantId}")
    @Operation(summary = "Update a variant")
    public ResponseEntity<ApiResponse<VariantDto>> updateVariant(
            @PathVariable Long variantId,
            @Valid @RequestBody VariantCreateRequest request
    ) {
        VariantDto variant = variantService.updateVariant(variantId, request);
        return ResponseEntity.ok(ApiResponse.success("Variant updated", variant));
    }

    @DeleteMapping("/variants/{variantId}")
    @Operation(summary = "Delete a variant")
    public ResponseEntity<ApiResponse<Void>> deleteVariant(@PathVariable Long variantId) {
        variantService.deleteVariant(variantId);
        return ResponseEntity.ok(ApiResponse.success("Variant deleted", null));
    }

    // ============================================
    // Order Management
    // ============================================
    
    @GetMapping("/orders")
    @Operation(summary = "Get all orders (admin)")
    public ResponseEntity<ApiResponse<PageResponse<OrderDto>>> getAllOrders(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        PageResponse<OrderDto> orders = orderService.getAllOrders(status, page, size);
        return ResponseEntity.ok(ApiResponse.success(orders));
    }
    
    @GetMapping("/orders/stats")
    @Operation(summary = "Get order statistics")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getOrderStats() {
        Map<String, Long> stats = orderService.getOrderStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
    
    @GetMapping("/orders/{orderId}")
    @Operation(summary = "Get order details (admin)")
    public ResponseEntity<ApiResponse<OrderDto>> getOrderById(@PathVariable Long orderId) {
        OrderDto order = orderService.getOrderByIdAdmin(orderId);
        return ResponseEntity.ok(ApiResponse.success(order));
    }
    
    @PatchMapping("/orders/{orderId}/status")
    @Operation(summary = "Update order status (optional customStatus label for this order)")
    public ResponseEntity<ApiResponse<OrderDto>> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> request
    ) {
        String newStatus = request.get("status");
        if (newStatus == null || newStatus.isBlank()) {
            throw new BadRequestException("status is required");
        }
        boolean touchCustom = request.containsKey("customStatus");
        String customStatus = request.get("customStatus");
        OrderDto order = orderService.updateOrderStatus(orderId, newStatus, customStatus, touchCustom);
        return ResponseEntity.ok(ApiResponse.success("Order status updated", order));
    }

    @PostMapping("/orders/{orderId}/notes")
    @Operation(summary = "Append an internal admin note to an order")
    public ResponseEntity<ApiResponse<OrderDto>> appendOrderNote(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> body
    ) {
        String note = body != null ? body.get("note") : null;
        OrderDto order = orderService.appendInternalNote(orderId, note);
        return ResponseEntity.ok(ApiResponse.success("Note saved", order));
    }

    @DeleteMapping("/orders/{orderId}")
    @Operation(summary = "Delete an order (admin)")
    public ResponseEntity<ApiResponse<Void>> deleteOrder(@PathVariable Long orderId) {
        orderService.deleteOrder(orderId);
        return ResponseEntity.ok(ApiResponse.success("Order deleted", null));
    }

    @PatchMapping("/orders/{orderId}/tracking")
    @Operation(summary = "Update order tracking info")
    public ResponseEntity<ApiResponse<OrderDto>> updateOrderTracking(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> request
    ) {
        OrderDto order = orderService.updateOrderTracking(
                orderId,
                request.get("trackingNumber"),
                request.get("trackingUrl"),
                request.get("carrier")
        );
        return ResponseEntity.ok(ApiResponse.success("Tracking info updated", order));
    }

    @GetMapping("/analytics/store-sales")
    @Operation(summary = "Get sales analytics by store type (Candle vs Hamper)")
    public ResponseEntity<ApiResponse<List<StoreSalesDto>>> getStoreSales() {
        List<StoreSalesDto> sales = orderService.getStoreSales();
        return ResponseEntity.ok(ApiResponse.success(sales));
    }
    
    // ============================================
    // Coupon Management
    // ============================================
    
    @GetMapping("/coupons")
    @Operation(summary = "Get all coupons")
    public ResponseEntity<ApiResponse<PageResponse<CouponDto>>> getAllCoupons(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        PageResponse<CouponDto> coupons = couponService.getAllCoupons(page, size);
        return ResponseEntity.ok(ApiResponse.success(coupons));
    }
    
    @GetMapping("/coupons/{id}")
    @Operation(summary = "Get coupon by ID")
    public ResponseEntity<ApiResponse<CouponDto>> getCouponById(@PathVariable Long id) {
        CouponDto coupon = couponService.getCouponById(id);
        return ResponseEntity.ok(ApiResponse.success(coupon));
    }
    
    @PostMapping("/coupons")
    @Operation(summary = "Create a new coupon")
    public ResponseEntity<ApiResponse<CouponDto>> createCoupon(@Valid @RequestBody CouponCreateRequest request) {
        CouponDto coupon = couponService.createCoupon(request);
        return ResponseEntity.ok(ApiResponse.success("Coupon created", coupon));
    }
    
    @PutMapping("/coupons/{id}")
    @Operation(summary = "Update a coupon")
    public ResponseEntity<ApiResponse<CouponDto>> updateCoupon(
            @PathVariable Long id,
            @Valid @RequestBody CouponCreateRequest request
    ) {
        CouponDto coupon = couponService.updateCoupon(id, request);
        return ResponseEntity.ok(ApiResponse.success("Coupon updated", coupon));
    }
    
    @DeleteMapping("/coupons/{id}")
    @Operation(summary = "Delete a coupon")
    public ResponseEntity<ApiResponse<Void>> deleteCoupon(@PathVariable Long id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.ok(ApiResponse.success("Coupon deleted", null));
    }
}
