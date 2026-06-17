'use client'

import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Truck, MapPin, Clock, Package, Shield, Phone, Mail, ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'

interface ShippingZone {
  zone: string
  regions: string[]
  processingTime: string
  deliveryTime: string
  cost: string
  freeShipping: string
}

interface FAQItem {
  question: string
  answer: string
}

const shippingZones: ShippingZone[] = [
  {
    zone: 'Accra Metro',
    regions: ['Accra', 'Tema', 'Kumasi', 'Takoradi'],
    processingTime: '1-2 business days',
    deliveryTime: '1-3 business days',
    cost: 'GHS 15',
    freeShipping: 'Orders over GHS 500',
  },
  {
    zone: 'Other Ghana Regions',
    regions: ['Ashanti', 'Eastern', 'Western', 'Central', 'Volta', 'Northern'],
    processingTime: '1-2 business days',
    deliveryTime: '3-5 business days',
    cost: 'GHS 25-50',
    freeShipping: 'Orders over GHS 500',
  },
  {
    zone: 'West Africa',
    regions: ['Nigeria', 'Ivory Coast', 'Senegal', 'Togo', 'Benin', 'Liberia'],
    processingTime: '1-2 business days',
    deliveryTime: '5-10 business days',
    cost: 'GHS 50-150',
    freeShipping: 'Not available',
  },
  {
    zone: 'International',
    regions: ['Europe', 'North America', 'Asia', 'Other'],
    processingTime: '2-3 business days',
    deliveryTime: '10-21 business days',
    cost: 'GHS 150-300',
    freeShipping: 'Not available',
  },
]

const shippingFAQs: FAQItem[] = [
  {
    question: 'How long does it take to process my order?',
    answer: 'Orders are typically processed within 1-2 business days. During peak seasons (holidays, sales), processing may take 2-3 business days. You will receive a confirmation email once your order has been processed and another email with tracking information once shipped.',
  },
  {
    question: 'Can I change my delivery address after placing my order?',
    answer: 'We process orders quickly to ensure fast delivery. If you need to change your delivery address, please contact our customer service team as soon as possible. We will do our best to accommodate your request if the order has not yet been shipped.',
  },
  {
    question: 'What if my package is lost or damaged?',
    answer: 'We work with reliable carriers, but sometimes issues occur. If your package is lost or damaged, please contact us immediately with your order number and photos of the damage. We will work with the carrier to resolve the issue and ensure you receive your order or a full refund.',
  },
  {
    question: 'Do you ship to P.O. boxes?',
    answer: 'Yes, we can ship to P.O. boxes for standard delivery. However, some carriers may require a physical address for express or expedited shipping. Please ensure your address is complete and accurate to avoid delivery delays.',
  },
  {
    question: 'Can I pick up my order instead of shipping?',
    answer: 'Yes, we offer in-store pickup at our Accra location. During checkout, select "Pickup" as your delivery method. You will receive an email when your order is ready for pickup. Please bring a valid ID and your order confirmation when collecting your order.',
  },
  {
    question: 'How do I track my shipment?',
    answer: 'Once your order ships, you will receive an email with a tracking number and a link to the carrier\'s website. You can also track your order by logging into your account and visiting the Orders section. Tracking information may take 24-48 hours to update after shipment.',
  },
  {
    question: 'What happens if I\'m not home when delivery is attempted?',
    answer: 'The carrier will typically attempt delivery 2-3 times. If you\'re not available, they may leave a notice with instructions on how to reschedule delivery or pick up from their facility. Please ensure someone is available or provide a safe location for delivery.',
  },
  {
    question: 'Are there items you cannot ship?',
    answer: 'Some items may have shipping restrictions due to size, weight, or regulatory constraints. These include certain hazardous materials, oversized items, and products restricted by international shipping regulations. You will be notified during checkout if an item cannot be shipped to your location.',
  },
]

export default function ShippingPage() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="bg-primary text-primary-foreground px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <Truck className="w-16 h-16 mx-auto mb-4 opacity-90" />
            <h1 className="text-3xl sm:text-4xl font-semibold mb-4">Shipping Information</h1>
            <p className="text-lg opacity-90">
              Fast and reliable delivery across Ghana and West Africa.
            </p>
          </div>
        </div>

        {/* Shipping Zones */}
        <div className="px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold mb-6">Shipping Zones & Rates</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-border rounded-lg">
                <thead>
                  <tr className="bg-muted">
                    <th className="px-4 py-3 text-left text-sm font-semibold">Zone</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Regions</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Processing</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Delivery</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Cost</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Free Shipping</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {shippingZones.map((zone, index) => (
                    <tr key={index} className="border-t border-border">
                      <td className="px-4 py-3 font-medium">{zone.zone}</td>
                      <td className="px-4 py-3">{zone.regions.join(', ')}</td>
                      <td className="px-4 py-3">{zone.processingTime}</td>
                      <td className="px-4 py-3">{zone.deliveryTime}</td>
                      <td className="px-4 py-3">{zone.cost}</td>
                      <td className="px-4 py-3">{zone.freeShipping}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="px-4 sm:px-6 lg:px-8 py-12 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold mb-6">Our Shipping Benefits</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Truck className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold mb-1">Fast Delivery</h3>
                <p className="text-sm text-muted-foreground">
                  Same-day dispatch for orders placed before 2PM
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Package className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold mb-1">Secure Packaging</h3>
                <p className="text-sm text-muted-foreground">
                  All items carefully packed for safe delivery
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <MapPin className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold mb-1">Track Your Order</h3>
                <p className="text-sm text-muted-foreground">
                  Real-time tracking updates
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold mb-1">Shipping Insurance</h3>
                <p className="text-sm text-muted-foreground">
                  Free insurance on orders over GHS 500
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold mb-6">Important Information</h2>
            <div className="space-y-4">
              <div className="p-4 border border-border rounded-lg">
                <h3 className="font-semibold mb-2">Order Processing Time</h3>
                <p className="text-sm text-muted-foreground">
                  Orders placed before 2PM GMT on business days will be processed the same day. Orders placed after 2PM or on weekends will be processed the next business day. During peak seasons, processing may take longer.
                </p>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <h3 className="font-semibold mb-2">Customs & Duties (International Orders)</h3>
                <p className="text-sm text-muted-foreground">
                  International orders may be subject to customs duties, taxes, and clearance fees. These fees are the responsibility of the buyer and are not included in the shipping cost. Please check with your local customs office for more information.
                </p>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <h3 className="font-semibold mb-2">Delivery Issues</h3>
                <p className="text-sm text-muted-foreground">
                  If your package is lost, damaged, or delivery fails, please contact us within 48 hours. We will work with the carrier to resolve the issue. Please have your order number ready when contacting support.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping FAQs */}
        <div className="px-4 sm:px-6 lg:px-8 py-12 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-2">
              {shippingFAQs.map((faq, index) => (
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
            <h2 className="text-xl font-semibold mb-4">Have Questions About Shipping?</h2>
            <p className="text-muted-foreground mb-6">
              Our support team is here to help with any shipping inquiries.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="tel:+233123456789"
                className="px-6 py-3 bg-accent text-accent-foreground rounded-lg font-medium hover:bg-accent/90 transition-colors inline-flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                Call Us
              </a>
              <a
                href="mailto:support@delchris.com"
                className="px-6 py-3 border border-border rounded-lg font-medium hover:bg-muted transition-colors inline-flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Email Support
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
