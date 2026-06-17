'use client'

import { useEffect, useMemo, useState, type ComponentType } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { DollarSign, Package, ShoppingCart, Users, Eye } from 'lucide-react'
import { useAuthStore } from '@/lib/store/auth'
import { useRouter } from 'next/navigation'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

type DashboardMetricsResponse = {
  total_revenue: string
  total_orders: number
  total_customers: number
  products_listed: number
  changes: {
    revenue_percent: number | null
    orders_percent: number | null
    customers_percent: number | null
    products_listed_percent: number | null
  }
}

type DashboardSalesDailyResponse = {
  data: Array<{
    date: string
    sales: number
    revenue: string
  }>
}

type DashboardRecentOrdersResponse = {
  data: Array<{
    id: string
    customer: string
    amount: string
    status: string
    date: string
    items?: Array<{
      id: number
      product_name: string
      product_image: string
      quantity: number
    }>
  }>
}

type DashboardMetric = {
  label: string
  value: string
  change: string
  icon: ComponentType<{ className?: string }>
  positive: boolean
}

const formatPercent = (value: number | null | undefined): string => {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}

const toOrderStatusPill = (status: string) => {
  const normalized = (status || '').toLowerCase().trim()
  const title =
    normalized === 'delivered'
      ? 'Delivered'
      : normalized === 'processing'
        ? 'Processing'
        : normalized === 'pending'
          ? 'Pending'
          : normalized === 'confirmed'
            ? 'Confirmed'
            : normalized === 'shipped'
              ? 'Shipped'
              : normalized === 'refunded'
                ? 'Refunded'
                : normalized === 'cancelled'
                  ? 'Cancelled'
                  : status

  const pillClass =
    normalized === 'delivered'
      ? 'bg-green-100 text-green-800'
      : normalized === 'processing'
        ? 'bg-blue-100 text-blue-800'
        : normalized === 'pending'
          ? 'bg-yellow-100 text-yellow-800'
          : normalized === 'refunded'
            ? 'bg-red-100 text-red-800'
            : 'bg-muted text-foreground'

  return { title, pillClass }
}

