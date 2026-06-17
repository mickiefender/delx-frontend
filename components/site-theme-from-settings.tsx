'use client'

import { useEffect, useMemo } from 'react'
import { fetchPublicSettings } from '@/lib/services/settings'

type ThemeVars = {
  '--primary'?: string
  '--primary-foreground'?: string
  '--secondary'?: string
  '--secondary-foreground'?: string
  '--accent'?: string
  '--accent-foreground'?: string
  '--ring'?: string

  '--chart-1'?: string
  '--chart-2'?: string
  '--chart-3'?: string
  '--chart-4'?: string
  '--chart-5'?: string

  '--sidebar'?: string
  '--sidebar-foreground'?: string
  '--sidebar-primary'?: string
  '--sidebar-primary-foreground'?: string
  '--sidebar-accent'?: string
  '--sidebar-accent-foreground'?: string
  '--sidebar-border'?: string
  '--sidebar-ring'?: string
}

const setCssVars = (vars: ThemeVars) => {
  const root = document.documentElement
  for (const [key, value] of Object.entries(vars)) {
    if (value) root.style.setProperty(key, value)
  }
}

const getContrastingTextColor = (hex: string): string => {
  // Simple luminance heuristic (assumes #RRGGBB)
  const normalized = hex.replace('#', '')
  if (normalized.length !== 6) return '#ffffff'
  const r = parseInt(normalized.slice(0, 2), 16) / 255
  const g = parseInt(normalized.slice(2, 4), 16) / 255
  const b = parseInt(normalized.slice(4, 6), 16) / 255
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return luminance > 0.6 ? '#0f0f0f' : '#ffffff'
}

export function SiteThemeFromSettings() {
  const themeDefaults = useMemo(
    () => ({
      primary_color: '#2E7D32',
      secondary_color: '#C62828',
      accent_color: '#F57C00',
    }),
    [],
  )

  useEffect(() => {
    let cancelled = false
    let lastThemeKey: string | null = null

    const apply = (settings: typeof themeDefaults) => {
      const primary = settings.primary_color || themeDefaults.primary_color
      const secondary = settings.secondary_color || themeDefaults.secondary_color
      const accent = settings.accent_color || themeDefaults.accent_color

      const primaryText = getContrastingTextColor(primary)
      const secondaryText = getContrastingTextColor(secondary)
      const accentText = getContrastingTextColor(accent)
      const sidebarText = getContrastingTextColor(primary)

      const vars: ThemeVars = {
        '--primary': primary,
        '--primary-foreground': primaryText,
        '--secondary': secondary,
        '--secondary-foreground': secondaryText,
        '--accent': accent,
        '--accent-foreground': accentText,
        '--ring': primary,

        '--chart-1': primary,
        '--chart-2': accent,
        '--chart-3': primary,
        '--chart-4': secondary,
        '--chart-5': primary,

        '--sidebar': primary,
        '--sidebar-foreground': sidebarText,
        '--sidebar-primary': primary,
        '--sidebar-primary-foreground': sidebarText,
        '--sidebar-accent': accent,
        '--sidebar-accent-foreground': accentText,
        '--sidebar-border': primary,
        '--sidebar-ring': primary,
      }

      setCssVars(vars)
    }

    const fetchAndApply = async () => {
      try {
        const res = await fetchPublicSettings()
        if (cancelled) return

        const themeKey = `${res.primary_color}|${res.secondary_color}|${res.accent_color}`
        if (themeKey === lastThemeKey) return
        lastThemeKey = themeKey

        apply({
          primary_color: res.primary_color,
          secondary_color: res.secondary_color,
          accent_color: res.accent_color,
        })
      } catch {
        // Keep defaults; do not crash the app for theme fetch failures.
      }
    }

    // Initial load
    fetchAndApply()

    // Real-time updates without polling:
    // Admin sets localStorage key `delchris_settings_updated_at`.
    const onStorage = (e: StorageEvent) => {
      if (e.key !== 'delchris_settings_updated_at') return
      void fetchAndApply()
    }

    window.addEventListener('storage', onStorage)

    return () => {
      cancelled = true
      window.removeEventListener('storage', onStorage)
    }
  }, [themeDefaults])

  return null
}
