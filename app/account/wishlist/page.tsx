'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Heart, ShoppingCart, Trash2, Loader, ArrowRight, Search } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { AccountSidebar } from '@/components/account/account-sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/use-auth'
import { useWishlistStore, type WishlistItem } from '@/lib/store/wishlist'
import { useCartStore } from '@/lib/store/cart'
import { toast } from 'sonner'

export default function AccountWishlistPage() {
  const router = useRouter()
  const { user, isAuthReady, isAuthenticated } = useAuth()
  const { items, removeItem, clear } = useWishlistStore()
  const cartAddItem = useCartStore((s) => s.addItem)

  const [isMounted, setIsMounted] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (isAuthReady && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthReady, isAuthenticated, router])

  const sortedItems = useMemo(() => {
    return items
      .slice()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [items])

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return sortedItems
    const q = searchQuery.toLowerCase()
    return sortedItems.filter(
      i => i.name.toLowerCase().includes(q) || String(i.price).includes(q)
    )
  }, [sortedItems, searchQuery])

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
    toast.success(`${item.name} added to cart`)
  }

  const moveAllToCart = () => {
    sortedItems.forEach(item => {
      cartAddItem({
        id: String(item.productId),
        productId: String(item.productId),
        variantId: undefined,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: 1,
      })
    })
    toast.success(`All ${sortedItems.length} items moved to cart`)
  }

  const total = useMemo(() => {
    return sortedItems.reduce((sum, i) => sum + i.price, 0)
  }, [sortedItems])

  if (!isMounted || !isAuthReady) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background flex items-center justify-center px-4">
          <Loader className="w-8 h-8 animate-spin" />
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
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-rose-500" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold">Wishlist</h1>
              </div>
              <p className="text-muted-foreground">
                {items.length} {items.length === 1 ? 'item' : 'items'} saved for later
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <AccountSidebar />

              <div className="lg:col-span-3">
                {items.length === 0 ? (
                  <div className="bg-card border border-border rounded-xl p-12 text-center">
                    <div className="w-20 h-20 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-5">
                      <Heart className="w-9 h-9 text-rose-500" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Your wishlist is empty</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Tap the heart icon on any product to save it here. Items you love stay organized and ready when you are.
                    </p>
                    <Link href="/products">
                      <Button size="lg" className="gap-2">
                        <Search className="w-4 h-4" />
                        Browse Products
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <>
                    {/* Search & Actions Bar */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-6">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Search wishlist..."
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={moveAllToCart}
                          className="gap-2"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          Move All to Cart
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
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
                          className="gap-2 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                          Clear
                        </Button>
                      </div>
                    </div>

                    {/* Items Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {filteredItems.map((item) => (
                        <div
                          key={item.productId}
                          className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
                        >
                          {/* Image */}
                          <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                            {item.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-4xl">🛍️</span>
                              </div>
                            )}
                            <button
                              onClick={() => {
                                removeItem(item.productId)
                                toast.success('Removed from wishlist')
                              }}
                              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
                            >
                              <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                            </button>
                          </div>

                          {/* Content */}
                          <div className="p-4">
                            <h3 className="font-semibold mb-1 truncate">{item.name}</h3>
                            <p className="text-accent font-bold text-lg mb-3">
                              GHS {item.price.toFixed(2)}
                            </p>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="flex-1 gap-2"
                                onClick={() => moveToCart(item)}
                              >
                                <ShoppingCart className="w-4 h-4" />
                                Add to Cart
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-2"
                                onClick={() => {
                                  removeItem(item.productId)
                                  toast.success('Removed from wishlist')
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Filtered empty state */}
                    {filteredItems.length === 0 && searchQuery.trim() && (
                      <div className="bg-card border border-border rounded-xl p-8 text-center">
                        <Search className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                        <h3 className="font-semibold mb-1">No results found</h3>
                        <p className="text-sm text-muted-foreground">
                          No items match "{searchQuery}"
                        </p>
                      </div>
                    )}

                    {/* Summary */}
                    <div className="mt-6 bg-card border border-border rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {filteredItems.length} of {items.length} items
                        </p>
                        <p className="text-2xl font-bold mt-1">GHS {total.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Heart className="w-3.5 h-3.5 text-rose-500" />
                        Saved on this device
                      </div>
                    </div>
                  </>
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
