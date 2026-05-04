package com.jaee.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Selling price = ceil(base cost + Razorpay % of base cost), in whole rupees.
 */
@Service
public class RetailPricingService {

    @Value("${app.pricing.razorpay-fee-rate:0.02365}")
    private BigDecimal razorpayFeeRate;

    public BigDecimal retailFromBaseCost(BigDecimal baseCost) {
        if (baseCost == null || baseCost.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Base cost must be positive");
        }
        BigDecimal multiplier = BigDecimal.ONE.add(razorpayFeeRate);
        return baseCost.multiply(multiplier).setScale(0, RoundingMode.CEILING);
    }

    public BigDecimal getRazorpayFeeRate() {
        return razorpayFeeRate;
    }
}
