// API Response types
export interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

// User types
export interface User {
  id: number
  name: string | null
  email: string | null
  mobileNumber: string | null
  role: 'USER' | 'ADMIN'
  twoFactorEnabled?: boolean
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

// Product types
export interface Product {
  id: number
  name: string
  slug: string
  description: string | null
  price: number
  currency: string
  categoryId: number | null
  categoryName: string | null
  images: string[]
  stockQty: number
  active: boolean
  inStock: boolean
  createdAt: string
}

export interface ProductFilters {
  categoryId?: number
  minPrice?: number
  maxPrice?: number
  search?: string
  sortBy?: 'newest' | 'price' | 'name'
  sortDir?: 'asc' | 'desc'
  page?: number
  size?: number
}

// Category types
export interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  productCount: number
}

// Cart types
export interface CartItem {
  id: number
  productId: number
  productName: string
  productSlug: string
  productImage: string | null
  unitPrice: number
  qty: number
  subtotal: number
  inStock: boolean
  availableQty: number
}

export interface Cart {
  id: number
  items: CartItem[]
  subtotal: number
  itemCount: number
}

// Guest cart item for localStorage
export interface GuestCartItem {
  productId: number
  qty: number
}

// Order types
export interface OrderItem {
  id: number
  productId: number | null
  name: string
  price: number
  qty: number
  subtotal: number
  imageUrl: string | null
}

export interface Order {
  id: number
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'SHIPPED' | 'FULFILLED'
  totalAmount: number
  currency: string
  items: OrderItem[]
  shippingAddress: string | null
  customerEmail: string | null
  customerPhone: string | null
  createdAt: string
  paidAt: string | null
}

// Form types
export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  name: string
  email: string
  password: string
}

export interface OtpRequestData {
  mobileNumber: string
}

export interface OtpVerifyData {
  mobileNumber: string
  otp: string
}

export interface ProductFormData {
  name: string
  description?: string
  price: number
  currency: string
  categoryId?: number
  images: string[]
  stockQty: number
  active: boolean
}

export interface CategoryFormData {
  name: string
  description?: string
  imageUrl?: string
}

// Profile update types
export interface UpdateProfileData {
  name: string
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
}

export interface ChangeMobileData {
  newMobileNumber: string
}

export interface VerifyMobileChangeData {
  newMobileNumber: string
  otp: string
}

export interface TwoFactorSetupResponse {
  secret: string
  qrCodeUrl: string
  manualEntryKey: string
}

export interface TwoFactorVerifyData {
  code: string
}
