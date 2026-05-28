const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface Review {
  id: number
  product: number
  user_name: string
  title: string
  content: string
  rating: number
  is_verified_purchase: boolean
  helpful_count: number
  created_at: string
  images?: {
    id: number
    image: string
  }[]
}

export async function getFeaturedReviews(): Promise<Review[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/reviews/featured/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Cache the results for 5 minutes
      next: { revalidate: 300 },
    })

    if (!response.ok) {
      console.error('Failed to fetch featured reviews:', response.statusText)
      return []
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching featured reviews:', error)
    return []
  }
}
