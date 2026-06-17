// Product Types
export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image_url?: string
  parent_id?: string
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface ProductImage {
  id: string
  product_id: string
  image_url: string
  alt_text?: string
  display_order: number
}

export interface ProductVariant {
  id: string
  product_id: string
  name: string
  sku?: string
  price?: number
  stock_quantity: number
  attributes?: Record<string, string>
}

export interface Product {
  id: string
  name: string
  slug: string
  description?: string
  long_description?: string
  category_id: string
  brand?: string
  base_price: number
  discount_price?: number
  discount_percentage?: number
  stock_quantity: number
  sku?: string
  weight?: number
  is_active: boolean
  is_featured: boolean
  rating_count: number
  average_rating: number
  view_count: number
  images?: ProductImage[]
  variants?: ProductVariant[]
  created_at: string
  updated_at: string
}

// User Types
export interface UserProfile {
  id: string
  first_name?: string
  last_name?: string
  phone?: string
  avatar_url?: string
  date_of_birth?: string
  bio?: string
  referral_code?: string
  referred_by_id?: string
  is_admin: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Address {
  id: string
  user_id: string
  address_type?: 'shipping' | 'billing'
  first_name: string
  last_name: string
  phone: string
  street_address: string
  apartment_suite?: string
  city: string
  state_province?: string
  postal_code?: string
  country: string
  is_default: boolean
  created_at: string
  updated_at: string
}

// Order Types
export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  variant_id?: string
  quantity: number
  price_at_time: number
}

export interface Order {
  id: string
  order_number: string
  user_id?: string
  guest_email?: string
  shipping_address_id?: string
  billing_address_id?: string
  subtotal: number
  shipping_cost: number
  discount_amount: number
  tax_amount: number
  total_amount: number
  coupon_id?: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded'
  payment_method?: string
  notes?: string
  items?: OrderItem[]
  created_at: string
  updated_at: string
  shipped_at?: string
  delivered_at?: string
}

export interface Payment {
  id: string
  order_id: string
  payment_method: 'card' | 'mobile_money' | 'bank_transfer'
  amount: number
  currency: string
  reference_code?: string
  status: 'pending' | 'completed' | 'failed'
  provider_response?: Record<string, unknown>
  created_at: string
  updated_at: string
}

// Review Types
export interface Review {
  id: string
  product_id: string
  user_id: string
  order_id?: string
  rating: number
  title?: string
  content?: string
  is_verified_purchase: boolean
  helpful_count: number
  unhelpful_count: number
  is_approved: boolean
  images?: string[]
  created_at: string
  updated_at: string
}

// Coupon Types
export interface Coupon {
  id: string
  code: string
  description?: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  max_uses?: number
  current_uses: number
  min_purchase_amount?: number
  max_discount_amount?: number
  applicable_categories?: string[]
  applicable_products?: string[]
  valid_from: string
  valid_until: string
  is_active: boolean
  created_at: string
}

// Analytics Types
export interface AnalyticsEvent {
  id: string
  user_id?: string
  event_type: string
  product_id?: string
  order_id?: string
  metadata?: Record<string, unknown>
  created_at: string
}

// API Response Types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

// Search Types
export interface SearchFilters {
  query?: string
  category?: string
  minPrice?: number
  maxPrice?: number
  rating?: number
  brands?: string[]
  inStock?: boolean
  sortBy?: 'popularity' | 'newest' | 'price_asc' | 'price_desc' | 'rating'
  page?: number
  limit?: number
}

// Cart Types
export interface CartResponse {
  id: string
  user_id?: string
  items: CartItem[]
  subtotal: number
  shipping: number
  discount: number
  total: number
}

export interface CartItem {
  id: string
  product_id: string
  variant_id?: string
  quantity: number
  price_at_time: number
  product?: Product
  variant?: ProductVariant
}

// Checkout Types
export interface CheckoutData {
  shipping_address: Address
  billing_address?: Address
  use_same_address: boolean
  shipping_method: string
  payment_method: 'card' | 'mobile_money' | 'bank_transfer'
  coupon_code?: string
}
