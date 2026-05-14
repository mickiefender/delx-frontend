'use client'

import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-semibold mb-4">Privacy Policy</h1>
            <p className="text-muted-foreground mb-8">Last updated: January 2025</p>

            <div className="prose prose-gray max-w-none space-y-8">
              <section>
                <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
                <p className="text-muted-foreground">
                  At Delchris, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, mobile application, or make a purchase from delchris.com or related channels.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
                <p className="text-muted-foreground mb-3">
                  We collect information that you provide directly to us, including:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li><strong>Account Information:</strong> Name, email address, phone number, and account credentials when you create an account</li>
                  <li><strong>Order Information:</strong> Shipping address, billing address, and payment information when you place an order</li>
                  <li><strong>Communications:</strong> Records of your communications with our customer service team</li>
                  <li><strong>Device Information:</strong> IP address, browser type, operating system, and device identifiers</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
                <p className="text-muted-foreground mb-3">We use the information we collect to:</p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Process and fulfill your orders</li>
                  <li>Provide customer support and respond to your inquiries</li>
                  <li>Send you order confirmations, shipping updates, and promotional offers</li>
                  <li>Improve our website and services based on your feedback</li>
                  <li>Prevent fraud and ensure the security of your account</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">4. Information Sharing</h2>
                <p className="text-muted-foreground">
                  We may share your information with third-party service providers who assist us in operating our website, conducting our business, or servicing you. These parties have agreed to keep your information confidential. We may also disclose your information when required by law or in response to valid requests by public authorities.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">5. Data Security</h2>
                <p className="text-muted-foreground">
                  We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. All sensitive payment information is encrypted using SSL technology.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">6. Your Rights</h2>
                <p className="text-muted-foreground mb-3">You have the right to:</p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Access the personal information we hold about you</li>
                  <li>Request correction of inaccurate personal information</li>
                  <li>Request deletion of your personal information</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Request a copy of your data in a portable format</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">7. Cookies and Tracking Technologies</h2>
                <p className="text-muted-foreground">
                  We use cookies and similar tracking technologies to track activity on our website and hold certain information. For detailed information about the cookies we use, please refer to our Cookie Policy.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">8. Third-Party Links</h2>
                <p className="text-muted-foreground">
                  Our website may contain links to third-party websites, products, or services. We are not responsible for the privacy practices or content of these third parties. We encourage you to review the privacy policies of any third-party sites you visit.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">9. Children's Privacy</h2>
                <p className="text-muted-foreground">
                  Our website is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">10. Changes to This Policy</h2>
                <p className="text-muted-foreground">
                  We may update this Privacy Policy from time to time to reflect changes in our practices or for operational, legal, or regulatory reasons. We will post any changes on this page and update the "Last updated" date at the top of this policy.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">11. Contact Us</h2>
                <p className="text-muted-foreground">
                  If you have any questions about this Privacy Policy, please contact us at:
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
