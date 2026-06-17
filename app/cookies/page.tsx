'use client'

import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export default function CookiePolicyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-semibold mb-4">Cookie Policy</h1>
            <p className="text-muted-foreground mb-8">Last updated: January 2025</p>

            <div className="prose prose-gray max-w-none space-y-8">
              <section>
                <h2 className="text-xl font-semibold mb-3">1. What Are Cookies</h2>
                <p className="text-muted-foreground">
                  Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners. Cookies allow websites to recognize your device and remember information about your visit, such as your preferred language, login information, and other settings.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">2. How We Use Cookies</h2>
                <p className="text-muted-foreground mb-3">We use cookies for the following purposes:</p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li><strong>Essential Cookies:</strong> Required for the website to function properly. These include cookies that allow you to log into secure areas of the site, use shopping carts, and process checkout payments.</li>
                  <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve the website's performance and user experience.</li>
                  <li><strong>Functional Cookies:</strong> Enable enhanced functionality and personalization, such as remembering your preferences (language, region, currency) and customizing content based on your interests.</li>
                  <li><strong>Marketing Cookies:</strong> Used to track visitors across websites to display advertisements that are relevant and engaging for each user. These cookies may track your browsing habits to help deliver targeted advertising.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">3. Types of Cookies We Use</h2>
                <p className="text-muted-foreground mb-3">Below is a detailed list of the cookies we use:</p>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-border rounded-lg">
                    <thead>
                      <tr className="bg-muted">
                        <th className="px-4 py-3 text-left text-sm font-semibold">Cookie Name</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Purpose</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      <tr className="border-t border-border">
                        <td className="px-4 py-3">session_id</td>
                        <td className="px-4 py-3">Essential</td>
                        <td className="px-4 py-3">Maintains your login session</td>
                        <td className="px-4 py-3">Session</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="px-4 py-3">cart_items</td>
                        <td className="px-4 py-3">Essential</td>
                        <td className="px-4 py-3">Remembers items in your shopping cart</td>
                        <td className="px-4 py-3">30 days</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="px-4 py-3">preferences</td>
                        <td className="px-4 py-3">Functional</td>
                        <td className="px-4 py-3">Stores your language and currency preferences</td>
                        <td className="px-4 py-3">1 year</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="px-4 py-3">_ga</td>
                        <td className="px-4 py-3">Analytics</td>
                        <td className="px-4 py-3">Distinguishes unique users</td>
                        <td className="px-4 py-3">2 years</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="px-4 py-3">_gid</td>
                        <td className="px-4 py-3">Analytics</td>
                        <td className="px-4 py-3">Distinguishes users for 24-hour periods</td>
                        <td className="px-4 py-3">24 hours</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="px-4 py-3">ads_preferences</td>
                        <td className="px-4 py-3">Marketing</td>
                        <td className="px-4 py-3">Stores your advertising preferences</td>
                        <td className="px-4 py-3">1 year</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">4. Third-Party Cookies</h2>
                <p className="text-muted-foreground mb-3">Some cookies are placed by third-party services that appear on our pages. We do not control these cookies. The third parties include:</p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li><strong>Google Analytics:</strong> Used to analyze website traffic and user behavior. Google Analytics cookies track information such as pages visited and time spent on site.</li>
                  <li><strong>Payment Partners:</strong> Our payment processors may set cookies to securely process transactions and prevent fraud.</li>
                  <li><strong>Social Media:</strong> Social media platforms may set cookies when you use social sharing features on our site.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">5. Managing Cookies</h2>
                <p className="text-muted-foreground mb-3">You have the right to decide whether to accept or reject cookies. You can manage your cookie preferences in the following ways:</p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li><strong>Browser Settings:</strong> Most web browsers allow you to control cookies through their settings. You can configure your browser to block cookies or alert you when cookies are being sent.</li>
                  <li><strong>Opt-Out Links:</strong> Some third-party analytics and advertising providers offer opt-out mechanisms. You can opt out of Google Analytics here: tools.google.com/dlpage/gaoptout</li>
                  <li><strong>Our Preference Center:</strong> You can update your cookie preferences by clicking the "Cookie Settings" link in our website footer.</li>
                </ul>
                <p className="text-muted-foreground mt-3">
                  Please note that blocking essential cookies may affect the functionality of our website. Some features may not work properly if you disable cookies.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">6. Cookie Duration</h2>
                <p className="text-muted-foreground">
                  Session cookies are deleted when you close your browser. Persistent cookies remain on your device until they expire or are deleted. The duration of each cookie is specified in the table above. You can clear cached cookies from your browser at any time.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">7. Updates to This Policy</h2>
                <p className="text-muted-foreground">
                  We may update this Cookie Policy from time to time to reflect changes in our practices or for operational, legal, or regulatory reasons. We will post any changes on this page and update the "Last updated" date.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">8. Contact Us</h2>
                <p className="text-muted-foreground">
                  If you have any questions about this Cookie Policy or how we use cookies, please contact us at:
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
