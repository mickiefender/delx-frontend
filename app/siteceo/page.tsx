'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Lock, Loader, Shield, Mail } from 'lucide-react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

interface LoginResponse {
  user: {
    id: number
    username: string
    email: string
    first_name?: string
    last_name?: string
    full_name?: string
    phone_number?: string
    is_staff: boolean
    is_superuser: boolean
  }
  token: string
}

export default function AdminLoginPage() {
  const router = useRouter()
  const { user: storeUser, setUser, setToken, isAdmin } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Redirect if already authenticated as admin
  useEffect(() => {
    if (isMounted && storeUser && isAdmin()) {
      router.push('/admin')
    }
  }, [isMounted, storeUser, isAdmin, router])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/users/admin_login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        if (response.status === 403) {
          throw new Error(errorData.error || 'Access denied. Admin credentials required.')
        }
        throw new Error(errorData.error || 'Invalid credentials')
      }

      const data: LoginResponse = await response.json()
      
      // Store user and token
      setUser(data.user)
      setToken(data.token)
      
      // Also store in localStorage for persistence
      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('auth_user', JSON.stringify(data.user))
      
      toast.success(`Welcome back${data.user.first_name ? ' ' + data.user.first_name : ''}!`)
      
      // Redirect to admin dashboard
      router.push('/admin')
    } catch (error) {
      console.error('Admin sign in error:', error)
      toast.error(error instanceof Error ? error.message : 'Invalid credentials')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500 rounded-2xl mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-slate-400">Sign in to access the admin dashboard</p>
        </div>

{/* Form */}
        <div className="bg-slate-800 rounded-2xl p-8 shadow-xl">
          <form onSubmit={handleSignIn} className="space-y-6">
            {/* Email */}
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 pl-11 h-12"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 pl-11 h-12"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5 mr-2" />
                  Access Admin Panel
                </>
)}
            </Button>
          </form>

          {/* Back to Store Link */}
          <div className="mt-6 pt-6 border-t border-slate-700">
            <p className="text-center text-slate-400 text-sm">
              Not an admin?{' '}
              <Link href="/auth/login" className="text-emerald-400 hover:text-emerald-300 font-medium">
                Sign in as customer
              </Link>
            </p>
          </div>

          {/* Back to Home */}
          <div className="mt-4">
            <Link 
              href="/" 
              className="block text-center text-slate-500 hover:text-slate-400 text-sm transition-colors"
            >
              ← Back to store
            </Link>
          </div>
        </div>

        {/* Security Notice */}
        <p className="text-xs text-slate-500 text-center mt-6">
          This is a restricted area. Unauthorized access is prohibited.
        </p>
      </div>
    </div>
  )
}
