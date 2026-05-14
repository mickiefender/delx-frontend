'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Loader, Camera } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthReady, isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  })

  useEffect(() => {
    if (isAuthReady && !isAuthenticated) {
      router.push('/auth/login')
      return
    }

    if (user) {
      setFormData({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
      })
    }
  }, [user, isAuthReady, isAuthenticated, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

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

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-semibold mb-2">My Profile</h1>
              <p className="text-muted-foreground">Manage your account information</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar */}
              <aside className="lg:col-span-1">
                <nav className="space-y-2">
                  <a
                    href="/account/profile"
                    className="block px-4 py-2 rounded-lg bg-accent text-accent-foreground font-medium"
                  >
                    Profile
                  </a>
                  <a
                    href="/account/addresses"
                    className="block px-4 py-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    Addresses
                  </a>
                  <a
                    href="/account/orders"
                    className="block px-4 py-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    Orders
                  </a>
                  <a
                    href="/account/wishlist"
                    className="block px-4 py-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    Wishlist
                  </a>
                  <a
                    href="/account/settings"
                    className="block px-4 py-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    Settings
                  </a>
                </nav>
              </aside>

              {/* Main Content */}
              <div className="lg:col-span-3">
                <div className="bg-card border border-border rounded-lg p-6 sm:p-8">
                  {/* Avatar Section */}
                  <div className="mb-8 pb-8 border-b border-border">
                    <h2 className="text-xl font-semibold mb-4">Profile Picture</h2>
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-3xl">
                        {user?.first_name?.charAt(0) || '👤'}
                      </div>
                      <div>
                        <Button variant="outline" className="gap-2">
                          <Camera className="w-4 h-4" />
                          Change Picture
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2">
                          JPG, PNG, GIF. Max 5MB
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium block mb-2">First Name</label>
                        <Input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          placeholder="First name"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium block mb-2">Last Name</label>
                        <Input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          placeholder="Last name"
                        />
                      </div>
                    </div>

                    {/* Email & Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium block mb-2">Email Address</label>
                        <Input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="email@example.com"
                          disabled
                          className="bg-muted"
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                          Email cannot be changed
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium block mb-2">Phone Number</label>
                        <Input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+233 (0) 123 456 789"
                        />
                      </div>
                    </div>

                    {/* Member Info */}
                    <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Member Since</span>
                        <span className="font-medium">
                          {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Account Status</span>
                        <span className="font-medium text-accent">Active</span>
                      </div>
                    </div>

                    {/* Submit */}
                    <div className="flex gap-3 pt-4 border-t border-border">
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="gap-2"
                      >
                        {isLoading ? (
                          <>
                            <Loader className="w-4 h-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save Changes'
                        )}
                      </Button>
                      <Button type="button" variant="outline">
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>

                {/* Change Password Section */}
                <div className="bg-card border border-border rounded-lg p-6 sm:p-8 mt-6">
                  <h2 className="text-xl font-semibold mb-4">Change Password</h2>
                  <form className="space-y-4">
                    <div>
                      <label className="text-sm font-medium block mb-2">Current Password</label>
                      <Input
                        type="password"
                        placeholder="••••••••"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-2">New Password</label>
                      <Input
                        type="password"
                        placeholder="••••••••"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-2">Confirm Password</label>
                      <Input
                        type="password"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="flex gap-3 pt-4 border-t border-border">
                      <Button type="submit">Update Password</Button>
                      <Button type="button" variant="outline">Cancel</Button>
                    </div>
                  </form>
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
