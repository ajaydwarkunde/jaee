package com.jaee.repository;

import com.jaee.entity.Cart;
import com.jaee.entity.CartItem;
import com.jaee.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    @Query("SELECT ci FROM CartItem ci WHERE ci.cart = :cart AND ci.product = :product AND " +
            "((:variantId IS NULL AND ci.variant IS NULL) OR (ci.variant IS NOT NULL AND ci.variant.id = :variantId))")
    Optional<CartItem> findCartLine(
            @Param("cart") Cart cart,
            @Param("product") Product product,
            @Param("variantId") Long variantId
    );

    void deleteByCart(Cart cart);
}