const buildAuthHeaders = (): HeadersInit => {
  const token = useAuthStore.getState().token
  if (!token) throw new Error('Admin token not found. Please log in again.')
  return { Authorization: `Token ${token}` }
}

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  const [metrics, setMetrics] = useState<DashboardMetricsResponse | null>(null)
  const [salesDaily, setSalesDaily] = useState<DashboardSalesDailyResponse | null>(null)
  const [recentOrders, setRecentOrders] = useState<DashboardRecentOrdersResponse | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const headers = buildAuthHeaders()

        const [metricsRes, salesDailyRes, ordersRes] = await Promise.all([
          fetch(`${API_BASE_URL}/analytics/dashboard/metrics/`, { method: 'GET', headers }),
          fetch(`${API_BASE_URL}/analytics/dashboard/sales-daily/`, { method: 'GET', headers }),
          fetch(`${API_BASE_URL}/analytics/dashboard/recent-orders/`, { method: 'GET', headers }),
        ])

        if (!metricsRes.ok) throw new Error(`Failed to fetch metrics (${metricsRes.status})`)
        if (!salesDailyRes.ok) throw new Error(`Failed to fetch daily sales (${salesDailyRes.status})`)
        if (!ordersRes.ok) throw new Error(`Failed to fetch recent orders (${ordersRes.status})`)

        const metricsJson: DashboardMetricsResponse = await metricsRes.json()
        const salesDailyJson: DashboardSalesDailyResponse = await salesDailyRes.json()
        const ordersJson: DashboardRecentOrdersResponse = await ordersRes.json()

        if (cancelled) return
        setMetrics(metricsJson)
        setSalesDaily(salesDailyJson)
        setRecentOrders(ordersJson)
      } catch (e) {
        console.error(e)
        if (cancelled) return
        setMetrics(null)
        setSalesDaily(null)
        setRecentOrders(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const dashboardMetrics: DashboardMetric[] = useMemo(() => {
    const m = metrics
    if (!m) {
      return [
        { label: 'Total Revenue', value: '₵0.00', change: '—', icon: DollarSign, positive: true },
        { label: 'Total Orders', value: '0', change: '—', icon: ShoppingCart, positive: true },
        { label: 'Total Customers', value: '0', change: '—', icon: Users, positive: true },
        { label: 'Products Listed', value: '0', change: '—', icon: Package, positive: true },
      ]
    }

    const revenuePct = m.changes.revenue_percent
    const ordersPct = m.changes.orders_percent
    const customersPct = m.changes.customers_percent
    const productsPct = m.changes.products_listed_percent

    return [
      {
        label: 'Total Revenue',
        value: `₵${Number(m.total_revenue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        change: formatPercent(revenuePct),
        icon: DollarSign,
        positive: revenuePct === null ? true : revenuePct >= 0,
      },
      {
        label: 'Total Orders',
        value: m.total_orders.toLocaleString(),
        change: formatPercent(ordersPct),
        icon: ShoppingCart,
        positive: ordersPct === null ? true : ordersPct >= 0,
      },
      {
        label: 'Total Customers',
        value: m.total_customers.toLocaleString(),
        change: formatPercent(customersPct),
        icon: Users,
        positive: customersPct === null ? true : customersPct >= 0,
      },
      {
        label: 'Products Listed',
        value: m.products_listed.toLocaleString(),
        change: formatPercent(productsPct),
        icon: Package,
        positive: productsPct === null ? true : productsPct >= 0,
      },
    ]
  }, [metrics])

  const salesData = useMemo(() => {
    const data = salesDaily?.data ?? []
    return data.map((d: { date: string; sales: number; revenue: string }) => ({
      date: d.date,
      sales: d.sales,
      revenue: Number(d.revenue),
    }))
  }, [salesDaily])

  const orders = recentOrders?.data ?? []

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="w-8 h-8" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-0">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome to your Delchris admin dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {dashboardMetrics.map((metric) => (
          <Card key={metric.label} className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm mb-2">{metric.label}</p>
                <p className="text-3xl font-bold text-foreground">{metric.value}</p>
                <p className={`text-xs mt-2 ${metric.positive ? 'text-green-600' : 'text-red-600'}`}>
                  {metric.change === '—' ? 'No change data' : `${metric.change} from last month`}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${metric.positive ? 'bg-green-50' : 'bg-red-50'}`}>
                <metric.icon className={`w-6 h-6 ${metric.positive ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Daily Sales</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sales" fill="#1a1a1a" name="Orders" />
              <Bar dataKey="revenue" fill="#b8860b" name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Revenue Trend (Daily)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#b8860b" strokeWidth={2} name="Revenue" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Recent Orders</h2>
          <Button variant="outline" size="sm" onClick={() => router.push('/admin/orders')} className="gap-2">
            View All
            <Eye className="w-4 h-4" />
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-foreground">Order ID</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Customer</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Items</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Amount</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td className="py-6 px-4 text-sm text-muted-foreground" colSpan={6}>
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const pill = toOrderStatusPill(order.status)
                  const items = order.items ?? []

                  return (
                    <tr
                      key={order.id}
                      className="border-b border-border hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm text-foreground font-medium">{order.id}</td>
                      <td className="py-3 px-4 text-sm text-foreground">{order.customer}</td>

                      <td className="py-3 px-4 text-sm">
                        {items.length === 0 ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            {items.slice(0, 3).map((it) => (
                              <div key={it.id} className="flex items-center gap-2 min-w-0">
                                <div className="w-10 h-10 rounded-md bg-muted border border-border overflow-hidden flex items-center justify-center">
                                  {it.product_image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={it.product_image}
                                      alt={it.product_name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <span aria-hidden="true" className="text-xl">🖼️</span>
                                  )}
                                </div>
                                <span className="hidden sm:inline text-xs text-muted-foreground truncate max-w-[140px]">
                                  {it.product_name || 'Item'}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-sm font-semibold text-foreground">{order.amount}</td>
                      <td className="py-3 px-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${pill.pillClass}`}>
                          {pill.title}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{order.date}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
