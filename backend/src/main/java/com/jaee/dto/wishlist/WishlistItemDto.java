package com.jaee.dto.wishlist;

import com.jaee.dto.product.ProductDto;
import com.jaee.entity.WishlistItem;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class WishlistItemDto {
    private Long id;
    private ProductDto product;
    private LocalDateTime addedAt;

    public static WishlistItemDto fromEntity(WishlistItem item) {
        return WishlistItemDto.builder()
                .id(item.getId())
                .product(ProductDto.fromEntity(item.getProduct()))
                .addedAt(item.getCreatedAt())
                .build();
    }
}
