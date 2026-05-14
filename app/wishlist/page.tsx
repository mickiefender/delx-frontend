'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Heart, ShoppingCart, Trash2, Loader, ArrowLeft } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { useWishlistStore, type WishlistItem } from '@/lib/store/wishlist'
import { useCartStore } from '@/lib/store/cart'
import { toast } from 'sonner'

export default function WishlistPage() {
  const { items, removeItem, clear } = useWishlistStore()
  const cartAddItem = useCartStore((s) => s.addItem)

  const [isMounted, setIsMounted] = useState(false)
  const [isClearing, setIsClearing] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const wishlistItems: WishlistItem[] = useMemo(() => items, [items])

  const moveToCart = (item: WishlistItem) => {
    cartAddItem({
      id: String(item.productId),
      productId: String(item.productId),
      variantId: undefined,
      name: item.name,
      image: item.image,
      price: item.price,
      quantity: 1,
    })
    toast.success('Added to cart')
  }

  const total = useMemo(() => {
    return wishlistItems.reduce((sum, i) => sum + i.price, 0)
  }, [wishlistItems])

  if (!isMounted) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background flex items-center justify-center px-4">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading wishlist...</p>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <Link href="/" className="inline-flex items-center text-accent hover:text-accent/80 mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
              <h1 className="text-3xl sm:text-4xl font-semibold mb-2">Your Wishlist</h1>
              <p className="text-muted-foreground">
                {wishlistItems.length} item{wishlistItems.length === 1 ? '' : 's'} saved
              </p>
            </div>

            {wishlistItems.length === 0 ? (
              <div className="bg-card rounded-lg border border-border p-12 text-center">
                <div className="text-5xl mb-4">💖</div>
                <h2 className="text-2xl font-semibold mb-2">No items yet</h2>
                <p className="text-muted-foreground mb-6">
                  Tap the heart on a product to save it here for later.
                </p>
                <Link href="/products">
                  <Button size="lg">Start Shopping</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                  {wishlistItems
                    .slice()
                    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                    .map((item) => (
                      <div
                        key={item.productId}
                        className="bg-card border border-border rounded-lg p-4 flex gap-4"
                      >
                        <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden border border-border">
                          {item.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-3xl" aria-hidden="true">
                              🛍️
                            </span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold mb-1 truncate">{item.name}</h3>
                          <p className="text-sm text-muted-foreground mb-3">GHS {item.price.toFixed(2)}</p>

                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              className="gap-2"
                              onClick={() => moveToCart(item)}
                            >
                              <ShoppingCart className="w-4 h-4" />
                              Add to Cart
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-2"
                              onClick={() => removeItem(item.productId)}
                            >
                              <Trash2 className="w-4 h-4" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                <div className="lg:col-span-1">
                  <div className="bg-card border border-border rounded-lg p-6 sticky top-24">
                    <h2 className="text-xl font-semibold mb-6">Summary</h2>

                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Items</span>
                        <span>{wishlistItems.length}</span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>GHS {total.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Button
                        className="w-full"
                        disabled={isClearing}
                        onClick={async () => {
                          setIsClearing(true)
                          try {
                            clear()
                            toast.success('Wishlist cleared')
                          } finally {
                            setIsClearing(false)
                          }
                        }}
                      >
                        {isClearing ? <Loader className="w-4 h-4 animate-spin" /> : 'Clear Wishlist'}
                      </Button>

                      <Link href="/cart" className="block">
                        <Button variant="outline" className="w-full">
                          Go to Cart
                        </Button>
                      </Link>

                      <div className="pt-3 border-t border-border text-sm text-muted-foreground flex items-center gap-2">
                        <Heart className="w-4 h-4 text-accent" />
                        Your wishlist stays on this device.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
