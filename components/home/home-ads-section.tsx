'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { fetchActiveHomeAds, type HomeAdBannerItem } from '@/lib/services/home-ads'
import { Skeleton } from '@/components/ui/skeleton'

export function HomeAdsSection() {
  const [ads, setAds] = useState<HomeAdBannerItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchActiveHomeAds()
        setAds(data)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load ads')
        setAds([])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const left = ads.find((a) => a.position === 1)
  const right = ads.find((a) => a.position === 2)

  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
         
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="border border-border bg-card rounded-lg overflow-hidden">
              <Skeleton className="h-64 w-full" />
            </div>
            <div className="border border-border bg-card rounded-lg overflow-hidden">
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        ) : error ? (
          <div className="border border-border bg-card rounded-lg p-4 text-sm text-muted-foreground">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AdSlot ad={left} alt="Left Ad Banner" />
            <AdSlot ad={right} alt="Right Ad Banner" />
          </div>
        )}
      </div>
    </section>
  )
}

function AdSlot({ ad, alt }: { ad?: HomeAdBannerItem; alt: string }) {
  if (!ad?.image) {
    return (
      <div className="border border-border bg-card rounded-lg overflow-hidden flex items-center justify-center">
        <div className="p-8 text-center">
          <div className="text-4xl mb-2"></div>
          <div className="font-semibold">Ad not set</div>
          <div className="text-muted-foreground text-sm mt-1">Position will appear here.</div>
        </div>
      </div>
    )
  }

  const href = ad.link_url?.trim()

  const content = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={ad.image}
        alt={alt}
        className="w-full h-64 object-cover"
        loading="lazy"
      />
    </>
  )

  if (!href) {
    return <div className="border border-border bg-card rounded-lg overflow-hidden">{content}</div>
  }

  return (
    <Link
      href={href}
      className="block border border-border bg-card rounded-lg overflow-hidden"
      aria-label={alt}
    >
      {content}
    </Link>
  )
}
