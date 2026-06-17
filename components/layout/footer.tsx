'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

import { fetchPublicSettings, type SiteSettingsPublic } from '@/lib/services/settings'

type FooterSettings = {
  site_name: string
  site_logo: string | null
  primary_color: string
  secondary_color: string
  accent_color: string
  contact_email: string
  contact_phone: string
  contact_address: string
  facebook_url: string
  instagram_url: string
  twitter_url: string
  free_shipping_threshold: string
  shipping_flat_rate: string
  local_shipping_rate: string
  return_policy_days: number
  return_policy_text: string
}

const toAbsoluteMediaUrl = (url?: string | null): string => {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  const backendBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1').replace(/\/api\/v1\/?$/, '')
  if (url.startsWith('/')) return `${backendBase}${url}`
  return `${backendBase}/${url}`
}


const defaultFooterSettings: FooterSettings = {
  site_name: 'Delchris E-Commerce',
  site_logo: null,
  primary_color: '#2E7D32',
  secondary_color: '#C62828',
  accent_color: '#F57C00',
  contact_email: '',
  contact_phone: '',
  contact_address: '',
  facebook_url: '',
  instagram_url: '',
  twitter_url: '',
  free_shipping_threshold: '500',
  shipping_flat_rate: '15',
  local_shipping_rate: '10',
  return_policy_days: 7,
  return_policy_text: '',
}

const getTelHref = (phone: string) => {
  const cleaned = phone.replace(/[^\d+]/g, '')
  return cleaned ? `tel:${cleaned}` : undefined
}

const getDisplayPhone = (phone: string) => phone || '+233 (0) 123 456 789'
const getDisplayEmail = (email: string) => email || 'support@delchris.com'

const SocialLink = ({
  href,
  label,
  children,
}: {
  href: string
  label: string
  children: React.ReactNode
}) => {
  if (!href) return <span aria-label={label}>{children}</span>
  return (
    <a href={href} target="_blank" rel="noreferrer" aria-label={label} className="hover:text-accent transition-colors">
      {children}
    </a>
  )
}

