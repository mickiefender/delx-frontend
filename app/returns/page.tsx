'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RotateCcw, RefreshCcw, Download, Clock, Shield, CheckCircle, AlertCircle, ChevronDown, ChevronRight, Package, Mail, Phone } from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
}

const refundFAQs: FAQItem[] = [
  {
    question: 'What items cannot be returned?',
    answer: 'For hygiene and safety reasons, the following items cannot be returned: intimate apparel, swimwear, earrings, beauty products that have been opened or used, and items marked as "Final Sale" or "Non-Returnable." Additionally, items damaged due to improper use or washing are not eligible for return.',
  },
  {
    question: 'How long do I have to return an item?',
    answer: 'You have 7 days from the date of delivery to initiate a return. The item must be unused, in its original packaging, with all tags attached. We recommend initiating your return as soon as possible to ensure sufficient time for processing.',
  },
  {
    question: 'Who pays for return shipping?',
    answer: 'For domestic returns (within Ghana), we provide a prepaid return label for items that are defective or were mistakenly sent. For returns due to change of mind or preference, the buyer is responsible for return shipping costs. International buyers are responsible for all return shipping costs.',
  },
  {
    question: 'How long does it take to process a refund?',
    answer: 'Once we receive your returned item, we will inspect it within 3-5 business days. If approved, your refund will be processed to your original payment method. Please note that it may take 10-14 business days for the refund to appear in your account, depending on your bank.',
  },
  {
    question: 'Can I exchange an item instead of getting a refund?',
    answer: 'Yes, we offer exchanges subject to availability. To request an exchange, contact our support team with your order number and specify the item and size/color you would like instead. If the requested item is unavailable, we will offer a refund.',
  },
  {
    question: 'What if I received a defective item?',
    answer: 'We apologize for any inconvenience. If you receive a defective item, please contact us immediately with your order number and photos of the defect. We will arrange for a replacement at no additional cost and provide a prepaid return label for the defective item.',
  },
  {
    question: 'Can I return a gift I received?',
    answer: 'Yes, you can return gifts for store credit or an exchange. Please contact us with the order number or the name and address of the person who placed the order. We will be happy to assist you.',
  },
  {
    question: 'What if my refund is rejected?',
    answer: 'If your refund is rejected, we will notify you via email with the reason. Common reasons include: items returned after the 7-day window, items that are not in original condition, or items that have been used. If you believe your return was wrongly rejected, please contact us with additional information.',
  },
]

const returnProcess = [
  {
    step: 1,
    title: 'Initiate Return',
    description: 'Contact our support team via email orphone to request a return authorization.',
  },
  {
    step: 2,
    title: 'Receive Authorization',
    description: 'We will email you a return authorization form and prepaid label (if eligible).',
  },
  {
    step: 3,
    title: 'Pack & Ship',
    description: 'Pack the item securely with all original packaging and ship within 7 days.',
  },
  {
    step: 4,
    title: 'Receive Refund',
    description: 'Once inspected, your refund will be processed within 5-7 business days.',
  },
]

