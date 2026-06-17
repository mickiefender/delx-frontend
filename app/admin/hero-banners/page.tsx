'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import {
  createHeroBanner,
  deleteHeroBanner,
  fetchActiveHeroBanners,
  updateHeroBanner,
  type HeroBannerItem,
} from '@/lib/services/hero-banners'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

type BannerFormState = {
  title: string
  subtitle: string
  cta_text: string
  cta_url: string
  duration_seconds: string
  sort_order: string
  is_active: boolean
  image: File | null
}

const initialFormState: BannerFormState = {
  title: '',
  subtitle: '',
  cta_text: '',
  cta_url: '',
  duration_seconds: '6',
  sort_order: '0',
  is_active: true,
  image: null,
}

export default function AdminHeroBannersPage() {
  const [banners, setBanners] = useState<HeroBannerItem[]>([])
  const [loading, setLoading] = useState(true)

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<HeroBannerItem | null>(null)
  const [form, setForm] = useState<BannerFormState>(initialFormState)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [deletingBanner, setDeletingBanner] = useState<HeroBannerItem | null>(null)

  const loadBanners = async () => {
    setError(null)
    setLoading(true)
    try {
      const data = await fetchActiveHeroBanners()
      // NOTE: our public endpoint returns active banners ordered. Admin UI currently
      // targets active banners only (good for rotation). If you need full admin
      // visibility (including inactive), we’ll extend the API next.
      setBanners(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load hero banners')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBanners()
  }, [])

  const resetForm = () => {
    setEditing(null)
    setForm(initialFormState)
  }

  const filteredBanners = useMemo(() => banners, [banners])

  const handleEdit = (banner: HeroBannerItem) => {
    setError(null)
    setEditing(banner)
    setForm({
      title: banner.title,
      subtitle: banner.subtitle,
      cta_text: banner.cta_text,
      cta_url: banner.cta_url,
      duration_seconds: String(banner.duration_seconds ?? 6),
      sort_order: String(banner.sort_order ?? 0),
      is_active: true,
      image: null,
    })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.title.trim()) return setError('Title is required.')
    if (!form.cta_text.trim()) return setError('CTA text is required.')
    if (!form.cta_url.trim()) return setError('CTA URL is required.')

    if (!editing && !form.image) return setError('Banner image is required.')

    const durationSeconds = Number(form.duration_seconds)
    const sortOrder = Number(form.sort_order)

    if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
      return setError('Duration must be a positive number of seconds.')
    }

    if (!Number.isFinite(sortOrder) || sortOrder < 0) {
      return setError('Sort order must be a non-negative number.')
    }

    setSubmitting(true)
    setError(null)

    try {
      if (!editing) {
        await createHeroBanner({
          title: form.title,
          subtitle: form.subtitle,
          cta_text: form.cta_text,
          cta_url: form.cta_url,
          duration_seconds: durationSeconds,
          sort_order: sortOrder,
          is_active: form.is_active,
          image: form.image as File,
        })
      } else {
        await updateHeroBanner(editing.id, {
          title: form.title,
          subtitle: form.subtitle,
          cta_text: form.cta_text,
          cta_url: form.cta_url,
          duration_seconds: durationSeconds,
          sort_order: sortOrder,
          is_active: form.is_active,
          image: form.image ?? undefined,
        })
      }

      setShowForm(false)
      resetForm()
      await loadBanners()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save hero banner')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingBanner) return

    setSubmitting(true)
    setError(null)

    try {
      await deleteHeroBanner(deletingBanner.id)
      setDeletingBanner(null)
      await loadBanners()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete hero banner')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-0">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Hero Banners</h1>
          <p className="text-muted-foreground mt-1">Upload and rotate hero banners on the homepage.</p>
        </div>
        <Button className="gap-2" onClick={() => setShowForm((prev) => !prev)}>
          <Plus className="w-4 h-4" />
          {showForm ? 'Cancel' : 'Add Banner'}
        </Button>
      </div>

      {error && (
        <Card className="p-4 mb-6 border-red-300">
          <p className="text-sm text-red-700">{error}</p>
        </Card>
      )}

      {showForm && (
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editing ? 'Edit Hero Banner' : 'Upload New Hero Banner'}
          </h2>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
            <Input
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              required
            />
            <Input
              placeholder="CTA Text"
              value={form.cta_text}
              onChange={(e) => setForm((prev) => ({ ...prev, cta_text: e.target.value }))}
              required
            />

            <Input
              placeholder="Subtitle (optional)"
              value={form.subtitle}
              onChange={(e) => setForm((prev) => ({ ...prev, subtitle: e.target.value }))}
            />
            <Input
              placeholder="CTA URL (e.g. /products)"
              value={form.cta_url}
              onChange={(e) => setForm((prev) => ({ ...prev, cta_url: e.target.value }))}
              required
            />

            <Input
              placeholder="Duration (seconds)"
              type="number"
              value={form.duration_seconds}
              onChange={(e) => setForm((prev) => ({ ...prev, duration_seconds: e.target.value }))}
              required
            />

            <Input
              placeholder="Sort order (0,1,2...)"
              type="number"
              value={form.sort_order}
              onChange={(e) => setForm((prev) => ({ ...prev, sort_order: e.target.value }))}
              required
            />

            <label className="flex items-center gap-2 text-sm text-foreground md:col-span-2">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))}
              />
              Active (shows in rotation)
            </label>

            <div className="md:col-span-2">
              <label className="text-sm text-foreground block mb-2">
                Banner image {editing ? '(optional - leave empty to keep existing)' : '(required)'}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    image: e.target.files && e.target.files.length > 0 ? e.target.files[0] : null,
                  }))
                }
              />
            </div>

            <div className="md:col-span-2 flex gap-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : editing ? 'Update Banner' : 'Upload Banner'}
              </Button>
              {editing && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    resetForm()
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Card>
      )}

      <Card className="p-6">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading hero banners...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Image</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Title</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Duration</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Sort</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredBanners.map((banner) => (
                  <tr key={banner.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4">
                      {banner.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={banner.image}
                          alt={banner.title || 'Hero banner'}
                          className="w-12 h-12 object-cover rounded-md border border-border"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">
                          No-img
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-foreground font-medium">{banner.title}</td>
                    <td className="py-3 px-4 text-sm">{banner.duration_seconds}s</td>
                    <td className="py-3 px-4 text-sm">{banner.sort_order}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(banner)}
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setDeletingBanner(banner)}
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogTitle>Delete Hero Banner</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{banner.title}"? This cannot be undone.
                            </AlertDialogDescription>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setDeletingBanner(null)}>
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction onClick={handleDelete} disabled={submitting}>
                                {submitting ? 'Deleting...' : 'Delete'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredBanners.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 px-4 text-center text-sm text-muted-foreground">
                      No hero banners found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
