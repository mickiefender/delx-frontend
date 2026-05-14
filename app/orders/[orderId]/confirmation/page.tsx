'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { usePaymentStore } from '@/lib/store/payment'
import { useCartStore } from '@/lib/store/cart'
import { CheckCircle } from 'lucide-react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

type OrderTrackingHistoryItem = {
  id: number
  status: string
  message: string
  location?: string
  timestamp: string
}

export default function OrderConfirmationPage() {
  const params = useParams()
  const orderId = params.orderId as string
  const { currentPayment } = usePaymentStore()
  const clearCart = useCartStore((state) => state.clearCart)

  const [isLoading, setIsLoading] = useState(true)
  const [trackingHistory, setTrackingHistory] = useState<OrderTrackingHistoryItem[]>([])
  const [trackingError, setTrackingError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadTracking() {
      setIsLoading(true)
      setTrackingError(null)

      try {
        const res = await fetch(`${API_BASE_URL}/orders/tracking-by-order-id/?order_id=${encodeURIComponent(orderId)}`)
        const json = await res.json()

        if (!res.ok) {
          throw new Error((json as any)?.error || `Failed to load tracking (${res.status})`)
        }

        if (cancelled) return
        setTrackingHistory(Array.isArray(json) ? (json as OrderTrackingHistoryItem[]) : [])
      } catch (e) {
        if (cancelled) return
        setTrackingError(e instanceof Error ? e.message : 'Failed to load tracking')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadTracking()
    return () => {
      cancelled = true
    }
  }, [orderId])

  useEffect(() => {
    clearCart()
  }, [clearCart])

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background flex items-center justify-center px-4">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading order details...</p>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-2xl mx-auto">
            {/* Success/Processing Message (based on backend tracking) */}
            {(() => {
              const hasConfirmed = trackingHistory.some(
                (t) => t.status?.toLowerCase() === 'confirmed'
              )

              return (
                <div className="text-center mb-12">
                  <div className="flex justify-center mb-4">
                    <div
                      className={`w-20 h-20 rounded-full flex items-center justify-center ${
                        hasConfirmed ? 'bg-green-100' : 'bg-muted'
                      }`}
                    >
                      <CheckCircle
                        className={`w-12 h-12 ${
                          hasConfirmed ? 'text-green-600' : 'text-foreground'
                        }`}
                      />
                    </div>
                  </div>

                  <h1 className="text-3xl font-bold mb-2">
                    {hasConfirmed ? 'Payment Successful ✅' : 'Payment received — processing...'}
                  </h1>

                  <p className="text-muted-foreground mb-4">
                    {hasConfirmed
                      ? "Your order has been confirmed. We've started processing it and will email you updates."
                      : 'We have received your payment. Your order is currently being processed.'}
                  </p>

                  <div className="text-lg font-semibold text-primary">
                    Order #{orderId}
                  </div>
                </div>
              )
            })()}

            {/* Payment Details */}
            {currentPayment && (
              <div className="bg-card border border-border rounded-lg p-6 mb-8">
                <h2 className="text-lg font-semibold mb-4">Payment Details</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount Paid</span>
                    <span className="font-semibold">GHS {currentPayment.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Method</span>
                    <span className="font-semibold capitalize">
                      {currentPayment.paymentMethod === 'mobile_money' 
                        ? `${currentPayment.mobileMoneyProvider?.toUpperCase()} Mobile Money`
                        : currentPayment.paymentMethod.replace('_', ' ')
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-semibold">{currentPayment.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className="inline-flex items-center gap-2 font-semibold text-green-600">
                      <div className="w-2 h-2 bg-green-600 rounded-full" />
                      Paid
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Order Status Timeline */}
            <div className="bg-card border border-border rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold mb-6">Order Status</h2>

              {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading tracking...</p>
              ) : trackingError ? (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <p className="font-semibold text-destructive">Failed to load tracking</p>
                  <p className="text-sm text-muted-foreground mt-1">{trackingError}</p>
                </div>
              ) : trackingHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tracking updates yet.</p>
              ) : (
                <div className="space-y-3">
                  {trackingHistory.map((t, idx) => (
                    <div key={t.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <p className="font-semibold">{t.status}</p>
                            <p className="text-sm text-muted-foreground">{t.message}</p>
                          </div>
                        </div>

                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {t.timestamp ? new Date(t.timestamp).toLocaleString() : ''}
                        </span>
                      </div>

                      {idx !== trackingHistory.length - 1 ? <div className="mt-3 h-px bg-border" /> : null}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* What's Next */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-blue-900 mb-3">What&apos;s Next?</h3>
              <ul className="text-sm text-blue-900 space-y-2">
                <li>✓ A confirmation email has been sent to {currentPayment?.email}</li>
                <li>✓ You can track your order in your account dashboard</li>
                <li>✓ Delivery usually takes 3-5 business days</li>
                <li>✓ We&apos;ll notify you when your order ships</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/">
                <Button variant="outline">Continue Shopping</Button>
              </Link>
              <Link href="/account/orders">
                <Button>View My Orders</Button>
              </Link>
              <Link href="/account/profile">
                <Button variant="outline">Account</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
