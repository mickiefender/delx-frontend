'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Search, Phone, Mail, MessageCircle, ChevronDown, ChevronRight, Clock, MapPin, ShoppingBag, CreditCard, Truck, RotateCcw, Package } from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
}

const helpCategories = [
  {
    icon: ShoppingBag,
    title: 'Orders & Shopping',
    description: 'How to place orders, track shipments, and manage your purchases',
    link: '/faq',
  },
  {
    icon: CreditCard,
    title: 'Payments & Pricing',
    description: 'Payment methods, pricing, discounts, and gift cards',
    link: '/faq',
  },
  {
    icon: Truck,
    title: 'Shipping & Delivery',
    description: 'Delivery times, shipping costs, and international shipping',
    link: '/shipping',
  },
  {
    icon: RotateCcw,
    title: 'Returns & Refunds',
    description: 'Return process, refund timelines, and exchange options',
    link: '/returns',
  },
]

const quickLinks = [
  { label: 'How do I track my order?', href: '/faq#track-order' },
  { label: 'What payment methods do you accept?', href: '/faq#payment-methods' },
  { label: 'How long does delivery take?', href: '/shipping#delivery-time' },
  { label: 'How do I return a product?', href: '/returns#process' },
  { label: 'Can I change my order?', href: '/faq#change-order' },
  { label: 'Where is my refund?', href: '/returns#refund-status' },
]

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="bg-primary text-primary-foreground px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl font-semibold mb-4">Help Center</h1>
            <p className="text-lg opacity-90 mb-8">
              How can we help you today? Search our knowledge base or browse below.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-60" />
              <input
                type="text"
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-lg text-foreground placeholder-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent text-lg"
              />
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="px-4 sm:px-6 lg:px-8 py-8 border-b border-border">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-lg font-semibold mb-4">Popular Topics</h2>
            <div className="flex flex-wrap gap-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 bg-muted rounded-full text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Help Categories */}
        <div className="px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold mb-6">Browse by Category</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {helpCategories.map((category) => (
                <Link
                  key={category.title}
                  href={category.link}
                  className="p-6 border border-border rounded-lg hover:border-accent hover:shadow-md transition-all group"
                >
                  <category.icon className="w-8 h-8 text-accent mb-3" />
                  <h3 className="font-semibold mb-2 group-hover:text-accent transition-colors">
                    {category.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Options */}
        <div className="px-4 sm:px-6 lg:px-8 py-12 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold mb-6 text-center">Still Need Help?</h2>
            <p className="text-center text-muted-foreground mb-8">
              Our support team is available to assist you with any questions.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-6 bg-card border border-border rounded-lg text-center">
                <Phone className="w-8 h-8 text-accent mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Call Us</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Available Mon-Sat, 9AM - 6PM
                </p>
                <a
                  href="tel:+233123456789"
                  className="text-accent hover:underline text-sm font-medium"
                >
                  +233 (0) 20 898 3545
                </a>
              </div>

              <div className="p-6 bg-card border border-border rounded-lg text-center">
                <Mail className="w-8 h-8 text-accent mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Email Support</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  We reply within 24 hours
                </p>
                <a
                  href="mailto:support@delchris.com"
                  className="text-accent hover:underline text-sm font-medium"
                >
                  support@delchris.com
                </a>
              </div>

              <div className="p-6 bg-card border border-border rounded-lg text-center">
                <MessageCircle className="w-8 h-8 text-accent mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Live Chat</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Available 24/7 for instant help
                </p>
                <Button size="sm">Start Chat</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Business Hours */}
        <div className="px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold mb-6">Business Hours</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <Clock className="w-6 h-6 text-accent flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">Customer Service</h3>
                  <p className="text-sm text-muted-foreground">Monday - Friday: 9AM - 6PM GMT</p>
                  <p className="text-sm text-muted-foreground">Saturday: 10AM - 4PM GMT</p>
                  <p className="text-sm text-muted-foreground">Sunday: Closed</p>
                </div>
              </div>
              <div className="flex gap-4">
                <MapPin className="w-6 h-6 text-accent flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">Store Location</h3>
                  <p className="text-sm text-muted-foreground">Accra, Ghana</p>
                  <p className="text-sm text-muted-foreground">Visit us during business hours</p>
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
