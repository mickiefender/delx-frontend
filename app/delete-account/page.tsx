'use client'

import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export default function DeleteAccountPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-semibold mb-4">Delete Your Delx Account</h1>
            <p className="text-muted-foreground mb-8">Last updated: July 21, 2026</p>

            <div className="prose prose-gray max-w-none space-y-8">
              <section>
                <h2 className="text-xl font-semibold mb-3">Introduction</h2>
                <p className="text-muted-foreground">
                  Delx, developed by Vertex Blueprint Technologies, allows users to permanently delete their accounts and associated data. Users can delete their accounts directly from the Delx mobile application or website settings. This page provides detailed instructions on how to request account deletion and explains what data will be removed and retained.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">How to Delete Your Account (Mobile App)</h2>
                <p className="text-muted-foreground mb-4">
                  To delete your account from the Delx mobile app, follow these steps:
                </p>
                <ol className="list-decimal pl-6 space-y-3 text-muted-foreground">
                  <li><strong>Open the Delx app</strong> on your mobile device</li>
                  <li><strong>Log in to your account</strong> with your email and password</li>
                  <li><strong>Go to Settings</strong> by tapping the menu icon or profile icon at the bottom or top right of the screen</li>
                  <li><strong>Scroll to the bottom</strong> of the Settings page</li>
                  <li><strong>Select "Delete Account"</strong> option</li>
                  <li><strong>Review the deletion notice</strong> and confirm that you understand your data will be permanently removed</li>
                  <li><strong>Confirm the deletion request</strong> by entering your password again or confirming via email verification</li>
                  <li>Your account will be scheduled for deletion and will be completely removed within 30 days</li>
                </ol>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">How to Delete Your Account (Website)</h2>
                <p className="text-muted-foreground mb-4">
                  To delete your account from the Delx website, follow these steps:
                </p>
                <ol className="list-decimal pl-6 space-y-3 text-muted-foreground">
                  <li><strong>Visit the Delx website</strong> and log in to your dashboard</li>
                  <li><strong>Click on your profile icon</strong> in the top right corner</li>
                  <li><strong>Navigate to Settings</strong> from the dropdown menu</li>
                  <li><strong>Scroll down to the account management section</strong></li>
                  <li><strong>Click "Delete Account"</strong> button</li>
                  <li><strong>Review the account deletion warning</strong> that explains all data will be permanently removed</li>
                  <li><strong>Confirm the deletion request</strong> by entering your password or clicking a confirmation link sent to your email</li>
                  <li>Your account will be scheduled for deletion and will be completely removed within 30 days</li>
                </ol>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">What Data Will Be Deleted</h2>
                <p className="text-muted-foreground mb-4">
                  When you delete your Delx account, the following information will be permanently deleted:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li><strong>User account profile information</strong> - Your complete profile page and settings</li>
                  <li><strong>Personal identification details</strong> - Name, email address, phone number, and contact information associated with your account</li>
                  <li><strong>Login credentials</strong> - Username, password, and authentication tokens</li>
                  <li><strong>Account preferences</strong> - Language settings, notification preferences, and display settings</li>
                  <li><strong>User-generated content</strong> - Reviews, ratings, wishlists, and saved items linked to your account</li>
                  <li><strong>Browsing and activity history</strong> - Search history, product views, and interaction records</li>
                  <li><strong>Personal information stored for account usage</strong> - Saved addresses, payment methods on file, and other customization data</li>
                  <li><strong>Profile pictures and personal media</strong> - Any images or files you uploaded to your account</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">Data That May Be Retained</h2>
                <p className="text-muted-foreground mb-4">
                  In certain circumstances, some information may be retained where required for legal, regulatory, or business purposes:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li><strong>Legal and regulatory requirements</strong> - Information required to comply with applicable laws and regulations</li>
                  <li><strong>Financial transaction records</strong> - Order history and payment transaction records for accounting and audit purposes</li>
                  <li><strong>Fraud prevention and security purposes</strong> - Information needed to prevent fraudulent activities and maintain platform security</li>
                  <li><strong>Business record keeping</strong> - Records necessary for maintaining business operations and resolving disputes</li>
                  <li><strong>Tax and financial compliance</strong> - Records required for tax reporting and financial compliance obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">Retention Period</h2>
                <p className="text-muted-foreground">
                  Any retained information will only be stored for the period required by applicable laws or business requirements, typically up to 7 years for financial records in compliance with accounting standards. Retained data will be permanently deleted after the required retention period has elapsed or once it is no longer legally required to be maintained.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">Important Information Before Deleting</h2>
                <p className="text-muted-foreground mb-4">
                  Please note the following important points before requesting account deletion:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Account deletion is <strong>permanent and irreversible</strong> - you will not be able to recover your account or data once deleted</li>
                  <li>If you have active orders or ongoing transactions, you may need to cancel or complete them before deletion</li>
                  <li>Any refunds owed will be processed to your original payment method before final account deletion</li>
                  <li>You will lose access to any benefits, loyalty points, or credits associated with your account</li>
                  <li>Deletion may take up to 30 days to complete as we ensure all associated data is removed from our systems</li>
                  <li>You may be unable to use the same email address to create a new Delx account for a short period following deletion</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">Canceling Account Deletion</h2>
                <p className="text-muted-foreground">
                  If you change your mind after requesting account deletion, you may be able to cancel the request within 7 days. Contact our support team immediately at support@delx.shop with your account details to request cancellation before the deletion is finalized.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">Need Help?</h2>
                <p className="text-muted-foreground mb-4">
                  If you experience any issues deleting your account or have questions about the account deletion process, our support team is here to help:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li><strong>Email:</strong> support@delx.shop</li>
                  <li><strong>Response time:</strong> We typically respond within 24-48 hours</li>
                  <li><strong>Live Chat:</strong> Available on the Delx website during business hours</li>
                  <li><strong>In-App Support:</strong> Contact us directly through the Delx mobile app settings</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  <strong>Developer:</strong> Vertex Blueprint Technologies
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">Additional Resources</h2>
                <p className="text-muted-foreground mb-3">
                  For more information about how we handle your data, please review our other policies:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li><a href="/privacy" className="text-blue-600 hover:text-blue-800 underline">Privacy Policy</a> - Learn about our data collection and usage practices</li>
                  <li><a href="/terms" className="text-blue-600 hover:text-blue-800 underline">Terms of Service</a> - Review the terms governing your use of Delx</li>
                  <li><a href="/contact" className="text-blue-600 hover:text-blue-800 underline">Contact Us</a> - Get in touch with our team for other inquiries</li>
                </ul>
              </section>

              <section className="pt-4 border-t border-muted">
                <p className="text-sm text-muted-foreground">
                  <strong>Last updated:</strong> July 21, 2026
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
