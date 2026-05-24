'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { AdminGuard } from '@/components/admin-guard'
import { Button } from '@/components/ui/button'
import { useIsMobile } from '@/hooks/use-mobile'
import {
  LayoutDashboard,
  Package,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Tags,
  Image,
  Sliders,
  Bell,
  Eye,
  ShoppingCart,
  RefreshCcw,
} from 'lucide-react'
import { useAuthStore } from '@/lib/store/auth'
import { fetchPublicSettings, type SiteSettingsPublic } from '@/lib/services/settings'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'

const navigationItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { label: 'Attributes', href: '/admin/attributes', icon: Sliders },
  { label: 'Hero Banners', href: '/admin/hero-banners', icon: Image },
  { label: 'Home Ads', href: '/admin/home-ads', icon: Image },
  { label: 'Categories', href: '/admin/categories', icon: Tags },
  { label: 'Brands', href: '/admin/brands', icon: Tags },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
]

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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

const toAbsoluteMediaUrl = (url?: string | null): string => {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  const backendBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1').replace(/\/api\/v1\/?$/, '')
  if (url.startsWith('/')) return `${backendBase}${url}`
  return `${backendBase}/${url}`
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false)
  const isMobile = useIsMobile()
  const router = useRouter()
  const { signOut } = useAuth()

  const [recentOrders, setRecentOrders] = useState<DashboardRecentOrdersResponse['data']>([])
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  const [notificationsError, setNotificationsError] = useState<string | null>(null)

  const [siteLogo, setSiteLogo] = useState<string | null>(null)

  const fetchNotifications = async () => {
    const token = useAuthStore.getState().token
    if (!token) return

    setNotificationsLoading(true)
    setNotificationsError(null)

    try {
      const res = await fetch(`${API_BASE_URL}/analytics/dashboard/recent-orders/`, {
        method: 'GET',
        headers: { Authorization: `Token ${token}` },
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `Failed to fetch notifications (${res.status})`)
      }

      const json = (await res.json()) as DashboardRecentOrdersResponse
      setRecentOrders(Array.isArray(json?.data) ? json.data : [])
    } catch (e) {
      setNotificationsError(e instanceof Error ? e.message : 'Failed to load notifications')
      setRecentOrders([])
    } finally {
      setNotificationsLoading(false)
    }
  }

  useEffect(() => {
    // Load + keep fresh while user stays on admin pages
    let cancelled = false

    async function load() {
      if (cancelled) return
      await fetchNotifications()
    }

    load()

    const interval = window.setInterval(() => {
      if (cancelled) return
      fetchNotifications()
    }, 30_000)

    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    let cancelled = false

    const loadLogo = async () => {
      try {
        const settings = await fetchPublicSettings()
        if (cancelled) return
        const logoRaw = (settings as any).site_logo as string | null | undefined
        setSiteLogo(logoRaw ? toAbsoluteMediaUrl(logoRaw) : null)
      } catch {
        // keep null fallback
      }
    }

    void loadLogo()

    return () => {
      cancelled = true
    }
  }, [])

  const unreadCount = recentOrders.filter((o) => {
    const s = (o.status || '').toLowerCase().trim()
    return s === 'pending' || s === 'processing'
  }).length

  const handleLogout = async () => {
    await signOut()
    router.push('/auth/login')
  }

