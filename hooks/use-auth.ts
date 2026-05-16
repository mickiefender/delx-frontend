'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/store/auth'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' ? `${window.location.origin}/api/v1` : '')

interface LoginResponse {
  user: {
    id: number
    username: string
    email: string
    first_name?: string
    last_name?: string
    full_name?: string
    phone_number?: string
    is_staff: boolean
    is_superuser: boolean
  }
  token: string
}

export function useAuth() {
  const { user, token, setUser, setToken, setLoading, setError, signOut, isAdmin } = useAuthStore()
  const [isAuthReady, setIsAuthReady] = useState(false)

  useEffect(() => {
    // Check for existing session on mount
    const checkAuth = () => {
      const storedToken = localStorage.getItem('auth_token')
      const storedUser = localStorage.getItem('auth_user')
      
      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)
          setToken(storedToken)
        } catch (error) {
          console.error('Failed to parse stored user:', error)
          signOut()
        }
      }
      setIsAuthReady(true)
    }

    checkAuth()
}, [setUser, setToken, signOut])

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${API_BASE_URL}/users/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const contentType = response.headers.get('content-type') || ''
        let message = `Request failed (${response.status})`

        if (contentType.includes('application/json')) {
          const errorData = await response.json().catch(() => ({}))
          message = errorData?.error || errorData?.detail || message
        } else {
          const text = await response.text().catch(() => '')
          if (text) message = text.slice(0, 500)
        }

        throw new Error(message)
      }

      const data: LoginResponse = await response.json()
      
      // Store user and token
      setUser(data.user)
      setToken(data.token)
      
      // Also store in localStorage for persistence
      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('auth_user', JSON.stringify(data.user))
      
      return data.user
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      setLoading(true)
      
      // Call logout endpoint if token exists
      if (token) {
        try {
          await fetch(`${API_BASE_URL}/users/logout/`, {
            method: 'POST',
            headers: {
              'Authorization': `Token ${token}`,
            },
          })
        } catch {
          // Ignore logout API errors
        }
      }
      
      signOut()
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData: {
    username: string
    email: string
    password: string
    password2: string
    first_name?: string
    last_name?: string
  }) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${API_BASE_URL}/users/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(JSON.stringify(errorData))
      }

      const data: LoginResponse = await response.json()
      
      // Store user and token
      setUser(data.user)
      setToken(data.token)
      
      // Also store in localStorage for persistence
      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('auth_user', JSON.stringify(data.user))
      
      return data.user
    } catch (error) {
      console.error('Register error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isAdmin: isAdmin(),
    isAuthReady,
    signIn,
    signOut: handleSignOut,
    register,
  }
}