export default function ReturnsPage() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const [orderEmail, setOrderEmail] = useState('')

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="bg-primary text-primary-foreground px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <RotateCcw className="w-16 h-16 mx-auto mb-4 opacity-90" />
            <h1 className="text-3xl sm:text-4xl font-semibold mb-4">Returns & Refunds</h1>
            <p className="text-lg opacity-90">
              Hassle-free returns within 7 days of delivery.
            </p>
          </div>
        </div>

        {/* Return Policy Highlights */}
        <div className="px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-6 bg-card border border-border rounded-lg text-center">
                <Clock className="w-10 h-10 text-accent mx-auto mb-3" />
                <h3 className="font-semibold mb-2">7-Day Window</h3>
                <p className="text-sm text-muted-foreground">
                  Return eligible items within 7 days of delivery
                </p>
              </div>
              <div className="p-6 bg-card border border-border rounded-lg text-center">
                <RefreshCcw className="w-10 h-10 text-accent mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Easy Process</h3>
                <p className="text-sm text-muted-foreground">
                  Simple return authorization in 24 hours
                </p>
              </div>
              <div className="p-6 bg-card border border-border rounded-lg text-center">
                <Shield className="w-10 h-10 text-accent mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Full Refund</h3>
                <p className="text-sm text-muted-foreground">
                  Get your money back within 14 business days
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Eligible Items */}
        <div className="px-4 sm:px-6 lg:px-8 py-12 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold mb-6">Return Eligibility</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Eligible for Return
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Unused items with tags attached</li>
                  <li>• Items in original packaging</li>
                  <li>• Items with all accessories included</li>
                  <li>• Defective or damaged items</li>
                  <li>• Wrong items delivered</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  Not Eligible for Return
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Intimate apparel and swimwear</li>
                  <li>• Earrings (hygiene reasons)</li>
                  <li>• Opened beauty products</li>
                  <li>• Items marked "Final Sale"</li>
                  <li>• Items damaged by user error</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Return Process */}
        <div className="px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold mb-6">How to Return an Item</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {returnProcess.map((step) => (
                <div key={step.step} className="p-4 border border-border rounded-lg">
                  <div className="w-8 h-8 bg-accent text-accent-foreground rounded-full flex items-center justify-center font-semibold mb-3">
                    {step.step}
                  </div>
                  <h3 className="font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Start Return */}
        <div className="px-4 sm:px-6 lg:px-8 py-12 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold mb-6">Initiate a Return</h2>
            <p className="text-muted-foreground mb-6">
              To start a return, please contact our support team. You will need your order number and the email address used for the order.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="mailto:support@delchris.com?subject=Return%20Request"
                className="px-6 py-3 bg-accent text-accent-foreground rounded-lg font-medium hover:bg-accent/90 transition-colors inline-flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Email Support
              </a>
              <a
                href="tel:+233123456789"
                className="px-6 py-3 border border-border rounded-lg font-medium hover:bg-muted transition-colors inline-flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                Call Us
              </a>
            </div>
          </div>
        </div>

        {/* Refund Information */}
        <div className="px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold mb-6">Refund Information</h2>
            <div className="space-y-4">
              <div className="p-4 border border-border rounded-lg">
                <h3 className="font-semibold mb-2">Refund Timeline</h3>
                <p className="text-sm text-muted-foreground">
                  We process refunds within 5-7 business days after receiving and inspecting your returned item. Once processed, refunds may take 10-14 business days to appear in your account, depending on your bank or payment provider.
                </p>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <h3 className="font-semibold mb-2">Refund Method</h3>
                <p className="text-sm text-muted-foreground">
                  Refunds are credited to the original payment method used for the purchase. If the original payment method is no longer available, we will contact you to arrange an alternative refund method. Store credit refunds are processed immediately and do not have a waiting period.
                </p>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <h3 className="font-semibold mb-2">Partial Refunds</h3>
                <p className="text-sm text-muted-foreground">
                  If your return is approved but the item is not in its original condition, we may offer a partial refund. This is determined on a case-by-case basis after inspection of the returned item.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="px-4 sm:px-6 lg:px-8 py-12 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-2">
              {refundFAQs.map((faq, index) => (
                <div
                  key={index}
                  className="border border-border rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-muted/30 transition-colors"
                  >
                    <span className="font-medium pr-4">{faq.question}</span>
                    {expandedIndex === index ? (
                      <ChevronDown className="w-5 h-5 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-5 h-5 flex-shrink-0" />
                    )}
                  </button>
                  {expandedIndex === index && (
                    <div className="px-6 pb-4 pt-0 border-t border-border">
                      <p className="text-muted-foreground mt-4">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-xl font-semibold mb-4">Need Help With a Return?</h2>
            <p className="text-muted-foreground mb-6">
              Our support team is here to assist you with any questions about returns or refunds.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/contact"
                className="px-6 py-3 bg-accent text-accent-foreground rounded-lg font-medium hover:bg-accent/90 transition-colors inline-block"
              >
                Contact Us
              </Link>
              <Link
                href="/faq"
                className="px-6 py-3 border border-border rounded-lg font-medium hover:bg-muted transition-colors inline-block"
              >
                View All FAQs
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
