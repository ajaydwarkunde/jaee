package com.jaee.service;

import com.jaee.dto.common.PageResponse;
import com.jaee.dto.coupon.CouponCreateRequest;
import com.jaee.dto.coupon.CouponDto;
import com.jaee.dto.coupon.CouponValidationResponse;
import com.jaee.entity.Coupon;
import com.jaee.entity.Coupon.DiscountType;
import com.jaee.entity.CouponUsage;
import com.jaee.entity.Order;
import com.jaee.entity.User;
import com.jaee.exception.BadRequestException;
import com.jaee.exception.NotFoundException;
import com.jaee.repository.CouponRepository;
import com.jaee.repository.CouponUsageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Slf4j
public class CouponService {

    private final CouponRepository couponRepository;
    private final CouponUsageRepository couponUsageRepository;

    @Transactional(readOnly = true)
    public PageResponse<CouponDto> getAllCoupons(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Coupon> couponPage = couponRepository.findAllByOrderByCreatedAtDesc(pageable);
        return PageResponse.from(couponPage, CouponDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public CouponDto getCouponById(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Coupon not found"));
        return CouponDto.fromEntity(coupon);
    }

    @Transactional
    public CouponDto createCoupon(CouponCreateRequest request) {
        if (couponRepository.existsByCodeIgnoreCase(request.getCode().toUpperCase())) {
            throw new BadRequestException("Coupon code already exists");
        }

        Coupon coupon = Coupon.builder()
                .code(request.getCode().toUpperCase())
                .description(request.getDescription())
                .discountType(DiscountType.valueOf(request.getDiscountType()))
                .discountValue(request.getDiscountValue())
                .minOrderAmount(request.getMinOrderAmount() != null ? request.getMinOrderAmount() : BigDecimal.ZERO)
                .maxDiscountAmount(request.getMaxDiscountAmount())
                .usageLimit(request.getUsageLimit())
                .validFrom(request.getValidFrom())
                .validUntil(request.getValidUntil())
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        couponRepository.save(coupon);
        log.info("Coupon created: {}", coupon.getCode());
        return CouponDto.fromEntity(coupon);
    }

    @Transactional
    public CouponDto updateCoupon(Long id, CouponCreateRequest request) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Coupon not found"));

        // Check if code is being changed and if new code already exists
        if (!coupon.getCode().equalsIgnoreCase(request.getCode()) &&
            couponRepository.existsByCodeIgnoreCase(request.getCode().toUpperCase())) {
            throw new BadRequestException("Coupon code already exists");
        }

        coupon.setCode(request.getCode().toUpperCase());
        coupon.setDescription(request.getDescription());
        coupon.setDiscountType(DiscountType.valueOf(request.getDiscountType()));
        coupon.setDiscountValue(request.getDiscountValue());
        coupon.setMinOrderAmount(request.getMinOrderAmount());
        coupon.setMaxDiscountAmount(request.getMaxDiscountAmount());
        coupon.setUsageLimit(request.getUsageLimit());
        coupon.setValidFrom(request.getValidFrom());
        coupon.setValidUntil(request.getValidUntil());
        coupon.setActive(request.getActive());

        couponRepository.save(coupon);
        log.info("Coupon updated: {}", coupon.getCode());
        return CouponDto.fromEntity(coupon);
    }

    @Transactional
    public void deleteCoupon(Long id) {
        if (!couponRepository.existsById(id)) {
            throw new NotFoundException("Coupon not found");
        }
        couponRepository.deleteById(id);
        log.info("Coupon deleted: {}", id);
    }

    @Transactional(readOnly = true)
    public CouponValidationResponse validateCoupon(String code, BigDecimal orderAmount, User user) {
        if (orderAmount == null) {
            orderAmount = BigDecimal.ZERO;
        }

        Coupon coupon = couponRepository.findByCodeIgnoreCase(code.toUpperCase())
                .orElse(null);

        if (coupon == null) {
            return CouponValidationResponse.builder()
                    .valid(false)
                    .message("Invalid coupon code")
                    .build();
        }

        if (!coupon.isValid()) {
            return CouponValidationResponse.builder()
                    .valid(false)
                    .code(coupon.getCode())
                    .message("This coupon has expired or is no longer valid")
                    .build();
        }

        // Check if user already used this coupon
        if (user != null && couponUsageRepository.existsByCouponAndUser(coupon, user)) {
            return CouponValidationResponse.builder()
                    .valid(false)
                    .code(coupon.getCode())
                    .message("You have already used this coupon")
                    .build();
        }

        // Check minimum order amount
        if (orderAmount.compareTo(coupon.getMinOrderAmount()) < 0) {
            return CouponValidationResponse.builder()
                    .valid(false)
                    .code(coupon.getCode())
                    .minOrderAmount(coupon.getMinOrderAmount())
                    .message("Minimum order amount is ₹" + coupon.getMinOrderAmount().intValue())
                    .build();
        }

        BigDecimal discountAmount = coupon.calculateDiscount(orderAmount);

        return CouponValidationResponse.builder()
                .valid(true)
                .code(coupon.getCode())
                .description(coupon.getDescription())
                .discountType(coupon.getDiscountType().name())
                .discountValue(coupon.getDiscountValue())
                .discountAmount(discountAmount)
                .minOrderAmount(coupon.getMinOrderAmount())
                .message("Coupon applied! You save ₹" + discountAmount.intValue())
                .build();
    }

    @Transactional
    public void recordCouponUsage(Coupon coupon, User user, Order order) {
        CouponUsage usage = CouponUsage.builder()
                .coupon(coupon)
                .user(user)
                .order(order)
                .build();
        couponUsageRepository.save(usage);

        // Increment used count
        coupon.setUsedCount(coupon.getUsedCount() + 1);
        couponRepository.save(coupon);

        log.info("Coupon {} used by user {}", coupon.getCode(), user.getId());
    }

    @Transactional(readOnly = true)
    public Coupon getCouponByCode(String code) {
        return couponRepository.findByCodeIgnoreCase(code.toUpperCase())
                .orElseThrow(() -> new NotFoundException("Coupon not found"));
    }
}
