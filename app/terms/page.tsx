'use client'

import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export default function TermsOfServicePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-semibold mb-4">Terms of Service</h1>
            <p className="text-muted-foreground mb-8">Last updated: January 2025</p>

            <div className="prose prose-gray max-w-none space-y-8">
              <section>
                <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground">
                  By accessing and using delchris.com (the "Website"), you accept and agree to be bound by the terms and provision of this Terms of Service Agreement. If you do not agree to abide by these terms, please do not use this service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
                <p className="text-muted-foreground">
                  Delchris provides an online e-commerce platform offering premium fashion and lifestyle products for sale. We reserve the right to modify, suspend, or discontinue any part of the service at any time. We will provide notice of any significant changes to the service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
                <p className="text-muted-foreground mb-3">When you create an account on our Website, you agree to:</p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Provide accurate, current, and complete information about yourself</li>
                  <li>Maintain and promptly update your account information</li>
                  <li>Keep your password secure and confidential</li>
                  <li>Accept responsibility for all activities that occur under your account</li>
                  <li>Notify us immediately of any unauthorized use of your account</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">4. Product Information and Pricing</h2>
                <p className="text-muted-foreground mb-3">We strive to provide accurate product information, but we cannot guarantee that:</p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>All product descriptions, images, and prices are 100% accurate</li>
                  <li>Products will always be in stock and available</li>
                  <li>Product colors will display accurately on your screen</li>
                </ul>
                <p className="text-muted-foreground mt-3">
                  We reserve the right to correct any errors, inaccuracies, or omissions and to change or update information at any time without prior notice. If a product is listed at an incorrect price, we reserve the right to cancel orders for that product.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">5. Ordering and Payment</h2>
                <p className="text-muted-foreground mb-3">When placing an order, you agree to:</p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Provide valid payment information and authorize us to charge your payment method</li>
                  <li>Confirm that you are authorized to use the payment method</li>
                  <li>Pay all charges incurred by your account</li>
                  <li>Pay applicable taxes and shipping fees</li>
                </ul>
                <p className="text-muted-foreground mt-3">
                  We accept major credit/debit cards, mobile money, and other payment methods as indicated on our checkout page. All payments are processed securely through our payment partners.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">6. Shipping and Delivery</h2>
                <p className="text-muted-foreground">
                  We ship products to locations within Ghana and West Africa. Delivery times are estimates and not guarantees. We are not responsible for delays caused by customs, weather, or circumstances beyond our control. Risk of loss passes to you upon delivery to the carrier.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">7. Returns and Refunds</h2>
                <p className="text-muted-foreground">
                  We want you to be completely satisfied with your purchase. Please refer to our Returns & Refunds policy for detailed information about our return process, eligible items, and refund timelines.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">8. User Conduct</h2>
                <p className="text-muted-foreground mb-3">You agree not to use the Website to:</p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Upload or transmit viruses, malware, or other harmful code</li>
                  <li>Post or transmit unlawful, defamatory, or obscene material</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Interfere with the proper operation of the Website</li>
                  <li>Engage in any activity that could harm or exploit users</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">9. Intellectual Property</h2>
                <p className="text-muted-foreground">
                  All content on this Website, including text, graphics, logos, images, audio clips, and software, is the property of Delchris or its content suppliers and is protected by copyright and other intellectual property laws. You may not reproduce, distribute, or modify any content without our prior written consent.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">10. Disclaimer of Warranties</h2>
                <p className="text-muted-foreground">
                  THE WEBSITE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">11. Limitation of Liability</h2>
                <p className="text-muted-foreground">
                  IN NO EVENT SHALL DELCHRIS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATED TO YOUR USE OF THE WEBSITE OR THE SERVICE, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">12. Indemnification</h2>
                <p className="text-muted-foreground">
                  You agree to indemnify, defend, and hold harmless Delchris and its officers, directors, employees, agents, and affiliates from and against any claims, liabilities, damages, losses, costs, or expenses (including reasonable attorneys' fees) arising out of or related to your use of the Website or any violation of these Terms of Service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">13. Governing Law</h2>
                <p className="text-muted-foreground">
                  These Terms of Service shall be governed by and construed in accordance with the laws of Ghana. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts of Ghana.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">14. Changes to Terms</h2>
                <p className="text-muted-foreground">
                  We reserve the right to modify these Terms of Service at any time. Any changes will be effective immediately upon posting on the Website. Your continued use of the Website after changes are posted constitutes your acceptance of the new terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">15. Contact Information</h2>
                <p className="text-muted-foreground">
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <ul className="list-disc pl-6 mt-3 space-y-1 text-muted-foreground">
                  <li>Email: support@delchris.com</li>
                  <li>Phone: +233 (0) 123 456 789</li>
                  <li>Address: Accra, Ghana</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
