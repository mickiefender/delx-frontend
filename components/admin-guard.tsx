'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth'

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { token, isAdmin } = useAuthStore()
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      setIsHydrated(true)
    })

    if (useAuthStore.persist.hasHydrated()) {
      setIsHydrated(true)
    }

    return () => {
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!isHydrated) return

    if (!token) {
      router.push('/auth/login?redirect=/admin')
      return
    }

    if (!isAdmin()) {
      router.push('/')
    }
  }, [isHydrated, token, isAdmin, router])

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!token || !isAdmin()) return null

  return <>{children}</>
}
