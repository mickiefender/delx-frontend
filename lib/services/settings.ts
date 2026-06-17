import { useAuthStore } from '@/lib/store/auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export interface SiteSettings {
  id: number
  site_name: string
  site_description: string
  primary_color: string
  secondary_color: string
  accent_color: string
  contact_email: string
  contact_phone: string
  contact_address: string
  facebook_url: string
  instagram_url: string
  twitter_url: string
  whatsapp_number: string
  free_shipping_threshold: string
  shipping_flat_rate: string
  local_shipping_rate: string
  tax_rate: string
  return_policy_days: number
  return_policy_text: string
  site_logo: string | null
  favicon: string | null
  is_maintenance_mode: boolean
  maintenance_message: string
  created_at: string
  updated_at: string
}

export interface SiteSettingsPublic {
  site_name: string
  site_description: string
  primary_color: string
  secondary_color: string
  accent_color: string
  contact_email: string
  contact_phone: string
  contact_address: string
  facebook_url: string
  instagram_url: string
  twitter_url: string
  whatsapp_number: string
  free_shipping_threshold: string
  shipping_flat_rate: string
  local_shipping_rate: string
  tax_rate: string
  return_policy_days: number
  return_policy_text: string
}

export interface UpdateSettingsPayload {
  site_name?: string
  site_description?: string
  primary_color?: string
  secondary_color?: string
  accent_color?: string
  contact_email?: string
  contact_phone?: string
  contact_address?: string
  facebook_url?: string
  instagram_url?: string
  twitter_url?: string
  whatsapp_number?: string
  free_shipping_threshold?: string
  shipping_flat_rate?: string
  local_shipping_rate?: string
  tax_rate?: string
  return_policy_days?: number
  return_policy_text?: string
  site_logo?: File
  favicon?: File
  is_maintenance_mode?: boolean
  maintenance_message?: string
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

const toAbsoluteMediaUrl = (url?: string | null): string => {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url

  const backendBase = API_BASE_URL.replace(/\/api\/v1\/?$/, '')
  if (url.startsWith('/')) {
    return `${backendBase}${url}`
  }
  return `${backendBase}/${url}`
}

export const fetchSettings = async (): Promise<SiteSettings> => {
  const response = await fetch(`${API_BASE_URL}/settings/`, {
    method: 'GET',
    headers: buildAuthHeaders(),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to fetch settings (${response.status}): ${text}`)
  }

  const data: SiteSettings = await response.json()

  return {
    ...data,
    site_logo: toAbsoluteMediaUrl(data.site_logo),
    favicon: toAbsoluteMediaUrl(data.favicon),
  }
}

export const fetchPublicSettings = async (): Promise<SiteSettingsPublic> => {
  const response = await fetch(`${API_BASE_URL}/settings/public/`, {
    method: 'GET',
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to fetch public settings (${response.status}): ${text}`)
  }

  return await response.json()
}

export const updateSettings = async (payload: Partial<UpdateSettingsPayload>): Promise<void> => {
  const formData = new FormData()

  if (payload.site_name) formData.append('site_name', payload.site_name)
  if (payload.site_description) formData.append('site_description', payload.site_description)
  if (payload.primary_color) formData.append('primary_color', payload.primary_color)
  if (payload.secondary_color) formData.append('secondary_color', payload.secondary_color)
  if (payload.accent_color) formData.append('accent_color', payload.accent_color)
  if (payload.contact_email) formData.append('contact_email', payload.contact_email)
  if (payload.contact_phone) formData.append('contact_phone', payload.contact_phone)
  if (payload.contact_address) formData.append('contact_address', payload.contact_address)
  if (payload.facebook_url) formData.append('facebook_url', payload.facebook_url)
  if (payload.instagram_url) formData.append('instagram_url', payload.instagram_url)
  if (payload.twitter_url) formData.append('twitter_url', payload.twitter_url)
  if (payload.whatsapp_number) formData.append('whatsapp_number', payload.whatsapp_number)
  if (payload.free_shipping_threshold) formData.append('free_shipping_threshold', payload.free_shipping_threshold)
  if (payload.shipping_flat_rate) formData.append('shipping_flat_rate', payload.shipping_flat_rate)
  if (payload.local_shipping_rate) formData.append('local_shipping_rate', payload.local_shipping_rate)
  if (payload.tax_rate) formData.append('tax_rate', payload.tax_rate)
  if (payload.return_policy_days !== undefined) {
    formData.append('return_policy_days', String(payload.return_policy_days))
  }
  if (payload.return_policy_text) formData.append('return_policy_text', payload.return_policy_text)
  if (payload.site_logo) formData.append('site_logo', payload.site_logo)
  if (payload.favicon) formData.append('favicon', payload.favicon)
  if (payload.is_maintenance_mode !== undefined) {
    formData.append('is_maintenance_mode', String(payload.is_maintenance_mode))
  }
  if (payload.maintenance_message) formData.append('maintenance_message', payload.maintenance_message)

  // Backend supports PATCH on the detail endpoint: /settings/{id}/
  const current = await fetchSettings()
  const response = await fetch(`${API_BASE_URL}/settings/${current.id}/`, {
    method: 'PATCH',
    headers: buildAuthHeaders(),
    body: formData,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to update settings (${response.status}): ${text}`)
  }
}
