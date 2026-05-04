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
     * Billable weight for rate lookup: sum over lines of (product weight per unit × quantity).
     * Each unit uses {@link com.jaee.entity.Product#getWeightKg()} or 0.5 kg if unset.
     * This total is what {@link ShippingRateService#computeShippingInr} uses with the address zone.
     */
    public BigDecimal computeTotalCartWeightKg(Cart cart) {
        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            return BigDecimal.ZERO;
        }
        BigDecimal totalKg = BigDecimal.ZERO;
        for (CartItem item : cart.getItems()) {
            BigDecimal w = item.getProduct().getWeightKg() != null
                    ? item.getProduct().getWeightKg()
                    : new BigDecimal("0.5");
            totalKg = totalKg.add(w.multiply(BigDecimal.valueOf(item.getQty())));
        }
        return totalKg;
    }
}
