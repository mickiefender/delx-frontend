'use client'

import { useEffect, useMemo, useState } from 'react'
import { Star, Heart, ShoppingCart, Flame, Sparkles, Tag } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { fetchProductsByCollection, ProductListItem, ProductCollection } from '@/lib/services/products'
import { useCartStore } from '@/lib/store/cart'
import { useWishlistStore, type WishlistItem } from '@/lib/store/wishlist'

type CollectionTab = {
  id: ProductCollection
  label: string
  
  description: string
}

const collectionTabs: CollectionTab[] = [
  {
    id: 'best_seller',
    label: 'Best Sellers',
    
    description: 'Most popular products loved by customers',
  },
  {
    id: 'new_arrival',
    label: 'New Arrivals',
    
    description: 'Fresh picks just landed in our store',
  },
  {
    id: 'special_offer',
    label: 'Special Offers',
   
    description: 'Hot deals and limited-time offers',
  },
]

export function CollectionSection() {
  const [activeTab, setActiveTab] = useState<ProductCollection>('best_seller')
  const [products, setProducts] = useState<ProductListItem[]>([])
  const [loading, setLoading] = useState(true)

  const wishlistItems = useWishlistStore((s) => s.items)
  const toggleWishlistItem = useWishlistStore((s) => s.toggleItem)

  const cartItems = useCartStore((s) => s.items)
  const addItem = useCartStore((s) => s.addItem)
  const removeItem = useCartStore((s) => s.removeItem)

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true)
      try {
        const data = await fetchProductsByCollection(activeTab)
        setProducts(data)
      } catch {
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [activeTab])

  const activeTabData = useMemo(
    () => collectionTabs.find((tab) => tab.id === activeTab),
    [activeTab]
  )

  return (
    <div>
      {/* Section Header */}
      <div className="text-center mb-10">
        <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-balance">
          Shop by Collection
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Discover our curated collections - from trending bestsellers to exclusive new arrivals and unbeatable deals
        </p>
      </div>

      {/* Collection Tabs */}
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        {collectionTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-full transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-accent text-accent-foreground shadow-lg shadow-accent/25'
                : 'bg-card text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
            }`}
          >
            <span className={activeTab === tab.id ? 'animate-pulse' : ''}></span>
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Collection Description */}
      <div className="text-center mb-8">
        <p className="text-muted-foreground">
          {activeTabData?.description}
        </p>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-card rounded-lg border border-border overflow-hidden animate-pulse"
            >
              <div className="h-48 bg-muted" />
              <div className="p-3 space-y-2">
                <div className="h-2.5 w-16 bg-muted rounded" />
                <div className="h-4 w-full bg-muted rounded" />
                <div className="h-3.5 w-20 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-lg border border-border">
          
          <h3 className="text-xl font-semibold mb-2">No {activeTabData?.label} Yet</h3>
          <p className="text-muted-foreground mb-6">
            Check back soon for amazing products in this collection
          </p>
          <Link href="/products">
            <Button variant="outline">Browse All Products</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.slice(0, 8).map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
              isWishlisted={wishlistItems.some((w) => w.productId === product.id)}
              isInCart={cartItems.some((i) => i.productId === String(product.id))}
              onToggleWishlist={() => {
                const item: WishlistItem = {
                  productId: product.id,
                  name: product.name,
                  image: product.image,
                  price: Number(product.price),
                  createdAt: new Date().toISOString(),
                }
                toggleWishlistItem(item)
              }}
              onToggleCart={() => {
                const inCart = cartItems.some((i) => i.productId === String(product.id))
                if (inCart) removeItem(String(product.id))
                else {
                  addItem({
                    id: `${product.id}`,
                    productId: String(product.id),
                    variantId: undefined,
                    name: product.name,
                    image: product.image,
                    price: Number(product.price),
                    quantity: 1,
                  })
                }
              }}
            />
          ))}
        </div>
      )}

      {/* View All Link */}
      {!loading && products.length > 0 && (
        <div className="flex justify-center mt-10">
          <Link href={`/products?collection=${activeTab}`}>
            <Button variant="outline" size="lg" className="rounded-full px-8">
              View All {activeTabData?.label}
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}

function ProductCard({
  product,
  index,
  isWishlisted,
  isInCart,
  onToggleWishlist,
  onToggleCart,
}: {
  product: ProductListItem
  index: number
  isWishlisted: boolean
  isInCart: boolean
  onToggleWishlist: () => void
  onToggleCart: () => void
}) {
  const price = Number(product.price)
  const originalPrice = product.original_price ? Number(product.original_price) : null
  const discount =
    originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0

  const collectionBadge = {
    best_seller: { text: 'Best Seller', className: 'bg-orange-500 text-white' },
    new_arrival: { text: 'New', className: 'bg-blue-500 text-white' },
    special_offer: { text: 'Sale', className: 'bg-red-500 text-white' },
  }

  const collectionKey = product.collection ?? 'none'
  const badge = collectionKey !== 'none' ? collectionBadge[collectionKey] : null

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex-shrink-0"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-xl hover:border-accent/50 transition-all duration-300 h-full flex flex-col">
        {/* Image Container */}
        <div className="relative h-48 bg-muted overflow-hidden flex items-center justify-center flex-shrink-0">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="text-6xl">🛍️</div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1.5">
            {badge && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-semibold shadow-md ${badge.className}`}
                >
                  {badge.text}
                </span>
            )}
            {discount > 0 && (
              <span className="bg-accent text-accent-foreground px-2 py-0.5 rounded-full text-[11px] font-semibold shadow-md">
                -{discount}% OFF
              </span>
            )}
          </div>

          {/* Out of Stock Overlay */}
          {!product.is_in_stock && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white font-semibold text-base px-2 text-center">Out of Stock</span>
            </div>
          )}

          {/* Actions: visible on mobile, hover-only on lg+ */}
          <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 to-transparent transition-transform duration-300 translate-y-0 lg:translate-y-full lg:opacity-100 lg:group-hover:translate-y-0">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onToggleWishlist()
                }}
                className={`flex-1 py-1.5 px-2 rounded-lg text-[12px] font-medium transition-colors flex items-center justify-center gap-2 ${
                  isWishlisted ? 'bg-destructive text-destructive-foreground' : 'bg-white/90 hover:bg-white text-gray-900'
                }`}
                aria-label="Wishlist"
              >
                <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
                Wishlist
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onToggleCart()
                }}
                className={`flex-1 py-1.5 px-2 rounded-lg text-[12px] font-medium transition-colors flex items-center justify-center gap-2 ${
                  isInCart ? 'bg-accent/90 text-accent-foreground' : 'bg-accent hover:bg-accent/90 text-accent-foreground'
                }`}
                aria-label="Add to cart"
              >
                <ShoppingCart className={`w-3.5 h-3.5 ${isInCart ? 'text-white' : ''}`} />
                {isInCart ? 'Remove' : 'Add'}
              </button>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-3 flex flex-col flex-grow">
          <p className="text-[11px] text-accent font-semibold mb-1">
            {product.category_name}
          </p>
          <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-accent transition-colors text-sm">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.round(Number(product.rating))
                      ? 'fill-accent text-accent'
                      : 'text-muted-foreground/50'
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] text-muted-foreground">
              ({product.review_count})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 mt-auto">
            <span className="text-base font-bold text-accent">GHS {price}</span>
            {originalPrice && originalPrice > price && (
              <span className="text-xs text-muted-foreground line-through">
                GHS {originalPrice}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
