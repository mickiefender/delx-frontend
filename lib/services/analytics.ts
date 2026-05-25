import { useAuthStore } from '@/lib/store/auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export interface NotificationCounts {
  new_orders_count: number
  recent_analytics_count: number
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

export const fetchNotificationCounts = async (): Promise<NotificationCounts> => {
  const response = await fetch(`${API_BASE_URL}/analytics/dashboard/notification-counts/`, {
    method: 'GET',
    headers: buildAuthHeaders(),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to fetch notification counts (${response.status}): ${text}`)
  }

  const data: NotificationCounts = await response.json()

  return {
    new_orders_count: data.new_orders_count ?? 0,
    recent_analytics_count: data.recent_analytics_count ?? 0,
  }
}