const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[oklch(0.12_0.03_260)]">
      {/* Logo */}
      <div className="p-6 border-b border-[oklch(0.25_0.04_260)]">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[oklch(0.55_0.15_45)] shadow-md overflow-hidden">
            {siteLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={siteLogo}
                alt="Delchris"
                className="w-full h-full "
                loading="eager"
              />
            ) : (
              <span className="text-[oklch(0.98_0.01_70)] font-bold text-lg">📊</span>
            )}
          </div>
          <span className="font-bold text-[oklch(0.92_0.01_70)] text-lg">Admin</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-2">
        {navigationItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => isMobile && setMobileSheetOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-[oklch(0.92_0.01_70)] hover:bg-[oklch(0.22_0.05_260)] hover:text-[oklch(0.95_0.01_70)] transition-all duration-200"
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-[oklch(0.25_0.04_260)] p-3 space-y-2">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[oklch(0.92_0.01_70)] hover:bg-[oklch(0.22_0.05_260)] hover:text-[oklch(0.95_0.01_70)] transition-all duration-200 text-sm font-medium"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )

  return (
    <AdminGuard>
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside
          className={`bg-sidebar shadow-lg transition-all duration-300 ${
            sidebarOpen ? 'w-64' : 'w-20'
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-6 border-b border-sidebar-border">
              <Link href="/admin" className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-sidebar-primary shadow-md overflow-hidden">
                  {siteLogo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={siteLogo}
                      alt="Delchris"
                      className="w-full h-full object-cover"
                      loading="eager"
                    />
                  ) : (
                    <span className="text-sidebar-primary-foreground font-bold text-lg">📊</span>
                  )}
                </div>
                {sidebarOpen && <span className="font-bold text-sidebar-foreground text-lg">Admin</span>}
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200 hover:shadow-md"
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                </Link>
              ))}
            </nav>

            {/* Footer */}
            <div className="border-t border-sidebar-border p-3 space-y-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200 text-sm font-medium hover:shadow-md"
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span>Logout</span>}
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-card border-b border-border px-4 md:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {isMobile ? (
              <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
                <SheetTrigger asChild>
                  <button
                    className="p-2 hover:bg-muted rounded-lg transition-colors md:hidden"
                    aria-label="Open menu"
                    type="button"
                  >
                    <Menu className="w-5 h-5" />
                  </button>
                </SheetTrigger>
<SheetContent
                  side="left"
                  className="w-72 p-0 bg-[oklch(0.12_0.03_260)] border-r border-[oklch(0.25_0.04_260)]"
                >
                  <SidebarContent />
                </SheetContent>
              </Sheet>
            ) : (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-muted rounded-lg transition-colors hidden md:block"
                aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                type="button"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}

            <div className="text-sm text-muted-foreground whitespace-nowrap hidden sm:block">
              Welcome back to Delchris Admin Dashboard
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <div className="hidden md:flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() => router.push('/admin/orders')}
                aria-label="Go to orders"
                title="Orders"
              >
                <ShoppingCart className="w-4 h-4" />
              </Button>

              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() => fetchNotifications()}
                aria-label="Refresh notifications"
                title="Refresh"
              >
                <RefreshCcw className="w-4 h-4" />
              </Button>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="relative p-2 hover:bg-muted rounded-lg transition-colors"
                  aria-label="View order notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border border-white">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-[320px]">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Notifications</span>
                  <span className="text-xs text-muted-foreground">
                    {notificationsLoading ? 'Loading…' : `${unreadCount} pending`}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {notificationsError ? (
                  <DropdownMenuItem disabled className="text-sm text-destructive">
                    {notificationsError}
                  </DropdownMenuItem>
                ) : recentOrders.length === 0 ? (
                  <DropdownMenuItem disabled className="text-sm text-muted-foreground">
                    No recent order updates
                  </DropdownMenuItem>
                ) : (
                  <>
                    {recentOrders.slice(0, 6).map((order) => {
                      const status = (order.status || '').toLowerCase().trim()
                      const pillClass =
                        status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : status === 'processing'
                            ? 'bg-blue-100 text-blue-800'
                            : status === 'delivered'
                              ? 'bg-green-100 text-green-800'
                              : status === 'cancelled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-muted text-foreground'

                      return (
                        <DropdownMenuItem key={order.id} className="flex items-start gap-3 py-3">
                          <div className={`mt-0.5 px-2 py-1 rounded-full text-[11px] font-semibold ${pillClass}`}>
                            {order.status}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium truncate">{order.customer || 'Customer'}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {order.amount} • {order.date}
                            </div>
                            <div className="text-xs text-muted-foreground mt-2">
                              <button
                                type="button"
                                className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-800 font-medium"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  router.push('/admin/orders')
                                }}
                              >
                                <Eye className="w-3.5 h-3.5" />
                                View orders
                              </button>
                            </div>
                          </div>
                        </DropdownMenuItem>
                      )
                    })}
                  </>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => router.push('/admin/orders')}
                  className="text-sm font-medium cursor-pointer"
                >
                  Go to Orders
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
    </AdminGuard>
  )
}
