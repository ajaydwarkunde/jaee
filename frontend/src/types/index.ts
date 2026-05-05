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
  /** Per unit, for delivery (kg) */
  weightKg?: number
  compareAtPrice: number | null
  discountPercent: number | null
  currency: string
  categoryIds: number[]
  categoryNames: string[]
  images: string[]
  videos: string[]
  options: string[]
  variants: ProductVariant[]
  stockQty: number
  active: boolean
  inStock: boolean
  createdAt: string
  avgRating: number | null
  reviewCount: number | null
}

export interface ProductVariant {
  id: number
  productId: number
  sku: string | null
  /** Matches admin drag-and-drop ordering when present */
  sortOrder?: number | null
  price: number
  /** Per-unit shipping weight (kg) */
  weightKg?: number | null
  compareAtPrice: number | null
  discountPercent: number | null
  stockQty: number
  active: boolean
  inStock: boolean
  optionValues: Record<string, string>
  images: string[]
}

export interface ProductFilters {
  categoryId?: number
  minPrice?: number
  maxPrice?: number
  search?: string
  color?: string
  size?: string
  sortBy?: 'newest' | 'price' | 'name'
  sortDir?: 'asc' | 'desc'
  page?: number
  pageSize?: number
}

export interface FilterOptions {
  colors: string[]
  sizes: string[]
}

// Category types
export interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  storeType: 'CANDLE' | 'HAMPER' | null
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
  variantId?: number | null
  /** Option summary e.g. "Size: M · Scent: Rose" */
  variantLabel?: string | null
}

export interface Cart {
  id: number
  items: CartItem[]
  subtotal: number
  itemCount: number
  /** Sum of (product kg × qty); same basis as server shipping tiers */
  totalWeightKg?: number | null
  /** Present when cart was loaded with addressId */
  shippingAmount?: number | null
  shippingZone?: string | null
  freeShippingApplied?: boolean | null
}

// Guest cart item for localStorage
export interface GuestCartItem {
  productId: number
  qty: number
  /** When the product has variants, must match server cart line */
  variantId?: number
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
  variantId?: number | null
  variantLabel?: string | null
  /** SKU captured at checkout */
  sku?: string | null
  /** Compare-at / retail (MRP) at checkout */
  compareAtPrice?: number | null
}

export interface Order {
  id: number
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'SHIPPED' | 'FULFILLED'
  totalAmount: number
  shippingAmount?: number
  shippingZone?: string | null
  discountAmount?: number | null
  couponCode?: string | null
  currency: string
  items: OrderItem[]
  shippingAddress: string | null
  customerEmail: string | null
  customerPhone: string | null
  createdAt: string
  paidAt: string | null
  trackingNumber: string | null
  trackingUrl: string | null
  carrier: string | null
  // Admin fields
  userId?: number | null
  userName?: string | null
  itemCount?: number
}

// Address types
export interface Address {
  id: number
  line1: string
  line2: string | null
  city: string
  state: string | null
  country: string
  zip: string | null
  phone: string | null
  isDefault: boolean
}

export interface AddressFormData {
  line1: string
  line2?: string
  city: string
  state?: string
  country: string
  zip?: string
  phone?: string
  isDefault?: boolean
}

// Form types
export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  name: string
  email: string
  mobileNumber: string
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
  description: string
  price?: number
  compareAtPrice?: number
  currency: string
  categoryIds: number[]
  images: string[]
  videos: string[]
  options: string[]
  stockQty: number
  active: boolean
}

export interface CategoryFormData {
  name: string
  description?: string
  imageUrl?: string
  storeType?: string
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
