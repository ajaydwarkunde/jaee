package com.jaee.service;

import com.jaee.dto.common.PageResponse;
import com.jaee.dto.coupon.CouponCreateRequest;
import com.jaee.dto.coupon.CouponDto;
import com.jaee.dto.coupon.CouponValidationResponse;
import com.jaee.entity.Coupon;
import com.jaee.entity.CouponUsage;
import com.jaee.entity.Order;
import com.jaee.entity.Order.OrderStatus;
import com.jaee.entity.User;
import com.jaee.exception.BadRequestException;
import com.jaee.exception.NotFoundException;
import com.jaee.repository.CouponRepository;
import com.jaee.repository.CouponUsageRepository;
import com.jaee.repository.OrderRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CouponServiceTest {

    @Mock
    private CouponRepository couponRepository;

    @Mock
    private CouponUsageRepository couponUsageRepository;

    @Mock
    private OrderRepository orderRepository;

    @InjectMocks
    private CouponService couponService;

    private CouponCreateRequest createRequest() {
        CouponCreateRequest req = new CouponCreateRequest();
        req.setCode("SAVE20");
        req.setDescription("20% off");
        req.setDiscountType("PERCENTAGE");
        req.setDiscountValue(new BigDecimal("20"));
        req.setMinOrderAmount(new BigDecimal("500"));
        req.setMaxDiscountAmount(new BigDecimal("200"));
        req.setUsageLimit(100);
        req.setValidFrom(LocalDateTime.now().minusDays(1));
        req.setValidUntil(LocalDateTime.now().plusDays(30));
        req.setActive(true);
        return req;
    }

    @Test
    void createCoupon_success() {
        CouponCreateRequest request = createRequest();
        when(couponRepository.existsByCodeIgnoreCase("SAVE20")).thenReturn(false);

        Coupon coupon = Coupon.builder()
                .id(1L)
                .code("SAVE20")
                .description(request.getDescription())
                .discountType(Coupon.DiscountType.PERCENTAGE)
                .discountValue(request.getDiscountValue())
                .minOrderAmount(request.getMinOrderAmount())
                .maxDiscountAmount(request.getMaxDiscountAmount())
                .usageLimit(request.getUsageLimit())
                .usedCount(0)
                .validFrom(request.getValidFrom())
                .validUntil(request.getValidUntil())
                .active(true)
                .createdAt(LocalDateTime.now())
                .build();

        when(couponRepository.save(any(Coupon.class))).thenAnswer(inv -> {
            Coupon c = inv.getArgument(0);
            c.setId(1L);
            return c;
        });

        CouponDto result = couponService.createCoupon(request);

        assertThat(result.getCode()).isEqualTo("SAVE20");
        assertThat(result.getDescription()).isEqualTo("20% off");
        assertThat(result.getDiscountType()).isEqualTo("PERCENTAGE");
        verify(couponRepository).save(any(Coupon.class));
    }

    @Test
    void createCoupon_duplicateCode_throwsBadRequestException() {
        CouponCreateRequest request = createRequest();
        when(couponRepository.existsByCodeIgnoreCase("SAVE20")).thenReturn(true);

        assertThatThrownBy(() -> couponService.createCoupon(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Coupon code already exists");

        verify(couponRepository, never()).save(any(Coupon.class));
    }

    @Test
    void getCouponById_success() {
        Coupon coupon = Coupon.builder()
                .id(1L)
                .code("SAVE20")
                .description("20% off")
                .discountType(Coupon.DiscountType.PERCENTAGE)
                .discountValue(new BigDecimal("20"))
                .minOrderAmount(new BigDecimal("500"))
                .maxDiscountAmount(new BigDecimal("200"))
                .usageLimit(100)
                .usedCount(0)
                .validFrom(LocalDateTime.now().minusDays(1))
                .validUntil(LocalDateTime.now().plusDays(30))
                .active(true)
                .createdAt(LocalDateTime.now())
                .build();

        when(couponRepository.findById(1L)).thenReturn(Optional.of(coupon));

        CouponDto result = couponService.getCouponById(1L);

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getCode()).isEqualTo("SAVE20");
    }

    @Test
    void getCouponById_notFound_throwsNotFoundException() {
        when(couponRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> couponService.getCouponById(999L))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("Coupon not found");
    }

    @Test
    void validateCoupon_validCoupon_returnsSuccess() {
        Coupon coupon = Coupon.builder()
                .id(1L)
                .code("SAVE20")
                .description("20% off")
                .discountType(Coupon.DiscountType.PERCENTAGE)
                .discountValue(new BigDecimal("20"))
                .minOrderAmount(new BigDecimal("500"))
                .maxDiscountAmount(new BigDecimal("200"))
                .usageLimit(100)
                .usedCount(10)
                .validFrom(LocalDateTime.now().minusDays(1))
                .validUntil(LocalDateTime.now().plusDays(30))
                .active(true)
                .build();

        when(couponRepository.findByCodeIgnoreCase("SAVE20")).thenReturn(Optional.of(coupon));

        User user = User.builder().id(1L).build();
        when(couponUsageRepository.existsByCouponAndUser(coupon, user)).thenReturn(false);
        when(orderRepository.existsNonCancelledOrderWithCoupon(eq(1L), eq(1L), eq(OrderStatus.CANCELLED)))
                .thenReturn(false);
        CouponValidationResponse response = couponService.validateCoupon("save20", new BigDecimal("1000"), user);

        assertThat(response.isValid()).isTrue();
        assertThat(response.getCode()).isEqualTo("SAVE20");
        assertThat(response.getDiscountAmount()).isEqualByComparingTo(new BigDecimal("200"));
    }

    @Test
    void validateCoupon_invalidCode_returnsInvalid() {
        when(couponRepository.findByCodeIgnoreCase("INVALID")).thenReturn(Optional.empty());

        CouponValidationResponse response = couponService.validateCoupon("INVALID", new BigDecimal("1000"), null);

        assertThat(response.isValid()).isFalse();
        assertThat(response.getMessage()).isEqualTo("Invalid coupon code");
    }

    @Test
    void validateCoupon_expiredCoupon_returnsInvalid() {
        Coupon coupon = Coupon.builder()
                .id(1L)
                .code("EXPIRED")
                .discountType(Coupon.DiscountType.FIXED)
                .discountValue(new BigDecimal("100"))
                .minOrderAmount(BigDecimal.ZERO)
                .validFrom(LocalDateTime.now().minusDays(30))
                .validUntil(LocalDateTime.now().minusDays(1))
                .active(true)
                .usageLimit(100)
                .usedCount(0)
                .build();

        when(couponRepository.findByCodeIgnoreCase("EXPIRED")).thenReturn(Optional.of(coupon));

        CouponValidationResponse response = couponService.validateCoupon("EXPIRED", new BigDecimal("500"), null);

        assertThat(response.isValid()).isFalse();
        assertThat(response.getMessage()).isEqualTo("This coupon has expired or is no longer valid");
    }

    @Test
    void validateCoupon_userAlreadyUsed_returnsInvalid() {
        Coupon coupon = Coupon.builder()
                .id(1L)
                .code("SAVE20")
                .discountType(Coupon.DiscountType.FIXED)
                .discountValue(new BigDecimal("50"))
                .minOrderAmount(BigDecimal.ZERO)
                .validFrom(LocalDateTime.now().minusDays(1))
                .validUntil(LocalDateTime.now().plusDays(30))
                .active(true)
                .usageLimit(100)
                .usedCount(10)
                .build();

        User user = User.builder().id(1L).build();
        when(couponRepository.findByCodeIgnoreCase("SAVE20")).thenReturn(Optional.of(coupon));
        when(couponUsageRepository.existsByCouponAndUser(coupon, user)).thenReturn(true);

        CouponValidationResponse response = couponService.validateCoupon("SAVE20", new BigDecimal("500"), user);

        assertThat(response.isValid()).isFalse();
        assertThat(response.getMessage()).isEqualTo("You have already used this coupon");
    }

    @Test
    void validateCoupon_minOrderNotMet_returnsInvalid() {
        Coupon coupon = Coupon.builder()
                .id(1L)
                .code("SAVE20")
                .discountType(Coupon.DiscountType.FIXED)
                .discountValue(new BigDecimal("50"))
                .minOrderAmount(new BigDecimal("1000"))
                .validFrom(LocalDateTime.now().minusDays(1))
                .validUntil(LocalDateTime.now().plusDays(30))
                .active(true)
                .usageLimit(100)
                .usedCount(0)
                .build();

        User user = User.builder().id(1L).build();
        when(couponRepository.findByCodeIgnoreCase("SAVE20")).thenReturn(Optional.of(coupon));
        when(couponUsageRepository.existsByCouponAndUser(coupon, user)).thenReturn(false);
        when(orderRepository.existsNonCancelledOrderWithCoupon(eq(1L), eq(1L), eq(OrderStatus.CANCELLED)))
                .thenReturn(false);

        CouponValidationResponse response = couponService.validateCoupon("SAVE20", new BigDecimal("500"), user);

        assertThat(response.isValid()).isFalse();
        assertThat(response.getMinOrderAmount()).isEqualByComparingTo(new BigDecimal("1000"));
        assertThat(response.getMessage()).contains("1000");
    }

    @Test
    void validateCoupon_nonCancelledOrderWithSameCoupon_returnsInvalid() {
        Coupon coupon = Coupon.builder()
                .id(1L)
                .code("SAVE20")
                .discountType(Coupon.DiscountType.FIXED)
                .discountValue(new BigDecimal("50"))
                .minOrderAmount(BigDecimal.ZERO)
                .validFrom(LocalDateTime.now().minusDays(1))
                .validUntil(LocalDateTime.now().plusDays(30))
                .active(true)
                .usageLimit(100)
                .usedCount(10)
                .limitOneUsePerCustomer(true)
                .build();

        User user = User.builder().id(1L).build();
        when(couponRepository.findByCodeIgnoreCase("SAVE20")).thenReturn(Optional.of(coupon));
        when(couponUsageRepository.existsByCouponAndUser(coupon, user)).thenReturn(false);
        when(orderRepository.existsNonCancelledOrderWithCoupon(eq(1L), eq(1L), eq(OrderStatus.CANCELLED)))
                .thenReturn(true);

        CouponValidationResponse response = couponService.validateCoupon("SAVE20", new BigDecimal("500"), user);

        assertThat(response.isValid()).isFalse();
        assertThat(response.getMessage()).contains("already applied");
    }

    @Test
    void validateCoupon_limitOneUsePerCustomerFalse_skipsPerUserChecks() {
        Coupon coupon = Coupon.builder()
                .id(1L)
                .code("LOYAL10")
                .discountType(Coupon.DiscountType.FIXED)
                .discountValue(new BigDecimal("10"))
                .minOrderAmount(BigDecimal.ZERO)
                .validFrom(LocalDateTime.now().minusDays(1))
                .validUntil(LocalDateTime.now().plusDays(30))
                .active(true)
                .usageLimit(1000)
                .usedCount(0)
                .limitOneUsePerCustomer(false)
                .build();

        User user = User.builder().id(1L).build();
        when(couponRepository.findByCodeIgnoreCase("LOYAL10")).thenReturn(Optional.of(coupon));

        CouponValidationResponse response = couponService.validateCoupon("LOYAL10", new BigDecimal("500"), user);

        assertThat(response.isValid()).isTrue();
        verify(couponUsageRepository, never()).existsByCouponAndUser(any(), any());
        verify(orderRepository, never()).existsNonCancelledOrderWithCoupon(any(), any(), any());
    }

    @Test
    void deleteCoupon_success() {
        when(couponRepository.existsById(1L)).thenReturn(true);

        couponService.deleteCoupon(1L);

        verify(couponRepository).deleteById(1L);
    }

    @Test
    void deleteCoupon_notFound_throwsNotFoundException() {
        when(couponRepository.existsById(999L)).thenReturn(false);

        assertThatThrownBy(() -> couponService.deleteCoupon(999L))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("Coupon not found");

        verify(couponRepository, never()).deleteById(any());
    }

    @Test
    void recordCouponUsage_incrementsUsedCount() {
        Coupon coupon = Coupon.builder()
                .id(1L)
                .code("SAVE20")
                .discountType(Coupon.DiscountType.FIXED)
                .discountValue(new BigDecimal("50"))
                .minOrderAmount(BigDecimal.ZERO)
                .usedCount(5)
                .validFrom(LocalDateTime.now().minusDays(1))
                .validUntil(LocalDateTime.now().plusDays(30))
                .active(true)
                .build();

        User user = User.builder().id(1L).build();
        Order order = Order.builder().id(1L).build();

        when(couponRepository.save(any(Coupon.class))).thenAnswer(inv -> inv.getArgument(0));

        couponService.recordCouponUsage(coupon, user, order);

        verify(couponUsageRepository).save(any(CouponUsage.class));
        verify(couponRepository).save(coupon);
        assertThat(coupon.getUsedCount()).isEqualTo(6);
    }
}
