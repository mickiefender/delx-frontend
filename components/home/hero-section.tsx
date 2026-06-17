'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import type { HeroBannerItem } from '@/lib/services/hero-banners'
import { fetchActiveHeroBanners } from '@/lib/services/hero-banners'

type AutoPlayStatus = 'playing' | 'paused'

export function HeroSection() {
  const [banners, setBanners] = useState<HeroBannerItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)
  const [autoplayStatus, setAutoplayStatus] = useState<AutoPlayStatus>('playing')

  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      try {
        const data = await fetchActiveHeroBanners()
        if (cancelled) return
        setBanners(data)
        setActiveIndex(0)
      } catch {
        if (cancelled) return
        setBanners([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const activeBanner = banners[activeIndex]

  const clampIndex = (next: number) => {
    if (banners.length === 0) return 0
    const mod = ((next % banners.length) + banners.length) % banners.length
    return mod
  }

  const goToIndex = (idx: number) => {
    if (banners.length === 0) return
    setActiveIndex(clampIndex(idx))
  }

  const goPrev = () => goToIndex(activeIndex - 1)
  const goNext = () => goToIndex(activeIndex + 1)

  useEffect(() => {
    if (loading) return
    if (autoplayStatus !== 'playing') return
    if (!banners.length) return

    const durationSeconds = activeBanner?.duration_seconds ?? 6
    const durationMs = Math.max(1, durationSeconds) * 1000

    if (timerRef.current) window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => {
      goToIndex(activeIndex + 1)
    }, durationMs)

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, autoplayStatus, loading, banners])

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [])

  const bannerHref = activeBanner?.cta_url || '/products'
  const hasSlides = banners.length > 0

  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-card to-background" />

      {/* One unified hero container (fills the full hero area on all screens) */}
      <div className="relative px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-14">
        <div className="max-w-7xl mx-auto">
          {/* Image-only carousel, but responsive + full-height across breakpoints */}
          <div className="relative w-full h-[280px] sm:h-[340px] lg:h-[420px]">
            {/* Optional soft accent layer */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-accent/5 rounded-2xl" />

            {/* Carousel slide */}
            {activeBanner?.image ? (
              <Link
                href={bannerHref}
                aria-label="Go to featured products"
                onMouseEnter={() => setAutoplayStatus('paused')}
                onMouseLeave={() => setAutoplayStatus('playing')}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeBanner.image}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover rounded-2xl border border-border"
                  draggable={false}
                />
              </Link>
            ) : (
              <div className="absolute inset-0 rounded-2xl border border-border" aria-hidden="true" />
            )}

            {/* Prev / Next Controls */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-3 sm:px-4">
              <button
                type="button"
                className="pointer-events-auto inline-flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-background/70 hover:bg-background border border-border shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous slide"
                onClick={() => {
                  setAutoplayStatus('paused')
                  goPrev()
                }}
                disabled={!hasSlides || loading}
              >
                <span aria-hidden="true" className="text-xl leading-none">
                  ‹
                </span>
              </button>

              <button
                type="button"
                className="pointer-events-auto inline-flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-background/70 hover:bg-background border border-border shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Next slide"
                onClick={() => {
                  setAutoplayStatus('paused')
                  goNext()
                }}
                disabled={!hasSlides || loading}
              >
                <span aria-hidden="true" className="text-xl leading-none">
                  ›
                </span>
              </button>
            </div>

            {/* Bottom indicator (subtle, professional) */}
            {hasSlides ? (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
                <div className="flex items-center gap-2 rounded-full bg-background/60 border border-border px-3 py-1.5">
                  <span className="text-sm font-semibold text-foreground/90">
                    {activeIndex + 1}
                  </span>
                  <span className="text-sm text-foreground/60">/ {banners.length}</span>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
