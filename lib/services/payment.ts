import { PaymentData, PaymentMethod, MobileMoneyProvider } from '@/lib/store/payment'

export interface InitializePaymentResponse {
  success: boolean
  data?: {
    authorizationUrl: string
    accessCode: string
    reference: string
  }
  error?: string
}

export interface VerifyPaymentResponse {
  success: boolean
  data?: {
    reference: string
    amount: number
    email: string
    phone?: string
    paymentMethod?: string
    status: 'success' | 'failed'
    paidAt: string
  }
  error?: string
}

export class PaymentService {
  /**
   * Initialize payment with Paystack
   */
  static async initializePayment(
    email: string,
    amount: number,
    orderId: string,
    phone: string,
    paymentMethod: PaymentMethod,
    mobileMoneyProvider?: MobileMoneyProvider,
    orderPayload?: Record<string, unknown>
  ): Promise<InitializePaymentResponse> {
    try {

      const authToken = localStorage.getItem('auth_token')

      const response = await fetch('/api/payments/initialize/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          amount,
          orderId,
          phone,
          paymentMethod,
          mobileMoneyProvider,
          ...(orderPayload ? { orderPayload } : {}),
        }),
      })

      const text = await response.text()
      const looksLikeJson = text.trim().startsWith('{') || text.trim().startsWith('[')

      const data = looksLikeJson
        ? (JSON.parse(text) as InitializePaymentResponse & { details?: unknown })
        : null

      if (!response.ok) {
        if (!data) {
          return {
            success: false,
            error: `Payment initialize failed (non-JSON response): ${text.slice(0, 300)}`,
          }
        }

        const detailsPart = data.details ? `: ${JSON.stringify(data.details)}` : ''
        return {
          success: false,
          error: `${data.error || 'Failed to initialize payment'}${detailsPart}`,
        }
      }

      return (data ?? { success: false, error: 'Unexpected empty response' })
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      }
    }
  }

  /**
   * Verify payment with Paystack
   */

  static async verifyPayment(reference: string): Promise<VerifyPaymentResponse> {
    try {
      const authToken = localStorage.getItem('auth_token')

      const response = await fetch('/api/payments/verify/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reference }),
      })

      const text = await response.text()
      const looksLikeJson = text.trim().startsWith('{') || text.trim().startsWith('[')

      const data = looksLikeJson ? (JSON.parse(text) as VerifyPaymentResponse) : null

      if (!response.ok) {
        return {
          success: false,
          error: data?.error || `Payment verify failed (non-JSON response): ${text.slice(0, 300)}`,
        }
      }

      return data ?? { success: false, error: 'Unexpected empty response' }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      }
    }
  }

  /**
   * Format amount in GHS to user-friendly format
   */
  static formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  /**
   * Get payment method display name
   */
  static getPaymentMethodName(method: PaymentMethod): string {
    const names: Record<PaymentMethod, string> = {
      card: 'Credit/Debit Card',
      mobile_money: 'Mobile Money',
      bank_transfer: 'Bank Transfer',
    }
    return names[method] || method
  }

  /**
   * Get mobile money provider name
   */
  static getMobileMoneyProviderName(provider: MobileMoneyProvider): string {
    const names: Record<MobileMoneyProvider, string> = {
      mtn: 'MTN MoMo',
      telecel: 'Telecel Cash',
      airteltigo: 'AirtelTigo Money',
    }
    return names[provider] || provider
  }

  /**
   * Generate order ID
   */
  static generateOrderId(): string {
    return `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
  }
}
