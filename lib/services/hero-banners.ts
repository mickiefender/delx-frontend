import { useAuthStore } from '@/lib/store/auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export interface HeroBannerItem {
  id: number
  title: string
  subtitle: string
  cta_text: string
  cta_url: string
  image: string
  sort_order: number
  duration_seconds: number
}

const buildAuthHeaders = (): HeadersInit => {
  const token = useAuthStore.getState().token
  if (!token) {
    throw new Error('Admin token not found. Please log in again.')
  }
  return { Authorization: `Token ${token}` }
}

const toAbsoluteMediaUrl = (url?: string | null): string => {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  const backendBase = API_BASE_URL.replace(/\/api\/v1\/?$/, '')
  if (url.startsWith('/')) return `${backendBase}${url}`
  return `${backendBase}/${url}`
}

export const fetchActiveHeroBanners = async (): Promise<HeroBannerItem[]> => {
  const response = await fetch(`${API_BASE_URL}/hero-banners/`, { method: 'GET' })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to fetch hero banners (${response.status}): ${text}`)
  }

  const data = await response.json()

  const banners: HeroBannerItem[] = Array.isArray(data)
    ? data
    : data?.results
      ? data.results
      : []

  return banners
    .map((b) => ({
      ...b,
      image: toAbsoluteMediaUrl(b.image),
    }))
    .sort((a, c) => (a.sort_order ?? 0) - (c.sort_order ?? 0))
}

export interface CreateHeroBannerPayload {
  title: string
  subtitle: string
  cta_text: string
  cta_url: string
  image: File
  is_active?: boolean
  sort_order?: number
  duration_seconds?: number
}

export const createHeroBanner = async (payload: CreateHeroBannerPayload): Promise<void> => {
  const formData = new FormData()
  formData.append('title', payload.title)
  formData.append('subtitle', payload.subtitle)
  formData.append('cta_text', payload.cta_text)
  formData.append('cta_url', payload.cta_url)
  formData.append('image', payload.image)

  formData.append('is_active', String(payload.is_active ?? true))
  if (payload.sort_order !== undefined) formData.append('sort_order', String(payload.sort_order))
  formData.append('duration_seconds', String(payload.duration_seconds ?? 6))

  const response = await fetch(`${API_BASE_URL}/hero-banners/`, {
    method: 'POST',
    headers: buildAuthHeaders(),
    body: formData,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to create hero banner (${response.status}): ${text}`)
  }
}

export interface UpdateHeroBannerPayload {
  title?: string
  subtitle?: string
  cta_text?: string
  cta_url?: string
  image?: File
  is_active?: boolean
  sort_order?: number
  duration_seconds?: number
}

export const updateHeroBanner = async (id: number, payload: UpdateHeroBannerPayload): Promise<void> => {
  const formData = new FormData()

  if (payload.title !== undefined) formData.append('title', payload.title)
  if (payload.subtitle !== undefined) formData.append('subtitle', payload.subtitle)
  if (payload.cta_text !== undefined) formData.append('cta_text', payload.cta_text)
  if (payload.cta_url !== undefined) formData.append('cta_url', payload.cta_url)
  if (payload.image) formData.append('image', payload.image)

  if (payload.is_active !== undefined) formData.append('is_active', String(payload.is_active))
  if (payload.sort_order !== undefined) formData.append('sort_order', String(payload.sort_order))
  if (payload.duration_seconds !== undefined) formData.append('duration_seconds', String(payload.duration_seconds))

  const response = await fetch(`${API_BASE_URL}/hero-banners/${id}/`, {
    method: 'PATCH',
    headers: buildAuthHeaders(),
    body: formData,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to update hero banner (${response.status}): ${text}`)
  }
}

export const deleteHeroBanner = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/hero-banners/${id}/`, {
    method: 'DELETE',
    headers: buildAuthHeaders(),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to delete hero banner (${response.status}): ${text}`)
  }
}
