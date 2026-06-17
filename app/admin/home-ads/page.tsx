'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert } from '@/components/ui/alert'
import { Upload } from 'lucide-react'
import { fetchActiveHomeAds, createHomeAd, updateHomeAd, type HomeAdBannerItem } from '@/lib/services/home-ads'

type PositionConfig = 1 | 2

const positions: PositionConfig[] = [1, 2]

const emptyAdState: Record<PositionConfig, { image: File | null; link_url: string; is_active: boolean; existing?: HomeAdBannerItem }> =
  {
    1: { image: null, link_url: '', is_active: true },
    2: { image: null, link_url: '', is_active: true },
  }

export default function AdminHomeAdsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [existingAds, setExistingAds] = useState<HomeAdBannerItem[]>([])
  const [formState, setFormState] = useState(emptyAdState)

  const adsByPosition = useMemo(() => {
    const map: Partial<Record<PositionConfig, HomeAdBannerItem>> = {}
    existingAds.forEach((a) => {
      map[a.position as PositionConfig] = a
    })
    return map as Record<PositionConfig, HomeAdBannerItem | undefined>
  }, [existingAds])

  const loadAds = async () => {
    setError(null)
    setLoading(true)
    try {
      const data = await fetchActiveHomeAds()
      setExistingAds(data)

      setFormState((prev) => {
        const next = { ...prev }
        positions.forEach((p) => {
          const ad = data.find((x) => x.position === p)
          if (ad) {
            next[p] = {
              ...next[p],
              is_active: ad.is_active,
              link_url: ad.link_url ?? '',
              image: null,
              existing: ad,
            }
          } else {
            next[p] = { image: null, link_url: '', is_active: true }
          }
        })
        return next
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load home ads.')
      setExistingAds([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAds()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFileChange = (position: PositionConfig, file: File | null) => {
    setFormState((prev) => ({
      ...prev,
      [position]: {
        ...prev[position],
        image: file,
      },
    }))
  }

  const handleActiveChange = (position: PositionConfig, is_active: boolean) => {
    setFormState((prev) => ({
      ...prev,
      [position]: {
        ...prev[position],
        is_active,
      },
    }))
  }

  const handleLinkUrlChange = (position: PositionConfig, link_url: string) => {
    setFormState((prev) => ({
      ...prev,
      [position]: {
        ...prev[position],
        link_url,
      },
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      // Save each position separately
      for (const position of positions) {
        const state = formState[position]
        const adExisting = adsByPosition[position]

        const payloadBase = {
          position,
          is_active: state.is_active,
        }

        if (state.image) {
          if (adExisting) {
            await updateHomeAd(position, {
              image: state.image,
              link_url: state.link_url,
              is_active: state.is_active,
            })
          } else {
            await createHomeAd({ ...payloadBase, image: state.image, link_url: state.link_url })
          }
        } else {
          // No image change, but link_url / is_active might have changed
          if (adExisting) {
            const linkChanged = state.link_url !== adExisting.link_url
            const isActiveChanged = state.is_active !== adExisting.is_active

            if (linkChanged || isActiveChanged) {
              await updateHomeAd(position, {
                link_url: state.link_url,
                is_active: state.is_active,
              })
            }
          } else {
            // No existing ad record yet (rare), create using current image requirement
            // If there's no image, there's nothing to create.
          }
        }
      }

      await loadAds()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save home ads.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-0">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Home Ads (2 banners)</h1>
          <p className="text-muted-foreground mt-2">
            Upload and manage two homepage ad banners. Position 1 = left/first, Position 2 = right/second.
          </p>
        </div>

        <Button onClick={handleSave} disabled={saving || loading} className="gap-2">
          <Upload className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          {error}
        </Alert>
      )}

      {loading ? (
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {positions.map((position) => {
            const ad = adsByPosition[position]
            const state = formState[position]

            return (
              <Card key={position} className="p-6">
                <h2 className="text-xl font-semibold mb-4">Position {position}</h2>

                {ad?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={ad.image}
                    alt={`Home ad position ${position}`}
                    className="w-full h-56 object-cover rounded-md border border-border mb-4"
                  />
                ) : (
                  <div className="w-full h-56 bg-muted rounded-md border border-border mb-4 flex items-center justify-center">
                    <span className="text-muted-foreground text-sm">No image uploaded</span>
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Upload new image {position === 1 ? '(left/first)' : '(right/second)'}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(position, e.target.files && e.target.files.length > 0 ? e.target.files[0] : null)}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-foreground mb-2">Link URL (banner click)</label>
                  <Input
                    value={state.link_url}
                    onChange={(e) => handleLinkUrlChange(position, e.target.value)}
                    placeholder="https://example.com or /products"
                  />
                </div>

                <label className="flex items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={state.is_active}
                    onChange={(e) => handleActiveChange(position, e.target.checked)}
                  />
                  Active (visible on homepage)
                </label>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
