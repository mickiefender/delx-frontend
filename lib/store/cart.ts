import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  productId: string
  variantId?: string
  name: string
  image?: string
  price: number
  quantity: number
}

export interface CartStore {
  items: CartItem[]
  couponCode?: string
  couponDiscount: number

  addItem: (item: CartItem) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  applyCoupon: (code: string, discount: number) => void
  removeCoupon: () => void
  clearCart: () => void
  
  getTotalPrice: () => number
  getTotalItems: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: undefined,
      couponDiscount: 0,

      addItem: (item) => set((state) => {
        const existingItem = state.items.find(
          (i) => i.productId === item.productId && i.variantId === item.variantId
        )
        if (existingItem) {
          return {
            items: state.items.map((i) =>
              i.id === existingItem.id ? { ...i, quantity: i.quantity + item.quantity } : i
            ),
          }
        }
        return { items: [...state.items, item] }
      }),

      removeItem: (itemId) => set((state) => ({
        items: state.items.filter((i) => i.id !== itemId),
      })),

      updateQuantity: (itemId, quantity) => set((state) => ({
        items: state.items
          .map((i) => (i.id === itemId ? { ...i, quantity } : i))
          .filter((i) => i.quantity > 0),
      })),

      applyCoupon: (code, discount) => set({
        couponCode: code,
        couponDiscount: discount,
      }),

      removeCoupon: () => set({
        couponCode: undefined,
        couponDiscount: 0,
      }),

      clearCart: () => set({
        items: [],
        couponCode: undefined,
        couponDiscount: 0,
      }),
      getTotalPrice: () => {
        const state = get()
        const subtotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
        const discount = state.couponDiscount || 0
        return Math.max(0, subtotal - discount)
      },

      getTotalItems: () => {
        const state = get()
        return state.items.reduce((sum, item) => sum + item.quantity, 0)
      },
    }),
    {
      name: 'cart-store',
    }
  )
)
