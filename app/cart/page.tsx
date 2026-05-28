'use client'

import Link from 'next/link'
import { useCartStore } from '@/lib/store/cart'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2, ArrowLeft, Loader } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice, getTotalItems, applyCoupon, couponCode, couponDiscount, removeCoupon, clearCart } = useCartStore()
  const [couponInput, setCouponInput] = useState('')
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  if (!isMounted) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background flex items-center justify-center px-4">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading cart...</p>
          </div>
        </main>
        <Footer />
      </>
    )
  }
  const shippingCost = subtotal > 0 ? (subtotal > 500 ? 0 : 50) : 0
  const taxAmount = subtotal * 0.15 // 15% VAT
  const totalDiscount = couponDiscount || 0
  const totalPrice = getTotalPrice() + shippingCost + taxAmount

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsApplyingCoupon(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      if (couponInput.toUpperCase() === 'WELCOME10') {
        const discount = subtotal * 0.1
        applyCoupon('WELCOME10', discount)
        toast.success('Coupon applied successfully!')
        setCouponInput('')
      } else {
        toast.error('Invalid coupon code')
      }
    } finally {
      setIsApplyingCoupon(false)
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <Link href="/" className="inline-flex items-center text-accent hover:text-accent/80 mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Continue Shopping
              </Link>
              <h1 className="text-3xl sm:text-4xl font-semibold mb-2">Shopping Cart</h1>
              <p className="text-muted-foreground">
                {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>

            {items.length === 0 ? (
              // Empty State
              <div className="bg-card rounded-lg border border-border p-12 text-center">
                <div className="text-5xl mb-4">🛒</div>
                <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
                <p className="text-muted-foreground mb-6">
                  Add some items to get started with your shopping.
                </p>
                <Link href="/products">
                  <Button size="lg">Start Shopping</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="bg-card border border-border rounded-lg p-4 flex gap-4">
                      {/* Product Image */}
                      <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden border border-border">
                        {item.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-3xl" aria-hidden="true">
                            🛍️
                          </span>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold mb-1 truncate">{item.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3">GHS {item.price.toFixed(2)}</p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="px-3 py-1 border border-border rounded hover:bg-muted transition-colors"
                          >
                            −
                          </button>
                          <span className="px-3 py-1 min-w-max">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-3 py-1 border border-border rounded hover:bg-muted transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Price & Remove */}
                      <div className="text-right flex flex-col justify-between">
                        <p className="font-semibold">GHS {(item.price * item.quantity).toFixed(2)}</p>
                        <button
                          onClick={() => {
                            removeItem(item.id)
                            toast.success('Item removed from cart')
                          }}
                          className="text-destructive hover:text-destructive/80 flex items-center gap-1 text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                  <div className="bg-card border border-border rounded-lg p-6 sticky top-24">
                    <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

                    {/* Coupon Input */}
                    <form onSubmit={handleApplyCoupon} className="mb-6 pb-6 border-b border-border">
                      <label className="text-sm font-medium block mb-2">Coupon Code</label>
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="Enter code"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          disabled={!!couponCode}
                          className="flex-1"
                        />
                        <Button 
                          type="submit" 
                          variant="outline"
                          disabled={isApplyingCoupon || !!couponCode}
                          size="sm"
                        >
                          {isApplyingCoupon ? <Loader className="w-4 h-4 animate-spin" /> : 'Apply'}
                        </Button>
                      </div>
                      {couponCode && (
                        <div className="mt-2 p-2 bg-accent/10 rounded text-sm flex justify-between items-center">
                          <span className="text-accent font-medium">{couponCode} applied</span>
                          <button
                            type="button"
                            onClick={removeCoupon}
                            className="text-xs text-accent hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">Try code: WELCOME10</p>
                    </form>

                    {/* Price Breakdown */}
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>GHS {subtotal.toFixed(2)}</span>
                      </div>
                      {couponDiscount > 0 && (
                        <div className="flex justify-between text-sm text-accent">
                          <span>Discount ({couponCode})</span>
                          <span>-GHS {couponDiscount.toFixed(2)}</span>
                        </div>
                      )}
                     
                     
                      <div className="border-t border-border pt-3 flex justify-between font-semibold text-lg">
                        <span>Total</span>
                          <span>GHS {subtotal.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Checkout Button */}
                    <Link href="/checkout" className="block mb-3">
                      <Button className="w-full" size="lg">
                        Proceed to Checkout
                      </Button>
                    </Link>

                    {/* Continue Shopping */}
                    <Link href="/products">
                      <Button variant="outline" className="w-full">
                        Continue Shopping
                      </Button>
                    </Link>
                  </div>

                  {/* Trust Badges */}
                  <div className="mt-6 space-y-3 text-sm text-muted-foreground">
                    <div className="flex gap-2">
                      <span>✓</span>
                      <span>Secure checkout</span>
                    </div>
                    <div className="flex gap-2">
                      <span>✓</span>
                      <span>Multiple payment methods</span>
                    </div>
                    <div className="flex gap-2">
                      <span>✓</span>
                      <span>Money-back guarantee</span>
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
