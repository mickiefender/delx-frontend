'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Mail, Loader, ArrowLeft } from 'lucide-react'
import { fetchPublicSettings } from '@/lib/services/settings'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { forgotPassword, isAuthenticated } = useAuth()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [siteLogo, setSiteLogo] = useState<string | null>(null)

  const toAbsoluteMediaUrl = (url?: string | null): string => {
    if (!url) return ''
    if (url.startsWith('http://') || url.startsWith('https://')) return url
    const backendBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1').replace(/\/api\/v1\/?$/, '')
    if (url.startsWith('/')) return `${backendBase}${url}`
    return `${backendBase}/${url}`
  }

  useEffect(() => {
    let cancelled = false

    const loadLogo = async () => {
      try {
        const settings = await fetchPublicSettings()
        if (cancelled) return

        const logo = (settings as any).site_logo as string | null | undefined
        setSiteLogo(logo ? toAbsoluteMediaUrl(logo) : null)
      } catch {
        // fallback silently
      }
    }

    void loadLogo()

    return () => {
      cancelled = true
    }
  }, [])

  // Redirect if already authenticated
  if (isAuthenticated) {
    router.push('/')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      toast.error('Please enter your email address')
      return
    }

    setIsLoading(true)

    try {
      await forgotPassword(email)
      setIsSubmitted(true)
      toast.success('Password reset link sent! Check your email.')
    } catch (error) {
      console.error('Forgot password error:', error)
      // Still show success to prevent email enumeration
      setIsSubmitted(true)
      toast.success('If an account exists with that email, a password reset link has been sent.')
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
            {siteLogo ? (
              <img
                src={siteLogo}
                alt="Delchris"
                className="w-20 h-14 rounded-md mx-auto mb-4"
                loading="eager"
              />
            ) : (
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xl mb-4 mx-auto">
                D
              </div>
            )}
          </Link>
          <h1 className="text-3xl font-semibold mb-2">Reset Password</h1>
          <p className="text-muted-foreground">
            {isSubmitted 
              ? 'Check your email for reset instructions' 
              : 'Enter your email to receive reset instructions'}
          </p>
        </div>

        {isSubmitted ? (
          /* Success State */
          <div className="text-center space-y-6">
            <div className="bg-muted/50 rounded-lg p-6">
              <p className="text-sm text-muted-foreground">
                We&apos;ve sent password reset instructions to <strong>{email}</strong>. 
                Please check your inbox and follow the link in the email.
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                If you don&apos;t see the email, check your spam folder.
              </p>
            </div>
            
            <div className="space-y-3">
              <Link href="/auth/login">
                <Button variant="outline" className="w-full" size="lg">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sign In
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* Form */
          <>
            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
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
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </form>

            {/* Back to Login */}
            <p className="text-center text-sm text-muted-foreground">
              Remember your password?{' '}
              <Link href="/auth/login" className="text-accent hover:text-accent/80 font-medium">
                Sign in
              </Link>
            </p>

            {/* Terms */}
            <p className="text-xs text-muted-foreground text-center mt-6">
              By requesting a password reset, you agree to our{' '}
              <Link href="/terms" className="text-accent hover:text-accent/80">
                Terms of Service
              </Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-accent hover:text-accent/80">
                Privacy Policy
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
