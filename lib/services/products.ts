import { useAuthStore } from '@/lib/store/auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export interface ProductListItem {
  id: number
  name: string
  slug: string
  category: number | null
  category_name: string
  // brand is optional (nullable in backend)
  brand?: number | null
  brand_name?: string
  price: string
  original_price: string | null
  image: string
  rating: string
  review_count: number
  discount_percentage: number
  is_featured: boolean
  stock_quantity: number
  is_in_stock: boolean
  status?: 'active' | 'inactive' | 'discontinued'
  collection?: 'none' | 'new_arrival' | 'best_seller' | 'special_offer'
}

export interface BrandListItem {
  id: number
  name: string
  slug: string
  logo: string | null
  is_active: boolean
  created_at: string
}

export interface ProductImageItem {
  id: number
  image: string
  alt_text: string
  is_primary: boolean
  order: number
}

export interface ProductDetailItem {
  id: number
  name: string
  slug: string
  category: number | null
  category_name: string
  // brand is optional (nullable in backend)
  brand?: number | null
  brand_name?: string
  description: string
  short_description: string
  price: string
  original_price: string | null
  sku: string | null
  stock_quantity: number
  is_featured: boolean
  collection: 'none' | 'new_arrival' | 'best_seller' | 'special_offer'
  status: 'active' | 'inactive' | 'discontinued'
  image: string
  images: ProductImageItem[]
  rating: string
  review_count: number
  discount_percentage: number
  created_at: string
  updated_at: string
}

export interface CategoryItem {
  id: number
  name: string
  slug: string
  description: string | null
  image: string | null
  is_active: boolean
  is_featured: boolean
  created_at: string
}

export interface ProductAttributeItem {
  id: number
  name: string
  slug: string
  values: string[]
  is_active: boolean
  created_at: string
}

export interface CreateAttributePayload {
  name: string
  values: string[]
  is_active?: boolean
}

export interface ProductAttributeItem {
  id: number
  name: string
  slug: string
  values: string[]
  is_active: boolean
  created_at: string
}

export interface CreateAttributePayload {
  name: string
  values: string[]
  is_active?: boolean
}

export interface CreateCategoryPayload {
  name: string
  description?: string
  image?: File
  is_active?: boolean
  is_featured?: boolean
}

export type ProductCollection = 'none' | 'new_arrival' | 'best_seller' | 'special_offer'

export interface CreateProductPayload {
  name: string
  category: string
  // optional
  brand?: string
  description: string
  short_description: string
  price: string
  original_price?: string
  sku?: string
  stock_quantity: string
  is_featured: boolean
  collection: ProductCollection
  status: 'active' | 'inactive' | 'discontinued'
  image: File
  additional_images?: File[]
  attributes?: number[]
}

const buildAuthHeaders = (): HeadersInit => {
  const token = useAuthStore.getState().token

  if (!token) {
    throw new Error('Admin token not found. Please log in again.')
  }

  return {
    Authorization: `Token ${token}`,
  }
}

export const fetchProducts = async (): Promise<ProductListItem[]> => {
  const response = await fetch(`${API_BASE_URL}/products/?ordering=-created_at`, {
    method: 'GET',
    headers: buildAuthHeaders(),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to fetch products (${response.status}): ${text}`)
  }

  const data = await response.json()

  if (Array.isArray(data)) {
    return data
  }

  if (data && Array.isArray(data.results)) {
    return data.results
  }

  return []
}

export const fetchCategories = async (): Promise<CategoryItem[]> => {
  const response = await fetch(`${API_BASE_URL}/categories/`, {
    method: 'GET',
    headers: buildAuthHeaders(),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to fetch categories (${response.status}): ${text}`)
  }

  const data = await response.json()

  if (Array.isArray(data)) {
    return data
  }

  if (data && Array.isArray(data.results)) {
    return data.results
  }

  return []
}

export const fetchFeaturedCategories = async (): Promise<CategoryItem[]> => {
  const response = await fetch(`${API_BASE_URL}/categories/featured/`, {
    method: 'GET',
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to fetch featured categories (${response.status}): ${text}`)
  }

  const data = await response.json()

  const categories: CategoryItem[] = Array.isArray(data)
    ? data
    : data && Array.isArray(data.results)
      ? data.results
      : []

  return categories.map((category) => ({
    ...category,
    image: toAbsoluteMediaUrl(category.image),
  }))
}

export const createCategory = async (payload: CreateCategoryPayload): Promise<void> => {
  const formData = new FormData()
  formData.append('name', payload.name)

  if (payload.description) {
    formData.append('description', payload.description)
  }

  if (payload.image) {
    formData.append('image', payload.image)
  }

  formData.append('is_active', String(payload.is_active ?? true))
  formData.append('is_featured', String(payload.is_featured ?? false))

  const response = await fetch(`${API_BASE_URL}/categories/`, {
    method: 'POST',
    headers: buildAuthHeaders(),
    body: formData,
  })

if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to create category (${response.status}): ${text}`)
  }
}

