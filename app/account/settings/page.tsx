'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { AccountSidebar } from '@/components/account/account-sidebar'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Settings,
  Bell,
  Mail,
  Shield,
  Globe,
  Moon,
  Smartphone,
  Loader,
  Save,
  LogOut,
  Trash2,
  ChevronRight,
  Volume2,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface NotificationPref {
  orderUpdates: boolean
  promotions: boolean
  newsletter: boolean
  pushNotifications: boolean
  smsNotifications: boolean
  priceDrops: boolean
  backInStock: boolean
}

const defaultNotifs: NotificationPref = {
  orderUpdates: true,
  promotions: true,
  newsletter: false,
  pushNotifications: true,
  smsNotifications: false,
  priceDrops: true,
  backInStock: true,
}

export default function SettingsPage() {
  const router = useRouter()
  const { user, isAuthReady, isAuthenticated, signOut } = useAuth()

  const [isMounted, setIsMounted] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [notifications, setNotifications] = useState<NotificationPref>(defaultNotifs)
  const [currency, setCurrency] = useState('GHS')
  const [language, setLanguage] = useState('en')

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (isAuthReady && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthReady, isAuthenticated, router])

  useEffect(() => {
    // Load saved preferences
    try {
      const saved = localStorage.getItem('user_settings')
      if (saved) {
        const parsed = JSON.parse(saved)
        setNotifications(parsed.notifications || defaultNotifs)
        setCurrency(parsed.currency || 'GHS')
        setLanguage(parsed.language || 'en')
      }
    } catch {
      // ignore
    }
  }, [])

  const saveSettings = async () => {
    setIsSaving(true)
    try {
      await new Promise(r => setTimeout(r, 600))
      localStorage.setItem('user_settings', JSON.stringify({
        notifications,
        currency,
        language,
      }))
      toast.success('Settings saved successfully')
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const notificationToggles: { key: keyof NotificationPref; label: string; description: string; icon: React.ElementType }[] = [
    { key: 'orderUpdates', label: 'Order Updates', description: 'Get notified when your order status changes', icon: Bell },
    { key: 'promotions', label: 'Promotions & Deals', description: 'Receive exclusive offers and discounts', icon: Mail },
    { key: 'newsletter', label: 'Newsletter', description: 'Weekly curated content and new arrivals', icon: Globe },
    { key: 'pushNotifications', label: 'Push Notifications', description: 'Browser notifications for quick updates', icon: Smartphone },
    { key: 'smsNotifications', label: 'SMS Notifications', description: 'Get text messages for order confirmations', icon: Volume2 },
    { key: 'priceDrops', label: 'Price Drops', description: 'Get notified when items on your wishlist go on sale', icon: Bell },
    { key: 'backInStock', label: 'Back in Stock', description: 'Get notified when out-of-stock items are available again', icon: Bell },
  ]

  if (!isMounted || !isAuthReady) {
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

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  <Settings className="w-5 h-5 text-muted-foreground" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
              </div>
              <p className="text-muted-foreground">Customize your experience and manage preferences</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <AccountSidebar />

              <div className="lg:col-span-3 space-y-6">
                {/* Notification Preferences */}
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  <div className="p-6 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                        <Bell className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold">Notification Preferences</h2>
                        <p className="text-sm text-muted-foreground">Choose what updates you receive</p>
                      </div>
                    </div>
                  </div>
                  <div className="divide-y divide-border">
                    {notificationToggles.map((nt) => {
                      const Icon = nt.icon
                      return (
                        <div key={nt.key} className="flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Icon className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{nt.label}</p>
                              <p className="text-xs text-muted-foreground">{nt.description}</p>
                            </div>
                          </div>
                          <Switch
                            checked={notifications[nt.key]}
                            onCheckedChange={(checked) =>
                              setNotifications((prev) => ({ ...prev, [nt.key]: checked }))
                            }
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Preferences */}
                <div className="bg-card border border-border rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <Globe className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">Preferences</h2>
                      <p className="text-sm text-muted-foreground">Language, currency, and regional settings</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium block mb-2">Currency</label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                      >
                        <option value="GHS">GHS (₵) - Ghanaian Cedi</option>
                        <option value="NGN">NGN (₦) - Nigerian Naira</option>
                        <option value="USD">USD ($) - US Dollar</option>
                        <option value="EUR">EUR (€) - Euro</option>
                        <option value="GBP">GBP (£) - British Pound</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium block mb-2">Language</label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                      >
                        <option value="en">English</option>
                        <option value="fr">Français</option>
                        <option value="pt">Português</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Account Actions */}
                <div className="bg-card border border-border rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-rose-500" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">Account Actions</h2>
                      <p className="text-sm text-muted-foreground">Security and account management</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        signOut()
                        router.push('/auth/login')
                      }}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center">
                          <LogOut className="w-4 h-4 text-orange-500" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium">Sign Out</p>
                          <p className="text-xs text-muted-foreground">Sign out of your account on this device</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                          toast.success('Account deletion requested')
                        }
                      }}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-destructive/20 hover:bg-destructive/5 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium text-destructive">Delete Account</p>
                          <p className="text-xs text-muted-foreground">Permanently remove your account and data</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-destructive/50 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                  <Button
                    onClick={saveSettings}
                    disabled={isSaving}
                    className="gap-2 min-w-[180px]"
                    size="lg"
                  >
                    {isSaving ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Settings
                      </>
                    )}
                  </Button>
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
