'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { AccountSidebar } from '@/components/account/account-sidebar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Package, ArrowRight, Loader, ShoppingBag } from 'lucide-react'

import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

type AccountOrder = {
  id: number
  order_id: string
  status: string
  total_amount: string | number
  created_at?: string
  items_count?: number
  tracking_number?: string | null
  shipping_first_name?: string
  shipping_last_name?: string
  shipping_email?: string
}

const statusColor = (status: string) => {
  const s = (status || '').toLowerCase()
  switch (s) {
    case 'delivered':
      return 'bg-green-100 text-green-800'
    case 'shipped':
      return 'bg-blue-100 text-blue-800'
    case 'processing':
      return 'bg-yellow-100 text-yellow-800'
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const statusLabel = (status: string) => {
  const s = status || ''
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : 'Unknown'
}

function toDateLabel(dateIso?: string) {
  if (!dateIso) return '—'
  const d = new Date(dateIso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function OrdersPage() {
  const router = useRouter()
  const token = useAuthStore.getState().token

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [orders, setOrders] = useState<AccountOrder[]>([])

  const headers = useMemo(() => {
    if (!token) return null
    return { Authorization: `Token ${token}` }
  }, [token])

useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const guestId = token ? null : window.localStorage.getItem('guest_id')
        const storedReference = token ? null : window.localStorage.getItem('paystack_reference')
        
        // FIRST: Verify any pending payments if we have a stored reference
        // This handles cases where user completed payment but didn't visit success page
        if (!token && storedReference) {
          try {
            const verifyRes = await fetch(`${API_BASE_URL}/payments/verify/`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ reference: storedReference }),
            })
            if (verifyRes.ok) {
              console.log('Payment verified on orders page load')
            }
          } catch (e) {
            console.warn('Payment verification on orders page failed:', e)
          }
        }

        const url = new URL(`${API_BASE_URL}/orders/`)
        if (!token && guestId) url.searchParams.set('guest_id', guestId)
        
        // Also try to fetch by paystack_reference if stored
        // This handles cases where user completed payment but didn't visit success page
        if (!token && storedReference) {
          url.searchParams.set('paystack_reference', storedReference)
        }

        const res = await fetch(url.toString(), { headers: headers ?? undefined })
        const json = await res.json()

        if (!res.ok) {
          throw new Error((json as any)?.error || `Failed to load orders (${res.status})`)
        }

        const list = Array.isArray(json) ? (json as AccountOrder[]) : ((json as any).results as AccountOrder[]) || []
        if (!cancelled) setOrders(list)
      } catch (e) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : 'Failed to load orders')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [headers])

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background flex items-center justify-center px-4">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Loading your orders...</p>
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

          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-blue-500" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold">My Orders</h1>

              </div>
              <p className="text-muted-foreground">Track and manage all your orders</p>
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <AccountSidebar />

              <div className="lg:col-span-3">
                {error ? (
                  <div className="bg-card border border-border rounded-xl p-6 mb-6">
                    <p className="font-semibold text-destructive mb-2">Could not load orders</p>
                    <p className="text-sm text-muted-foreground">{error}</p>
                  </div>
                ) : null}

                {orders.length === 0 && !error ? (
                  <div className="bg-card border border-border rounded-xl p-12 text-center">
                    <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-5">
                      <ShoppingBag className="w-9 h-9 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
                    <p className="text-muted-foreground mb-6">
                      You haven't placed any orders yet. Start shopping to see your orders here.
                    </p>
                    <Link href="/products">
                      <Button size="lg" className="gap-2">
                        <ShoppingBag className="w-4 h-4" />
                        Continue Shopping
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-card border border-border rounded-xl p-6 hover:border-accent/50 transition-all duration-200"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center mb-4">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Order ID</p>
                            <p className="font-mono text-sm font-semibold">{order.order_id}</p>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Date</p>
                            <p className="text-sm">{toDateLabel(order.created_at)}</p>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Status</p>
                            <Badge className={statusColor(order.status)}>{statusLabel(order.status)}</Badge>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Amount</p>
                            <p className="font-semibold">
                              {typeof order.total_amount === 'number'
                                ? `GHS ${order.total_amount.toFixed(2)}`
                                : `GHS ${order.total_amount}`}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Items</p>
                            <p className="text-sm">
                              {typeof order.items_count === 'number' ? `${order.items_count} items` : '—'}
                            </p>
                          </div>
                        </div>

                        {order.tracking_number ? (
                          <div className="py-3 px-4 bg-muted rounded-lg mb-4">
                            <p className="text-xs text-muted-foreground mb-1">Tracking Number</p>
                            <p className="font-mono text-sm font-semibold text-foreground">{order.tracking_number}</p>
                          </div>
                        ) : null}

                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => router.push(`/orders/${order.order_id}/confirmation`)}
                        >
                          View Details
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
