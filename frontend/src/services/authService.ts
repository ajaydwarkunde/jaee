import { api } from '@/lib/api'
import type { 
  ApiResponse, 
  AuthResponse, 
  LoginFormData, 
  RegisterFormData, 
  OtpRequestData, 
  OtpVerifyData, 
  User,
  UpdateProfileData,
  ChangePasswordData,
  ChangeMobileData,
  VerifyMobileChangeData,
  TwoFactorSetupResponse,
  TwoFactorVerifyData
} from '@/types'

export interface OtpRequestResponse {
  devOtp: string | null  // OTP shown only in dev mode when SMS not configured
}

export const authService = {
  register: async (data: RegisterFormData): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data)
    return response.data.data
  },

  login: async (data: LoginFormData): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', data)
    return response.data.data
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/refresh', { refreshToken })
    return response.data.data
  },

  logout: async (refreshToken?: string): Promise<void> => {
    await api.post('/auth/logout', { refreshToken })
  },

  requestOtp: async (data: OtpRequestData): Promise<OtpRequestResponse> => {
    const response = await api.post<ApiResponse<OtpRequestResponse>>('/auth/otp/request', data)
    return response.data.data
  },

  verifyOtp: async (data: OtpVerifyData): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/otp/verify', data)
    return response.data.data
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>('/me')
    return response.data.data
  },

  // Profile management
  updateProfile: async (data: UpdateProfileData): Promise<User> => {
    const response = await api.put<ApiResponse<User>>('/me/profile', data)
    return response.data.data
  },

  changePassword: async (data: ChangePasswordData): Promise<void> => {
    await api.post('/me/change-password', data)
  },

  // Mobile number change
  requestMobileChangeOtp: async (data: ChangeMobileData): Promise<OtpRequestResponse> => {
    const response = await api.post<ApiResponse<OtpRequestResponse>>('/me/mobile/request-otp', data)
    return response.data.data
  },

  verifyAndChangeMobile: async (data: VerifyMobileChangeData): Promise<User> => {
    const response = await api.post<ApiResponse<User>>('/me/mobile/verify', data)
    return response.data.data
  },

  // Two-Factor Authentication
  setup2FA: async (): Promise<TwoFactorSetupResponse> => {
    const response = await api.post<ApiResponse<TwoFactorSetupResponse>>('/me/2fa/setup')
    return response.data.data
  },

  enable2FA: async (data: TwoFactorVerifyData): Promise<void> => {
    await api.post('/me/2fa/enable', data)
  },

  disable2FA: async (data: TwoFactorVerifyData): Promise<void> => {
    await api.post('/me/2fa/disable', data)
  },

  // Password Reset
  forgotPassword: async (email: string): Promise<void> => {
    await api.post('/auth/forgot-password', { email })
  },

  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await api.post('/auth/reset-password', { token, newPassword })
  },
}
