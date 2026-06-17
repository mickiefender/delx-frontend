import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

interface PaystackWebhookEvent {
  event: string
  data: {
    id: number
    reference: string
    amount: number
    status: string
    paid_at: string
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

/**
 * Verify Paystack webhook signature
 */
function verifyPaystackSignature(body: string, signature: string): boolean {
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY || '')
    .update(body)
    .digest('hex')

  return hash === signature
}

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(event: PaystackWebhookEvent) {
  const { data } = event
  const { reference, amount, customer, metadata } = data

  console.log(`[Paystack] Payment successful for reference: ${reference}`)
  console.log(`[Paystack] Amount: ${amount / 100} GHS`)
  console.log(`[Paystack] Customer: ${customer.email}`)

  // Persist payment confirmation to Django order
  // Here `reference` is expected to be the Order.order_id.
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  const confirmUrl = `${apiBaseUrl}/api/v1/orders/confirm-by-id/`

  const confirmRes = await fetch(confirmUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order_id: reference }),
  })

  if (!confirmRes.ok) {
    const confirmJson = await confirmRes.json().catch(() => ({}))
    console.error('[Paystack] Failed to confirm order in DB', confirmRes.status, confirmJson)
    // Still return 200 to Paystack to avoid retries, but log the issue.
  }

  return {
    success: true,
    message: 'Payment processed successfully',
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(event: PaystackWebhookEvent) {
  const { data } = event
  const { reference, customer } = data

  console.error(`[Paystack] Payment failed for reference: ${reference}`)
  console.error(`[Paystack] Customer: ${customer.email}`)

  // In a real app, you would:
  // 1. Update order status to failed
  // 2. Send failure notification email
  // 3. Allow user to retry

  // Example database update (pseudo-code):
  /*
  await db.orders.update({
    where: { reference },
    data: {
      status: 'payment_failed',
      failedAt: new Date(),
    }
  })
  */

  return {
    success: true,
    message: 'Payment failure recorded',
  }
}

/**
 * Handle charge success event
 */
async function handleChargeSuccess(event: PaystackWebhookEvent) {
  const { data } = event

  // This is the most reliable event for payment confirmation
  return handlePaymentSuccess({
    ...event,
    event: 'charge.success',
  })
}

/**
 * Main webhook handler
 */
export async function POST(request: NextRequest) {
  try {
    // Get request body as text for signature verification
    const rawBody = await request.text()
    const signature = request.headers.get('x-paystack-signature') || ''

    // Verify webhook signature
    if (!verifyPaystackSignature(rawBody, signature)) {
      console.error('[Paystack] Invalid webhook signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    // Parse the event
    const event = JSON.parse(rawBody) as PaystackWebhookEvent

    console.log(`[Paystack] Received webhook event: ${event.event}`)

    // Handle different event types
    switch (event.event) {
      case 'charge.success':
        await handleChargeSuccess(event)
        break

      case 'invoice.payment_requested':
        console.log(`[Paystack] Invoice payment requested for: ${event.data.reference}`)
        break

      case 'invoice.create':
        console.log(`[Paystack] Invoice created for: ${event.data.reference}`)
        break

      case 'invoice.update':
        console.log(`[Paystack] Invoice updated for: ${event.data.reference}`)
        break

      case 'invoice.finalize':
        console.log(`[Paystack] Invoice finalized for: ${event.data.reference}`)
        break

      case 'invoice.archive':
        console.log(`[Paystack] Invoice archived for: ${event.data.reference}`)
        break

      case 'invoice.mark.as.sent':
        console.log(`[Paystack] Invoice marked as sent for: ${event.data.reference}`)
        break

      case 'invoice.mark.as.draft':
        console.log(`[Paystack] Invoice marked as draft for: ${event.data.reference}`)
        break

      case 'invoice.mark.as.paid':
        console.log(`[Paystack] Invoice marked as paid for: ${event.data.reference}`)
        break

      case 'transfer.success':
        console.log(`[Paystack] Transfer successful for reference: ${event.data.reference}`)
        break

      case 'transfer.failed':
        console.log(`[Paystack] Transfer failed for reference: ${event.data.reference}`)
        break

      case 'transfer.reversed':
        console.log(`[Paystack] Transfer reversed for reference: ${event.data.reference}`)
        break

      default:
        console.log(`[Paystack] Unhandled webhook event: ${event.event}`)
    }

    // Always return 200 OK to acknowledge receipt
    return NextResponse.json({
      success: true,
      event: event.event,
    })
  } catch (error) {
    console.error('[Paystack] Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
