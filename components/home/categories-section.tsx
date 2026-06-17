'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { fetchFeaturedCategories } from '@/lib/services/products'
import type { CategoryItem } from '@/lib/services/products'

export function CategoriesSection() {
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      try {
        const data = await fetchFeaturedCategories()
        if (cancelled) return
        setCategories(data)
      } catch {
        if (cancelled) return
        setCategories([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-1">Browse Categories</h2>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground text-center py-6">Loading categories...</div>
      ) : (
        <>
          {categories.length > 0 ? (
            <div className="w-full">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-1 sm:gap-2">
                {categories.map((category) => (
                  <Link key={category.id} href={`/products?category=${category.slug}`} className="group">
                    <div className="flex flex-col border border-gray-200 hover:border-gray-300 transition-colors duration-300 bg-white h-full">
                      {/* Image Container - Reduced size */}
                      <div className="w-full h-16 sm:h-20 md:h-24 lg:h-28 bg-gray-50 flex items-center justify-center p-1 overflow-hidden">
                        {category.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={category.image}
                            alt={category.name}
                            className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-110"
                            draggable={false}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200" />
                        )}
                      </div>

                      {/* Text Container - Below Image */}
                      <div className="flex items-center justify-center text-center p-1 sm:p-1.5 min-h-8 flex-grow">
                        <h3 className="font-medium text-[9px] sm:text-[10px] text-gray-900 line-clamp-2">
                          {category.name}
                        </h3>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center text-sm text-muted-foreground py-6">
              No featured categories yet.
            </div>
          )}
        </>
      )}
    </div>
  )
}
