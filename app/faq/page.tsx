'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Search, ChevronDown, ChevronRight, ShoppingBag, CreditCard, Truck, RotateCcw, User, Package } from 'lucide-react'

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
}

const faqItems: FAQItem[] = [
  // Orders & Shopping
  {
    id: 'track-order',
    question: 'How can I track my order?',
    answer: 'You can track your order by visiting the "Orders" section in your account dashboard. Once your order ships, you will receive a tracking number via email. You can also track your order using the tracking number on our website or the carrier\'s website. For more details, visit our Shipping Info page.',
    category: 'orders',
  },
  {
    id: 'change-order',
    question: 'Can I modify or cancel my order after placing it?',
    answer: 'We process orders quickly to ensure fast delivery. If you need to modify or cancel your order, please contact our customer service team as soon as possible. We will do our best to accommodate your request if the order has not yet been processed or shipped. You can reach us at support@delchris.com or call +233 (0) 123 456 789.',
    category: 'orders',
  },
  {
    id: 'order-not-received',
    question: 'What should I do if I don\'t receive my order?',
    answer: 'If you haven\'t received your order within the estimated delivery time, please check your tracking information first. If the tracking shows delivered but you haven\'t received the package, please contact us within 48 hours. We will work with the carrier to resolve the issue. Please also check with neighbors or building management in case the package was delivered elsewhere.',
    category: 'orders',
  },
  {
    id: 'wrong-item',
    question: 'What if I receive the wrong item?',
    answer: 'We apologize for any inconvenience. If you receive the wrong item, please contact our customer service team immediately with your order number and a photo of the item received. We will arrange for the correct item to be sent and provide a prepaid return label for the incorrect item.',
    category: 'orders',
  },
  {
    id: 'damage-receipt',
    question: 'What if my item arrives damaged?',
    answer: 'If your item arrives damaged, please do not accept the delivery if possible. Take photos of the damage and contact us within 48 hours. We will arrange for a replacement or refund. Please include your order number and photos in your email to support@delchris.com.',
    category: 'orders',
  },

  // Payments
  {
    id: 'payment-methods',
    question: 'What payment methods do you accept?',
    answer: 'We accept multiple payment methods including credit/debit cards (Visa, MasterCard, American Express), mobile money (MTN MoMo, Vodafone Cash, AirtelTigo Money), and bank transfers. All payments are processed securely through our encrypted payment partners.',
    category: 'payments',
  },
  {
    id: 'currency',
    question: 'What currency are prices in?',
    answer: 'All prices on our website are displayed in Ghana Cedis (GHS). If you are browsing from another country, prices may be converted by your payment provider based on current exchange rates.',
    category: 'payments',
  },
  {
    id: 'promo-code',
    question: 'How do I use a promo code or coupon?',
    answer: 'To use a promo code, enter it in the "Promo Code" or "Coupon" field during checkout and click "Apply". The discount will be reflected in your order total. Please note that only one promo code can be used per order, and some codes may have restrictions on eligible products.',
    category: 'payments',
  },
  {
    id: 'payment-failed',
    question: 'What if my payment fails?',
    answer: 'If your payment fails, please check that your card is valid and has sufficient funds. Ensure the billing address matches your card details. If the issue persists, try a different payment method or contact your bank. You can also use mobile money or bank transfer as alternatives.',
    category: 'payments',
  },

  // Shipping
  {
    id: 'delivery-time',
    question: 'How long will delivery take?',
    answer: 'Delivery times vary by location: Accra Metro: 1-3 business days, Other Ghana regions: 3-5 business days, West Africa: 5-10 business days. Note that orders are processed within 1-2 business days. Delivery times are estimates and not guaranteed. Custom orders may require additional processing time.',
    category: 'shipping',
  },
  {
    id: 'shipping-cost',
    question: 'How much does shipping cost?',
    answer: 'Shipping rates: Accra Metro: GHS 15, Other Ghana regions: GHS 25-50, West Africa: GHS 50-150. Free shipping is available on orders over GHS 500 within Ghana. International shipping costs vary by destination.',
    category: 'shipping',
  },
  {
    id: 'international-shipping',
    question: 'Do you ship internationally?',
    answer: 'Yes, we ship to most countries in West Africa and worldwide. International shipping costs and delivery times vary by destination. Please note that international orders may be subject to customs duties and taxes, which are the responsibility of the buyer.',
    category: 'shipping',
  },
  {
    id: 'single-location',
    question: 'Can I only ship to one address per order?',
    answer: 'Yes, each order can only be shipped to a single address. If you need items shipped to different addresses, please place separate orders for each address.',
    category: 'shipping',
  },

  // Returns
  {
    id: 'return-eligible',
    question: 'Which items can I return?',
    answer: 'We accept returns of most items within 7 days of delivery for a full refund or exchange. Items must be unused, in original packaging with all tags attached. Some items are final sale: intimate apparel, swimwear, earrings, and items marked as non-returnable. Sale items may have modified return terms.',
    category: 'returns',
  },
  {
    id: 'return-process',
    question: 'How do I return an item?',
    answer: 'To return an item: 1) Contact our support team with your order number, 2) Request a return authorization, 3) Pack the item securely with all original packaging, 4) Use the prepaid label provided (for domestic returns), 5) Ship within 7 days of authorization. For detailed instructions, visit our Returns & Refunds page.',
    category: 'returns',
  },
  {
    id: 'refund-status',
    question: 'Where is my refund?',
    answer: 'Refunds are processed within 5-7 business days after we receive and inspect your return. The refund will be credited to your original payment method. Please note that it may take 10-14 business days for the refund to appear in your account, depending on your bank. If you have not received your refund after 14 days, please contact your bank first, then reach out to us.',
    category: 'returns',
  },
  {
    id: 'exchange',
    question: 'Can I exchange an item for a different size or color?',
    answer: 'Yes, we offer exchanges subject to availability. To request an exchange, contact our support team with your order number and the item you wish to exchange. If the requested item is unavailable, we will offer a refund or alternative. Exchanges are processed similarly to returns.',
    category: 'returns',
  },

  // Account
  {
    id: 'create-account',
    question: 'How do I create an account?',
    answer: 'Click "Sign Up" or "Create Account" on our website. Enter your email, create a password, and fill in your details. You can also create an account during checkout. Having an account allows you to track orders, save favorites, and enjoy a faster checkout.',
    category: 'account',
  },
  {
    id: 'reset-password',
    question: 'How do I reset my password?',
    answer: 'Click "Forgot Password" on the login page. Enter your email address and we will send you a password reset link. Check your spam folder if you don\'t receive the email within a few minutes. The link expires after 24 hours.',
    category: 'account',
  },
  {
    id: 'update-info',
    question: 'How do I update my account information?',
    answer: 'Log into your account and go to "Account Settings" or "Profile". From there, you can update your name, email, phone number, shipping addresses, and communication preferences. For security, password changes require your current password.',
    category: 'account',
  },
]

