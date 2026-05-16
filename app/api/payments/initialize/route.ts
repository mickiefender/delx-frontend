import { NextRequest, NextResponse } from 'next/server'

interface InitializePaymentRequest {
  email: string
  amount: number
  orderId: string
  phone: string
  paymentMethod: 'card' | 'mobile_money' | 'bank_transfer'
  mobileMoneyProvider?: 'mtn' | 'telecel' | 'airteltigo'
  orderPayload?: Record<string, unknown>
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as InitializePaymentRequest

    const { email, amount, orderId, phone, paymentMethod, mobileMoneyProvider, orderPayload } = body

    if (!email || !amount || !orderId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 1) Create the Django order (DB persistence) before initializing Paystack
    // Normalize NEXT_PUBLIC_API_URL to always point at ".../api/v1"
    const apiBaseUrl =
      (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1').replace(/\/api\/v1\/?$/, '/api/v1')
    const ordersUrl = `${apiBaseUrl}/orders/`

    const createOrderPayload: Record<string, unknown> = {
      ...(orderPayload || {}),
      // ensure the payment reference maps to the order we create
      // NOTE: for this to work, backend must accept `order_id` in OrderCreateSerializer
      order_id: orderId,
    }

    const createOrderRes = await fetch(ordersUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(createOrderPayload),
    })

    const createOrderText = await createOrderRes.text()
    const createOrderLooksJson = createOrderText.trim().startsWith('{') || createOrderText.trim().startsWith('[')
    const createOrderJson = createOrderLooksJson ? JSON.parse(createOrderText) : null

    if (!createOrderRes.ok) {
      return NextResponse.json(
        {
          error: createOrderJson?.error || 'Failed to create order',
          details: createOrderJson ?? { raw: createOrderText.slice(0, 500) },
          status: createOrderRes.status,
          url: ordersUrl,
        },
        { status: createOrderRes.status || 400 }
      )
    }

    const createdOrder = createOrderJson ?? {}
    const paystackReference = createdOrder?.order_id || orderId

    // Validate amount (Paystack works in kobo - smallest currency unit)
    const amountInKobo = Math.round(amount * 100)

    if (amountInKobo < 100) {
      return NextResponse.json(
        { error: 'Amount must be at least GHS 0.01' },
        { status: 400 }
      )
    }

    // Call Paystack API to initialize payment
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
      body: JSON.stringify({
        email,
        amount: amountInKobo,
        reference: paystackReference,
        metadata: {
          phone,
          payment_method: paymentMethod,
          mobile_money_provider: mobileMoneyProvider || null,
        },
        channels: getPaymentChannels(paymentMethod, mobileMoneyProvider),
      }),
    })

    const paystackText = await paystackResponse.text()
    const paystackLooksJson =
      paystackText.trim().startsWith('{') || paystackText.trim().startsWith('[')

    const paystackData = paystackLooksJson
      ? JSON.parse(paystackText)
      : null

    if (!paystackResponse.ok) {
      return NextResponse.json(
        {
          error:
            paystackData?.message ||
            'Failed to initialize payment',
          raw:
            paystackLooksJson ? paystackData : paystackText.slice(0, 500),
        },
        { status: paystackResponse.status }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        authorizationUrl: paystackData.data.authorization_url,
        accessCode: paystackData.data.access_code,
        reference: paystackData.data.reference,
      },
    })
  } catch (error) {
    console.error('Payment initialization error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function getPaymentChannels(
  paymentMethod: string,
  mobileMoneyProvider?: string
): string[] {
  const channels: string[] = []

  if (paymentMethod === 'card') {
    channels.push('card')
  } else if (paymentMethod === 'mobile_money') {
    if (mobileMoneyProvider === 'mtn') {
      channels.push('mobile_money')
    } else if (mobileMoneyProvider === 'telecel') {
      channels.push('mobile_money')
    } else if (mobileMoneyProvider === 'airteltigo') {
      channels.push('mobile_money')
    } else {
      channels.push('mobile_money')
    }
  } else if (paymentMethod === 'bank_transfer') {
    channels.push('bank_transfer')
  }

  return channels.length > 0 ? channels : ['card']
}
