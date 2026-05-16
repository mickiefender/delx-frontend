'use client'

import { useState, useMemo, Suspense, useEffect } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Star, Heart, ShoppingCart, Filter, Grid, List, X } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { fetchStoreProducts, ProductListItem } from '@/lib/services/products'
import { BrandsSection } from '@/components/home/brands-section'
import { useCartStore } from '@/lib/store/cart'
import { useWishlistStore } from '@/lib/store/wishlist'

function hashStringToNumber(input: string) {
  // Deterministic "random" per refreshSeed + product.id.
  // Avoids Math.random() inside memo to keep ordering stable for the same render.
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0) / 4294967295
}

function ProductsContent() {
  const searchParams = useSearchParams()
  const categoryFilter = searchParams.get('category')
  const brandFilterRaw = searchParams.get('brand')
  const brandFilterId = brandFilterRaw ? Number(brandFilterRaw) : null

  const [products, setProducts] = useState<ProductListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(categoryFilter || '')

// Sync category state with URL changes when navigating between categories
  useEffect(() => {
    if (categoryFilter !== null && categoryFilter !== selectedCategory) {
      setSelectedCategory(categoryFilter)
    }
  }, [categoryFilter])

  const [priceRange, setPriceRange] = useState([0, 600])
  const [selectedRating, setSelectedRating] = useState(0)
  const [sortBy, setSortBy] = useState('popularity')
  const wishlistItems = useWishlistStore((s) => s.items)
  const toggleWishlistItem = useWishlistStore((s) => s.toggleItem)
  const cartItems = useCartStore((state) => state.items)
  const addItem = useCartStore((state) => state.addItem)
  const removeItem = useCartStore((state) => state.removeItem)

  // Changes on every refresh/mount => product arrangement changes.
  const [refreshSeed] = useState(() => Math.random())

  const isInCart = (productId: number, variantId?: string) => {
    const productIdStr = String(productId)
    return cartItems.some(
      (i) => i.productId === productIdStr && i.variantId === variantId
    )
  }

  const makeCartItem = (product: ProductListItem): { id: string; productId: string; variantId?: string; name: string; image?: string; price: number; quantity: number } => {
    // Cart keying: we support variantId optionally, but homepage list uses products without variants.
    // Use a stable id so removeItem can work consistently.
    const id = `${product.id}`
    return {
      id,
      productId: String(product.id),
      variantId: undefined,
      name: product.name,
      image: product.image,
      price: Number(product.price),
      quantity: 1,
    }
  }

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        setError('')
        const data = await fetchStoreProducts(brandFilterId ?? undefined)
        setProducts(data)

        if (data.length > 0) {
          const maxPrice = Math.ceil(Math.max(...data.map((p) => Number(p.price))) || 600)
          setPriceRange([0, maxPrice])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load products.')
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [brandFilterId])

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category_name).filter(Boolean))),
    [products]
  )

  const maxAvailablePrice = useMemo(
    () => Math.ceil(Math.max(600, ...products.map((p) => Number(p.price) || 0))),
    [products]
  )

  const filteredProducts = useMemo(() => {
    const filtered = [...products]

    let result = filtered

    if (selectedCategory) {
      // Case-insensitive category matching to support both slug and name from URL
      result = result.filter((p) =>
        p.category_name?.toLowerCase() === selectedCategory.toLowerCase() ||
        p.category_name?.toLowerCase() === selectedCategory.replace(/-/g, ' ').toLowerCase()
      )
    }

    result = result.filter((p) => {
      const price = Number(p.price)
      return price >= priceRange[0] && price <= priceRange[1]
    })

    if (selectedRating > 0) {
      result = result.filter((p) => Math.round(Number(p.rating)) >= selectedRating)
    }

    const withRandomTieBreaker = (arr: ProductListItem[]) => {
      arr.sort((a, b) => {
        // If two items end up "equal" on the primary sort key, we randomize their order.
        // This ensures refreshes produce different arrangements.
        const aRand = hashStringToNumber(`${refreshSeed}:${a.id}`)
        const bRand = hashStringToNumber(`${refreshSeed}:${b.id}`)
        return aRand - bRand
      })
    }

    switch (sortBy) {
      case 'price_asc': {
        result.sort((a, b) => {
          const diff = Number(a.price) - Number(b.price)
          if (diff !== 0) return diff
          const aRand = hashStringToNumber(`${refreshSeed}:${a.id}`)
          const bRand = hashStringToNumber(`${refreshSeed}:${b.id}`)
          return aRand - bRand
        })
        break
      }
      case 'price_desc': {
        result.sort((a, b) => {
          const diff = Number(b.price) - Number(a.price)
          if (diff !== 0) return diff
          const aRand = hashStringToNumber(`${refreshSeed}:${a.id}`)
          const bRand = hashStringToNumber(`${refreshSeed}:${b.id}`)
          return aRand - bRand
        })
        break
      }
      case 'rating': {
        result.sort((a, b) => {
          const diff = Number(b.rating) - Number(a.rating)
          if (diff !== 0) return diff
          const aRand = hashStringToNumber(`${refreshSeed}:${a.id}`)
          const bRand = hashStringToNumber(`${refreshSeed}:${b.id}`)
          return aRand - bRand
        })
        break
      }
      case 'newest': {
        // Current behavior is reverse the list (deterministic). We add a random tie-breaker
        // by shuffling within the whole list based on the same seed.
        withRandomTieBreaker(result)
        break
      }
      case 'popularity':
      default: {
        result.sort((a, b) => {
          const diff = b.review_count - a.review_count
          if (diff !== 0) return diff
          const aRand = hashStringToNumber(`${refreshSeed}:${a.id}`)
          const bRand = hashStringToNumber(`${refreshSeed}:${b.id}`)
          return aRand - bRand
        })
      }
    }

    return result
  }, [products, selectedCategory, priceRange, selectedRating, sortBy, refreshSeed])

  const [pageSize] = useState<number>(12)
  const [currentPage, setCurrentPage] = useState<number>(1)

  // If filters/sorting change, reset back to the first page.
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory, priceRange, selectedRating, sortBy])

  const totalProducts = filteredProducts.length
  const totalPages = Math.max(1, Math.ceil(totalProducts / pageSize))

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize
    return filteredProducts.slice(start, end)
  }, [filteredProducts, currentPage, pageSize])

  const toggleWishlistForProduct = (product: ProductListItem) => {
    toggleWishlistItem({
      productId: product.id,
      name: product.name,
      image: product.image,
      price: Number(product.price),
      createdAt: new Date().toISOString(),
    })
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-semibold mb-2">Products</h1>
              <p className="text-muted-foreground">
                {loading
                  ? 'Loading products...'
                  : `Showing ${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''}`}
              </p>
              {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <aside className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                <div className="space-y-6">
                  <div className="flex items-center justify-between lg:hidden mb-6">
                    <h2 className="text-lg font-semibold">Filters</h2>
                    <button onClick={() => setShowFilters(false)} className="p-1 hover:bg-muted rounded">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <BrandsSection
                    label="Brands"
                    selectedBrandId={brandFilterId}
                    onBrandSelect={(id) => {
                      const url = new URL(window.location.href)
                      if (!id) url.searchParams.delete('brand')
                      else url.searchParams.set('brand', String(id))
                      window.history.pushState({}, '', url.toString())
                      setCurrentPage(1)
                    }}
                  />

                  <div>
                    <h3 className="font-semibold mb-3">Category</h3>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="category"
                          value=""
                          checked={selectedCategory === ''}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="rounded"
                        />
                        <span className="text-sm">All Categories</span>
                      </label>
                      {categories.map((cat) => (
                        <label key={cat} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="category"
                            value={cat}
                            checked={selectedCategory === cat}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="rounded"
                          />
                          <span className="text-sm">{cat}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Price Range</h3>
                    <div className="space-y-3">
                      <div>
                        <input
                          type="range"
                          min="0"
                          max={maxAvailablePrice}
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value, 10)])}
                          className="w-full"
                        />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">GHS {priceRange[0]}</span>
                        <span className="font-medium">GHS {priceRange[1]}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Rating</h3>
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1, 0].map((rating) => (
                        <label key={rating} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="rating"
                            value={rating}
                            checked={selectedRating === rating}
                            onChange={() => setSelectedRating(rating)}
                            className="rounded"
                          />
                          <span className="text-sm">
                            {rating === 0 ? (
                              'All Ratings'
                            ) : (
                              <>
                                {Array.from({ length: rating }).map((_, i) => (
                                  <Star key={i} className="w-3 h-3 fill-accent text-accent inline mr-0.5" />
                                ))}
                                <span className="ml-1">& up</span>
                              </>
                            )}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setSelectedCategory('')
                      setPriceRange([0, maxAvailablePrice])
                      setSelectedRating(0)
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </aside>

              <div className="lg:col-span-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-border">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="lg:hidden flex items-center gap-2 px-3 py-2 border border-border rounded-lg hover:bg-muted"
                    >
                      <Filter className="w-4 h-4" />
                      Filters
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-muted-foreground">Sort:</label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="popularity">Popularity</option>
                        <option value="newest">Newest</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                        <option value="rating">Top Rated</option>
                      </select>
                    </div>

                    <div className="flex gap-1 border border-border rounded-lg p-1">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded ${viewMode === 'grid' ? 'bg-muted' : 'hover:bg-muted'}`}
                      >
                        <Grid className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded ${viewMode === 'list' ? 'bg-muted' : 'hover:bg-muted'}`}
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-12 text-muted-foreground">Loading products...</div>
                ) : viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {paginatedProducts.map((product) => {
                      const price = Number(product.price)
                      const originalPrice = product.original_price ? Number(product.original_price) : null
                      const discount =
                        originalPrice && originalPrice > price
                          ? Math.round(((originalPrice - price) / originalPrice) * 100)
                          : 0
                      const isWishlisted = wishlistItems.some((w) => w.productId === product.id)

                      return (
                        <Link
                          key={product.id}
                          href={`/products/${product.slug}`}
                          className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all group block"
                        >
                          <div className="relative h-40 bg-muted flex items-center justify-center overflow-hidden">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <div className="text-5xl">🛍️</div>
                            )}
                            {discount > 0 && (
                              <div className="absolute top-3 right-3 bg-accent text-accent-foreground px-2 py-1 rounded text-sm font-semibold">
                                -{discount}%
                              </div>
                            )}

                            <div className="absolute inset-0 bg-black/0 lg:group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-100 lg:opacity-0 lg:group-hover:opacity-100 gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault()
                                  toggleWishlistForProduct(product)
                                }}
                                className={`p-2 rounded-lg transition-colors ${
                                  isWishlisted
                                    ? 'bg-destructive text-destructive-foreground'
                                    : 'bg-card text-foreground hover:bg-accent hover:text-accent-foreground'
                                }`}
                              >
                                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()

                                  const inCart = isInCart(product.id)
                                  if (inCart) {
                                    // remove by cart item id
                                    removeItem(String(product.id))
                                  } else {
                                    addItem(makeCartItem(product))
                                  }
                                }}
                                className="bg-primary text-primary-foreground p-2 rounded-lg hover:bg-accent transition-colors"
                              >
                                <ShoppingCart
                                  className={`w-5 h-5 ${isInCart(product.id) ? 'text-white' : ''}`}
                                />
                              </button>
                            </div>
                          </div>

                          <div className="p-2.5">
                              <p className="text-[10.5px] text-accent font-semibold mb-1">{product.category_name}</p>
                              <h3 className="font-semibold mb-1.5 line-clamp-2 group-hover:text-accent transition-colors text-sm">
                                {product.name}
                              </h3>

                            <div className="flex items-center gap-1 mb-1.5">
                              <div className="flex">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3.5 h-3.5 ${
                                      i < Math.round(Number(product.rating))
                                        ? 'fill-accent text-accent'
                                        : 'text-muted-foreground'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-[11px] text-muted-foreground">
                                {product.rating} ({product.review_count})
                              </span>
                            </div>

                            <div className="flex items-baseline gap-2">
                              <span className="font-semibold">GHS {price}</span>
                              {originalPrice && originalPrice > price && (
                                <span className="text-xs text-muted-foreground line-through">
                                  GHS {originalPrice}
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {paginatedProducts.map((product) => {
                      const price = Number(product.price)
                      const originalPrice = product.original_price ? Number(product.original_price) : null
                      const discount =
                        originalPrice && originalPrice > price
                          ? Math.round(((originalPrice - price) / originalPrice) * 100)
                          : 0
                      const isWishlisted = wishlistItems.some((w) => w.productId === product.id)

                      return (
                        <Link
                          key={product.id}
                          href={`/products/${product.slug}`}
                          className="bg-card border border-border rounded-lg p-4 flex gap-4 hover:shadow-lg transition-all group"
                        >
                          <div className="w-24 h-24 bg-muted rounded flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <div className="text-4xl">🛍️</div>
                            )}
                            {discount > 0 && (
                              <div className="absolute top-1 right-1 bg-accent text-accent-foreground px-2 py-1 rounded text-xs font-semibold">
                                -{discount}%
                              </div>
                            )}
                          </div>

                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <p className="text-[11px] text-accent font-semibold mb-1">{product.category_name}</p>
                              <h3 className="font-semibold text-sm mb-2">{product.name}</h3>
                              <div className="flex items-center gap-3">
                                <div className="flex">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < Math.round(Number(product.rating))
                                          ? 'fill-accent text-accent'
                                          : 'text-muted-foreground'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-[12px] text-muted-foreground">
                                  {product.rating} ({product.review_count} reviews)
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-baseline gap-2">
                                <span className="text-lg font-semibold">GHS {price}</span>
                                {originalPrice && originalPrice > price && (
                                  <span className="text-sm text-muted-foreground line-through">
                                    GHS {originalPrice}
                                  </span>
                                )}
                              </div>

                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    toggleWishlistForProduct(product)
                                  }}
                                  className={`p-2 rounded-lg transition-colors ${
                                    isWishlisted
                                      ? 'bg-destructive text-destructive-foreground'
                                      : 'border border-border hover:bg-muted'
                                  }`}
                                >
                                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                                </button>
                                <Button
                                  size="sm"
                                  className="gap-2"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()

                                    const inCart = isInCart(product.id)
                                    if (inCart) {
                                      removeItem(String(product.id))
                                    } else {
                                      addItem(makeCartItem(product))
                                    }
                                  }}
                                >
                                  <ShoppingCart className="w-4 h-4" />
                                  {isInCart(product.id) ? 'Remove' : 'Add'}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                )}

                {!loading && filteredProducts.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg">No products found matching your filters.</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => {
                        setSelectedCategory('')
                        setPriceRange([0, maxAvailablePrice])
                        setSelectedRating(0)
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                )}

                {!loading && filteredProducts.length > 0 && (
                  <div className="mt-8 flex items-center justify-between gap-4">
                    <div className="text-sm text-muted-foreground">
                      Showing{' '}
                      <span className="font-medium text-foreground">
                        {Math.min((currentPage - 1) * pageSize + 1, totalProducts)}
                      </span>{' '}
                      to{' '}
                      <span className="font-medium text-foreground">
                        {Math.min(currentPage * pageSize, totalProducts)}
                      </span>{' '}
                      of{' '}
                      <span className="font-medium text-foreground">{totalProducts}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        className="px-3 py-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        Prev
                      </button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }).map((_, idx) => {
                          const page = idx + 1
                          return (
                            <button
                              key={page}
                              className={`px-3 py-2 border border-border rounded-lg text-sm hover:bg-muted ${
                                page === currentPage ? 'bg-muted font-semibold' : ''
                              }`}
                              onClick={() => setCurrentPage(page)}
                            >
                              {page}
                            </button>
                          )
                        })}
                      </div>

                      <button
                        className="px-3 py-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-primary"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  )
}
