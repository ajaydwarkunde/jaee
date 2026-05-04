package com.jaee.service;

import com.jaee.dto.cart.AddToCartRequest;
import com.jaee.dto.cart.CartDto;
import com.jaee.dto.cart.MergeCartRequest;
import com.jaee.dto.cart.UpdateCartItemRequest;
import com.jaee.entity.Address;
import com.jaee.entity.Cart;
import com.jaee.entity.CartItem;
import com.jaee.entity.Product;
import com.jaee.entity.ProductVariant;
import com.jaee.entity.User;
import com.jaee.exception.BadRequestException;
import com.jaee.exception.NotFoundException;
import com.jaee.repository.AddressRepository;
import com.jaee.repository.CartItemRepository;
import com.jaee.repository.CartRepository;
import com.jaee.repository.ProductRepository;
import com.jaee.repository.ProductVariantRepository;
import com.jaee.util.VariantLabelFormatter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final AddressRepository addressRepository;
    private final ShipmentQuoteService shipmentQuoteService;

    @Transactional(readOnly = true)
    public CartDto getCart(User user) {
        return getCart(user, null, null);
    }

    @Transactional(readOnly = true)
    public CartDto getCart(User user, Long addressId, String couponCode) {
        Cart cart = getOrCreateCart(user);
        CartDto dto = CartDto.fromEntity(cart);
        enrichCartTotals(cart, dto);

        if (addressId == null || cart.getItems().isEmpty()) {
            return dto;
        }

        Address address = addressRepository.findByIdAndUser(addressId, user).orElse(null);
        if (address == null) {
            return dto;
        }

        ShipmentQuoteService.Quote q = shipmentQuoteService.quote(user, cart, address, couponCode);
        dto.setShippingAmount(q.shippingAmount());
        dto.setShippingZone(q.zone().name());
        dto.setFreeShippingApplied(q.freeShippingApplied());
        return dto;
    }

    /** Sets total billable weight (basis for zone rate table). */
    private void enrichCartTotals(Cart cart, CartDto dto) {
        BigDecimal raw = shipmentQuoteService.computeTotalCartWeightKg(cart);
        if (raw == null) {
            raw = BigDecimal.ZERO;
        }
        dto.setTotalWeightKg(raw.setScale(3, RoundingMode.HALF_UP));
    }

    @Transactional
    public CartDto addToCart(User user, AddToCartRequest request) {
        Cart cart = getOrCreateCart(user);
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new NotFoundException("Product not found"));

        if (!product.getActive()) {
            throw new BadRequestException("Product is not available");
        }

        long variantCount = productVariantRepository.countByProduct_Id(product.getId());
        Long variantId = request.getVariantId();
        if (variantCount > 0 && variantId == null) {
            throw new BadRequestException("Please select an option for this product");
        }
        if (variantCount == 0 && variantId != null) {
            variantId = null;
        }

        ProductVariant variant = null;
        BigDecimal unitPrice = product.getPrice();
        int available;

        if (variantId != null) {
            variant = productVariantRepository.findByIdAndProduct_Id(variantId, product.getId())
                    .orElseThrow(() -> new BadRequestException("Invalid product option"));
            if (!Boolean.TRUE.equals(variant.getActive())) {
                throw new BadRequestException("This option is no longer available");
            }
            unitPrice = variant.getPrice();
            available = variant.getStockQty() != null ? variant.getStockQty() : 0;
        } else {
            available = product.getStockQty() != null ? product.getStockQty() : 0;
        }

        if (available < request.getQty()) {
            throw new BadRequestException("Insufficient stock. Available: " + available);
        }

        String variantLabel = variant != null ? VariantLabelFormatter.format(variant) : null;

        CartItem existingItem = cartItemRepository.findCartLine(cart, product, variantId)
                .orElse(null);

        if (existingItem != null) {
            int newQty = existingItem.getQty() + request.getQty();
            if (available < newQty) {
                throw new BadRequestException("Insufficient stock. Available: " + available);
            }
            existingItem.setQty(newQty);
            cartItemRepository.save(existingItem);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .variant(variant)
                    .variantLabel(variantLabel)
                    .qty(request.getQty())
                    .unitPriceSnapshot(unitPrice)
                    .build();
            cart.addItem(newItem);
            cartItemRepository.save(newItem);
        }

        log.info("Added {} x {} to cart for user {}", request.getQty(), product.getName(), user.getId());
        CartDto dto = CartDto.fromEntity(cart);
        enrichCartTotals(cart, dto);
        return dto;
    }

    @Transactional
    public CartDto updateCartItem(User user, Long itemId, UpdateCartItemRequest request) {
        Cart cart = getOrCreateCart(user);
        
        CartItem item = cart.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Cart item not found"));

        if (request.getQty() == 0) {
            cart.removeItem(item);
            cartItemRepository.delete(item);
        } else {
            int available = item.getVariant() != null
                    ? (item.getVariant().getStockQty() != null ? item.getVariant().getStockQty() : 0)
                    : (item.getProduct().getStockQty() != null ? item.getProduct().getStockQty() : 0);
            if (available < request.getQty()) {
                throw new BadRequestException("Insufficient stock. Available: " + available);
            }
            item.setQty(request.getQty());
            cartItemRepository.save(item);
        }

        CartDto dto = CartDto.fromEntity(cart);
        enrichCartTotals(cart, dto);
        return dto;
    }

    @Transactional
    public CartDto removeCartItem(User user, Long itemId) {
        Cart cart = getOrCreateCart(user);
        
        CartItem item = cart.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Cart item not found"));

        cart.removeItem(item);
        cartItemRepository.delete(item);

        CartDto dto = CartDto.fromEntity(cart);
        enrichCartTotals(cart, dto);
        return dto;
    }

    @Transactional
    public CartDto mergeCart(User user, MergeCartRequest request) {
        Cart cart = getOrCreateCart(user);

        for (MergeCartRequest.GuestCartItem guestItem : request.getGuestItems()) {
            Product product = productRepository.findById(guestItem.getProductId())
                    .orElse(null);

            if (product == null || !product.getActive()) {
                continue;
            }

            long variantCount = productVariantRepository.countByProduct_Id(product.getId());
            Long variantId = guestItem.getVariantId();
            if (variantCount > 0 && variantId == null) {
                continue;
            }
            if (variantCount == 0) {
                variantId = null;
            }

            ProductVariant variant = null;
            BigDecimal unitPrice = product.getPrice();
            int available;

            if (variantId != null) {
                variant = productVariantRepository.findByIdAndProduct_Id(variantId, product.getId()).orElse(null);
                if (variant == null || !Boolean.TRUE.equals(variant.getActive())) {
                    continue;
                }
                unitPrice = variant.getPrice();
                available = variant.getStockQty() != null ? variant.getStockQty() : 0;
            } else {
                available = product.getStockQty() != null ? product.getStockQty() : 0;
            }

            String variantLabel = variant != null ? VariantLabelFormatter.format(variant) : null;

            CartItem existingItem = cartItemRepository.findCartLine(cart, product, variantId).orElse(null);

            int qtyToAdd = Math.min(guestItem.getQty(), available);
            if (qtyToAdd <= 0) {
                continue;
            }

            if (existingItem != null) {
                int newQty = Math.min(existingItem.getQty() + qtyToAdd, available);
                existingItem.setQty(newQty);
                cartItemRepository.save(existingItem);
            } else {
                CartItem newItem = CartItem.builder()
                        .cart(cart)
                        .product(product)
                        .variant(variant)
                        .variantLabel(variantLabel)
                        .qty(qtyToAdd)
                        .unitPriceSnapshot(unitPrice)
                        .build();
                cart.addItem(newItem);
                cartItemRepository.save(newItem);
            }
        }

        log.info("Merged {} guest items into cart for user {}", request.getGuestItems().size(), user.getId());
        CartDto dto = CartDto.fromEntity(cart);
        enrichCartTotals(cart, dto);
        return dto;
    }

    @Transactional
    public void clearCart(User user) {
        Cart cart = cartRepository.findByUser(user).orElse(null);
        if (cart != null) {
            cart.clearItems();
            cartRepository.save(cart);
        }
    }
    
    @Transactional(readOnly = true)
    public BigDecimal getCartTotal(User user) {
        Cart cart = cartRepository.findByUserWithItems(user).orElse(null);
        if (cart == null || cart.getItems().isEmpty()) {
            return BigDecimal.ZERO;
        }
        
        return cart.getItems().stream()
                .map(CartItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private Cart getOrCreateCart(User user) {
        return cartRepository.findByUserWithItems(user)
                .orElseGet(() -> {
                    Cart newCart = Cart.builder()
                            .user(user)
                            .items(new ArrayList<>())
                            .build();
                    return cartRepository.save(newCart);
                });
    }
}
