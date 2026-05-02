import { api } from '../lib/api';

export interface CouponValidationResponse {
  valid: boolean;
  code: string;
  description?: string;
  discountType?: string;
  discountValue?: number;
  discountAmount?: number;
  minOrderAmount?: number;
  message: string;
}

export interface Coupon {
  id: number;
  code: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usedCount: number;
  validFrom?: string;
  validUntil?: string;
  active: boolean;
  valid: boolean;
  createdAt: string;
}

export interface CouponCreateRequest {
  code: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  validFrom?: string;
  validUntil?: string;
  active?: boolean;
}

interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export const couponService = {
  // Validate a coupon code
  validateCoupon: async (code: string, orderAmount?: number): Promise<CouponValidationResponse> => {
    const encodedCode = encodeURIComponent(code);
    const params =
      orderAmount !== undefined && orderAmount !== null
        ? `?orderAmount=${encodeURIComponent(String(orderAmount))}`
        : '';
    const response = await api.get(`/coupons/validate/${encodedCode}${params}`);
    return response.data.data;
  },

  // Admin: Get all coupons
  getAllCoupons: async (page = 0, size = 20): Promise<PageResponse<Coupon>> => {
    const response = await api.get(`/admin/coupons?page=${page}&size=${size}`);
    return response.data.data;
  },

  // Admin: Get coupon by ID
  getCouponById: async (id: number): Promise<Coupon> => {
    const response = await api.get(`/admin/coupons/${id}`);
    return response.data.data;
  },

  // Admin: Create coupon
  createCoupon: async (data: CouponCreateRequest): Promise<Coupon> => {
    const response = await api.post('/admin/coupons', data);
    return response.data.data;
  },

  // Admin: Update coupon
  updateCoupon: async (id: number, data: CouponCreateRequest): Promise<Coupon> => {
    const response = await api.put(`/admin/coupons/${id}`, data);
    return response.data.data;
  },

  // Admin: Delete coupon
  deleteCoupon: async (id: number): Promise<void> => {
    await api.delete(`/admin/coupons/${id}`);
  },
};
