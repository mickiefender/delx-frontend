'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Plus, Pencil, Trash2, X } from 'lucide-react'
import {
  createCategory,
  fetchCategories,
  updateCategory,
  deleteCategory,
  CategoryItem,
} from '@/lib/services/products'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

const toAbsoluteMediaUrl = (url?: string | null): string => {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url

  const backendBase = API_BASE_URL.replace(/\/api\/v1\/?$/, '')
  if (url.startsWith('/')) {
    return `${backendBase}${url}`
  }
  return `${backendBase}/${url}`
}

interface CategoryFormState {
  name: string
  description: string
  image: File | null
  is_active: boolean
  is_featured: boolean
}

const initialFormState: CategoryFormState = {
  name: '',
  description: '',
  image: null,
  is_active: true,
  is_featured: false,
}

interface EditFormState {
  name: string
  description: string
  image: File | null
  is_active: boolean
  is_featured: boolean
}

const initialEditFormState: EditFormState = {
  name: '',
  description: '',
  image: null,
  is_active: true,
  is_featured: false,
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [form, setForm] = useState<CategoryFormState>(initialFormState)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<EditFormState>(initialEditFormState)
  const [editSubmitting, setEditSubmitting] = useState(false)

  // Delete state
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deleteSubmitting, setDeleteSubmitting] = useState(false)

  const loadCategories = async () => {
    setError(null)
    try {
      const data = await fetchCategories()
      // Convert image URLs to absolute URLs
      const categoriesWithAbsoluteImages = data.map((category) => ({
        ...category,
        image: toAbsoluteMediaUrl(category.image),
      }))
      setCategories(categoriesWithAbsoluteImages)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const filteredCategories = useMemo(() => {
    return categories.filter((category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [categories, searchTerm])

  const resetForm = () => setForm(initialFormState)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      await createCategory({
        name: form.name,
        description: form.description || undefined,
        image: form.image || undefined,
        is_active: form.is_active,
        is_featured: form.is_featured,
      })

      resetForm()
      setShowAddForm(false)
      setLoading(true)
      await loadCategories()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditClick = (category: CategoryItem) => {
    setEditingId(category.id)
    setEditForm({
      name: category.name,
      description: category.description || '',
      image: null,
      is_active: category.is_active,
      is_featured: category.is_featured || false,
    })
    setError(null)
  }

  const handleEditCancel = () => {
    setEditingId(null)
    setEditForm(initialEditFormState)
  }

  const handleEditSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!editingId) return

    setEditSubmitting(true)
    setError(null)

    try {
      await updateCategory(editingId, {
        name: editForm.name,
        description: editForm.description || undefined,
        image: editForm.image || undefined,
        is_active: editForm.is_active,
        is_featured: editForm.is_featured,
      })

      setEditingId(null)
      setEditForm(initialEditFormState)
      setLoading(true)
      await loadCategories()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update category')
    } finally {
      setEditSubmitting(false)
    }
  }

  const handleDeleteClick = (id: number) => {
    setDeletingId(id)
    setError(null)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingId) return

    setDeleteSubmitting(true)
    setError(null)

    try {
      await deleteCategory(deletingId)
      setDeletingId(null)
      setLoading(true)
      await loadCategories()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category')
    } finally {
      setDeleteSubmitting(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeletingId(null)
  }

  return (
    <div className="p-0">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Categories</h1>
          <p className="text-muted-foreground mt-1">Create and manage product categories</p>
        </div>
        <Button className="gap-2" onClick={() => setShowAddForm((prev) => !prev)}>
          <Plus className="w-4 h-4" />
          {showAddForm ? 'Cancel' : 'Add Category'}
        </Button>
      </div>

      {error && (
        <Card className="p-4 mb-6 border-red-300">
          <p className="text-sm text-red-700">{error}</p>
        </Card>
      )}

      {showAddForm && (
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Create Category</h2>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
            <Input
              placeholder="Category name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
            <Input
              placeholder="Description (optional)"
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            />
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))}
              />
              Active category
            </label>

            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => setForm((prev) => ({ ...prev, is_featured: e.target.checked }))}
              />
              Featured category (homepage)
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
              className="md:col-span-2"
            />
            <div className="md:col-span-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Category'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="p-4 mb-6">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-0 bg-transparent focus:ring-0 placeholder:text-muted-foreground"
          />
        </div>
      </Card>

      <Card className="p-6">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading categories...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Image</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Description</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((category) => (
                  <tr key={category.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    {editingId === category.id ? (
                      <>
                        <td className="py-3 px-4">
                          {category.image && (
                            <img
                              src={category.image}
                              alt={category.name}
                              className="w-16 h-16 object-cover rounded"
                            />
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                image: e.target.files && e.target.files.length > 0 ? e.target.files[0] : null,
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
                          <Input
                            value={editForm.description}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
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
                            <Button size="sm" type="submit" disabled={editSubmitting}>
                              {editSubmitting ? 'Saving...' : 'Save'}
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleEditCancel}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </>
                    ) : deletingId === category.id ? (
                      <>
                        <td className="py-3 px-4">
                          {category.image && (
                            <img
                              src={category.image}
                              alt={category.name}
                              className="w-16 h-16 object-cover rounded"
                            />
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm text-foreground font-medium">{category.name}</td>
                        <td className="py-3 px-4 text-sm text-foreground">{category.description || '-'}</td>
                        <td className="py-3 px-4 text-sm text-foreground">
                          {category.is_active ? 'Active' : 'Inactive'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-red-600 font-medium">Delete this category?</p>
                            <Button size="sm" variant="destructive" onClick={handleDeleteConfirm} disabled={deleteSubmitting}>
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
                          {category.image && (
                            <img
                              src={category.image}
                              alt={category.name}
                              className="w-16 h-16 object-cover rounded"
                            />
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm text-foreground font-medium">{category.name}</td>
                        <td className="py-3 px-4 text-sm text-foreground">{category.description || '-'}</td>
                        <td className="py-3 px-4 text-sm text-foreground">
                          {category.is_active ? 'Active' : 'Inactive'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEditClick(category)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteClick(category.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
                {filteredCategories.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 px-4 text-center text-sm text-muted-foreground">
                      No categories found.
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
