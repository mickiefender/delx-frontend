'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { XCircle, AlertTriangle, ArrowLeft, HelpCircle, RefreshCw } from 'lucide-react'

function FailureContent() {
  const searchParams = useSearchParams()
  const reference = searchParams.get('reference')
  const errorType = searchParams.get('error')
  
  const [isRetrying, setIsRetrying] = useState(false)

  const getErrorMessage = () => {
    switch (errorType) {
      case 'no_reference':
        return 'Payment reference was not found. Please try again.'
      case 'verification_failed':
        return 'We could not verify your payment. Please check your payment method and try again.'
      case 'verification_error':
        return 'An error occurred while verifying your payment. Please contact support.'
      case 'cancelled':
        return 'Payment was cancelled. You can try again if you still want to complete your purchase.'
      default:
        return 'There was an issue processing your payment. Please try again or contact support.'
    }
  }

  const getErrorTitle = () => {
    switch (errorType) {
      case 'cancelled':
        return 'Payment Cancelled'
      default:
        return 'Payment Failed'
    }
  }

  const handleRetry = () => {
    setIsRetrying(true)
    // Go back to checkout/cart to try again
    window.location.href = '/cart'
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md mx-auto text-center">
          {/* Error Icon */}
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-14 h-14 text-red-600" />
          </div>
          
          {/* Error Title */}
          <h1 className="text-2xl sm:text-3xl font-bold mb-4">
            {getErrorTitle()}
          </h1>
          
          {/* Error Message */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3 text-left">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-800">
                {getErrorMessage()}
              </p>
            </div>
          </div>
          
          {/* Reference if available */}
          {reference && (
            <p className="text-sm text-muted-foreground mb-6">
              Reference: <span className="font-mono font-medium">{reference}</span>
            </p>
          )}
          
          {/* Help Text */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3 text-left">
              <HelpCircle className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-1">Need Help?</p>
                <ul className="space-y-1">
                  <li>• Check your mobile money/bank account for any deduction</li>
                  <li>• Ensure you have sufficient funds</li>
                  <li>• Contact your bank for more information</li>
                  <li>• Or try a different payment method</li>
                </ul>
              </div>
            </div>
          </div>
          
{/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="outline" 
              onClick={handleRetry}
              disabled={isRetrying}
              className="w-full sm:w-auto"
            >
              {isRetrying ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ArrowLeft className="w-4 h-4 mr-2" />
              )}
              Try Again
            </Button>
            <Link href="/contact" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full">
                Contact Support
              </Button>
            </Link>
            <Link href="/" className="w-full sm:w-auto">
              <Button variant="default" className="w-full">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default function FailurePage() {
  return (
    <Suspense
      fallback={
        <>
          <Header />
          <main className="min-h-screen bg-background flex items-center justify-center px-4">
            <div className="text-muted-foreground">Loading payment status...</div>
          </main>
          <Footer />
        </>
      }
    >
      <FailureContent />
    </Suspense>
  )
}
