'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { fetchBrands, BrandListItem } from '@/lib/services/products'
import { Button } from '@/components/ui/button'

type BrandsSectionProps = {
  selectedBrandId?: number | null
  onBrandSelect?: (brandId: number | null) => void
  label?: string
}

export function BrandsSection({
  selectedBrandId,
  onBrandSelect,
  label = 'Featured Brands',
}: BrandsSectionProps) {
  const [brands, setBrands] = useState<BrandListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        setError('')
        const data = await fetchBrands()
        if (!cancelled) setBrands(data)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load brands.')
        if (!cancelled) setBrands([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const activeBrands = useMemo(() => brands.filter((b) => b.is_active), [brands])

  if (loading) {
    return (
      <section className="py-8">
        <h2 className="text-xl font-semibold mb-4">{label}</h2>
        <div className="text-sm text-muted-foreground">Loading brands...</div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-8">
        <h2 className="text-xl font-semibold mb-4">{label}</h2>
        <div className="text-sm text-red-600">{error}</div>
      </section>
    )
  }

  if (!activeBrands.length) return null

  return (
    <section className="py-8">
      <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-xl font-semibold">{label}</h2>

        {onBrandSelect && (
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => onBrandSelect(null)}
          >
            All
          </Button>
        )}
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2">
        {activeBrands.map((brand) => {
          const isSelected = selectedBrandId ? brand.id === selectedBrandId : false
          const className = [
            'flex-shrink-0 rounded-full border transition-colors',
            isSelected ? 'border-primary bg-muted' : 'border-border bg-card hover:bg-muted',
          ].join(' ')

          // Homepage: no onBrandSelect => render as navigation links.
          if (!onBrandSelect) {
            return (
              <Link
                key={brand.id}
                href={`/products?brand=${brand.id}`}
                aria-label={`View products for brand ${brand.name}`}
                className={className}
              >
                <div className="w-16 h-16 sm:w-18 sm:h-18 flex items-center justify-center p-2">
                  {brand.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="w-full h-full object-contain"
                      draggable={false}
                    />
                  ) : (
                    <span className="text-sm font-semibold text-foreground">
                      {brand.name.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
              </Link>
            )
          }

          // Products page: use click handler to update URL.
          return (
            <button
              key={brand.id}
              type="button"
              onClick={() => onBrandSelect(brand.id)}
              className={className}
              aria-label={`Filter by brand ${brand.name}`}
            >
              <div className="w-16 h-16 sm:w-18 sm:h-18 flex items-center justify-center p-2">
                {brand.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="w-full h-full object-contain"
                    draggable={false}
                  />
                ) : (
                  <span className="text-sm font-semibold text-foreground">
                    {brand.name.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
