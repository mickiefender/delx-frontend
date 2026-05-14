import axios, { AxiosInstance, AxiosError } from 'axios'
import { createClient } from '@/lib/supabase/client'

let apiClient: AxiosInstance

export const getApiClient = async (): Promise<AxiosInstance> => {
  if (!apiClient) {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    apiClient = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Add auth token to requests
    if (session?.access_token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${session.access_token}`
    }

    // Handle response errors
    apiClient.interceptors.response.use(
      response => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Handle unauthorized
          supabase.auth.signOut()
        }
        return Promise.reject(error)
      }
    )
  }

  return apiClient
}

export default getApiClient
