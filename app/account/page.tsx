'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { AccountSidebar } from '@/components/account/account-sidebar'
import { useAuth } from '@/hooks/use-auth'
import { useAuthStore } from '@/lib/store/auth'
import { Loader, ShoppingBag, Heart, MapPin, Package, ArrowRight, TrendingUp, Clock } from 'lucide-react'

export default function AccountDashboard() {
  const router = useRouter()
  const { user, isAuthReady, isAuthenticated } = useAuth()
  const [stats, setStats] = useState({ orders: 0, wishlist: 0, addresses: 0 })

  useEffect(() => {
    if (isAuthReady && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthReady, isAuthenticated, router])

  useEffect(() => {
    // Load stats from localStorage or API
    const storedWishlist = JSON.parse(localStorage.getItem('wishlist-store') || '{}')
    const wishlistCount = storedWishlist?.state?.items?.length || 0
    setStats(prev => ({ ...prev, wishlist: wishlistCount }))
  }, [])

  if (!isAuthReady) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background flex items-center justify-center">
          <Loader className="w-8 h-8 animate-spin" />
        </main>
        <Footer />
      </>
    )
  }

  const quickLinks = [
    {
      title: 'Browse Products',
      description: 'Explore our latest collection',
      href: '/products',
      icon: ShoppingBag,
      color: 'from-accent/20 to-accent/5',
      border: 'border-accent/20',
      iconColor: 'text-accent',
    },
    {
      title: 'Track Orders',
      description: 'View order status and tracking',
      href: '/account/orders',
      icon: Package,
      color: 'from-blue-500/20 to-blue-500/5',
      border: 'border-blue-500/20',
      iconColor: 'text-blue-500',
    },
    {
      title: 'Saved Items',
      description: 'Items you love',
      href: '/account/wishlist',
      icon: Heart,
      color: 'from-rose-500/20 to-rose-500/5',
      border: 'border-rose-500/20',
      iconColor: 'text-rose-500',
    },
    {
      title: 'Shipping Addresses',
      description: 'Manage your addresses',
      href: '/account/addresses',
      icon: MapPin,
      color: 'from-emerald-500/20 to-emerald-500/5',
      border: 'border-emerald-500/20',
      iconColor: 'text-emerald-500',
    },
  ]

  const initials = user?.first_name
    ? `${user.first_name.charAt(0)}${user.last_name?.charAt(0) || ''}`.toUpperCase()
    : '👤'

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-6xl mx-auto">
            {/* Welcome Header */}
            <div className="mb-10">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-accent/25">
                  {initials}
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold">
                    Welcome back, {user?.first_name || 'there'}! 👋
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Here's what's happening with your account
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <AccountSidebar />

              {/* Main Content */}
              <div className="lg:col-span-3 space-y-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-card border border-border rounded-xl p-5 hover:border-accent/50 transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5 text-accent" />
                      </div>
                      <TrendingUp className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-2xl font-bold">{stats.orders}</p>
                    <p className="text-xs text-muted-foreground mt-1">Total Orders</p>
                  </div>

                  <div className="bg-card border border-border rounded-xl p-5 hover:border-rose-500/50 transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center">
                        <Heart className="w-5 h-5 text-rose-500" />
                      </div>
                      <TrendingUp className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-2xl font-bold">{stats.wishlist}</p>
                    <p className="text-xs text-muted-foreground mt-1">Saved Items</p>
                  </div>

                  <div className="bg-card border border-border rounded-xl p-5 hover:border-emerald-500/50 transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-emerald-500" />
                      </div>
                      <TrendingUp className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-2xl font-bold">{stats.addresses}</p>
                    <p className="text-xs text-muted-foreground mt-1">Addresses</p>
                  </div>
                </div>

                {/* Quick Links */}
                <div>
                  <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {quickLinks.map((link) => {
                      const Icon = link.icon
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={`group bg-card border ${link.border} rounded-xl p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center flex-shrink-0`}>
                              <Icon className={`w-6 h-6 ${link.iconColor}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold mb-1">{link.title}</h3>
                              <p className="text-sm text-muted-foreground">{link.description}</p>
                            </div>
                            <ArrowRight className={`w-5 h-5 ${link.iconColor} opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 flex-shrink-0 mt-1`} />
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-card border border-border rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-muted-foreground" />
                      <h2 className="text-lg font-semibold">Recent Activity</h2>
                    </div>
                    <Link
                      href="/account/orders"
                      className="text-sm text-accent hover:text-accent/80 font-medium"
                    >
                      View all
                    </Link>
                  </div>

                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <Clock className="w-7 h-7 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold mb-1">No recent activity</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Your recent orders and updates will appear here
                    </p>
                    <Link href="/products">
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent/80">
                        Start Shopping
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </Link>
                  </div>
                </div>

                {/* Account Info */}
                <div className="bg-card border border-border rounded-xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Account Details</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Full Name</p>
                      <p className="font-medium">
                        {user?.first_name && user?.last_name
                          ? `${user.first_name} ${user.last_name}`
                          : user?.first_name || 'Not set'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Email</p>
                      <p className="font-medium">{user?.email || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Phone</p>
                      <p className="font-medium">{user?.phone || user?.phone_number || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Account Type</p>
                      <p className="font-medium capitalize">
                        {user?.is_superuser ? 'Administrator' : user?.is_staff ? 'Staff' : 'Customer'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
