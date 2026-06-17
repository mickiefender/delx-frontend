'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { OrderReceipt } from '@/components/payment/receipt'
import { CheckCircle, Loader2, Package, Mail } from 'lucide-react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

interface OrderData {
  order_id: string
  status: string
  shipping_first_name: string
  shipping_last_name: string
  shipping_email: string
  shipping_phone: string
  shipping_address: string
  shipping_city: string
  shipping_state: string
  shipping_country: string
  subtotal: string
  shipping_cost: string
  tax_amount: string
  discount_amount: string
  total_amount: string
  items: OrderItem[]
  created_at: string
}

interface OrderItem {
  id: number
  product_name: string
  product_image: string
  sku: string
  price: string
  quantity: number
  subtotal: string
}

interface PaymentData {
  amount: string
  payment_method: string
  status: string
  created_at: string
}

function SuccessContent() {
  const searchParams = useSearchParams()
  const reference = searchParams.get('reference')
  const pendingVerification = searchParams.get('pending_verification')
  
  const [orderData, setOrderData] = useState<OrderData | null>(null)
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

useEffect(() => {
    async function fetchOrderData() {
      if (!reference) {
        setError('No reference provided')
        setIsLoading(false)
        return
      }

try {
        // CRITICAL: First verify the payment with the Django backend BEFORE trying to fetch order
        // This is required because the webhook may not be configured in Paystack dashboard
        // The Django backend verify endpoint will:
        // 1. Verify the payment with Paystack
        // 2. Update the order status from awaiting_payment to confirmed
        // 3. Set order.paystack_reference so the order can be found
        const verifyRes = await fetch(`${API_BASE_URL}/payments/verify/`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            // Include auth token if available for authenticated users
            ...(typeof window !== 'undefined' && window.localStorage.getItem('auth_token') 
              ? { 'Authorization': `Bearer ${window.localStorage.getItem('auth_token')}` }
              : {})
          },
          body: JSON.stringify({ reference }),
        })

        if (!verifyRes.ok) {
          const errorText = await verifyRes.text()
          console.warn('Payment verification response:', errorText)
          // Continue anyway - order might already be confirmed via webhook
        } else {
          const verifyData = await verifyRes.json()
          console.log('Payment verified successfully:', verifyData)
        }

        // Try to get order by paystack_reference (or order_id as fallback - they're the same)
        const res = await fetch(`${API_BASE_URL}/orders/?paystack_reference=${encodeURIComponent(reference)}`)
        
        let orderFound = false
        
        if (res.ok) {
          const data = await res.json()
          if (data.results && data.results.length > 0) {
            const order = data.results[0]
            setOrderData(order)
            orderFound = true
            
            // Also fetch payment data
            try {
              const paymentRes = await fetch(`${API_BASE_URL}/payments/?paystack_reference=${encodeURIComponent(reference)}`)
              if (paymentRes.ok) {
                const paymentJson = await paymentRes.json()
                if (paymentJson.results && paymentJson.results.length > 0) {
                  setPaymentData(paymentJson.results[0])
                }
              }
            } catch (e) {
              console.error('Failed to fetch payment data:', e)
            }
          }
        }
        
        // Fallback: try by order_id if paystack_reference didn't work
        if (!orderFound) {
          const fallbackRes = await fetch(`${API_BASE_URL}/orders/?order_id=${encodeURIComponent(reference)}`)
          if (fallbackRes.ok) {
            const data = await fallbackRes.json()
            if (data.results && data.results.length > 0) {
              const order = data.results[0]
              setOrderData(order)
              orderFound = true
            }
          }
        }
        
        if (!orderFound) {
          setError('Order not found. It may still be processing.')
        }
      } catch (e) {
        console.error('Error fetching order:', e)
        setError('Unable to load order details. Please contact support.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrderData()
  }, [reference])

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background flex items-center justify-center px-4">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading order details...</p>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (error) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background flex items-center justify-center px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-10 h-10 text-yellow-600" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Processing Your Order</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <p className="text-sm text-muted-foreground mb-6">
              If you paid successfully, your order confirmation email will be sent shortly.
              You can also check your order status in your account dashboard.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/account/orders">
                <Button>View My Orders</Button>
              </Link>
              <Link href="/">
                <Button variant="outline">Continue Shopping</Button>
              </Link>
            </div>
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
          <div className="max-w-3xl mx-auto">
            {/* Success Header */}
            <div className="text-center mb-10">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-14 h-14 text-green-600" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-green-600 mb-3">
                Payment Successful!
              </h1>
              <p className="text-lg text-muted-foreground mb-2">
                Thank you for your order, {orderData?.shipping_first_name}!
              </p>
              {reference && (
                <p className="text-sm text-muted-foreground">
                  Reference: <span className="font-mono font-medium">{reference}</span>
                </p>
              )}
            </div>

            {/* Pending Verification Notice */}
            {pendingVerification && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
                <div className="flex items-center gap-3 text-yellow-800">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <p className="text-sm">
                    Your payment is being verified. Order confirmation will be sent shortly.
                  </p>
                </div>
              </div>
            )}

            {/* Receipt */}
            {orderData && <OrderReceipt order={orderData} payment={paymentData} />}

            {/* Next Steps */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
              <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5" />
                What&apos;s Next?
              </h3>
              <ul className="text-sm text-blue-900 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  Order confirmation sent to {orderData?.shipping_email}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span>Order is being processed - typically ships within 3-5 business days</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span>Track your order in your account dashboard</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span>Get updates via email</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center mt-10">
              <Link href="/account/orders">
                <Button className="w-full sm:w-auto">
                  <Package className="w-4 h-4 mr-2" />
                  View My Orders
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full sm:w-auto">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
      <SuccessContent />
    </Suspense>
  )
}
