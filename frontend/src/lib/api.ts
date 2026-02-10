import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/authStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    
    // If 401 or 403 (token expired) and we haven't retried yet, try to refresh
    const isAuthError = error.response?.status === 401 || error.response?.status === 403
    
    if (isAuthError && !originalRequest._retry) {
      originalRequest._retry = true
      
      const refreshToken = useAuthStore.getState().refreshToken
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          })
          
          const { accessToken, refreshToken: newRefreshToken } = response.data.data
          useAuthStore.getState().setTokens(accessToken, newRefreshToken)
          
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return api(originalRequest)
        } catch {
          // Refresh failed, logout
          useAuthStore.getState().logout()
          window.location.href = '/login'
        }
      } else {
        // No refresh token, redirect to login
        useAuthStore.getState().logout()
        window.location.href = '/login'
      }
    }
    
    return Promise.reject(error)
  }
)

// Map of status codes / backend messages to user-friendly messages
const FRIENDLY_MESSAGES: Record<string, string> = {
  'Invalid email or password': 'The email or password you entered is incorrect. Please try again.',
  'Invalid credentials': 'The email or password you entered is incorrect. Please try again.',
  'Bad credentials': 'The email or password you entered is incorrect. Please try again.',
  'Email is already registered': 'This email is already associated with an account. Try signing in instead.',
  'Current password is incorrect': 'The current password you entered doesn\'t match. Please try again.',
  'Network Error': 'Unable to connect to the server. Please check your internet connection.',
  'Request failed with status code 500': 'Something went wrong on our end. Please try again later.',
  'Request failed with status code 429': 'Too many attempts. Please wait a moment and try again.',
}

// Helper to extract error message
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string }>
    const backendMessage = axiosError.response?.data?.message
    
    // Check for user-friendly mapping
    if (backendMessage && FRIENDLY_MESSAGES[backendMessage]) {
      return FRIENDLY_MESSAGES[backendMessage]
    }
    
    // Check axios message mapping
    const axiosMessage = axiosError.message
    if (axiosMessage && FRIENDLY_MESSAGES[axiosMessage]) {
      return FRIENDLY_MESSAGES[axiosMessage]
    }

    // Status-specific fallbacks
    if (axiosError.response?.status === 401) {
      return 'Invalid credentials. Please check your email and password.'
    }
    if (axiosError.response?.status === 403) {
      return 'You don\'t have permission to perform this action.'
    }
    if (axiosError.response?.status === 404) {
      return 'The requested resource was not found.'
    }
    if (axiosError.response?.status === 429) {
      return 'Too many attempts. Please wait a moment and try again.'
    }
    if (axiosError.response?.status && axiosError.response.status >= 500) {
      return 'Something went wrong on our end. Please try again later.'
    }
    
    return backendMessage || 'An error occurred. Please try again.'
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'An unexpected error occurred. Please try again.'
}
