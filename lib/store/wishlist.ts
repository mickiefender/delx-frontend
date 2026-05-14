import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface WishlistItem {
  productId: number
  name: string
  image?: string
  price: number
  createdAt: string
}

export interface WishlistStore {
  items: WishlistItem[]

  isWishlisted: (productId: number) => boolean
  addItem: (item: WishlistItem) => void
  removeItem: (productId: number) => void
  toggleItem: (item: WishlistItem) => void
  clear: () => void
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      isWishlisted: (productId) => {
        const state = get()
        return state.items.some((i) => i.productId === productId)
      },

      addItem: (item) =>
        set((state) => {
          if (state.items.some((i) => i.productId === item.productId)) return state
          return { items: [{ ...item }, ...state.items] }
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),

      toggleItem: (item) =>
        set((state) => {
          const exists = state.items.some((i) => i.productId === item.productId)
          if (exists) {
            return { items: state.items.filter((i) => i.productId !== item.productId) }
          }
          return { items: [{ ...item }, ...state.items] }
        }),

      clear: () => set({ items: [] }),
    }),
    {
      name: 'wishlist-store',
    }
  )
)
