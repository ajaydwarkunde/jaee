package com.jaee.service;

import com.jaee.dto.cart.AddToCartRequest;
import com.jaee.dto.cart.CartDto;
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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock
    private CartRepository cartRepository;

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private CartService cartService;

    private User createUser(Long id) {
        User user = new User();
        user.setId(id);
        user.setEmail("user@test.com");
        user.setName("Test User");
        return user;
    }

    private Product createProduct(Long id, BigDecimal price, int stockQty, boolean active) {
        Product product = Product.builder()
                .name("Product " + id)
                .slug("product-" + id)
                .price(price)
                .stockQty(stockQty)
                .active(active)
                .images(List.of())
                .build();
        product.setId(id);
        return product;
    }

    private Cart createCart(User user, List<CartItem> items) {
        List<CartItem> itemList = items != null ? new ArrayList<>(items) : new ArrayList<>();
        Cart cart = Cart.builder()
                .id(1L)
                .user(user)
                .items(itemList)
                .build();
        itemList.forEach(item -> item.setCart(cart));
        return cart;
    }

    @Test
    void getCart_returnsExistingCart() {
        User user = createUser(1L);
        Cart cart = createCart(user, List.of());
        when(cartRepository.findByUserWithItems(user)).thenReturn(Optional.of(cart));

        CartDto result = cartService.getCart(user);

        assertThat(result.getId()).isEqualTo(1L);
        verify(cartRepository).findByUserWithItems(user);
        verify(cartRepository, never()).save(any());
    }

    @Test
    void getCart_createsNewCartWhenNoneExists() {
        User user = createUser(1L);
        when(cartRepository.findByUserWithItems(user)).thenReturn(Optional.empty());
        when(cartRepository.save(any(Cart.class))).thenAnswer(inv -> {
            Cart c = inv.getArgument(0);
            c.setId(1L);
            return c;
        });

        CartDto result = cartService.getCart(user);

        assertThat(result.getId()).isEqualTo(1L);
        verify(cartRepository).save(any(Cart.class));
    }

    @Test
    void addToCart_newItemAddedSuccessfully() {
        User user = createUser(1L);
        Product product = createProduct(1L, BigDecimal.TEN, 5, true);
        Cart cart = createCart(user, List.of());

        when(cartRepository.findByUserWithItems(user)).thenReturn(Optional.of(cart));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(cartItemRepository.findByCartAndProduct(cart, product)).thenReturn(Optional.empty());
        when(cartItemRepository.save(any(CartItem.class))).thenAnswer(inv -> {
            CartItem item = inv.getArgument(0);
            item.setId(1L);
            return item;
        });

        AddToCartRequest request = new AddToCartRequest();
        request.setProductId(1L);
        request.setQty(2);

        CartDto result = cartService.addToCart(user, request);

        assertThat(result.getItems()).hasSize(1);
        assertThat(result.getItems().get(0).getQty()).isEqualTo(2);
        verify(cartItemRepository).save(any(CartItem.class));
    }

    @Test
    void addToCart_existingItemQuantityIncremented() {
        User user = createUser(1L);
        Product product = createProduct(1L, BigDecimal.TEN, 10, true);
        CartItem existingItem = CartItem.builder()
                .id(1L)
                .product(product)
                .qty(2)
                .unitPriceSnapshot(product.getPrice())
                .build();
        Cart cart = createCart(user, List.of(existingItem));

        when(cartRepository.findByUserWithItems(user)).thenReturn(Optional.of(cart));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(cartItemRepository.findByCartAndProduct(cart, product)).thenReturn(Optional.of(existingItem));

        AddToCartRequest request = new AddToCartRequest();
        request.setProductId(1L);
        request.setQty(3);

        CartDto result = cartService.addToCart(user, request);

        assertThat(existingItem.getQty()).isEqualTo(5);
        verify(cartItemRepository).save(existingItem);
    }

    @Test
    void addToCart_throwsWhenProductNotFound() {
        User user = createUser(1L);
        Cart cart = createCart(user, List.of());
        when(cartRepository.findByUserWithItems(user)).thenReturn(Optional.of(cart));
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        AddToCartRequest request = new AddToCartRequest();
        request.setProductId(999L);
        request.setQty(1);

        assertThatThrownBy(() -> cartService.addToCart(user, request))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("Product not found");
        verify(cartItemRepository, never()).save(any());
    }

    @Test
    void addToCart_throwsWhenProductInactive() {
        User user = createUser(1L);
        Product product = createProduct(1L, BigDecimal.TEN, 5, false);
        Cart cart = createCart(user, List.of());

        when(cartRepository.findByUserWithItems(user)).thenReturn(Optional.of(cart));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        AddToCartRequest request = new AddToCartRequest();
        request.setProductId(1L);
        request.setQty(1);

        assertThatThrownBy(() -> cartService.addToCart(user, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("not available");
        verify(cartItemRepository, never()).save(any());
    }

    @Test
    void addToCart_throwsWhenInsufficientStock() {
        User user = createUser(1L);
        Product product = createProduct(1L, BigDecimal.TEN, 2, true);
        Cart cart = createCart(user, List.of());

        when(cartRepository.findByUserWithItems(user)).thenReturn(Optional.of(cart));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        AddToCartRequest request = new AddToCartRequest();
        request.setProductId(1L);
        request.setQty(5);

        assertThatThrownBy(() -> cartService.addToCart(user, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Insufficient stock");
        verify(cartItemRepository, never()).save(any());
    }

    @Test
    void updateCartItem_updatesQuantity() {
        User user = createUser(1L);
        Product product = createProduct(1L, BigDecimal.TEN, 10, true);
        CartItem item = CartItem.builder()
                .id(1L)
                .product(product)
                .qty(2)
                .unitPriceSnapshot(product.getPrice())
                .build();
        Cart cart = createCart(user, List.of(item));

        when(cartRepository.findByUserWithItems(user)).thenReturn(Optional.of(cart));

        UpdateCartItemRequest request = new UpdateCartItemRequest();
        request.setQty(4);

        CartDto result = cartService.updateCartItem(user, 1L, request);

        assertThat(item.getQty()).isEqualTo(4);
        verify(cartItemRepository).save(item);
    }

    @Test
    void updateCartItem_qtyZeroRemovesItem() {
        User user = createUser(1L);
        Product product = createProduct(1L, BigDecimal.TEN, 10, true);
        CartItem item = CartItem.builder()
                .id(1L)
                .product(product)
                .qty(2)
                .unitPriceSnapshot(product.getPrice())
                .build();
        Cart cart = createCart(user, List.of(item));

        when(cartRepository.findByUserWithItems(user)).thenReturn(Optional.of(cart));

        UpdateCartItemRequest request = new UpdateCartItemRequest();
        request.setQty(0);

        CartDto result = cartService.updateCartItem(user, 1L, request);

        assertThat(cart.getItems()).isEmpty();
        verify(cartItemRepository).delete(item);
    }

    @Test
    void updateCartItem_throwsWhenItemNotFound() {
        User user = createUser(1L);
        Cart cart = createCart(user, List.of());
        when(cartRepository.findByUserWithItems(user)).thenReturn(Optional.of(cart));

        UpdateCartItemRequest request = new UpdateCartItemRequest();
        request.setQty(2);

        assertThatThrownBy(() -> cartService.updateCartItem(user, 999L, request))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("Cart item not found");
        verify(cartItemRepository, never()).save(any());
        verify(cartItemRepository, never()).delete(any());
    }

    @Test
    void removeCartItem_removesSuccessfully() {
        User user = createUser(1L);
        Product product = createProduct(1L, BigDecimal.TEN, 10, true);
        CartItem item = CartItem.builder()
                .id(1L)
                .product(product)
                .qty(2)
                .unitPriceSnapshot(product.getPrice())
                .build();
        Cart cart = createCart(user, List.of(item));

        when(cartRepository.findByUserWithItems(user)).thenReturn(Optional.of(cart));

        CartDto result = cartService.removeCartItem(user, 1L);

        assertThat(cart.getItems()).isEmpty();
        verify(cartItemRepository).delete(item);
    }

    @Test
    void clearCart_clearsAllItems() {
        User user = createUser(1L);
        Product product = createProduct(1L, BigDecimal.TEN, 10, true);
        CartItem item = CartItem.builder()
                .id(1L)
                .product(product)
                .qty(1)
                .unitPriceSnapshot(product.getPrice())
                .build();
        Cart cart = createCart(user, List.of(item));

        when(cartRepository.findByUser(user)).thenReturn(Optional.of(cart));

        cartService.clearCart(user);

        assertThat(cart.getItems()).isEmpty();
        verify(cartRepository).save(cart);
    }

    @Test
    void getCartTotal_calculatesCorrectly() {
        User user = createUser(1L);
        Product p1 = createProduct(1L, BigDecimal.TEN, 10, true);
        Product p2 = createProduct(2L, BigDecimal.valueOf(5), 10, true);
        CartItem item1 = CartItem.builder()
                .id(1L)
                .product(p1)
                .qty(2)
                .unitPriceSnapshot(p1.getPrice())
                .build();
        CartItem item2 = CartItem.builder()
                .id(2L)
                .product(p2)
                .qty(3)
                .unitPriceSnapshot(p2.getPrice())
                .build();
        Cart cart = createCart(user, List.of(item1, item2));

        when(cartRepository.findByUserWithItems(user)).thenReturn(Optional.of(cart));

        BigDecimal total = cartService.getCartTotal(user);

        assertThat(total).isEqualByComparingTo(BigDecimal.valueOf(35));
    }

    @Test
    void getCartTotal_returnsZeroWhenCartEmpty() {
        User user = createUser(1L);
        when(cartRepository.findByUserWithItems(user)).thenReturn(Optional.empty());

        BigDecimal total = cartService.getCartTotal(user);

        assertThat(total).isEqualByComparingTo(BigDecimal.ZERO);
    }
}
