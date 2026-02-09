package com.jaee.service;

import com.jaee.dto.wishlist.WishlistItemDto;
import com.jaee.entity.Product;
import com.jaee.entity.User;
import com.jaee.entity.WishlistItem;
import com.jaee.exception.BadRequestException;
import com.jaee.exception.NotFoundException;
import com.jaee.repository.ProductRepository;
import com.jaee.repository.WishlistItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class WishlistService {

    private final WishlistItemRepository wishlistItemRepository;
    private final ProductRepository productRepository;

    public List<WishlistItemDto> getWishlist(User user) {
        return wishlistItemRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(WishlistItemDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public WishlistItemDto addToWishlist(User user, Long productId) {
        if (wishlistItemRepository.existsByUserIdAndProductId(user.getId(), productId)) {
            throw new BadRequestException("Product is already in your wishlist");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product not found"));

        WishlistItem item = WishlistItem.builder()
                .user(user)
                .product(product)
                .build();

        wishlistItemRepository.save(item);
        log.info("User {} added product {} to wishlist", user.getEmail(), productId);

        return WishlistItemDto.fromEntity(item);
    }

    @Transactional
    public void removeFromWishlist(User user, Long productId) {
        WishlistItem item = wishlistItemRepository.findByUserIdAndProductId(user.getId(), productId)
                .orElseThrow(() -> new NotFoundException("Product not found in wishlist"));

        wishlistItemRepository.delete(item);
        log.info("User {} removed product {} from wishlist", user.getEmail(), productId);
    }

    public boolean isInWishlist(User user, Long productId) {
        return wishlistItemRepository.existsByUserIdAndProductId(user.getId(), productId);
    }

    public List<Long> getWishlistProductIds(User user) {
        return wishlistItemRepository.findProductIdsByUserId(user.getId());
    }

    public long getWishlistCount(User user) {
        return wishlistItemRepository.countByUserId(user.getId());
    }
}
