'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCartStore } from '@/lib/store/cart'
import { usePaymentStore, PaymentMethod, MobileMoneyProvider } from '@/lib/store/payment'
import { PaymentService } from '@/lib/services/payment'
import { toast } from 'sonner'
import { ChevronRight, Loader } from 'lucide-react'
import { fetchPublicSettings, type SiteSettingsPublic } from '@/lib/services/settings'

declare global {
  interface Window {
    PaystackPop: {
      setup(config: {
        key: string
        email: string
        amount: number
        ref: string
        onClose: () => void
        onSuccess: (response: { reference: string }) => void
      }): { openIframe: () => void }
    }
  }
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotalPrice, clearCart } = useCartStore()
  const { initializePayment, setProcessing, setError, updatePaymentStatus, clearPayment } = usePaymentStore()
  const [step, setStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedMobileProvider, setSelectedMobileProvider] = useState<MobileMoneyProvider>('mtn')
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard')

  const [publicSettings, setPublicSettings] = useState<SiteSettingsPublic | null>(null)

  // Load public settings (shipping/tax)
  useEffect(() => {
    const loadPublicSettings = async () => {
      try {
        const data = await fetchPublicSettings()
        setPublicSettings(data)
      } catch {
        // Keep checkout usable with defaults
        setPublicSettings(null)
      }
    }
    loadPublicSettings()
  }, [])

  // Load Paystack script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://js.paystack.co/v1/inline.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])

  // Step 1: Shipping Address
  const [shippingAddress, setShippingAddress] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
  })

  // Step 2: Billing Address
  const [useSameAddress, setUseSameAddress] = useState(true)
  const [billingAddress, setBillingAddress] = useState({ ...shippingAddress })

  // Step 3: Payment Method
  const [paymentMethod, setPaymentMethod] = useState('card')

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const freeShippingThreshold = publicSettings ? Number(publicSettings.free_shipping_threshold) : 500
  const standardShippingRate = publicSettings ? Number(publicSettings.shipping_flat_rate) : 15
  const expressShippingRate = publicSettings ? Number(publicSettings.local_shipping_rate) : 10
  const taxRate = publicSettings ? Number(publicSettings.tax_rate) : 0.15

  const shipping =
    subtotal >= freeShippingThreshold
      ? 0
      : shippingMethod === 'standard'
        ? standardShippingRate
        : expressShippingRate

  const tax = subtotal * taxRate
  const total = subtotal + shipping + tax

  if (items.length === 0) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-3xl font-semibold mb-4">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6">Add items to proceed with checkout</p>
            <Link href="/products">
              <Button>Continue Shopping</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const handleNextStep = () => {
    if (step === 1) {
      if (!shippingAddress.firstName || !shippingAddress.email || !shippingAddress.address) {
        toast.error('Please fill in all required fields')
        return
      }
      setStep(2)
    } else if (step === 2) {
      setStep(3)
    }
  }

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handlePlaceOrder = async () => {
    if (!shippingAddress.email || !shippingAddress.phone) {
      toast.error('Please fill in email and phone number')
      return
    }

    setIsProcessing(true)
    setProcessing(true)

    try {
      // Use guestId when user is not signed in
      const authToken = typeof window !== 'undefined' ? window.localStorage.getItem('auth_token') : null
      const isSignedIn = !!authToken

      const ensureGuestId = () => {
        const key = 'guest_id'
        const existing = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null
        if (existing) return existing
        const created = `GST-${Date.now()}-${Math.random().toString(36).slice(2, 10).toUpperCase()}`
        window.localStorage.setItem(key, created)
        return created
      }

      const guestId = !isSignedIn ? ensureGuestId() : undefined

      const orderId = PaymentService.generateOrderId()

      // Round amounts to prevent DRF Decimal max_digits/decimal_places validation errors.
      const subtotal = Number(getTotalPrice().toFixed(2))
      const shippingCost = Number(shipping.toFixed(2))
      const taxAmount = Number(tax.toFixed(2))
      const discountAmount = Number((items.length ? 0 : 0).toFixed(2))
      const totalAmount = Number((subtotal + shippingCost + taxAmount - discountAmount).toFixed(2))

      // Map cart items -> backend OrderItem shape.
      // Backend requires: product_name, sku, price, quantity, subtotal, variant_attributes.
      const itemsPayload = items.map((item) => ({
        id: undefined,
        product: undefined,
        product_name: item.name,
        product_image: item.image || '',
        sku: item.variantId ? `${item.productId}-${item.variantId}` : item.productId,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
        variant_attributes: item.variantId ? { variantId: item.variantId } : {},
      }))

      const initResponse = await PaymentService.initializePayment(
        shippingAddress.email,
        totalAmount,
        orderId,
        shippingAddress.phone,
        paymentMethod as PaymentMethod,
        paymentMethod === 'mobile_money' ? selectedMobileProvider : undefined,
        {
          guest_id: guestId,
          // Shipping
          shipping_first_name: shippingAddress.firstName,
          shipping_last_name: shippingAddress.lastName,
          shipping_email: shippingAddress.email,
          shipping_phone: shippingAddress.phone,
          shipping_address: shippingAddress.address,
          shipping_city: shippingAddress.city,
          shipping_state: 'N/A',
          shipping_postal_code: shippingAddress.postalCode || 'N/A',
          shipping_country: 'GH',
          // Billing
          billing_same_as_shipping: true,
          billing_first_name: shippingAddress.firstName,
          billing_last_name: shippingAddress.lastName,
          billing_address: shippingAddress.address,
          billing_city: shippingAddress.city,
          billing_state: '',
          billing_postal_code: shippingAddress.postalCode || '',
          billing_country: 'GH',
          // Pricing
          items: itemsPayload,
          subtotal,
          shipping_cost: shippingCost,
          tax_amount: taxAmount,
          discount_amount: discountAmount,
          total_amount: totalAmount,
          notes: '',
        } as unknown as Record<string, unknown>
      )

      if (!initResponse.success || !initResponse.data) {
        throw new Error(initResponse.error || 'Failed to initialize payment')
      }

      initializePayment({
        orderId,
        email: shippingAddress.email,
        phone: shippingAddress.phone,
        amount: totalAmount,
        paymentMethod: paymentMethod as PaymentMethod,
        mobileMoneyProvider: paymentMethod === 'mobile_money' ? selectedMobileProvider : undefined,
        reference: initResponse.data.reference,
        authorizationUrl: initResponse.data.authorizationUrl,
        accessCode: initResponse.data.accessCode,
        status: 'pending',
      })

      window.location.href = initResponse.data.authorizationUrl
    } catch (error) {
      console.error('Payment error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to process payment'
      toast.error(errorMessage)
      setError(errorMessage)
      setIsProcessing(false)
      setProcessing(false)
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-6xl mx-auto">
            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  1
                </div>
                <div className={`flex-1 h-1 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  2
                </div>
                <div className={`flex-1 h-1 ${step >= 3 ? 'bg-primary' : 'bg-muted'}`} />
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  3
                </div>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground mt-2">
                <span>Shipping</span>
                <span>Billing</span>
                <span>Payment</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form Section */}
              <div className="lg:col-span-2">
                <div className="bg-card border border-border rounded-lg p-6 sm:p-8">
                  {/* Step 1: Shipping Address */}
                  {step === 1 && (
                    <div>
                      <h2 className="text-2xl font-semibold mb-6">Shipping Address</h2>
                      <form className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium block mb-2">First Name *</label>
                            <Input
                              type="text"
                              value={shippingAddress.firstName}
                              onChange={(e) => setShippingAddress({ ...shippingAddress, firstName: e.target.value })}
                              placeholder="First name"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium block mb-2">Last Name *</label>
                            <Input
                              type="text"
                              value={shippingAddress.lastName}
                              onChange={(e) => setShippingAddress({ ...shippingAddress, lastName: e.target.value })}
                              placeholder="Last name"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium block mb-2">Email *</label>
                          <Input
                            type="email"
                            value={shippingAddress.email}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, email: e.target.value })}
                            placeholder="you@example.com"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium block mb-2">Phone *</label>
                          <Input
                            type="tel"
                            value={shippingAddress.phone}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                            placeholder="+233 (0) 123 456 789"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium block mb-2">Address *</label>
                          <Input
                            type="text"
                            value={shippingAddress.address}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                            placeholder="Street address"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium block mb-2">City *</label>
                            <Input
                              type="text"
                              value={shippingAddress.city}
                              onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                              placeholder="City"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium block mb-2">Postal Code</label>
                            <Input
                              type="text"
                              value={shippingAddress.postalCode}
                              onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                              placeholder="Postal code"
                            />
                          </div>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Step 2: Billing Address */}
                  {step === 2 && (
                    <div>
                      <h2 className="text-2xl font-semibold mb-6">Billing Address</h2>

                      <div className="mb-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={useSameAddress}
                            onChange={(e) => setUseSameAddress(e.target.checked)}
                            className="rounded"
                          />
                          <span className="text-sm">Use same address as shipping</span>
                        </label>
                      </div>

                      {!useSameAddress && (
                        <form className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <Input placeholder="First name" />
                            <Input placeholder="Last name" />
                          </div>
                          <Input placeholder="Address" />
                          <div className="grid grid-cols-2 gap-4">
                            <Input placeholder="City" />
                            <Input placeholder="Postal code" />
                          </div>
                        </form>
                      )}

                      {/* Shipping Method */}
                      <div className="mt-8 pt-8 border-t border-border">
                        <h3 className="text-lg font-semibold mb-4">Shipping Method</h3>
                        <div className="space-y-3">
                          <label className="flex items-center gap-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-muted">
                            <input
                              type="radio"
                              name="shipping"
                              value="standard"
                              checked={shippingMethod === 'standard'}
                              onChange={() => setShippingMethod('standard')}
                              className="rounded-full"
                            />
                            <div>
                              <p className="font-medium">Standard Delivery</p>
                              <p className="text-xs text-muted-foreground">3-5 business days</p>
                            </div>
                            <span className="ml-auto font-semibold">GHS {shippingMethod === 'standard' ? standardShippingRate : expressShippingRate}</span>
                          </label>

                          <label className="flex items-center gap-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-muted">
                            <input
                              type="radio"
                              name="shipping"
                              value="express"
                              checked={shippingMethod === 'express'}
                              onChange={() => setShippingMethod('express')}
                              className="rounded-full"
                            />
                            <div>
                              <p className="font-medium">Express Delivery</p>
                              <p className="text-xs text-muted-foreground">1-2 business days</p>
                            </div>
                            <span className="ml-auto font-semibold">GHS {shippingMethod === 'express' ? expressShippingRate : standardShippingRate}</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Payment Method */}
                  {step === 3 && (
                    <div>
                      <h2 className="text-2xl font-semibold mb-6">Payment Method</h2>
                      <p className="text-sm text-muted-foreground mb-6">Securely powered by Paystack</p>

                      <div className="space-y-3">
                        <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer ${paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted'}`}>
                          <input
                            type="radio"
                            name="payment"
                            value="card"
                            checked={paymentMethod === 'card'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="rounded-full"
                          />
                          <div>
                            <p className="font-medium">Credit/Debit Card</p>
                            <p className="text-xs text-muted-foreground">Visa, Mastercard, American Express</p>
                          </div>
                        </label>

                        <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer ${paymentMethod === 'mobile_money' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted'}`}>
                          <input
                            type="radio"
                            name="payment"
                            value="mobile_money"
                            checked={paymentMethod === 'mobile_money'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="rounded-full"
                          />
                          <div>
                            <p className="font-medium">Mobile Money</p>
                            <p className="text-xs text-muted-foreground">MTN MoMo, Telecel Cash, AirtelTigo Money</p>
                          </div>
                        </label>

                        <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer ${paymentMethod === 'bank_transfer' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted'}`}>
                          <input
                            type="radio"
                            name="payment"
                            value="bank_transfer"
                            checked={paymentMethod === 'bank_transfer'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="rounded-full"
                          />
                          <div>
                            <p className="font-medium">Bank Transfer</p>
                            <p className="text-xs text-muted-foreground">Direct bank payment</p>
                          </div>
                        </label>
                      </div>

                      {paymentMethod === 'mobile_money' && (
                        <div className="mt-6 p-4 border border-border rounded-lg">
                          <label className="text-sm font-medium block mb-3">Select Mobile Money Provider</label>
                          <div className="space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                value="mtn"
                                checked={selectedMobileProvider === 'mtn'}
                                onChange={(e) => setSelectedMobileProvider(e.target.value as MobileMoneyProvider)}
                                className="rounded-full"
                              />
                              <span>MTN MoMo</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                value="telecel"
                                checked={selectedMobileProvider === 'telecel'}
                                onChange={(e) => setSelectedMobileProvider(e.target.value as MobileMoneyProvider)}
                                className="rounded-full"
                              />
                              <span>Telecel Cash</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                value="airteltigo"
                                checked={selectedMobileProvider === 'airteltigo'}
                                onChange={(e) => setSelectedMobileProvider(e.target.value as MobileMoneyProvider)}
                                className="rounded-full"
                              />
                              <span>AirtelTigo Money</span>
                            </label>
                          </div>
                        </div>
                      )}

                      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-xs text-amber-900">
                          💡 <strong>Tip:</strong> All payments are processed securely by Paystack. You&apos;ll be redirected to complete your payment.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex gap-3 mt-8 pt-8 border-t border-border">
                    {step > 1 && (
                      <Button variant="outline" onClick={handlePrevStep}>
                        Back
                      </Button>
                    )}

                    {step < 3 ? (
                      <Button onClick={handleNextStep} className="gap-2">
                        Continue
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        onClick={handlePlaceOrder}
                        disabled={isProcessing}
                        className="gap-2"
                      >
                        {isProcessing ? (
                          <>
                            <Loader className="w-4 h-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          'Place Order'
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-card border border-border rounded-lg p-6 sticky top-24">
                  <h2 className="text-lg font-semibold mb-6">Order Summary</h2>

                  {/* Items */}
                  <div className="space-y-2 mb-6 pb-6 border-b border-border max-h-64 overflow-y-auto">
                    {items.map(item => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.name} x {item.quantity}</span>
                        <span>GHS {(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="space-y-2 text-sm mb-6">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span>GHS {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Shipping</span>
                      <span>GHS {shipping.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Tax ({(taxRate * 100).toFixed(2)}%)</span>
                      <span>GHS {tax.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-border pt-2 flex justify-between font-semibold text-base">
                      <span>Total</span>
                      <span>GHS {total.toFixed(2)}</span>
                    </div>
                  </div>

                  <Link href="/cart">
                    <Button variant="outline" className="w-full">
                      Edit Cart
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
