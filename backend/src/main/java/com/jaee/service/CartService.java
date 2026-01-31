package com.jaee.service;

import com.jaee.dto.cart.AddToCartRequest;
import com.jaee.dto.cart.CartDto;
import com.jaee.dto.cart.MergeCartRequest;
import com.jaee.dto.cart.UpdateCartItemRequest;
import com.jaee.entity.Cart;
import com.jaee.entity.CartItem;
import com.jaee.entity.Product;
import com.jaee.entity.User;
import com.jaee.exception.BadRequestException;
import com.jaee.exception.NotFoundException;
import com.jaee.repository.CartItemRepository;
import com.jaee.repository.CartRepository;
import com.jaee.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public CartDto getCart(User user) {
        Cart cart = getOrCreateCart(user);
        return CartDto.fromEntity(cart);
    }

    @Transactional
    public CartDto addToCart(User user, AddToCartRequest request) {
        Cart cart = getOrCreateCart(user);
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new NotFoundException("Product not found"));

        if (!product.getActive()) {
            throw new BadRequestException("Product is not available");
        }

        if (product.getStockQty() < request.getQty()) {
            throw new BadRequestException("Insufficient stock. Available: " + product.getStockQty());
        }

        // Check if item already in cart
        CartItem existingItem = cartItemRepository.findByCartAndProduct(cart, product)
                .orElse(null);

        if (existingItem != null) {
            int newQty = existingItem.getQty() + request.getQty();
            if (product.getStockQty() < newQty) {
                throw new BadRequestException("Insufficient stock. Available: " + product.getStockQty());
            }
            existingItem.setQty(newQty);
            cartItemRepository.save(existingItem);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .qty(request.getQty())
                    .unitPriceSnapshot(product.getPrice())
                    .build();
            cart.addItem(newItem);
            cartItemRepository.save(newItem);
        }

        log.info("Added {} x {} to cart for user {}", request.getQty(), product.getName(), user.getId());
        return CartDto.fromEntity(cart);
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
            if (item.getProduct().getStockQty() < request.getQty()) {
                throw new BadRequestException("Insufficient stock. Available: " + item.getProduct().getStockQty());
            }
            item.setQty(request.getQty());
            cartItemRepository.save(item);
        }

        return CartDto.fromEntity(cart);
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

        return CartDto.fromEntity(cart);
    }

    @Transactional
    public CartDto mergeCart(User user, MergeCartRequest request) {
        Cart cart = getOrCreateCart(user);

        for (MergeCartRequest.GuestCartItem guestItem : request.getGuestItems()) {
            Product product = productRepository.findById(guestItem.getProductId())
                    .orElse(null);

            if (product == null || !product.getActive()) {
                continue; // Skip invalid products
            }

            CartItem existingItem = cartItemRepository.findByCartAndProduct(cart, product)
                    .orElse(null);

            int qtyToAdd = Math.min(guestItem.getQty(), product.getStockQty());
            if (qtyToAdd <= 0) continue;

            if (existingItem != null) {
                int newQty = Math.min(existingItem.getQty() + qtyToAdd, product.getStockQty());
                existingItem.setQty(newQty);
                cartItemRepository.save(existingItem);
            } else {
                CartItem newItem = CartItem.builder()
                        .cart(cart)
                        .product(product)
                        .qty(qtyToAdd)
                        .unitPriceSnapshot(product.getPrice())
                        .build();
                cart.addItem(newItem);
                cartItemRepository.save(newItem);
            }
        }

        log.info("Merged {} guest items into cart for user {}", request.getGuestItems().size(), user.getId());
        return CartDto.fromEntity(cart);
    }

    @Transactional
    public void clearCart(User user) {
        Cart cart = cartRepository.findByUser(user).orElse(null);
        if (cart != null) {
            cart.clearItems();
            cartRepository.save(cart);
        }
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
