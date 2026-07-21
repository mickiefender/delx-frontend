import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import './globals.css'
import { SiteThemeFromSettings } from '@/components/site-theme-from-settings'
import { CookieConsentBanner } from '@/components/cookie-consent-banner'

const geist = Geist({ subsets: ["latin"] });
const geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Delx - Premium E-cmomerce in Ghana & West Africa',
  description: 'A premiuim ecommerce app where you can get everything you need from Delchris Africa Ltd. Fast shipping across Ghana and West Africa.',
  authors: [{ name: 'Delchris Africa Ltd', url: 'https://delx.shop' }],
  creator: 'Delchris Africa Ltd',
  publisher: 'Delchris Africa Ltd',
  applicationName: 'Delx',
  themeColor: '#f4ede4',
  colorScheme: 'light',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
  keywords: 'fashion, luxury, ecommerce, Ghana, West Africa, shopping, goods, lifestyle, Delchris, online store, premium products,webshop, clothing, accessories, home decor, beauty products, shoes, footwear, jewelry, watches, electronic gadgets, fast shipping, customer service, secure payment, exclusive deals, discounts',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://delx.shop',
    siteName: 'Delx',
    title: 'Delx - Premium E-commerce in Ghana & West Africa',
    description: 'A premiuim ecommerce app where you can get everything you need from Delchris Africa Ltd. Fast shipping across Ghana and West Africa.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/icon-light-32x32.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background scroll-smooth">
      <head>
        <meta name="theme-color" content="#f4ede4" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#1a1a1a" media="(prefers-color-scheme: dark)" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className={`${geist.className} font-sans antialiased bg-background text-foreground`}>
        <SiteThemeFromSettings />
        {children}
        <Toaster position="top-center" />
        {process.env.NODE_ENV === 'production' && <Analytics />}
        {/* Cookie consent banner (professional accept/reject, re-shows until decided) */}
        {/*
          Keep this outside main content so it can overlay any page consistently.
        */}
        <CookieConsentBanner />
      </body>
    </html>
  )
}
