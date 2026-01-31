package com.jaee.dto.cart;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class MergeCartRequest {
    
    @NotNull(message = "Guest items are required")
    @Valid
    private List<GuestCartItem> guestItems;
    
    @Data
    public static class GuestCartItem {
        @NotNull(message = "Product ID is required")
        private Long productId;
        
        @NotNull(message = "Quantity is required")
        private Integer qty;
    }
}
