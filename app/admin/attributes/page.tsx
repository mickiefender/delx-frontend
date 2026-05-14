'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Plus, Trash2 } from 'lucide-react'
import {
  fetchAttributes,
  createAttribute,
  deleteAttribute,
  ProductAttributeItem,
} from '@/lib/services/products'
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

interface AttributeFormState {
  name: string
  values: string
  is_active: boolean
}

const initialFormState: AttributeFormState = {
  name: '',
  values: '',
  is_active: true,
}

export default function AdminAttributesPage() {
  const [attributes, setAttributes] = useState<ProductAttributeItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [form, setForm] = useState<AttributeFormState>(initialFormState)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingAttribute, setDeletingAttribute] = useState<ProductAttributeItem | null>(null)

  const loadAttributes = async () => {
    setError(null)
    try {
      const data = await fetchAttributes()
      setAttributes(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load attributes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAttributes()
  }, [])

  const filteredAttributes = useMemo(() => {
    return attributes.filter((attr) =>
      attr.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [attributes, searchTerm])

  const resetForm = () => setForm(initialFormState)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    if (!form.name.trim()) {
      setError('Attribute name is required.')
      return
    }

    if (!form.values.trim()) {
      setError('At least one value is required.')
      return
    }

    const valuesArray = form.values
      .split(',')
      .map((v) => v.trim())
      .filter((v) => v.length > 0)

    if (valuesArray.length === 0) {
      setError('At least one value is required.')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      await createAttribute({
        name: form.name,
        values: valuesArray,
        is_active: form.is_active,
      })

      resetForm()
      setShowAddForm(false)
      setLoading(true)
      await loadAttributes()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create attribute')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingAttribute) return

    setSubmitting(true)
    setError(null)

    try {
      await deleteAttribute(deletingAttribute.id)
      setDeletingAttribute(null)
      await loadAttributes()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete attribute')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-0">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Attributes</h1>
          <p className="text-muted-foreground mt-1">Create and manage product attributes</p>
        </div>
        <Button className="gap-2" onClick={() => setShowAddForm((prev) => !prev)}>
          <Plus className="w-4 h-4" />
          {showAddForm ? 'Cancel' : 'Add Attribute'}
        </Button>
      </div>

      {error && (
        <Card className="p-4 mb-6 border-red-300">
          <p className="text-sm text-red-700">{error}</p>
        </Card>
      )}

      {showAddForm && (
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Create Attribute</h2>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
            <Input
              placeholder="Attribute name (e.g., Color, Size, Material)"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              required
              className="md:col-span-2"
            />
            <Input
              placeholder="Values (comma separated, e.g., Red, Blue, Green)"
              value={form.values}
              onChange={(e) => setForm((prev) => ({ ...prev, values: e.target.value }))}
              required
              className="md:col-span-2"
            />

            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))}
              />
              Active attribute
            </label>

            <div className="md:col-span-2 flex gap-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Attribute'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="p-4 mb-6">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search attributes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-0 bg-transparent focus:ring-0 placeholder:text-muted-foreground"
          />
        </div>
      </Card>

      <Card className="p-6">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading attributes...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Values</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttributes.map((attr) => (
                  <tr key={attr.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 text-sm text-foreground font-medium">{attr.name}</td>
                    <td className="py-3 px-4 text-sm text-foreground">
                      <div className="flex flex-wrap gap-1">
                        {attr.values?.map((value, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-muted rounded text-xs"
                          >
                            {value}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-foreground">
                      {attr.is_active ? 'Active' : 'Inactive'}
                    </td>
                    <td className="py-3 px-4">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setDeletingAttribute(attr)}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogTitle>Delete Attribute</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{attr.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setDeletingAttribute(null)}>
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} disabled={submitting}>
                              {submitting ? 'Deleting...' : 'Delete'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </td>
                  </tr>
                ))}
                {filteredAttributes.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 px-4 text-center text-sm text-muted-foreground">
                      No attributes found.
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
