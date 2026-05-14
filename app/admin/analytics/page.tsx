'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Spinner } from '@/components/ui/spinner'
import { DollarSign, ShoppingCart, Users, Package } from 'lucide-react'
import { useAuthStore } from '@/lib/store/auth'
import { CookieConsentBanner } from '@/components/cookie-consent-banner'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

const COOKIE_CONSENT_STORAGE_KEY = 'delchris_cookie_consent_v1'
type CookieConsentChoice = 'accepted' | 'rejected' | null

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

type PerformanceSummaryResponse = {
  total_clicks: number
  total_page_views: number
  window_days: number
}

type BreakdownRow = { label: string; count: number }

type PerformanceBreakdownResponse = {
  window_days: number
  clicks: {
    devices: BreakdownRow[]
    browsers: BreakdownRow[]
    pages: BreakdownRow[]
    ips: BreakdownRow[]
    users: BreakdownRow[]
  }
  page_views: {
    devices: BreakdownRow[]
    browsers: BreakdownRow[]
    pages: BreakdownRow[]
    ips: BreakdownRow[]
    users: BreakdownRow[]
  }
}

const formatPercent = (value: number | null | undefined): string => {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}

function safeReadCookieConsentChoice(): CookieConsentChoice {
  try {
    const raw = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)
    if (raw === 'accepted' || raw === 'rejected') return raw
    return null
  } catch {
    return null
  }
}

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [metrics, setMetrics] = useState<DashboardMetricsResponse | null>(null)
  const [salesDaily, setSalesDaily] = useState<DashboardSalesDailyResponse | null>(null)

  const [performanceSummary, setPerformanceSummary] = useState<PerformanceSummaryResponse | null>(null)
  const [performanceBreakdown, setPerformanceBreakdown] = useState<PerformanceBreakdownResponse | null>(null)

  const token = useAuthStore((s) => s.token)
  const authHeaders: Record<string, string> = token
    ? { Authorization: `Token ${token}` }
    : ({} as Record<string, string>)

  const [cookieChoice, setCookieChoice] = useState<CookieConsentChoice>(null)
  const cookieAccepted = cookieChoice === 'accepted'

  useEffect(() => {
    setCookieChoice(safeReadCookieConsentChoice())

    const onChanged = (e: Event) => {
      const custom = e as CustomEvent<{ accepted: boolean }>
      const accepted = custom?.detail?.accepted
      setCookieChoice(accepted ? 'accepted' : 'rejected')
    }
    window.addEventListener('cookie-consent-changed', onChanged)
    return () => window.removeEventListener('cookie-consent-changed', onChanged)
  }, [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const [metricsRes, salesDailyRes, perfSummaryRes, perfBreakdownRes] = await Promise.all([
          fetch(`${API_BASE_URL}/analytics/dashboard/metrics/`, {
            method: 'GET',
            headers: authHeaders,
          }),
          fetch(`${API_BASE_URL}/analytics/dashboard/sales-daily/`, {
            method: 'GET',
            headers: authHeaders,
          }),
          fetch(`${API_BASE_URL}/analytics/dashboard/performance-summary/`, {
            method: 'GET',
            headers: authHeaders,
          }),
          fetch(`${API_BASE_URL}/analytics/dashboard/performance-breakdown/`, {
            method: 'GET',
            headers: authHeaders,
          }),
        ])

        if (!metricsRes.ok) throw new Error(`Failed to fetch metrics (${metricsRes.status})`)
        if (!salesDailyRes.ok) throw new Error(`Failed to fetch sales daily (${salesDailyRes.status})`)
        if (!perfSummaryRes.ok) throw new Error(`Failed to fetch performance summary (${perfSummaryRes.status})`)
        if (!perfBreakdownRes.ok) throw new Error(`Failed to fetch performance breakdown (${perfBreakdownRes.status})`)

        const metricsJson: DashboardMetricsResponse = await metricsRes.json()
        const salesDailyJson: DashboardSalesDailyResponse = await salesDailyRes.json()
        const perfSummaryJson: PerformanceSummaryResponse = await perfSummaryRes.json()
        const perfBreakdownJson: PerformanceBreakdownResponse = await perfBreakdownRes.json()

        if (cancelled) return
        setMetrics(metricsJson)
        setSalesDaily(salesDailyJson)
        setPerformanceSummary(perfSummaryJson)
        setPerformanceBreakdown(perfBreakdownJson)
      } catch (e) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : 'Failed to load analytics')
        setMetrics(null)
        setSalesDaily(null)
        setPerformanceSummary(null)
        setPerformanceBreakdown(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Send tracking events only when cookie consent is accepted.
  useEffect(() => {
    if (!cookieAccepted) return

    const sessionId = window.localStorage.getItem('delchris_session_id') || crypto.randomUUID()
    try {
      window.localStorage.setItem('delchris_session_id', sessionId)
    } catch {
      // ignore
    }

    const userAgent = navigator.userAgent
    const device = /Mobile|Android|iPhone/i.test(userAgent) ? 'Mobile' : 'Desktop'
    const browser =
      /Chrome\//i.test(userAgent) ? 'Chrome' : /Safari\//i.test(userAgent) && !/Chrome\//i.test(userAgent) ? 'Safari' : 'Other'

    const referrer = document.referrer || ''

    // Page view tracking: track this admin analytics route
    fetch(`${API_BASE_URL}/analytics/track/page-view/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Admin endpoints are protected in backend; tracking endpoints are unauthenticated (permission_classes=[]).
      body: JSON.stringify({
        page_name: 'Admin Analytics',
        page_path: window.location.pathname,
        session_id: sessionId,
        referrer,
        device,
        browser,
      }),
    }).catch(() => {
      // best effort only
    })

    const onClick = (ev: MouseEvent) => {
      const target = ev.target as HTMLElement | null
      if (!target) return

      const el = target.closest('[data-track-click]') as HTMLElement | null
      if (!el) return

      const elementLabel = el.getAttribute('data-track-click') || el.getAttribute('aria-label') || el.tagName || 'click'

      fetch(`${API_BASE_URL}/analytics/track/click/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page_path: window.location.pathname,
          element_label: elementLabel.slice(0, 255),
          session_id: sessionId,
          device,
          browser,
        }),
      }).catch(() => {
        // best effort only
      })
    }

    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [cookieAccepted])

  const metricsCards = useMemo(() => {
    const m = metrics
    if (!m) return []

    return [
      {
        label: 'Total Revenue',
        value: `₵${Number(m.total_revenue).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
        change: formatPercent(m.changes.revenue_percent),
        icon: DollarSign,
      },
      {
        label: 'Total Orders',
        value: m.total_orders.toLocaleString(),
        change: formatPercent(m.changes.orders_percent),
        icon: ShoppingCart,
      },
      {
        label: 'Total Customers',
        value: m.total_customers.toLocaleString(),
        change: formatPercent(m.changes.customers_percent),
        icon: Users,
      },
      {
        label: 'Products Listed',
        value: m.products_listed.toLocaleString(),
        change: formatPercent(m.changes.products_listed_percent),
        icon: Package,
      },
    ]
  }, [metrics])

  const salesDailyData = useMemo(() => {
    const d = salesDaily?.data ?? []
    return d.map((x) => ({
      date: x.date,
      orders: x.sales,
      revenue: Number(x.revenue),
    }))
  }, [salesDaily])

  const performanceCards = useMemo(() => {
    const p = performanceSummary
    if (!p) return []
    return [
      {
        label: 'Total Clicks',
        value: p.total_clicks.toLocaleString(),
        icon: DollarSign,
        change: `${p.window_days}d window`,
      },
      {
        label: 'Total Page Views',
        value: p.total_page_views.toLocaleString(),
        icon: Users,
        change: `${p.window_days}d window`,
      },
    ]
  }, [performanceSummary])

  const chartDataFromRows = (rows: BreakdownRow[]) =>
    (rows || []).slice(0, 10).map((r) => ({
      label: r.label,
      count: r.count,
    }))

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="w-8 h-8" />
          <p className="text-sm text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground mt-1">Detailed business insights and metrics</p>
        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
      </div>

      {!!metricsCards.length && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metricsCards.map((metric) => {
            const Icon = metric.icon
            const change = metric.change === '—' ? '' : metric.change
            const positive = metric.change !== '—' ? metric.change.startsWith('+') : true
            return (
              <Card key={metric.label} className="p-4">
                <p className="text-muted-foreground text-sm mb-2">{metric.label}</p>
                <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                <div className={`text-xs mt-2 ${positive ? 'text-green-600' : 'text-red-600'}`}>
                  {change ? `${change} this month` : '—'}
                </div>
                <div className={`mt-3 p-3 rounded-lg ${positive ? 'bg-green-50' : 'bg-red-50'}`}>
                  <Icon className={`w-6 h-6 ${positive ? 'text-green-600' : 'text-red-600'}`} />
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {!!performanceCards.length && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
          {performanceCards.map((c) => {
            const Icon = c.icon
            return (
              <Card key={c.label} className="p-4">
                <p className="text-muted-foreground text-sm mb-2">{c.label}</p>
                <p className="text-2xl font-bold text-foreground">{c.value}</p>
                <p className="text-xs text-muted-foreground mt-2">{c.change}</p>
                <div className="mt-3 p-3 rounded-lg bg-muted">
                  <Icon className="w-6 h-6 text-foreground" />
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <h2 className="text-xl font-bold text-foreground mb-4">Daily Orders</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesDailyData}>
              <defs>
                <linearGradient id="orderGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#1e40af" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
              <XAxis dataKey="date" stroke="rgba(0,0,0,0.4)" />
              <YAxis stroke="rgba(0,0,0,0.4)" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
              />
              <Legend />
              <Bar dataKey="orders" fill="url(#orderGradient)" name="Orders" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900 dark:to-emerald-800">
          <h2 className="text-xl font-bold text-foreground mb-4">Daily Revenue</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={salesDailyData}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
              <XAxis dataKey="date" stroke="rgba(0,0,0,0.4)" />
              <YAxis stroke="rgba(0,0,0,0.4)" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }}
              />
              <Legend />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fill="url(#revenueGradient)" name="Revenue" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {!!performanceBreakdown && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800">
              <h2 className="text-xl font-bold text-foreground mb-4">Clicks by Device</h2>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={chartDataFromRows(performanceBreakdown.clicks.devices)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ label, count }) => `${label}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    <Cell fill="#8b5cf6" />
                    <Cell fill="#d946ef" />
                    <Cell fill="#ec4899" />
                    <Cell fill="#f43f5e" />
                    <Cell fill="#f97316" />
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800">
              <h2 className="text-xl font-bold text-foreground mb-4">Page Views by Browser</h2>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={chartDataFromRows(performanceBreakdown.page_views.browsers)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ label, count }) => `${label}: ${count}`}
                    outerRadius={80}
                    fill="#fbbf24"
                    dataKey="count"
                  >
                    <Cell fill="#f97316" />
                    <Cell fill="#ea580c" />
                    <Cell fill="#c2410c" />
                    <Cell fill="#92400e" />
                    <Cell fill="#7c2d12" />
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900 dark:to-cyan-800">
              <h2 className="text-xl font-bold text-foreground mb-4">Clicks by Page</h2>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartDataFromRows(performanceBreakdown.clicks.pages)}>
                  <defs>
                    <linearGradient id="pageGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#0891b2" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis dataKey="label" stroke="rgba(0,0,0,0.4)" />
                  <YAxis stroke="rgba(0,0,0,0.4)" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  <Bar dataKey="count" fill="url(#pageGradient)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900 dark:to-rose-800">
              <h2 className="text-xl font-bold text-foreground mb-4">Page Views by IP Address</h2>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartDataFromRows(performanceBreakdown.page_views.ips)}>
                  <defs>
                    <linearGradient id="ipGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#e11d48" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis dataKey="label" stroke="rgba(0,0,0,0.4)" />
                  <YAxis stroke="rgba(0,0,0,0.4)" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  <Bar dataKey="count" fill="url(#ipGradient)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900 dark:to-indigo-800">
              <h2 className="text-xl font-bold text-foreground mb-4">Page Views by Device</h2>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={chartDataFromRows(performanceBreakdown.page_views.devices)}>
                    <defs>
                      <linearGradient id="deviceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.6} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                    <XAxis dataKey="label" stroke="rgba(0,0,0,0.4)" />
                    <YAxis stroke="rgba(0,0,0,0.4)" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                    <Bar dataKey="count" fill="url(#deviceGradient)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900 dark:to-teal-800">
                <h2 className="text-xl font-bold text-foreground mb-4">Clicks by Browser</h2>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={chartDataFromRows(performanceBreakdown.clicks.browsers)}>
                    <defs>
                      <linearGradient id="browserGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#0d9488" stopOpacity={0.6} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                    <XAxis dataKey="label" stroke="rgba(0,0,0,0.4)" />
                    <YAxis stroke="rgba(0,0,0,0.4)" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                    <Bar dataKey="count" fill="url(#browserGradient)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6 bg-gradient-to-br from-lime-50 to-lime-100 dark:from-lime-900 dark:to-lime-800">
                <h2 className="text-xl font-bold text-foreground mb-4">Page Views by User</h2>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartDataFromRows(performanceBreakdown.page_views.users)}>
                  <defs>
                    <linearGradient id="userViewGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#84cc16" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#65a30d" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis dataKey="label" stroke="rgba(0,0,0,0.4)" />
                  <YAxis stroke="rgba(0,0,0,0.4)" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  <Bar dataKey="count" fill="url(#userViewGradient)" name="User Views" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900 dark:to-pink-800">
              <h2 className="text-xl font-bold text-foreground mb-4">Clicks by User</h2>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartDataFromRows(performanceBreakdown.clicks.users)}>
                  <defs>
                    <linearGradient id="userClickGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ec4899" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#db2777" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis dataKey="label" stroke="rgba(0,0,0,0.4)" />
                  <YAxis stroke="rgba(0,0,0,0.4)" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  <Bar dataKey="count" fill="url(#userClickGradient)" name="User Clicks" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </div>
      )}

      {!salesDailyData.length && (
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">No sales-daily data returned from the server.</p>
        </Card>
      )}

      {/* Cookie banner is already mounted globally in app/layout.tsx.
          Keeping this import/use prevents dead-code removal in some build modes. */}
      <div className="hidden">
        <CookieConsentBanner />
      </div>
    </div>
  )
}