const categories = [
  { id: 'orders', label: 'Orders & Shopping', icon: ShoppingBag },
  { id: 'payments', label: 'Payments & Pricing', icon: CreditCard },
  { id: 'shipping', label: 'Shipping & Delivery', icon: Truck },
  { id: 'returns', label: 'Returns & Refunds', icon: RotateCcw },
  { id: 'account', label: 'Account & Profile', icon: User },
]

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const filteredFAQs = faqItems.filter((faq) => {
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="bg-primary text-primary-foreground px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl font-semibold mb-4">Frequently Asked Questions</h1>
            <p className="text-lg opacity-90">
              Find answers to common questions about shopping with Delchris.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 sm:px-6 lg:px-8 py-8 border-b border-border">
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-60" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="px-4 sm:px-6 lg:px-8 py-6 border-b border-border">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-muted hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                    selectedCategory === cat.id
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-muted hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <cat.icon className="w-4 h-4" />
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ List */}
        <div className="px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto">
            {filteredFAQs.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg text-muted-foreground mb-4">No FAQs found matching your search.</p>
                <p className="text-sm text-muted-foreground">
                  Try different keywords or browse all categories.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredFAQs.map((faq) => (
                  <div
                    key={faq.id}
                    className="border border-border rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-muted/30 transition-colors"
                    >
                      <span className="font-medium pr-4">{faq.question}</span>
                      {expandedId === faq.id ? (
                        <ChevronDown className="w-5 h-5 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-5 h-5 flex-shrink-0" />
                      )}
                    </button>
                    {expandedId === faq.id && (
                      <div className="px-6 pb-4 pt-0 border-t border-border">
                        <p className="text-muted-foreground mt-4">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Still Have Questions */}
        <div className="px-4 sm:px-6 lg:px-8 py-12 bg-muted/30">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-xl font-semibold mb-4">Still Have Questions?</h2>
            <p className="text-muted-foreground mb-6">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/contact"
                className="px-6 py-3 bg-accent text-accent-foreground rounded-lg font-medium hover:bg-accent/90 transition-colors inline-block"
              >
                Contact Us
              </Link>
              <Link
                href="/help"
                className="px-6 py-3 border border-border rounded-lg font-medium hover:bg-muted transition-colors inline-block"
              >
                Visit Help Center
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
