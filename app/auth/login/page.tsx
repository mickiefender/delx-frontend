'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Mail, Lock, Loader, User } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { signIn, isAuthenticated } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Redirect if already authenticated (use useEffect to avoid React router push during render error)
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/')
    }
}, [isAuthenticated, router])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const user = await signIn(email, password)
      toast.success(`Welcome back${user.first_name ? ' ' + user.first_name : ''}!`)
      
      // Check if user is admin/staff and redirect to admin
      if (user.is_staff || user.is_superuser) {
        router.push('/admin')
      } else {
        router.push('/')
      }
    } catch (error) {
      console.error('Sign in error:', error)
      toast.error(error instanceof Error ? error.message : 'Invalid credentials')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xl mb-4">
              D
            </div>
          </Link>
          <h1 className="text-3xl font-semibold mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to your Delchris account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSignIn} className="space-y-4 mb-6">
          {/* Email */}
          <div>
            <label className="text-sm font-medium mb-2 block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium">Password</label>
              <Link href="/auth/forgot-password" className="text-xs text-accent hover:text-accent/80">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        {/* Sign Up Link */}
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="text-accent hover:text-accent/80 font-medium">
            Sign up
          </Link>
        </p>

        {/* Terms */}
        <p className="text-xs text-muted-foreground text-center mt-6">
          By signing in, you agree to our{' '}
          <Link href="/terms" className="text-accent hover:text-accent/80">
            Terms of Service
          </Link>
          {' '}and{' '}
          <Link href="/privacy" className="text-accent hover:text-accent/80">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
}
