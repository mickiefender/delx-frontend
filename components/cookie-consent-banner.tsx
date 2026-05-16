'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

type ConsentChoice = 'accepted' | 'rejected'

const STORAGE_KEY = 'delchris_cookie_consent_v1'
const LAST_SHOWN_KEY = 'delchris_cookie_consent_last_shown'
const REMINDER_INTERVAL_DAYS = 30

type CookieConsentBannerProps = {
  showUntilDecided?: boolean
}

export function CookieConsentBanner({
  showUntilDecided = false,
}: CookieConsentBannerProps) {
  const [mounted, setMounted] = useState(false)
  const [choice, setChoice] = useState<ConsentChoice | null>(null)
  const [visible, setVisible] = useState(false)

  const shouldShowBanner = useMemo(() => {
    if (choice === 'accepted') {
      return showUntilDecided
    }

    if (!showUntilDecided) {
      try {
        const lastShown = window.localStorage.getItem(LAST_SHOWN_KEY)

        if (lastShown) {
          const lastShownDate = new Date(lastShown)
          const now = new Date()
          const diffTime = now.getTime() - lastShownDate.getTime()
          const diffDays = diffTime / (1000 * 60 * 60 * 24)

          if (diffDays < REMINDER_INTERVAL_DAYS) {
            return false
          }
        }
      } catch {
        // ignore
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
      // ignore
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      setVisible(shouldShowBanner)
    }
  }, [mounted, shouldShowBanner])

  const message = useMemo(() => {
    return {
      title: 'Cookie Settings',
      body:
        'We use cookies to improve your experience and personalize content. By clicking "Accept", you agree to our Cookie Policy.',
    }
  }, [])

  const persistChoice = (next: ConsentChoice) => {
    setChoice(next)
    setVisible(false)

    try {
      window.localStorage.setItem(STORAGE_KEY, next)
      window.localStorage.setItem(
        LAST_SHOWN_KEY,
        new Date().toISOString()
      )
    } catch {
      // ignore
    }

    window.dispatchEvent(
      new CustomEvent('cookie-consent-changed', {
        detail: { accepted: next === 'accepted' },
      })
    )
  }

  const handleClose = () => {
    setVisible(false)

    try {
      window.localStorage.setItem(
        LAST_SHOWN_KEY,
        new Date().toISOString()
      )
    } catch {
      // ignore
    }
  }

  if (!mounted || !visible) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-[120] px-3 pb-3 sm:px-4 sm:pb-4">
      <Card className="mx-auto max-w-md rounded-lg border border-gray-200 bg-white p-4 shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">
                {message.title}
              </h2>

              <button
                type="button"
                onClick={handleClose}
                aria-label="Close cookies settings"
                className="text-gray-400 transition-colors hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mb-4 text-xs leading-relaxed text-gray-600">
              {message.body}
            </p>

            <div className="flex gap-2">
              <Button
                type="button"
                onClick={() => persistChoice('accepted')}
                className="h-8 rounded-md bg-gray-900 px-4 text-xs font-medium text-white hover:bg-gray-800"
              >
                Accept
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => persistChoice('rejected')}
                className="h-8 rounded-md border-0 bg-gray-100 px-4 text-xs font-medium text-gray-900 hover:bg-gray-200"
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