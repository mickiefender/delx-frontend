import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthUser {
  id: number
  username: string
  email: string
  first_name?: string
  last_name?: string
  full_name?: string
  phone_number?: string

  // Used by storefront account pages
  phone?: string
  created_at?: string

  is_staff?: boolean
  is_superuser?: boolean
}

interface AuthStore {
  user: AuthUser | null
  token: string | null
  loading: boolean
  error: string | null
  setUser: (user: AuthUser | null) => void
  setToken: (token: string | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  signOut: () => void
  isAdmin: () => boolean
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,
      error: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      signOut: () => set({ user: null, token: null, error: null }),
      isAdmin: () => {
        const state = get()
        return state.user?.is_staff === true || state.user?.is_superuser === true
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
)
