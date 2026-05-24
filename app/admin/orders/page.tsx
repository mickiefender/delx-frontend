'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Eye, Search, Download, Filter, X, Trash2 } from 'lucide-react'
import { useAuthStore } from '@/lib/store/auth'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

type AdminOrder = {
  id: number
  order_id: string
  status: string
  total_amount: string | number
  created_at?: string
  items_count?: number
  shipping_first_name?: string
  shipping_last_name?: string
  shipping_email?: string
  // Optional preview (if backend includes it)
  items?: Array<{
    id: number
    product_name: string
    product_image: string
    quantity: number
  }>
}

type OrderItemDetail = {
  id: number
  product_name: string
  product_image: string
  sku: string
  price: string | number
  quantity: number
  subtotal: string | number
}

type OrderTrackingDetail = {
  id: number
  status: string
  message: string
  location?: string
  timestamp: string
}

const ADMIN_ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const
type AdminOrderStatus = (typeof ADMIN_ORDER_STATUSES)[number]

type OrderDetail = {
  id: number
  order_id: string
  status: string
  shipping_first_name: string
  shipping_last_name: string
  shipping_email: string
  shipping_phone: string
  shipping_address: string
  shipping_city: string
  shipping_state: string
  shipping_postal_code: string
  shipping_country: string
  billing_same_as_shipping: boolean
  subtotal: string | number
  shipping_cost: string | number
  tax_amount: string | number
  discount_amount: string | number
  total_amount: string | number
  notes?: string | null
  items: OrderItemDetail[]
  tracking_history: OrderTrackingDetail[]
  created_at?: string
}

const statusColors: Record<string, string> = {
  delivered: 'bg-green-100 text-green-800',
  processing: 'bg-blue-100 text-blue-800',
  pending: 'bg-yellow-100 text-yellow-800',
  shipped: 'bg-gray-200 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
}