export const fetchAttributes = async (): Promise<ProductAttributeItem[]> => {
  const response = await fetch(`${API_BASE_URL}/attributes/`, {
    method: 'GET',
    headers: buildAuthHeaders(),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to fetch attributes (${response.status}): ${text}`)
  }

  const data = await response.json()

  if (Array.isArray(data)) {
    return data
  }

  if (data && Array.isArray(data.results)) {
    return data.results
  }

  return []
}

export const createAttribute = async (payload: CreateAttributePayload): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/attributes/`, {
    method: 'POST',
    headers: {
      ...buildAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: payload.name,
      values: payload.values,
      is_active: payload.is_active ?? true,
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to create attribute (${response.status}): ${text}`)
  }
}

export const deleteAttribute = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/attributes/${id}/`, {
    method: 'DELETE',
    headers: buildAuthHeaders(),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to delete attribute (${response.status}): ${text}`)
  }
}

const toAbsoluteMediaUrl = (url?: string | null): string => {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url

  const backendBase = API_BASE_URL.replace(/\/api\/v1\/?$/, '')
  if (url.startsWith('/')) {
    return `${backendBase}${url}`
  }
  return `${backendBase}/${url}`
}

export const fetchStoreProducts = async (brandId?: number): Promise<ProductListItem[]> => {
  const brandQuery = brandId ? `&brand=${brandId}` : ''
  const response = await fetch(`${API_BASE_URL}/products/?ordering=-created_at${brandQuery}`, {
    method: 'GET',
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to fetch store products (${response.status}): ${text}`)
  }

  const data = await response.json()
  const products: ProductListItem[] = Array.isArray(data)
    ? data
    : data && Array.isArray(data.results)
      ? data.results
      : []

  return products.map((product) => ({
    ...product,
    image: toAbsoluteMediaUrl(product.image),
  }))
}

export const fetchStoreProductBySlug = async (slug: string): Promise<ProductDetailItem> => {
  const response = await fetch(`${API_BASE_URL}/products/${slug}/`, {
    method: 'GET',
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to fetch product detail (${response.status}): ${text}`)
  }

  const data: ProductDetailItem = await response.json()

  return {
    ...data,
    image: toAbsoluteMediaUrl(data.image),
    images: (data.images || []).map((img: ProductImageItem) => ({
      ...img,
      image: toAbsoluteMediaUrl(img.image),
    })),
  }
}

export const fetchProductById = async (id: number): Promise<ProductDetailItem> => {
  const response = await fetch(`${API_BASE_URL}/products/${id}/`, {
    method: 'GET',
    headers: buildAuthHeaders(),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to fetch product detail (${response.status}): ${text}`)
  }

  const data: ProductDetailItem = await response.json()

  return {
    ...data,
    image: toAbsoluteMediaUrl(data.image),
  }
}

export const createBrand = async (payload: {
  name: string
  logo: File | null
  is_active?: boolean
}): Promise<void> => {
  const formData = new FormData()
  formData.append('name', payload.name)
  formData.append('is_active', String(payload.is_active ?? true))
  if (payload.logo) formData.append('logo', payload.logo)

  const response = await fetch(`${API_BASE_URL}/brands/`, {
    method: 'POST',
    headers: buildAuthHeaders(),
    body: formData,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to create brand (${response.status}): ${text}`)
  }
}

export const updateBrand = async (
  id: number,
  payload: { name?: string; logo?: File | null; is_active?: boolean }
): Promise<void> => {
  const formData = new FormData()

  if (payload.name !== undefined) formData.append('name', payload.name)
  if (payload.is_active !== undefined) formData.append('is_active', String(payload.is_active))
  if (payload.logo !== undefined) {
    if (payload.logo) formData.append('logo', payload.logo)
  }

  const response = await fetch(`${API_BASE_URL}/brands/${id}/`, {
    method: 'PATCH',
    headers: buildAuthHeaders(),
    body: formData,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to update brand (${response.status}): ${text}`)
  }
}

export const deleteBrand = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/brands/${id}/`, {
    method: 'DELETE',
    headers: buildAuthHeaders(),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to delete brand (${response.status}): ${text}`)
  }
}

