import { NextRequest, NextResponse } from 'next/server'

/**
 * Paystack Callback Handler
 * 
 * This endpoint handles the redirect from Paystack after payment.
 * It validates the payment reference and redirects the user to the success or failure page.
 * 
 * Query parameters:
 * - reference: Paystack payment reference
 * - trx: Transaction reference (our internal reference)
 */

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    // Get references from Paystack redirect
    const paystackReference = searchParams.get('reference')
    const trxReference = searchParams.get('trx')
    
    // Use whichever reference we can find
    const reference = paystackReference || trxReference
    
    if (!reference) {
      console.error('Paystack callback: No reference found')
      return NextResponse.redirect(new URL('/orders/failure?error=no_reference', request.url))
    }
    
    // Verify payment directly with Paystack API
    // This bypasses Django's Payment record which may not exist when frontend skips payment/initialize
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY
    
    if (!paystackSecretKey) {
      console.error('Paystack callback: Missing PAYSTACK_SECRET_KEY')
      const failureUrl = new URL('/orders/failure', request.url)
      failureUrl.searchParams.set('error', 'server_config_error')
      return NextResponse.redirect(failureUrl)
    }
    
    try {
      const verifyResponse = await fetch(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${paystackSecretKey}`,
            'Content-Type': 'application/json',
          },
        }
      )
      
      if (verifyResponse.ok) {
        const data = await verifyResponse.json()
        
        if (data.status === true && data.data?.status === 'success') {
          // Payment successful - redirect to success page with reference
          console.log('Paystack callback: Payment verified successfully', { reference })
          const successUrl = new URL('/orders/success', request.url)
          successUrl.searchParams.set('reference', reference)
          return NextResponse.redirect(successUrl)
        } else {
          // Payment not successful
          console.error('Paystack callback: Payment not successful', { 
            reference, 
            status: data.data?.status,
            message: data.message 
          })
          const failureUrl = new URL('/orders/failure', request.url)
          failureUrl.searchParams.set('reference', reference)
          failureUrl.searchParams.set('error', 'payment_not_successful')
          return NextResponse.redirect(failureUrl)
        }
      } else {
        // Paystack API error
        const errorText = await verifyResponse.text()
        console.error('Paystack callback: Paystack API error', {
          status: verifyResponse.status,
          reference,
          error: errorText,
        })
        const failureUrl = new URL('/orders/failure', request.url)
        failureUrl.searchParams.set('reference', reference)
        failureUrl.searchParams.set('error', 'verification_failed')
        return NextResponse.redirect(failureUrl)
      }
    } catch (error) {
      console.error('Paystack callback: Error verifying payment:', error)
      
      // Payment verification failed - redirect to failure page
      const failureUrl = new URL('/orders/failure', request.url)
      failureUrl.searchParams.set('reference', reference)
      failureUrl.searchParams.set('error', 'verification_error')
      return NextResponse.redirect(failureUrl)
    }
    
  } catch (error) {
    console.error('Paystack callback error:', error)
    
    const failureUrl = new URL('/orders/failure', request.url)
    failureUrl.searchParams.set('error', 'unknown_error')
    return NextResponse.redirect(failureUrl)
  }
}
