'use client'

import { useEffect, useMemo, useState, FormEvent } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Plus, Pencil, Trash2, X } from 'lucide-react'
import {
  createBrand,
  fetchBrands,
  updateBrand,
  deleteBrand,
  BrandListItem,
} from '@/lib/services/products'

const toAbsoluteMediaUrl = (url?: string | null): string => {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'
  const backendBase = API_BASE_URL.replace(/\/api\/v1\/?$/, '')
  if (url.startsWith('/')) return `${backendBase}${url}`
  return `${backendBase}/${url}`
}

interface BrandFormState {
  name: string
  logo: File | null
  is_active: boolean
}

interface BrandEditState {
  name: string
  logo: File | null
  is_active: boolean
}

const initialForm: BrandFormState = {
  name: '',
  logo: null,
  is_active: true,
}

const initialEdit: BrandEditState = {
  name: '',
  logo: null,
  is_active: true,
}

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<BrandListItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [form, setForm] = useState<BrandFormState>(initialForm)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<BrandEditState>(initialEdit)
  const [editSubmitting, setEditSubmitting] = useState(false)

  // Delete state
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deleteSubmitting, setDeleteSubmitting] = useState(false)

  const loadBrands = async () => {
    setError(null)
    setLoading(true)
    try {
      const data = await fetchBrands()
      const withAbsolute = data.map((b) => ({
        ...b,
        logo: toAbsoluteMediaUrl(b.logo),
      }))
      setBrands(withAbsolute)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load brands')
      setBrands([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadBrands()
  }, [])

  const filteredBrands = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) return brands
    return brands.filter((b) => b.name.toLowerCase().includes(q))
  }, [brands, searchTerm])

  const resetForm = () => setForm(initialForm)
  const resetEdit = () => {
    setEditingId(null)
    setEditForm(initialEdit)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      await createBrand({
        name: form.name,
        logo: form.logo,
        is_active: form.is_active,
      })

      resetForm()
      setShowAddForm(false)
      await loadBrands()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create brand')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditClick = (brand: BrandListItem) => {
    setEditingId(brand.id)
    setEditForm({
      name: brand.name,
      logo: null,
      is_active: brand.is_active,
    })
    setError(null)
  }

  const handleEditCancel = () => resetEdit()

  const handleEditSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!editingId) return

    setError(null)
    setEditSubmitting(true)

    try {
      await updateBrand(editingId, {
        name: editForm.name,
        logo: editForm.logo,
        is_active: editForm.is_active,
      })
      resetEdit()
      await loadBrands()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update brand')
    } finally {
      setEditSubmitting(false)
    }
  }

  const handleDeleteClick = (id: number) => {
    setDeletingId(id)
    setError(null)
  }

  const handleDeleteCancel = () => {
    setDeletingId(null)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingId) return
    setError(null)
    setDeleteSubmitting(true)

    try {
      await deleteBrand(deletingId)
      setDeletingId(null)
      await loadBrands()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete brand')
    } finally {
      setDeleteSubmitting(false)
    }
  }

  return (
    <div className="p-0">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Brands</h1>
          <p className="text-muted-foreground mt-1">Create and manage product brands</p>
        </div>

        <Button className="gap-2" onClick={() => setShowAddForm((p) => !p)}>
          <Plus className="w-4 h-4" />
          {showAddForm ? 'Cancel' : 'Add Brand'}
        </Button>
      </div>

      {error && (
        <Card className="p-4 mb-6 border-red-300">
          <p className="text-sm text-red-700">{error}</p>
        </Card>
      )}

      {showAddForm && (
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Create Brand</h2>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
            <Input
              placeholder="Brand name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              required
            />

            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))}
              />
              Active
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  logo: e.target.files && e.target.files.length > 0 ? e.target.files[0] : null,
                }))
              }
              className="md:col-span-2"
            />

            <div className="md:col-span-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Brand'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="p-4 mb-6">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search brands..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-0 bg-transparent focus:ring-0 placeholder:text-muted-foreground"
          />
        </div>
      </Card>

      <Card className="p-6">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading brands...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Logo</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBrands.map((brand) => (
                  <tr key={brand.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    {editingId === brand.id ? (
                      <>
                        <td className="py-3 px-4">
                          {brand.logo ? (
                            <img
                              src={brand.logo}
                              alt={brand.name}
                              className="w-16 h-16 object-contain rounded bg-muted"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded bg-muted flex items-center justify-center text-sm text-muted-foreground">
                              —
                            </div>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                logo: e.target.files && e.target.files.length > 0 ? e.target.files[0] : null,
                              }))
                            }
                            className="mt-2 text-sm"
                          />
                        </td>

                        <td className="py-3 px-4">
                          <Input
                            value={editForm.name}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                            required
                          />
                        </td>

                        <td className="py-3 px-4">
                          <label className="flex items-center gap-2 text-sm text-foreground">
                            <input
                              type="checkbox"
                              checked={editForm.is_active}
                              onChange={(e) => setEditForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                            />
                            Active
                          </label>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button size="sm" type="submit" disabled={editSubmitting} form="editBrandForm">
                              {editSubmitting ? 'Saving...' : 'Save'}
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleEditCancel}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          <form id="editBrandForm" onSubmit={handleEditSubmit} className="hidden" />
                        </td>
                      </>
                    ) : deletingId === brand.id ? (
                      <>
                        <td className="py-3 px-4">
                          {brand.logo && (
                            <img
                              src={brand.logo}
                              alt={brand.name}
                              className="w-16 h-16 object-contain rounded bg-muted"
                            />
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm text-foreground font-medium">{brand.name}</td>
                        <td className="py-3 px-4 text-sm text-foreground">
                          {brand.is_active ? 'Active' : 'Inactive'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-red-600 font-medium">Delete this brand?</p>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={handleDeleteConfirm}
                              disabled={deleteSubmitting}
                            >
                              {deleteSubmitting ? 'Deleting...' : 'Confirm'}
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleDeleteCancel}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-3 px-4">
                          {brand.logo ? (
                            <img
                              src={brand.logo}
                              alt={brand.name}
                              className="w-16 h-16 object-contain rounded bg-muted"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded bg-muted flex items-center justify-center text-sm text-muted-foreground">
                              —
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4 text-sm text-foreground font-medium">{brand.name}</td>

                        <td className="py-3 px-4 text-sm text-foreground">
                          {brand.is_active ? 'Active' : 'Inactive'}
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEditClick(brand)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteClick(brand.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}

                {filteredBrands.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 px-4 text-center text-sm text-muted-foreground">
                      No brands found.
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
