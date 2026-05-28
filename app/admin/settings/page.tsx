'use client'

import { useEffect, useMemo, useState, FormEvent } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import { useToast } from '@/hooks/use-toast'
import { fetchSettings, updateSettings, type SiteSettings, type UpdateSettingsPayload } from '@/lib/services/settings'

const colorInputHint = 'Paste a hex color like #2E7D32'

  const initialPayload: Partial<UpdateSettingsPayload> = {
  site_name: '',
  site_description: '',
  primary_color: '#2E7D32',
  secondary_color: '#C62828',
  accent_color: '#F57C00',
  contact_email: '',
  contact_phone: '',
  contact_address: '',
  facebook_url: '',
  instagram_url: '',
  twitter_url: '',
  whatsapp_number: '',
  free_shipping_threshold: '500',
  shipping_flat_rate: '15',
  local_shipping_rate: '10',
  tax_rate: '0',
  return_policy_days: 7,
  return_policy_text: '',
  is_maintenance_mode: false,
  maintenance_message: '',
  site_logo: undefined,
  favicon: undefined,
}

export default function AdminSettingsPage() {
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [settings, setSettings] = useState<Partial<UpdateSettingsPayload>>(initialPayload)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [faviconFile, setFaviconFile] = useState<File | null>(null)

  const themePreview = useMemo(() => {
    const primary = settings.primary_color || '#2E7D32'
    const secondary = settings.secondary_color || '#C62828'
    const accent = settings.accent_color || '#F57C00'

    return { primary, secondary, accent }
  }, [settings.primary_color, settings.secondary_color, settings.accent_color])

  const load = async () => {
    setError(null)
    setLoading(true)
    try {
      const data: SiteSettings = await fetchSettings()

      setSettings({
        site_name: data.site_name ?? '',
        site_description: data.site_description ?? '',
        primary_color: data.primary_color ?? '#2E7D32',
        secondary_color: data.secondary_color ?? '#C62828',
        accent_color: data.accent_color ?? '#F57C00',
        contact_email: data.contact_email ?? '',
        contact_phone: data.contact_phone ?? '',
        contact_address: data.contact_address ?? '',
        facebook_url: data.facebook_url ?? '',
        instagram_url: data.instagram_url ?? '',
        twitter_url: data.twitter_url ?? '',
        whatsapp_number: data.whatsapp_number ?? '',
free_shipping_threshold: data.free_shipping_threshold ?? '500',
        shipping_flat_rate: data.shipping_flat_rate ?? '15',
        local_shipping_rate: data.local_shipping_rate ?? '10',
        tax_rate: data.tax_rate ?? '0',
        return_policy_days: data.return_policy_days ?? 7,
        return_policy_text: data.return_policy_text ?? '',
        is_maintenance_mode: data.is_maintenance_mode ?? false,
        maintenance_message: data.maintenance_message ?? '',
      })

      setLogoFile(null)
      setFaviconFile(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const setField = <K extends keyof UpdateSettingsPayload>(key: K, value: UpdateSettingsPayload[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setSaving(true)

    try {
        const payload: Partial<UpdateSettingsPayload> = {
        site_name: settings.site_name,
        site_description: settings.site_description,

        primary_color: settings.primary_color,
        secondary_color: settings.secondary_color,
        accent_color: settings.accent_color,

        contact_email: settings.contact_email,
        contact_phone: settings.contact_phone,
        contact_address: settings.contact_address,

        facebook_url: settings.facebook_url,
        instagram_url: settings.instagram_url,
        twitter_url: settings.twitter_url,
        whatsapp_number: settings.whatsapp_number,

        free_shipping_threshold: settings.free_shipping_threshold,
        shipping_flat_rate: settings.shipping_flat_rate,
        local_shipping_rate: settings.local_shipping_rate,
        tax_rate: settings.tax_rate,

        return_policy_days: settings.return_policy_days,
        return_policy_text: settings.return_policy_text,

        is_maintenance_mode: settings.is_maintenance_mode,
        maintenance_message: settings.maintenance_message,

        ...(logoFile ? { site_logo: logoFile } : {}),
        ...(faviconFile ? { favicon: faviconFile } : {}),
      }

      await updateSettings(payload)

      // Notify the storefront to refresh theme/text without polling.
      // Storefront listens to the storage event + localStorage key.
      const updatedAt = Date.now()
      window.localStorage.setItem('delchris_settings_updated_at', String(updatedAt))

      toast({
        title: 'Settings updated',
        description: 'Your website settings were saved successfully.',
      })

      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings')
      toast({
        title: 'Save failed',
        description: err instanceof Error ? err.message : 'Please try again.',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-0">
        <div className="flex items-center gap-3">
          <Spinner className="w-6 h-6" />
          <p className="text-sm text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-0">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage website info, shipping, maintenance mode, and theme colors.</p>
      </div>

      {error && (
        <Card className="p-4 mb-6 border-red-300">
          <p className="text-sm text-red-700">{error}</p>
        </Card>
      )}

      <Card className="p-6">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Theme */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Theme</h2>

            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">Primary color</label>
                  <Input
                    value={settings.primary_color ?? ''}
                    onChange={(e) => setField('primary_color', e.target.value)}
                    placeholder="#2E7D32"
                  />
                  <p className="text-xs text-muted-foreground">{colorInputHint}</p>
                </div>

                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">Secondary color</label>
                  <Input
                    value={settings.secondary_color ?? ''}
                    onChange={(e) => setField('secondary_color', e.target.value)}
                    placeholder="#C62828"
                  />
                  <p className="text-xs text-muted-foreground">{colorInputHint}</p>
                </div>

                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">Accent color</label>
                  <Input
                    value={settings.accent_color ?? ''}
                    onChange={(e) => setField('accent_color', e.target.value)}
                    placeholder="#F57C00"
                  />
                  <p className="text-xs text-muted-foreground">{colorInputHint}</p>
                </div>
              </div>

              <div className="w-full md:w-64">
                <div className="rounded-lg border p-4 space-y-3">
                  <p className="text-sm font-medium">Preview</p>
                  <div className="flex gap-2">
                    <div className="h-10 w-full rounded" style={{ background: themePreview.primary }} />
                    <div className="h-10 w-full rounded" style={{ background: themePreview.secondary }} />
                  </div>
                  <div className="h-10 w-full rounded" style={{ background: themePreview.accent }} />
                  <div
                    className="rounded-lg p-3 border text-sm"
                    style={{ background: themePreview.primary, color: '#ffffff' }}
                  >
                    Primary button style
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Site info */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Site</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Site name</label>
                <Input value={settings.site_name ?? ''} onChange={(e) => setField('site_name', e.target.value)} />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Site logo</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
                />
                {logoFile && <p className="text-xs text-muted-foreground">Selected: {logoFile.name}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Site description</label>
              <Textarea
                rows={4}
                value={settings.site_description ?? ''}
                onChange={(e) => setField('site_description', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Favicon</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFaviconFile(e.target.files?.[0] ?? null)}
                />
                {faviconFile && <p className="text-xs text-muted-foreground">Selected: {faviconFile.name}</p>}
              </div>
              <div />
            </div>
          </div>

          {/* Contact + Social */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Contact & Social</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Contact email</label>
                <Input value={settings.contact_email ?? ''} onChange={(e) => setField('contact_email', e.target.value)} />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Contact phone</label>
                <Input value={settings.contact_phone ?? ''} onChange={(e) => setField('contact_phone', e.target.value)} />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm text-muted-foreground">Contact address</label>
                <Textarea
                  rows={3}
                  value={settings.contact_address ?? ''}
                  onChange={(e) => setField('contact_address', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Facebook URL</label>
                <Input value={settings.facebook_url ?? ''} onChange={(e) => setField('facebook_url', e.target.value)} />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Instagram URL</label>
                <Input value={settings.instagram_url ?? ''} onChange={(e) => setField('instagram_url', e.target.value)} />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Twitter URL</label>
                <Input value={settings.twitter_url ?? ''} onChange={(e) => setField('twitter_url', e.target.value)} />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">WhatsApp number</label>
                <Input value={settings.whatsapp_number ?? ''} onChange={(e) => setField('whatsapp_number', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Shipping + Returns */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Shipping & Returns</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Free shipping threshold</label>
                <Input
                  value={settings.free_shipping_threshold ?? ''}
                  onChange={(e) => setField('free_shipping_threshold', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Shipping flat rate</label>
                <Input value={settings.shipping_flat_rate ?? ''} onChange={(e) => setField('shipping_flat_rate', e.target.value)} />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Local shipping rate</label>
                <Input value={settings.local_shipping_rate ?? ''} onChange={(e) => setField('local_shipping_rate', e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm text-muted-foreground">Tax rate (fraction)</label>
<Input
                  value={settings.tax_rate ?? '0'}
                  onChange={(e) => setField('tax_rate', e.target.value)}
                  placeholder="e.g. 0.15 for 15%"
                />
                <p className="text-xs text-muted-foreground">Enter 0.15 for 15%</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Return policy days</label>
                <Input
                  type="number"
                  value={settings.return_policy_days ?? 7}
                  onChange={(e) => setField('return_policy_days', Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Return policy text</label>
                <Textarea
                  rows={5}
                  value={settings.return_policy_text ?? ''}
                  onChange={(e) => setField('return_policy_text', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Maintenance */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Maintenance Mode</h2>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={Boolean(settings.is_maintenance_mode)}
                onChange={(e) => setField('is_maintenance_mode', e.target.checked)}
              />
              <span className="text-sm text-foreground">Enable maintenance mode</span>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Maintenance message</label>
              <Textarea
                rows={4}
                value={settings.maintenance_message ?? ''}
                onChange={(e) => setField('maintenance_message', e.target.value)}
                placeholder="We’ll be back soon. Thank you for your patience."
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
            <Button type="button" variant="outline" disabled={saving} onClick={load}>
              Reset
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
