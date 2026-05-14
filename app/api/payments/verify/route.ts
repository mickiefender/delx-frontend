import { NextRequest, NextResponse } from 'next/server'

interface VerifyPaymentRequest {
  reference: string
}

interface PaystackVerifyResponse {
  status: boolean
  message: string
  data?: {
    id: number
    reference: string
    amount: number
    paid_at: string
    status: string
    customer: {
      id: number
      email: string
      phone?: string
    }
    metadata?: {
      phone?: string
      payment_method?: string
      mobile_money_provider?: string
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as VerifyPaymentRequest

    const { reference } = body

    if (!reference) {
      return NextResponse.json(
        { error: 'Missing reference' },
        { status: 400 }
      )
    }

    // Verify payment with Paystack
    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    )

    const verifyData = (await verifyResponse.json()) as PaystackVerifyResponse

    if (!verifyResponse.ok) {
      return NextResponse.json(
        { error: verifyData.message || 'Failed to verify payment' },
        { status: verifyResponse.status }
      )
    }

    if (verifyData.status && verifyData.data?.status === 'success') {
      // Payment was successful
      return NextResponse.json({
        success: true,
        data: {
          reference: verifyData.data.reference,
          amount: verifyData.data.amount / 100, // Convert from kobo to GHS
          email: verifyData.data.customer.email,
          phone: verifyData.data.metadata?.phone,
          paymentMethod: verifyData.data.metadata?.payment_method,
          status: 'success',
          paidAt: verifyData.data.paid_at,
        },
      })
    } else {
      // Payment failed or pending
      return NextResponse.json({
        success: false,
        data: {
          reference: verifyData.data?.reference || reference,
          status: verifyData.data?.status || 'failed',
        },
      })
    }
  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
