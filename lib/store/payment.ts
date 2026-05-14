import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type PaymentMethod = 'card' | 'mobile_money' | 'bank_transfer'
export type MobileMoneyProvider = 'mtn' | 'telecel' | 'airteltigo'

export interface PaymentData {
  orderId: string
  email: string
  phone: string
  amount: number
  paymentMethod: PaymentMethod
  mobileMoneyProvider?: MobileMoneyProvider
  reference?: string
  status?: 'pending' | 'success' | 'failed'
  authorizationUrl?: string
  accessCode?: string
  createdAt?: string
  completedAt?: string
}

interface PaymentStore {
  currentPayment: PaymentData | null
  isProcessing: boolean
  error: string | null
  
  // Actions
  initializePayment: (data: PaymentData) => void
  setProcessing: (isProcessing: boolean) => void
  setError: (error: string | null) => void
  updatePaymentStatus: (status: 'pending' | 'success' | 'failed') => void
  clearPayment: () => void
}

export const usePaymentStore = create<PaymentStore>()(
  persist(
    (set) => ({
      currentPayment: null,
      isProcessing: false,
      error: null,

      initializePayment: (data: PaymentData) => {
        set({
          currentPayment: {
            ...data,
            createdAt: new Date().toISOString(),
          },
          isProcessing: false,
          error: null,
        })
      },

      setProcessing: (isProcessing: boolean) => {
        set({ isProcessing })
      },

      setError: (error: string | null) => {
        set({ error })
      },

      updatePaymentStatus: (status: 'pending' | 'success' | 'failed') => {
        set((state) => ({
          currentPayment: state.currentPayment
            ? {
                ...state.currentPayment,
                status,
                completedAt: status !== 'pending' ? new Date().toISOString() : undefined,
              }
            : null,
        }))
      },

      clearPayment: () => {
        set({
          currentPayment: null,
          isProcessing: false,
          error: null,
        })
      },
    }),
    {
      name: 'payment-store',
    }
  )
)
