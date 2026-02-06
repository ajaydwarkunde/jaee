package com.jaee.service;

import com.jaee.dto.address.AddressDto;
import com.jaee.entity.*;
import com.jaee.exception.BadRequestException;
import com.jaee.repository.AddressRepository;
import com.jaee.repository.CartRepository;
import com.jaee.repository.OrderRepository;
import com.jaee.repository.ProductRepository;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class CheckoutService {

    private final CartRepository cartRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final AddressRepository addressRepository;
    private final CartService cartService;
    private final EmailService emailService;

    @Value("${app.razorpay.key-id}")
    private String razorpayKeyId;

    @Value("${app.razorpay.key-secret}")
    private String razorpayKeySecret;

    @Value("${app.razorpay.webhook-secret}")
    private String razorpayWebhookSecret;

    @Value("${app.razorpay.test-mode:true}")
    private boolean testMode;

    private RazorpayClient razorpayClient;

    @PostConstruct
    public void init() {
        if (testMode) {
            log.info("Razorpay TEST MODE enabled - payments will be simulated");
            return;
        }
        try {
            razorpayClient = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
            log.info("Razorpay client initialized");
        } catch (RazorpayException e) {
            log.error("Failed to initialize Razorpay client: {}", e.getMessage());
        }
    }

    /**
     * Create a Razorpay order for checkout
     */
    @Transactional
    public Map<String, Object> createOrder(User user, Long addressId) throws RazorpayException {
        Cart cart = cartRepository.findByUserWithItems(user)
                .orElseThrow(() -> new BadRequestException("Cart is empty"));

        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        // Validate stock
        for (CartItem item : cart.getItems()) {
            Product product = item.getProduct();
            if (!product.getActive()) {
                throw new BadRequestException("Product '" + product.getName() + "' is no longer available");
            }
            if (product.getStockQty() < item.getQty()) {
                throw new BadRequestException("Insufficient stock for '" + product.getName() + 
                        "'. Available: " + product.getStockQty());
            }
        }

        // Resolve shipping address
        Address shippingAddress = null;
        String shippingAddressStr = null;
        if (addressId != null) {
            shippingAddress = addressRepository.findByIdAndUser(addressId, user)
                    .orElseThrow(() -> new BadRequestException("Address not found"));
            shippingAddressStr = formatAddress(shippingAddress);
        } else {
            // Try to use default address
            shippingAddress = addressRepository.findByUserAndIsDefaultTrue(user).orElse(null);
            if (shippingAddress != null) {
                shippingAddressStr = formatAddress(shippingAddress);
            }
        }

        // Create pending order in our database
        Order pendingOrder = createPendingOrder(user, cart, shippingAddress, shippingAddressStr);

        // Calculate total in paise (Razorpay expects amount in smallest currency unit)
        long amountInPaise = pendingOrder.getTotalAmount()
                .multiply(BigDecimal.valueOf(100))
                .longValue();

        // TEST MODE: Simulate Razorpay order without API call
        if (testMode) {
            String mockOrderId = "test_order_" + pendingOrder.getId() + "_" + System.currentTimeMillis();
            pendingOrder.setRazorpayOrderId(mockOrderId);
            orderRepository.save(pendingOrder);

            log.info("TEST MODE: Created mock order for user {}: {}", user.getId(), mockOrderId);

            Map<String, Object> response = new HashMap<>();
            response.put("orderId", mockOrderId);
            response.put("amount", amountInPaise);
            response.put("currency", pendingOrder.getCurrency());
            response.put("keyId", "test_key");
            response.put("internalOrderId", pendingOrder.getId());
            response.put("testMode", true);
            
            Map<String, String> prefill = new HashMap<>();
            prefill.put("name", user.getName() != null ? user.getName() : "");
            prefill.put("email", user.getEmail() != null ? user.getEmail() : "");
            prefill.put("contact", user.getMobileNumber() != null ? user.getMobileNumber() : "");
            response.put("prefill", prefill);
            
            return response;
        }

        // Create Razorpay order
        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amountInPaise);
        orderRequest.put("currency", pendingOrder.getCurrency());
        orderRequest.put("receipt", "order_" + pendingOrder.getId());
        orderRequest.put("notes", new JSONObject()
                .put("order_id", pendingOrder.getId().toString())
                .put("user_id", user.getId().toString())
        );

        com.razorpay.Order razorpayOrder = razorpayClient.orders.create(orderRequest);

        pendingOrder.setRazorpayOrderId(razorpayOrder.get("id"));
        orderRepository.save(pendingOrder);

        log.info("Razorpay order created for user {}: {}", user.getId(), razorpayOrder.get("id"));

        Map<String, Object> response = new HashMap<>();
        response.put("orderId", razorpayOrder.get("id"));
        response.put("amount", amountInPaise);
        response.put("currency", pendingOrder.getCurrency());
        response.put("keyId", razorpayKeyId);
        response.put("internalOrderId", pendingOrder.getId());
        response.put("testMode", false);
        
        Map<String, String> prefill = new HashMap<>();
        prefill.put("name", user.getName() != null ? user.getName() : "");
        prefill.put("email", user.getEmail() != null ? user.getEmail() : "");
        prefill.put("contact", user.getMobileNumber() != null ? user.getMobileNumber() : "");
        response.put("prefill", prefill);

        return response;
    }

    /**
     * Verify payment after Razorpay checkout completes (called from frontend)
     */
    @Transactional
    public Map<String, Object> verifyPayment(String razorpayOrderId, String razorpayPaymentId, 
                                              String razorpaySignature) {
        Order order = orderRepository.findByRazorpayOrderId(razorpayOrderId)
                .orElseThrow(() -> new BadRequestException("Order not found"));

        // TEST MODE: Skip signature verification
        if (!testMode) {
            try {
                JSONObject attributes = new JSONObject();
                attributes.put("razorpay_order_id", razorpayOrderId);
                attributes.put("razorpay_payment_id", razorpayPaymentId);
                attributes.put("razorpay_signature", razorpaySignature);

                boolean isValid = Utils.verifyPaymentSignature(attributes, razorpayKeySecret);

                if (!isValid) {
                    log.error("Invalid Razorpay signature for order: {}", razorpayOrderId);
                    throw new BadRequestException("Payment verification failed");
                }
            } catch (RazorpayException e) {
                log.error("Razorpay signature verification error: {}", e.getMessage());
                throw new BadRequestException("Payment verification failed");
            }
        } else {
            log.info("TEST MODE: Skipping signature verification for order: {}", razorpayOrderId);
        }

        if (order.getStatus() != Order.OrderStatus.PENDING) {
            log.info("Order {} already processed", order.getId());
            return Map.of("success", true, "orderId", order.getId(), "message", "Order already processed");
        }

        // Mark order as paid
        order.setStatus(Order.OrderStatus.PAID);
        order.setPaidAt(LocalDateTime.now());
        order.setRazorpayPaymentId(razorpayPaymentId);

        // Reduce stock
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            if (product != null) {
                product.reduceStock(item.getQty());
                productRepository.save(product);
            }
        }

        orderRepository.save(order);

        // Clear cart
        cartService.clearCart(order.getUser());

        // Send confirmation email
        try {
            emailService.sendOrderConfirmation(order);
        } catch (Exception e) {
            log.error("Failed to send order confirmation email for order {}: {}", order.getId(), e.getMessage());
        }

        log.info("Order {} completed successfully via {} payment {}", 
                order.getId(), testMode ? "TEST" : "Razorpay", razorpayPaymentId);

        return Map.of(
                "success", true,
                "orderId", order.getId(),
                "message", "Payment successful"
        );
    }

    /**
     * Handle Razorpay webhook events
     */
    @Transactional
    public void handleWebhook(String payload, String signature) {
        try {
            boolean isValid = Utils.verifyWebhookSignature(payload, signature, razorpayWebhookSecret);
            if (!isValid) {
                log.error("Invalid Razorpay webhook signature");
                throw new BadRequestException("Invalid signature");
            }
        } catch (RazorpayException e) {
            log.error("Webhook signature verification failed: {}", e.getMessage());
            throw new BadRequestException("Invalid signature");
        }

        JSONObject webhookData = new JSONObject(payload);
        String event = webhookData.getString("event");

        log.info("Received Razorpay webhook: {}", event);

        if ("payment.captured".equals(event)) {
            handlePaymentCaptured(webhookData);
        } else if ("payment.failed".equals(event)) {
            handlePaymentFailed(webhookData);
        }
    }

    private void handlePaymentCaptured(JSONObject webhookData) {
        JSONObject paymentEntity = webhookData.getJSONObject("payload")
                .getJSONObject("payment")
                .getJSONObject("entity");

        String razorpayOrderId = paymentEntity.getString("order_id");
        String razorpayPaymentId = paymentEntity.getString("id");

        Order order = orderRepository.findByRazorpayOrderId(razorpayOrderId).orElse(null);

        if (order == null) {
            log.error("Order not found for Razorpay order: {}", razorpayOrderId);
            return;
        }

        if (order.getStatus() != Order.OrderStatus.PENDING) {
            log.info("Order {} already processed", order.getId());
            return;
        }

        order.setStatus(Order.OrderStatus.PAID);
        order.setPaidAt(LocalDateTime.now());
        order.setRazorpayPaymentId(razorpayPaymentId);

        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            if (product != null) {
                product.reduceStock(item.getQty());
                productRepository.save(product);
            }
        }

        orderRepository.save(order);
        cartService.clearCart(order.getUser());

        try {
            emailService.sendOrderConfirmation(order);
        } catch (Exception e) {
            log.error("Failed to send order confirmation email for order {}: {}", order.getId(), e.getMessage());
        }

        log.info("Order {} marked as paid via webhook", order.getId());
    }

    private void handlePaymentFailed(JSONObject webhookData) {
        JSONObject paymentEntity = webhookData.getJSONObject("payload")
                .getJSONObject("payment")
                .getJSONObject("entity");

        String razorpayOrderId = paymentEntity.getString("order_id");
        String errorDescription = paymentEntity.optJSONObject("error") != null 
                ? paymentEntity.getJSONObject("error").optString("description", "Payment failed")
                : "Payment failed";

        log.warn("Payment failed for Razorpay order {}: {}", razorpayOrderId, errorDescription);

        orderRepository.findByRazorpayOrderId(razorpayOrderId)
                .ifPresent(order -> {
                    if (order.getStatus() == Order.OrderStatus.PENDING) {
                        order.setStatus(Order.OrderStatus.CANCELLED);
                        orderRepository.save(order);
                        log.info("Order {} marked as cancelled due to payment failure", order.getId());
                    }
                });
    }

    private Order createPendingOrder(User user, Cart cart, Address shippingAddress, String shippingAddressStr) {
        BigDecimal total = cart.getItems().stream()
                .map(CartItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Order order = Order.builder()
                .user(user)
                .status(Order.OrderStatus.PENDING)
                .totalAmount(total)
                .currency(cart.getItems().get(0).getProduct().getCurrency())
                .customerEmail(user.getEmail())
                .customerPhone(user.getMobileNumber())
                .shippingAddress(shippingAddressStr)
                .address(shippingAddress)
                .build();

        for (CartItem cartItem : cart.getItems()) {
            OrderItem orderItem = OrderItem.builder()
                    .product(cartItem.getProduct())
                    .nameSnapshot(cartItem.getProduct().getName())
                    .priceSnapshot(cartItem.getUnitPriceSnapshot())
                    .qty(cartItem.getQty())
                    .imageUrl(cartItem.getProduct().getImages().isEmpty() ? null : 
                            cartItem.getProduct().getImages().get(0))
                    .build();
            order.addItem(orderItem);
        }

        return orderRepository.save(order);
    }

    private String formatAddress(Address address) {
        StringBuilder sb = new StringBuilder();
        sb.append(address.getLine1());
        if (address.getLine2() != null && !address.getLine2().isBlank()) {
            sb.append(", ").append(address.getLine2());
        }
        sb.append("\n").append(address.getCity());
        if (address.getState() != null && !address.getState().isBlank()) {
            sb.append(", ").append(address.getState());
        }
        if (address.getZip() != null && !address.getZip().isBlank()) {
            sb.append(" - ").append(address.getZip());
        }
        sb.append("\n").append(address.getCountry());
        if (address.getPhone() != null && !address.getPhone().isBlank()) {
            sb.append("\nPhone: ").append(address.getPhone());
        }
        return sb.toString();
    }
}