function toDateLabel(dateIso?: string) {
  if (!dateIso) return '—'
  const d = new Date(dateIso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  const token = useAuthStore.getState().token

  const headers = useMemo(() => {
    if (!token) return null
    return { Authorization: `Token ${token}` }
  }, [token])

  // Modal state
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)

  const closeModal = () => {
    setSelectedOrder(null)
    setDetailError(null)
  }

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      try {
        if (!headers) throw new Error('Admin token not found. Please log in again.')

        const res = await fetch(`${API_BASE_URL}/orders/`, { headers })
        const json = await res.json()

        if (!res.ok) {
          throw new Error((json as any)?.error || `Failed to fetch orders (${res.status})`)
        }

        const list = Array.isArray(json) ? (json as AdminOrder[]) : ((json as any).results as AdminOrder[]) || []
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

  const filteredOrders = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()

    return orders.filter((order) => {
      const customerName = `${order.shipping_first_name || ''} ${order.shipping_last_name || ''}`.trim().toLowerCase()
      const email = (order.shipping_email || '').toLowerCase()

      const matchesSearch =
        !q ||
        order.order_id.toLowerCase().includes(q) ||
        customerName.includes(q) ||
        email.includes(q)

      const matchesStatus = statusFilter === 'All' || order.status.toLowerCase() === statusFilter.toLowerCase()

      return matchesSearch && matchesStatus
    })
  }, [orders, searchTerm, statusFilter])

  const openOrderDetail = async (order: AdminOrder) => {
    if (!headers) return

    setIsDetailLoading(true)
    setDetailError(null)
    setSelectedOrder(null)

    try {
      const res = await fetch(`${API_BASE_URL}/orders/${order.id}/`, { headers })
      const json = (await res.json()) as OrderDetail

      if (!res.ok) {
        throw new Error((json as any)?.error || `Failed to load order details (${res.status})`)
      }

      setSelectedOrder(json)
    } catch (e) {
      setDetailError(e instanceof Error ? e.message : 'Failed to load order details')
    } finally {
      setIsDetailLoading(false)
    }
  }

  const pillFor = (status: string) => {
    const key = (status || '').toLowerCase()
    return statusColors[key] || 'bg-gray-100 text-gray-800'
  }

  const updateSelectedOrderStatus = async (status: AdminOrderStatus) => {
    if (!headers || !selectedOrder) return

    setIsDetailLoading(true)
    setDetailError(null)

    try {
      const res = await fetch(`${API_BASE_URL}/orders/${selectedOrder.id}/update-status/`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          message: `Admin updated order status to ${status}`,
        }),
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error((json as any)?.error || `Failed to update status (${res.status})`)
      }

      // Refresh modal
      const refreshRes = await fetch(`${API_BASE_URL}/orders/${selectedOrder.id}/`, { headers })
      const refreshJson = (await refreshRes.json()) as OrderDetail

      if (!refreshRes.ok) {
        throw new Error((refreshJson as any)?.error || `Failed to refresh order details (${refreshRes.status})`)
      }

      setSelectedOrder(refreshJson)
    } catch (e) {
      setDetailError(e instanceof Error ? e.message : 'Failed to update status')
    } finally {
      setIsDetailLoading(false)
    }
  }

  const deleteSelectedOrder = async () => {
    if (!headers || !selectedOrder) return

    setIsDetailLoading(true)
    setDetailError(null)

    try {
      const res = await fetch(`${API_BASE_URL}/orders/${selectedOrder.id}/`, {
        method: 'DELETE',
        headers,
      })

      if (!res.ok && res.status !== 204) {
        const text = await res.text()
        throw new Error(text || `Failed to delete order (${res.status})`)
      }

      closeModal()
      await (async () => {
        const refresh = await fetch(`${API_BASE_URL}/orders/`, { headers })
        const json = await refresh.json()

        if (!refresh.ok) {
          throw new Error((json as any)?.error || `Failed to refresh orders (${refresh.status})`)
        }

        const list = Array.isArray(json) ? (json as AdminOrder[]) : ((json as any).results as AdminOrder[]) || []
        setOrders(list)
      })()
    } catch (e) {
      setDetailError(e instanceof Error ? e.message : 'Failed to delete order')
    } finally {
      setIsDetailLoading(false)
    }
  }

  return (
    <div className="p-0">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground mt-1">Manage customer orders and shipments</p>
        </div>

        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      <Card className="p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search by order ID, customer or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-0 bg-transparent focus:ring-0 placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-0 focus:ring-0 placeholder:text-muted-foreground"
            >
              <option>All</option>
              <option>pending</option>
              <option>processing</option>
              <option>shipped</option>
              <option>delivered</option>
              <option>cancelled</option>
            </select>
          </div>

          <div className="flex items-center">
            <span className="text-sm text-muted-foreground">
              {filteredOrders.length} order{filteredOrders.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="min-h-[260px] flex items-center justify-center">
          <p className="text-muted-foreground text-sm">Loading orders...</p>
        </div>
      ) : error ? (
        <Card className="p-6">
          <p className="text-destructive font-semibold mb-2">Could not load orders</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </Card>
      ) : (
        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Order ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Items</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td className="py-6 px-4 text-sm text-muted-foreground" colSpan={8}>
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4 text-sm text-foreground font-medium">{order.order_id}</td>

                      <td className="py-3 px-4 text-sm text-foreground">
                        {`${order.shipping_first_name || ''} ${order.shipping_last_name || ''}`.trim() || 'Customer'}
                      </td>

                      <td className="py-3 px-4 text-sm text-foreground">{order.shipping_email || '—'}</td>

                      <td className="py-3 px-4 text-sm text-foreground">
                        {order.items && order.items.length > 0 ? (
                          <div className="flex items-center gap-2">
                            {order.items.slice(0, 3).map((it) => (
                              <div key={it.id} className="w-10 h-10 rounded-md bg-muted border border-border overflow-hidden flex items-center justify-center">
                                {it.product_image ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={it.product_image} alt={it.product_name} className="w-full h-full object-cover" />
                                ) : (
                                  <span aria-hidden="true" className="text-xl">🖼️</span>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : typeof order.items_count === 'number' ? (
                          <span>{order.items_count}</span>
                        ) : (
                          <span>—</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-sm font-semibold text-foreground">
                        {typeof order.total_amount === 'number'
                          ? `₵${order.total_amount.toFixed(2)}`
                          : `₵${order.total_amount}`}
                      </td>

                      <td className="py-3 px-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${pillFor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-sm text-muted-foreground">{toDateLabel(order.created_at)}</td>

                      <td className="py-3 px-4 text-sm">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700"
                          onClick={() => openOrderDetail(order)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal */}
      {selectedOrder || isDetailLoading || detailError ? (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg w-full max-w-3xl max-h-[85vh] overflow-y-auto">
            <div className="p-4 flex items-start justify-between border-b border-border gap-3">
              <div>
                <h2 className="text-xl font-bold text-foreground">Order Details</h2>
                <p className="text-muted-foreground mt-1">#{selectedOrder?.order_id || ''}</p>
              </div>

              <div className="flex items-center gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="gap-2" disabled={isDetailLoading}>
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogTitle>Delete Order</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete order "{selectedOrder?.order_id}"? This action cannot be undone.
                    </AlertDialogDescription>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={deleteSelectedOrder} disabled={isDetailLoading}>
                        {isDetailLoading ? 'Deleting...' : 'Delete'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Button variant="ghost" size="sm" onClick={closeModal} className="gap-2">
                  <X className="w-4 h-4" />
                  Close
                </Button>
              </div>
            </div>

            <div className="p-4">
              {isDetailLoading ? (
                <p className="text-sm text-muted-foreground">Loading order details...</p>
              ) : detailError ? (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <p className="font-semibold text-destructive">Failed to load order</p>
                  <p className="text-sm text-muted-foreground mt-1">{detailError}</p>
                </div>
              ) : selectedOrder ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-muted/30 border border-border rounded-lg p-4">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Shipping</p>
                      <p className="font-semibold">
                        {selectedOrder.shipping_first_name} {selectedOrder.shipping_last_name}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">{selectedOrder.shipping_email}</p>
                      <p className="text-sm text-muted-foreground mt-1">{selectedOrder.shipping_phone}</p>
                      <p className="text-sm mt-2">
                        {selectedOrder.shipping_address}, {selectedOrder.shipping_city}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedOrder.shipping_state} {selectedOrder.shipping_postal_code} ({selectedOrder.shipping_country})
                      </p>
                    </div>

                    <div className="bg-muted/30 border border-border rounded-lg p-4">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Pricing</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between gap-3">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span className="font-semibold">₵{selectedOrder.subtotal}</span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span className="text-muted-foreground">Shipping</span>
                          <span className="font-semibold">₵{selectedOrder.shipping_cost}</span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span className="text-muted-foreground">Tax</span>
                          <span className="font-semibold">₵{selectedOrder.tax_amount}</span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span className="text-muted-foreground">Discount</span>
                          <span className="font-semibold">₵{selectedOrder.discount_amount}</span>
                        </div>
                        <div className="pt-2 border-t border-border flex justify-between gap-3">
                          <span className="font-semibold">Total</span>
                          <span className="font-semibold text-foreground">₵{selectedOrder.total_amount}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Items</p>
                    <div className="space-y-3">
                      {selectedOrder.items.map((it) => (
                        <div key={it.id} className="border border-border rounded-lg p-3">
                          <div className="flex gap-3">
                            <div className="w-16 h-16 rounded-md bg-muted border border-border overflow-hidden flex items-center justify-center">
                              {it.product_image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={it.product_image} alt={it.product_name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-2xl" aria-hidden="true">🖼️</span>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="font-semibold truncate">{it.product_name || 'Item'}</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                SKU: <span className="font-mono">{it.sku}</span>
                              </p>

                              <div className="mt-2 grid grid-cols-3 gap-3 text-sm">
                                <div>
                                  <p className="text-xs text-muted-foreground">Price</p>
                                  <p className="font-semibold">₵{it.price}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Qty</p>
                                  <p className="font-semibold">{it.quantity}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Subtotal</p>
                                  <p className="font-semibold">₵{it.subtotal}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status update (admin) */}
                  <div className="bg-muted/30 border border-border rounded-lg p-4 mb-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Update Order Status</p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="text-sm text-foreground font-semibold">
                        Current: <span className="text-muted-foreground font-normal">{selectedOrder.status}</span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {ADMIN_ORDER_STATUSES.map((s) => (
                          <Button
                            key={s}
                            type="button"
                            size="sm"
                            variant={selectedOrder.status.toLowerCase() === s ? 'default' : 'outline'}
                            onClick={() => updateSelectedOrderStatus(s)}
                            disabled={isDetailLoading}
                            className="gap-2"
                          >
                            {s}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Tracking history */}
                  {selectedOrder.tracking_history?.length ? (
                    <div className="bg-muted/30 border border-border rounded-lg p-4 mb-4">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Tracking History</p>
                      <div className="space-y-2">
                        {selectedOrder.tracking_history.map((t) => (
                          <div key={t.id} className="border border-border rounded-md p-3">
                            <div className="flex items-center justify-between gap-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${pillFor(t.status)}`}>
                                {t.status}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {t.timestamp ? new Date(t.timestamp).toLocaleString() : ''}
                              </span>
                            </div>
                            <p className="text-sm text-foreground mt-2">{t.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {selectedOrder.notes ? (
                    <div className="bg-muted/30 border border-border rounded-lg p-4">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Notes</p>
                      <p className="text-sm text-foreground whitespace-pre-wrap">{selectedOrder.notes}</p>
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