export function Footer() {
  const [email, setEmail] = useState('')
  const [footerSettings, setFooterSettings] = useState<FooterSettings>(defaultFooterSettings)

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      toast.success('Thank you for subscribing!')
      setEmail('')
    }
  }

  useEffect(() => {
    let cancelled = false
    let lastKey: string | null = null

    const apply = (s: SiteSettingsPublic) => {

      const logoRaw = (s as any).site_logo as string | null | undefined
      const next: FooterSettings = {
        site_name: s.site_name ?? defaultFooterSettings.site_name,
        site_logo: logoRaw ? toAbsoluteMediaUrl(logoRaw) : null,
        primary_color: (s as any).primary_color ?? defaultFooterSettings.primary_color,
        secondary_color: (s as any).secondary_color ?? defaultFooterSettings.secondary_color,
        accent_color: (s as any).accent_color ?? defaultFooterSettings.accent_color,
        contact_email: (s as any).contact_email ?? defaultFooterSettings.contact_email,
        contact_phone: (s as any).contact_phone ?? defaultFooterSettings.contact_phone,
        contact_address: (s as any).contact_address ?? defaultFooterSettings.contact_address,
        facebook_url: (s as any).facebook_url ?? '',
        instagram_url: (s as any).instagram_url ?? '',
        twitter_url: (s as any).twitter_url ?? '',
        free_shipping_threshold: (s as any).free_shipping_threshold ?? defaultFooterSettings.free_shipping_threshold,
        shipping_flat_rate: (s as any).shipping_flat_rate ?? defaultFooterSettings.shipping_flat_rate,
        local_shipping_rate: (s as any).local_shipping_rate ?? defaultFooterSettings.local_shipping_rate,
        return_policy_days: (s as any).return_policy_days ?? defaultFooterSettings.return_policy_days,
        return_policy_text: (s as any).return_policy_text ?? defaultFooterSettings.return_policy_text,
      }


      const key = JSON.stringify({
        site_name: next.site_name,
        site_logo: next.site_logo,
        contact_email: next.contact_email,
        contact_phone: next.contact_phone,
        facebook_url: next.facebook_url,
        instagram_url: next.instagram_url,
        twitter_url: next.twitter_url,
        return_policy_days: next.return_policy_days,
        return_policy_text: next.return_policy_text,
        free_shipping_threshold: next.free_shipping_threshold,
        shipping_flat_rate: next.shipping_flat_rate,
        local_shipping_rate: next.local_shipping_rate,
      })

      if (key === lastKey) return
      lastKey = key

      setFooterSettings(next)
    }

    const fetchAndApply = async () => {
      try {
        const res = await fetchPublicSettings()
        if (cancelled) return
        apply(res)
      } catch {
        // Keep last known footer values.
      }
    }

    // Initial load
    fetchAndApply()

    // Real-time updates without polling:
    // Admin sets localStorage key `delchris_settings_updated_at`.
    const onStorage = (e: StorageEvent) => {
      if (e.key !== 'delchris_settings_updated_at') return
      void fetchAndApply()
    }

    window.addEventListener('storage', onStorage)

    return () => {
      cancelled = true
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  const telHref = useMemo(() => getTelHref(footerSettings.contact_phone), [footerSettings.contact_phone])

  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Newsletter Section */}
      <div className="border-b border-primary-foreground/20 px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-semibold mb-2">Stay Updated</h3>
              <p className="opacity-90">Get exclusive offers and new product updates delivered to your inbox.</p>
            </div>
            <form onSubmit={handleNewsletter} className="flex gap-2">
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg text-foreground placeholder-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent"
                required
              />
              <Button type="submit" variant="secondary" className="px-6">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* About */}
            <div>
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                {footerSettings.site_logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={footerSettings.site_logo}
                    alt={footerSettings.site_name || 'Delchris'}
                    className="w-8 h-8 rounded-md object-cover border border-border bg-background"
                    loading="eager"
                  />
                ) : (
                  <div className="w-8 h-8 bg-accent rounded-md flex items-center justify-center text-primary text-sm font-bold">
                    {(footerSettings.site_name?.trim()?.[0]?.toUpperCase() as string) || 'D'}
                  </div>
                )}
                {footerSettings.site_name}
              </h4>
              <p className="text-sm opacity-90 mb-4">
                Premium fashion and lifestyle products for discerning customers. Experience excellence with {footerSettings.site_name}.
              </p>
              <div className="flex gap-3">
                <SocialLink href={footerSettings.facebook_url} label="Facebook">
                  <Facebook className="w-5 h-5" />
                </SocialLink>
                <SocialLink href={footerSettings.instagram_url} label="Instagram">
                  <Instagram className="w-5 h-5" />
                </SocialLink>
                <SocialLink href={footerSettings.twitter_url} label="Twitter">
                  <Twitter className="w-5 h-5" />
                </SocialLink>
              </div>
            </div>

            {/* Shop */}
            <div>
              <h4 className="font-semibold mb-4">Shop</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/products" className="opacity-90 hover:text-accent transition-colors">
                    All Products
                  </Link>
                </li>
                <li>
                  <Link href="/products?category=clothing" className="opacity-90 hover:text-accent transition-colors">
                    Clothing
                  </Link>
                </li>
                <li>
                  <Link href="/" className="opacity-90 hover:text-accent transition-colors">
                    Accessories
                  </Link>
                </li>
                <li>
                  <Link href="/" className="opacity-90 hover:text-accent transition-colors">
                    Flash Sales
                  </Link>
                </li>
                <li>
                  <Link href="/" className="opacity-90 hover:text-accent transition-colors">
                    New Arrivals
                  </Link>
                </li>
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/help" className="opacity-90 hover:text-accent transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="opacity-90 hover:text-accent transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="opacity-90 hover:text-accent transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/shipping" className="opacity-90 hover:text-accent transition-colors">
                    Shipping Info
                  </Link>
                </li>
                <li>
                  <Link href="/returns" className="opacity-90 hover:text-accent transition-colors">
                    Returns & Refunds
                  </Link>
                </li>
              </ul>
              <div className="mt-4 text-xs opacity-90 space-y-1">
                <p>
                  Free shipping over <span className="font-semibold">{footerSettings.free_shipping_threshold}</span>
                </p>
                <p>
                  Shipping rate: <span className="font-semibold">{footerSettings.shipping_flat_rate}</span>
                </p>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4">Get in Touch</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex gap-2">
                  <MapPin className="w-5 h-5 flex-shrink-0" />
                  <span>{footerSettings.contact_address || 'Accra, Ghana'}</span>
                </li>
                <li className="flex gap-2">
                  <Phone className="w-5 h-5 flex-shrink-0" />
                  {telHref ? (
                    <a href={telHref} className="opacity-90 hover:text-accent transition-colors">
                      {getDisplayPhone(footerSettings.contact_phone)}
                    </a>
                  ) : (
                    <span className="opacity-90">{getDisplayPhone(footerSettings.contact_phone)}</span>
                  )}
                </li>
                <li className="flex gap-2">
                  <Mail className="w-5 h-5 flex-shrink-0" />
                  <a href={`mailto:${getDisplayEmail(footerSettings.contact_email)}`} className="opacity-90 hover:text-accent transition-colors">
                    {footerSettings.contact_email ? footerSettings.contact_email : 'support@delchris.com'}
                  </a>
                </li>
              </ul>

              <div className="mt-4 text-xs opacity-90 space-y-1">
                <p>
                  Returns within <span className="font-semibold">{footerSettings.return_policy_days}</span> days
                </p>
                {footerSettings.return_policy_text ? (
                  <p className="leading-snug">{footerSettings.return_policy_text}</p>
                ) : null}
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-primary-foreground/20 pt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center md:text-left">
                <p>&copy; 2026 {footerSettings.site_name}. All rights reserved.</p>
              </div>
              <div className="flex justify-center gap-4 text-xs">
                <Link href="/privacy" className="opacity-90 hover:text-accent transition-colors">
                  Privacy Policy
                </Link>
                <span className="opacity-50">|</span>
                <Link href="/terms" className="opacity-90 hover:text-accent transition-colors">
                  Terms of Service
                </Link>
                <span className="opacity-50">|</span>
                <Link href="/cookies" className="opacity-90 hover:text-accent transition-colors">
                  Cookie Policy
                </Link>
              </div>
              <div className="text-center md:text-right">
               <a href="https://vertexblueprinttech.com" target="_blank" rel="noopener noreferrer">
                  <p className="opacity-90">Designed & Built by Vertex Blueprint Technologies</p>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
