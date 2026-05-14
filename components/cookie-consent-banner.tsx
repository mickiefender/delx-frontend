'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, Cookie } from 'lucide-react'

type ConsentChoice = 'accepted' | 'rejected'

const STORAGE_KEY = 'delchris_cookie_consent_v1'
const LAST_SHOWN_KEY = 'delchris_cookie_consent_last_shown'
// Re-show banner every 30 days if not yet accepted
const REMINDER_INTERVAL_DAYS = 30

type CookieConsentBannerProps = {
  /**
   * If true, the banner will only show while consent is not decided yet.
   * If false, it will also show even after a choice.
   * @default false - shows periodically until accepted
   */
  showUntilDecided?: boolean
}

export function CookieConsentBanner({
  showUntilDecided = false,
}: CookieConsentBannerProps) {
  const [mounted, setMounted] = useState(false)
  const [choice, setChoice] = useState<ConsentChoice | null>(null)
  const [visible, setVisible] = useState(false)

  // Check if we should show the banner based on timing
  const shouldShowBanner = useMemo(() => {
    if (choice === 'accepted') {
      // If accepted, don't show again (unless showUntilDecided is true)
      return showUntilDecided
    }
    // If rejected or no choice, show based on timing
    if (!showUntilDecided) {
      try {
        const lastShown = window.localStorage.getItem(LAST_SHOWN_KEY)
        if (lastShown) {
          const lastShownDate = new Date(lastShown)
          const now = new Date()
          const diffTime = now.getTime() - lastShownDate.getTime()
          const diffDays = diffTime / (1000 * 60 * 60 * 24)
          // Re-show if it's been more than REMINDER_INTERVAL_DAYS
          if (diffDays < REMINDER_INTERVAL_DAYS) {
            return false
          }
        }
      } catch {
        // ignore storage errors
      }
    }
    return true
  }, [choice, showUntilDecided])

  useEffect(() => {
    setMounted(true)

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw === 'accepted' || raw === 'rejected') {
        setChoice(raw)
      }
    } catch {
      // ignore storage errors
    }
  }, [])

  // Set visible after mount based on shouldShowBanner
  useEffect(() => {
    if (mounted) {
      setVisible(shouldShowBanner)
    }
  }, [mounted, shouldShowBanner])

  const message = useMemo(() => {
    return {
      title: 'Cookie Settings',
      body:
        'We use cookies and similar technologies to help personalize content, tailor and measure ads, and provide a better experience. By clicking "Accept All", you agree to our use of cookies as outlined in our Cookie Policy. You can manage your preferences at any time.',
    }
  }, [])

  const persistChoice = (next: ConsentChoice) => {
    setChoice(next)
    setVisible(false)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
      // Record when we last showed the banner
      window.localStorage.setItem(LAST_SHOWN_KEY, new Date().toISOString())
    } catch {
      // ignore
    }

    // Inform the app so tracking can respect consent immediately.
    window.dispatchEvent(
      new CustomEvent('cookie-consent-changed', {
        detail: { accepted: next === 'accepted' },
      })
    )
  }

  // Close banner without making a choice (dismiss)
  const handleClose = () => {
    setVisible(false)
    try {
      // Record when we last dismissed to potentially re-show later
      window.localStorage.setItem(LAST_SHOWN_KEY, new Date().toISOString())
    } catch {
      // ignore
    }
  }

  if (!mounted || !visible) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-[120] px-4 pb-4 sm:px-6 sm:pb-6">
      <Card className="mx-auto max-w-lg p-6 bg-white border border-gray-200 rounded-lg shadow-lg">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <h2 className="text-xl font-bold text-gray-900">{message.title}</h2>
              <button
                type="button"
                onClick={() => setVisible(false)}
                aria-label="Close cookies settings"
                className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <p className="text-sm text-gray-700 leading-relaxed mb-6">
              {message.body}
            </p>

            <div className="flex gap-3">
              <Button
                type="button"
                onClick={() => persistChoice('accepted')}
                className="bg-gray-900 text-white hover:bg-gray-800 font-semibold px-6 py-2 rounded"
              >
                Accept
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => persistChoice('rejected')}
                className="bg-gray-100 text-gray-900 hover:bg-gray-200 border-0 font-semibold px-6 py-2 rounded"
              >
                Preferences
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
