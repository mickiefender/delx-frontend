'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import { Star, Heart, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { fetchStoreProducts, type ProductListItem } from '@/lib/services/products'
import { useCartStore } from '@/lib/store/cart'
import { useWishlistStore, type WishlistItem } from '@/lib/store/wishlist'
import { Button } from '@/components/ui/button'

export function FeaturedProducts() {
  const [products, setProducts] = useState<ProductListItem[]>([])
  const [loading, setLoading] = useState(true)
  const scrollRef1 = useRef<HTMLDivElement>(null)
  const scrollRef2 = useRef<HTMLDivElement>(null)

  const wishlistItems = useWishlistStore((s) => s.items)
  const toggleWishlistItem = useWishlistStore((s) => s.toggleItem)

  const cartItems = useCartStore((s) => s.items)
  const addItem = useCartStore((s) => s.addItem)
  const removeItem = useCartStore((s) => s.removeItem)

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchStoreProducts()
        setProducts(data)
      } catch {
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  const featuredProducts = useMemo(
    () => products.filter((product) => product.is_featured).slice(0, 12),
    [products]
  )

  const row1Products = useMemo(() => featuredProducts.slice(0, 6), [featuredProducts])
  const row2Products = useMemo(() => featuredProducts.slice(6, 12), [featuredProducts])

  const scroll = (
    ref: React.RefObject<HTMLDivElement | null>,
    direction: 'left' | 'right'
  ) => {
    if (!ref.current) return
    const scrollAmount = 320
    ref.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }

  const isWishlisted = (productId: number) =>
    wishlistItems.some((w) => w.productId === productId)

  const isInCart = (productId: number) =>
    cartItems.some((i) => i.productId === String(productId))

  const makeCartItem = (product: ProductListItem) => ({
    id: `${product.id}`,
    productId: String(product.id),
    variantId: undefined,
    name: product.name,
    image: product.image,
    price: Number(product.price),
    quantity: 1,
  })

  const toggleWishlistForProduct = (product: ProductListItem) => {
    const item: WishlistItem = {
      productId: product.id,
      name: product.name,
      image: product.image,
      price: Number(product.price),
      createdAt: new Date().toISOString(),
    }
    toggleWishlistItem(item)
  }

  const toggleCartForProduct = (product: ProductListItem) => {
    const inCart = isInCart(product.id)
    if (inCart) removeItem(String(product.id))
    else addItem(makeCartItem(product))
  }

  return (
    <div>
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-semibold mb-4 text-balance">
          Featured Collections
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Handpicked premium items curated for discerning customers.
        </p>
      </div>

      {/* Products Carousel */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading featured products...</div>
      ) : (
        <div className="space-y-8 mb-8">
          {/* Row 1 */}
          {row1Products.length > 0 && (
            <div className="relative">
              <div
                ref={scrollRef1}
                className="flex gap-6 overflow-x-auto scroll-smooth pb-4"
                style={{ scrollBehavior: 'smooth' }}
              >
                {row1Products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isWishlisted={isWishlisted(product.id)}
                    isInCart={isInCart(product.id)}
                    onToggleWishlist={() => toggleWishlistForProduct(product)}
                    onToggleCart={() => toggleCartForProduct(product)}
                  />
                ))}
              </div>

              <button
                onClick={() => scroll(scrollRef1, 'left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 bg-primary text-primary-foreground p-2 rounded-full hover:bg-accent transition-colors z-10 hidden md:flex items-center justify-center"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={() => scroll(scrollRef1, 'right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 bg-primary text-primary-foreground p-2 rounded-full hover:bg-accent transition-colors z-10 hidden md:flex items-center justify-center"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Row 2 */}
          {row2Products.length > 0 && (
            <div className="relative">
              <div
                ref={scrollRef2}
                className="flex gap-6 overflow-x-auto scroll-smooth pb-4"
                style={{ scrollBehavior: 'smooth' }}
              >
                {row2Products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isWishlisted={isWishlisted(product.id)}
                    isInCart={isInCart(product.id)}
                    onToggleWishlist={() => toggleWishlistForProduct(product)}
                    onToggleCart={() => toggleCartForProduct(product)}
                  />
                ))}
              </div>

              <button
                onClick={() => scroll(scrollRef2, 'left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 bg-primary text-primary-foreground p-2 rounded-full hover:bg-accent transition-colors z-10 hidden md:flex items-center justify-center"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={() => scroll(scrollRef2, 'right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 bg-primary text-primary-foreground p-2 rounded-full hover:bg-accent transition-colors z-10 hidden md:flex items-center justify-center"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* View All Button */}
      <div className="flex justify-center pt-4">
        <Link href="/products">
          <Button variant="outline" size="lg">
            View All Products
          </Button>
        </Link>
      </div>
    </div>
  )
}

function ProductCard({
  product,
  isWishlisted,
  isInCart,
  onToggleWishlist,
  onToggleCart,
}: {
  product: ProductListItem
  isWishlisted: boolean
  isInCart: boolean
  onToggleWishlist: () => void
  onToggleCart: () => void
}) {
  const price = Number(product.price)
  const originalPrice = product.original_price ? Number(product.original_price) : null
  const discount =
    originalPrice && originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0

  return (
    <Link href={`/products/${product.slug}`} className="group flex-shrink-0 w-64">
      <div className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col">
        {/* Image Container */}
        <div className="relative h-52 bg-muted overflow-hidden flex items-center justify-center flex-shrink-0">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="text-5xl">🛍️</div>
          )}

          {/* Discount Badge */}
          {discount > 0 && (
            <div className="absolute top-2 right-2 bg-accent text-accent-foreground px-2 py-1 rounded-full text-xs font-semibold">
              -{discount}%
            </div>
          )}

          {/* Actions: visible on mobile, hover-only on lg+ */}
          <div className="absolute inset-0 bg-black/0 lg:group-hover:bg-black/40 transition-colors flex items-end justify-end p-4 gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onToggleWishlist()
              }}
              className={`p-2 rounded-lg transition-colors ${
                isWishlisted ? 'bg-destructive text-destructive-foreground' : 'bg-card hover:bg-primary text-foreground hover:text-primary-foreground'
              }`}
              aria-label="Wishlist"
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onToggleCart()
              }}
              className={`p-2 rounded-lg transition-colors bg-primary text-primary-foreground hover:bg-accent ${isInCart ? 'opacity-100' : ''}`}
              aria-label="Add to cart"
            >
              <ShoppingCart className={`w-5 h-5 ${isInCart ? 'text-white' : ''}`} />
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-3 flex flex-col flex-grow">
          <p className="text-[11px] text-accent font-semibold mb-1">{product.category_name}</p>
          <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-accent transition-colors text-sm">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < Math.round(Number(product.rating)) ? 'fill-accent text-accent' : 'text-muted-foreground'
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] text-muted-foreground">
              {product.rating} ({product.review_count})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 mt-auto">
            <span className="text-base font-semibold">GHS {price}</span>
            {originalPrice && originalPrice > price && (
              <span className="text-xs text-muted-foreground line-through">GHS {originalPrice}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
