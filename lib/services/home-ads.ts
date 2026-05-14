import { useAuthStore } from '@/lib/store/auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export interface HomeAdBannerItem {
  position: 1 | 2
  image: string
  link_url: string
  is_active: boolean
  created_at?: string
  updated_at?: string
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

export const fetchActiveHomeAds = async (): Promise<HomeAdBannerItem[]> => {
  const response = await fetch(`${API_BASE_URL}/home-ads/`, { method: 'GET' })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to fetch home ads (${response.status}): ${text}`)
  }

  const data = await response.json()

  const ads: HomeAdBannerItem[] = Array.isArray(data)
    ? data
    : data?.results
      ? data.results
      : []

  return ads
    .filter((a) => a.is_active)
    .map((a) => ({
      ...a,
      image: toAbsoluteMediaUrl(a.image),
    }))
    .sort((a, b) => a.position - b.position) as HomeAdBannerItem[]
}

export interface CreateHomeAdPayload {
  position: 1 | 2
  image: File
  link_url?: string
  is_active?: boolean
}

export const createHomeAd = async (payload: CreateHomeAdPayload): Promise<void> => {
  const formData = new FormData()
  formData.append('position', String(payload.position))
  formData.append('image', payload.image)
  if (payload.link_url !== undefined) formData.append('link_url', payload.link_url)
  formData.append('is_active', String(payload.is_active ?? true))

  const response = await fetch(`${API_BASE_URL}/home-ads/`, {
    method: 'POST',
    headers: buildAuthHeaders(),
    body: formData,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to create home ad (${response.status}): ${text}`)
  }
}

export interface UpdateHomeAdPayload {
  image?: File
  link_url?: string
  is_active?: boolean
}

export const updateHomeAd = async (position: 1 | 2, payload: UpdateHomeAdPayload): Promise<void> => {
  const formData = new FormData()

  if (payload.image) formData.append('image', payload.image)
  if (payload.link_url !== undefined) formData.append('link_url', payload.link_url)
  if (payload.is_active !== undefined) formData.append('is_active', String(payload.is_active))

  const response = await fetch(`${API_BASE_URL}/home-ads/${position}/`, {
    method: 'PATCH',
    headers: buildAuthHeaders(),
    body: formData,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to update home ad (${response.status}): ${text}`)
  }
}

export const deleteHomeAd = async (position: 1 | 2): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/home-ads/${position}/`, {
    method: 'DELETE',
    headers: buildAuthHeaders(),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to delete home ad (${response.status}): ${text}`)
  }
}