export const createProduct = async (payload: CreateProductPayload): Promise<void> => {
  const formData = new FormData()
  formData.append('name', payload.name)
  formData.append('category', payload.category)

  if (payload.brand) {
    formData.append('brand', payload.brand)
  }
  formData.append('description', payload.description)
  formData.append('short_description', payload.short_description)
  formData.append('price', payload.price)

  if (payload.original_price) {
    formData.append('original_price', payload.original_price)
  }

  if (payload.sku) {
    formData.append('sku', payload.sku)
  }
  formData.append('stock_quantity', payload.stock_quantity)
  formData.append('is_featured', String(payload.is_featured))
  formData.append('collection', payload.collection)
  formData.append('status', payload.status)
  formData.append('image', payload.image)

if (payload.additional_images?.length) {
    payload.additional_images.forEach((file) => {
      formData.append('additional_images', file)
    })
  }

  if (payload.attributes?.length) {
    payload.attributes.forEach((attrId) => {
      formData.append('attributes', String(attrId))
    })
  }

  const response = await fetch(`${API_BASE_URL}/products/`, {
    method: 'POST',
    headers: buildAuthHeaders(),
    body: formData,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to create product (${response.status}): ${text}`)
  }
}

export interface UpdateProductPayload {
  name?: string
  category?: string
  // optional
  brand?: string
  description?: string
  short_description?: string
  price?: string
  original_price?: string
  sku?: string
  stock_quantity?: string
  is_featured?: boolean
  collection?: ProductCollection
  status?: 'active' | 'inactive' | 'discontinued'
  image?: File
  additional_images?: File[]
}

export const updateProduct = async (id: number, payload: Partial<UpdateProductPayload>): Promise<void> => {
  const formData = new FormData()

  if (payload.name) formData.append('name', payload.name)
  if (payload.category) formData.append('category', payload.category)
  if (payload.brand) formData.append('brand', payload.brand)
  if (payload.description) formData.append('description', payload.description)
  if (payload.short_description) formData.append('short_description', payload.short_description)
  if (payload.price) formData.append('price', payload.price)
  if (payload.original_price) formData.append('original_price', payload.original_price)
  if (payload.sku) formData.append('sku', payload.sku)
  if (payload.stock_quantity) formData.append('stock_quantity', payload.stock_quantity)
  if (payload.is_featured !== undefined) formData.append('is_featured', String(payload.is_featured))
  if (payload.collection) formData.append('collection', payload.collection)
  if (payload.status) formData.append('status', payload.status)
  if (payload.image) formData.append('image', payload.image)

  if (payload.additional_images?.length) {
    payload.additional_images.forEach((file) => {
      formData.append('additional_images', file)
    })
  }

  const response = await fetch(`${API_BASE_URL}/products/${id}/`, {
    method: 'PATCH',
    headers: buildAuthHeaders(),
    body: formData,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to update product (${response.status}): ${text}`)
  }
}

export const deleteProduct = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/products/${id}/`, {
    method: 'DELETE',
    headers: buildAuthHeaders(),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to delete product (${response.status}): ${text}`)
  }
}

export const updateCategory = async (id: number, payload: Partial<CreateCategoryPayload>): Promise<void> => {
  const formData = new FormData()

  if (payload.name) formData.append('name', payload.name)
  if (payload.description) formData.append('description', payload.description)
  if (payload.image) formData.append('image', payload.image)
  if (payload.is_active !== undefined) formData.append('is_active', String(payload.is_active))
  if (payload.is_featured !== undefined) formData.append('is_featured', String(payload.is_featured))

  const response = await fetch(`${API_BASE_URL}/categories/${id}/`, {
    method: 'PATCH',
    headers: buildAuthHeaders(),
    body: formData,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to update category (${response.status}): ${text}`)
  }
}

export const deleteCategory = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/categories/${id}/`, {
    method: 'DELETE',
    headers: buildAuthHeaders(),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to delete category (${response.status}): ${text}`)
  }
}

export const fetchBrands = async (): Promise<BrandListItem[]> => {
  const response = await fetch(`${API_BASE_URL}/brands/`, {
    method: 'GET',
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to fetch brands (${response.status}): ${text}`)
  }

  const data = await response.json()
  const brands: BrandListItem[] = Array.isArray(data)
    ? data
    : data && Array.isArray(data.results)
      ? data.results
      : []

  return brands.map((b) => ({
    ...b,
    logo: toAbsoluteMediaUrl(b.logo),
  }))
}

export const fetchProductsByCollection = async (collection: ProductCollection): Promise<ProductListItem[]> => {
  const validCollections = ['new_arrival', 'best_seller', 'special_offer']
  
  if (!validCollections.includes(collection)) {
    throw new Error(`Invalid collection. Must be one of: ${validCollections.join(', ')}`)
  }
  
  const response = await fetch(`${API_BASE_URL}/products/by_collection/?collection=${collection}`, {
    method: 'GET',
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to fetch products by collection (${response.status}): ${text}`)
  }

  const data = await response.json()
  const products: ProductListItem[] = Array.isArray(data)
    ? data
    : data && Array.isArray(data.results)
      ? data.results
      : []

  return products.map((product) => ({
    ...product,
    image: toAbsoluteMediaUrl(product.image),
  }))
}
