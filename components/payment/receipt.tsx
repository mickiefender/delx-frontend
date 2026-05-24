'use client'

import { useState } from 'react'
import { CheckCircle, Download, Printer, Receipt, CreditCard, Smartphone, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface OrderItem {
  id: number
  product_name: string
  product_image?: string
  sku?: string
  price: string
  quantity: number
  subtotal: string
}

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

interface PaymentData {
  amount: string
  payment_method: string
  currency?: string
  status: string
  created_at?: string
}

interface OrderReceiptProps {
  order: OrderData
  payment?: PaymentData | null
}

export function OrderReceipt({ order, payment }: OrderReceiptProps) {
  const [showPrint, setShowPrint] = useState(false)
  
  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
    }).format(numPrice)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return new Date().toLocaleDateString('en-GH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    return new Date(dateString).toLocaleDateString('en-GH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getPaymentMethodIcon = (method?: string) => {
    switch (method) {
      case 'card':
        return <CreditCard className="w-4 h-4" />
      case 'mobile_money':
        return <Smartphone className="w-4 h-4" />
      case 'bank_transfer':
        return <Building2 className="w-4 h-4" />
      default:
        return <CreditCard className="w-4 h-4" />
    }
  }

  const getPaymentMethodName = (method?: string) => {
    switch (method) {
      case 'card':
        return 'Credit/Debit Card'
      case 'mobile_money':
        return 'Mobile Money'
      case 'bank_transfer':
        return 'Bank Transfer'
      default:
        return method || 'Unknown'
    }
  }

  const handlePrint = () => {
    setShowPrint(true)
    setTimeout(() => {
      window.print()
      setShowPrint(false)
    }, 100)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      {/* Receipt Header */}
      <div className="bg-primary px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Receipt className="w-6 h-6 text-white" />
          <div>
            <h2 className="text-lg font-bold text-white">Official Receipt</h2>
            <p className="text-sm text-primary-foreground/80">Order #{order.order_id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-green-100 text-sm bg-green-600/20 px-3 py-1 rounded-full">
            <CheckCircle className="w-3 h-3" />
            Paid
          </span>
        </div>
      </div>

      {/* Receipt Body */}
      <div className="p-6 space-y-6">
        {/* Order Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Customer Information</h3>
            <div className="space-y-1">
              <p className="font-medium">{order.shipping_first_name} {order.shipping_last_name}</p>
              <p className="text-sm text-muted-foreground">{order.shipping_email}</p>
              <p className="text-sm text-muted-foreground">{order.shipping_phone}</p>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Shipping Address</h3>
            <p className="text-sm">{order.shipping_address}</p>
            <p className="text-sm text-muted-foreground">
              {order.shipping_city}, {order.shipping_state}
            </p>
            <p className="text-sm text-muted-foreground">{order.shipping_country}</p>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Items Table */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Items Ordered</h3>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Qty</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {order.items?.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-sm">{item.product_name}</p>
                      {item.sku && (
                        <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">{item.quantity}</td>
                    <td className="px-4 py-3 text-right text-sm">{formatPrice(item.price)}</td>
                    <td className="px-4 py-3 text-right text-sm font-medium">{formatPrice(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Order Summary */}
        <div className="flex justify-end">
          <div className="w-full max-w-xs">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {parseFloat(order.shipping_cost || '0') > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{formatPrice(order.shipping_cost)}</span>
                </div>
              )}
              {parseFloat(order.tax_amount || '0') > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatPrice(order.tax_amount)}</span>
                </div>
              )}
              {parseFloat(order.discount_amount || '0') > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-{formatPrice(order.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>{formatPrice(order.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Payment Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Payment Details</h3>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {getPaymentMethodIcon(payment?.payment_method || order.status)}
                <span className="text-sm">{getPaymentMethodName(payment?.payment_method)}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Amount Paid: <span className="font-medium text-green-600">{formatPrice(payment?.amount || order.total_amount)}</span>
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Order Date</h3>
            <p className="text-sm">{formatDate(order.created_at)}</p>
          </div>
        </div>
      </div>

      {/* Receipt Footer Actions */}
      <div className="bg-gray-50 px-6 py-4 flex items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">
          Thank you for shopping with us!
        </p>
        <div className="flex items-center gap-2 print:hidden">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .bg-white, .bg-white * {
            visibility: visible;
          }
          .bg-white {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none;
            box-shadow: none;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
