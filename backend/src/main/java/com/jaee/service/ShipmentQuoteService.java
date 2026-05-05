package com.jaee.service;

import com.jaee.dto.coupon.CouponValidationResponse;
import com.jaee.entity.Address;
import com.jaee.entity.Cart;
import com.jaee.entity.CartItem;
import com.jaee.entity.User;
import com.jaee.shipping.ShippingZone;
import com.jaee.shipping.ShippingZoneResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class ShipmentQuoteService {

    private final ShippingZoneResolver shippingZoneResolver;
    private final ShippingRateService shippingRateService;
    private final StoreSettingService storeSettingService;
    private final CouponService couponService;

    public record Quote(BigDecimal shippingAmount, ShippingZone zone, boolean freeShippingApplied) {}

    public Quote quote(User user, Cart cart, Address address, String couponCode) {
        BigDecimal subtotal = cart.getItems().stream()
                .map(CartItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal discount = BigDecimal.ZERO;
        if (couponCode != null && !couponCode.isBlank()) {
            CouponValidationResponse v = couponService.validateCoupon(couponCode.trim(), subtotal, user);
            if (v.isValid() && v.getDiscountAmount() != null) {
                discount = v.getDiscountAmount();
            }
        }

        BigDecimal afterDiscount = subtotal.subtract(discount);
        if (afterDiscount.compareTo(BigDecimal.ZERO) < 0) {
            afterDiscount = BigDecimal.ZERO;
        }

        ShippingZone zone = shippingZoneResolver.resolve(address);

        boolean free = storeSettingService.isFreeShippingEnabled()
                && afterDiscount.compareTo(BigDecimal.valueOf(storeSettingService.getFreeShippingThreshold())) >= 0;

        if (free) {
            return new Quote(BigDecimal.ZERO.setScale(2), zone, true);
        }

        BigDecimal totalKg = computeTotalCartWeightKg(cart);
        BigDecimal shipping = shippingRateService.computeShippingInr(totalKg, zone);
        return new Quote(shipping, zone, false);
    }

    /**
     * Billable weight: sum of (per-unit kg × qty). Uses variant {@code weightKg} when set,
     * otherwise product {@code weightKg}, otherwise 0.5 kg.
     */
    public BigDecimal computeTotalCartWeightKg(Cart cart) {
        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            return BigDecimal.ZERO;
        }
        BigDecimal totalKg = BigDecimal.ZERO;
        for (CartItem item : cart.getItems()) {
            BigDecimal perUnit = unitWeightKg(item);
            totalKg = totalKg.add(perUnit.multiply(BigDecimal.valueOf(item.getQty())));
        }
        return totalKg;
    }

    private static BigDecimal unitWeightKg(CartItem item) {
        if (item.getVariant() != null && item.getVariant().getWeightKg() != null
                && item.getVariant().getWeightKg().compareTo(BigDecimal.ZERO) > 0) {
            return item.getVariant().getWeightKg();
        }
        if (item.getProduct().getWeightKg() != null
                && item.getProduct().getWeightKg().compareTo(BigDecimal.ZERO) > 0) {
            return item.getProduct().getWeightKg();
        }
        return new BigDecimal("0.5");
    }
}
