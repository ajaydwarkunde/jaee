import { api } from '@/lib/api'
import type { ApiResponse } from '@/types'

export interface RazorpayOrderData {
  orderId: string
  amount: number
  currency: string
  keyId: string
  internalOrderId: number
  testMode: boolean  // When true, payment is simulated without Razorpay
  prefill: {
    name: string
    email: string
    contact: string
  }
}

export interface PaymentVerificationData {
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature: string
}

export interface PaymentVerificationResult {
  success: boolean
  orderId: number
  message: string
}

export const checkoutService = {
  /**
   * Create a Razorpay order for checkout
   */
  createOrder: async (addressId?: number): Promise<RazorpayOrderData> => {
    const response = await api.post<ApiResponse<RazorpayOrderData>>('/checkout/create-order', 
      addressId ? { addressId } : {}
    )
    return response.data.data
  },

  /**
   * Verify payment after Razorpay checkout completes
   */
  verifyPayment: async (data: PaymentVerificationData): Promise<PaymentVerificationResult> => {
    const response = await api.post<ApiResponse<PaymentVerificationResult>>('/checkout/verify-payment', data)
    return response.data.data
  },
}
