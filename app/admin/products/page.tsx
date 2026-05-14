'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Pencil, Trash2 } from 'lucide-react'
import {
  createProduct,
  updateProduct,
  deleteProduct,
  fetchProducts,
  fetchCategories,
  fetchProductById,
  fetchAttributes,
  fetchBrands,
  ProductListItem,
  ProductDetailItem,
  CategoryItem,
  ProductAttributeItem,
  ProductCollection,
  BrandListItem,
} from '@/lib/services/products'
import { useQuill } from 'react-quilljs'
import 'quill/dist/quill.snow.css'
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

type ProductStatus = 'active' | 'inactive' | 'discontinued'

interface ProductFormState {
  name: string
  category: string
  brand: string // optional
  description: string
  short_description: string
  price: string
  original_price: string
  sku: string
  stock_quantity: string
  is_featured: boolean
  collection: ProductCollection
  status: ProductStatus
  image: File | null
  additional_images: File[]
  attributes: number[]
}

const initialFormState: ProductFormState = {
  name: '',
  category: '',
  brand: '',
  description: '',
  short_description: '',
  price: '',
  original_price: '',
  sku: '',
  stock_quantity: '',
  is_featured: false,
  collection: 'none',
  status: 'active',
  image: null,
  additional_images: [],
  attributes: [],
}

const getStatusStyles = (status: ProductStatus) => {
  if (status === 'active') return 'bg-green-100 text-green-800'
  if (status === 'inactive') return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
}

const getStockLabel = (stock: number) => `${stock} units`

export default function AdminProductsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [products, setProducts] = useState<ProductListItem[]>([])
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [brands, setBrands] = useState<BrandListItem[]>([])
  const [attributes, setAttributes] = useState<ProductAttributeItem[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [form, setForm] = useState<ProductFormState>(initialFormState)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingProduct, setEditingProduct] = useState<ProductListItem | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<ProductListItem | null>(null)
  const { quill, quillRef } = useQuill({
    modules: {
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'image'],
        ['clean'],
      ],
    },
  })

  const loadProducts = async () => {
    setError(null)
    try {
      const data = await fetchProducts()
      setProducts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

const loadCategories = async () => {
    try {
      const data = await fetchCategories()
      setCategories(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories')
    }
  }

  const loadAttributes = async () => {
    try {
      const data = await fetchAttributes()
      setAttributes(data)
    } catch (err) {
      console.error('Failed to load attributes:', err)
    }
  }

  const loadBrands = async () => {
    try {
      const data = await fetchBrands()
      setBrands(data)
    } catch (err) {
      console.error('Failed to load brands:', err)
    }
  }

  useEffect(() => {
    loadProducts()
    loadCategories()
    loadAttributes()
    loadBrands()
  }, [])

const filteredProducts = useMemo(() => {
    return products.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
}, [products, searchTerm])

  const resetForm = () => {
    setForm(initialFormState)
    setEditingProduct(null)
  }

  const handleCancelEdit = () => {
    resetForm()
    setShowAddForm(false)
  }

const handleEdit = async (product: ProductListItem) => {
    setEditingProduct(product)
    setError(null)

    try {
      // Fetch full product details to get description and short_description
      const productDetails = await fetchProductById(product.id)

setForm({
        name: productDetails.name,
        category: String(productDetails.category || ''),
        brand: productDetails.brand ? String(productDetails.brand) : '',
        description: productDetails.description || '',
        short_description: productDetails.short_description || '',
        price: productDetails.price,
        original_price: productDetails.original_price || '',
        sku: productDetails.sku || '',
        stock_quantity: String(productDetails.stock_quantity),
        is_featured: productDetails.is_featured,
        collection: productDetails.collection || 'none',
        status: productDetails.status || 'active',
        image: null,
        additional_images: [],
        attributes: [],
      })

      // Set Quill editor content if available
      if (quill && productDetails.description) {
        quill.root.innerHTML = productDetails.description
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load product details')
      // Still show the form with basic data
      setForm({
        name: product.name,
        category: String(product.category || ''),
        brand: product.brand ? String(product.brand) : '',
        description: '',
        short_description: '',
        price: product.price,
        original_price: product.original_price || '',
        sku: '',
        stock_quantity: String(product.stock_quantity),
        is_featured: product.is_featured,
        collection: 'none',
        status: product.status || 'active',
        image: null,
        additional_images: [],
        attributes: [],
      })
    }

    setShowAddForm(true)
  }

  const handleDelete = async () => {
    if (!deletingProduct) return

    setSubmitting(true)
    setError(null)

    try {
      await deleteProduct(deletingProduct.id)
      setDeletingProduct(null)
      await loadProducts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product')
    } finally {
      setSubmitting(false)
    }
  }

const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    if (!editingProduct) {
// Creating new product
      if (!form.image) {
        setError('Main product image is required.')
        return
      }

      if (!form.category.trim()) {
        setError('Product category is required.')
        return
      }

      if (!form.description.trim()) {
        setError('Product description is required.')
        return
      }

      setSubmitting(true)
      setError(null)

try {
        await createProduct({
          name: form.name,
          category: form.category,
          brand: form.brand || undefined,
          description: form.description,
          short_description: form.short_description,
          price: form.price,
          original_price: form.original_price || undefined,
          sku: form.sku || undefined,
          stock_quantity: form.stock_quantity,
          is_featured: form.is_featured,
          collection: form.collection,
          status: form.status,
          image: form.image,
          additional_images: form.additional_images,
          attributes: form.attributes,
        })

        resetForm()
        setShowAddForm(false)
        setLoading(true)
        await loadProducts()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create product')
      } finally {
        setSubmitting(false)
      }
    } else {
      // Editing existing product
      if (!form.category.trim()) {
        setError('Product category is required.')
        return
      }

      setSubmitting(true)
      setError(null)

try {
        await updateProduct(editingProduct.id, {
          name: form.name,
          category: form.category,
          brand: form.brand || undefined,
          description: form.description || undefined,
          short_description: form.short_description,
          price: form.price,
          original_price: form.original_price || undefined,
          sku: form.sku || undefined,
          stock_quantity: form.stock_quantity,
          is_featured: form.is_featured,
          collection: form.collection,
          status: form.status,
          image: form.image || undefined,
          additional_images: form.additional_images,
        })

        resetForm()
        setShowAddForm(false)
        setLoading(true)
        await loadProducts()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update product')
      } finally {
        setSubmitting(false)
      }
    }
  }

  useEffect(() => {
    if (!quill) return

    const handleChange = () => {
      setForm((prev) => ({ ...prev, description: quill.root.innerHTML }))
    }

    quill.on('text-change', handleChange)
    if (form.description && quill.root.innerHTML !== form.description) {
      quill.root.innerHTML = form.description
    }

    return () => {
      quill.off('text-change', handleChange)
    }
  }, [quill, form.description])

  return (
    <div className="p-0">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground mt-1">Manage your product catalog</p>
        </div>
        <Button className="gap-2" onClick={() => setShowAddForm((prev) => !prev)}>
          <Plus className="w-4 h-4" />
          {showAddForm ? 'Cancel' : 'Add Product'}
        </Button>
      </div>

      {error && (
        <Card className="p-4 mb-6 border-red-300">
          <p className="text-sm text-red-700">{error}</p>
        </Card>
      )}

      {showAddForm && (
        <Card className="p-6 mb-6">
<h2 className="text-xl font-semibold mb-4">
                  {editingProduct ? 'Edit Product' : 'Upload New Product'}
                </h2>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
            <Input
              placeholder="Product name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              required
            />

            <select
              value={form.category}
              onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={String(category.id)}>
                  {category.name}
                </option>
              ))}
            </select>

            <select
              value={form.brand}
              onChange={(e) => setForm((prev) => ({ ...prev, brand: e.target.value }))}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">No Brand (optional)</option>
              {brands
                .filter((b) => b.is_active)
                .map((brand) => (
                  <option key={brand.id} value={String(brand.id)}>
                    {brand.name}
                  </option>
                ))}
            </select>

            <Input
              placeholder="Price"
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
              required
            />

            <Input
              placeholder="Original price (optional)"
              type="number"
              step="0.01"
              value={form.original_price}
              onChange={(e) => setForm((prev) => ({ ...prev, original_price: e.target.value }))}
            />

            <Input
              placeholder="Stock quantity"
              type="number"
              value={form.stock_quantity}
              onChange={(e) => setForm((prev) => ({ ...prev, stock_quantity: e.target.value }))}
              required
            />

            <select
              value={form.collection}
              onChange={(e) => setForm((prev) => ({ ...prev, collection: e.target.value as ProductCollection }))}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="none">No Collection</option>
              <option value="new_arrival">New Arrival</option>
              <option value="best_seller">Best Seller</option>
              <option value="special_offer">Special Offer</option>
            </select>

            <Input
              placeholder="SKU (optional - auto generated if empty)"
              value={form.sku}
              onChange={(e) => setForm((prev) => ({ ...prev, sku: e.target.value }))}
            />

            <Input
              placeholder="Contents / short description"
              value={form.short_description}
              onChange={(e) => setForm((prev) => ({ ...prev, short_description: e.target.value }))}
            />

            <div className="md:col-span-2">
              <label className="text-sm text-foreground block mb-2">Description (with optional images)</label>
              <div className="bg-background border border-input rounded-md p-2">
                <div ref={quillRef} />
              </div>
            </div>

            <select
              value={form.status}
              onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as ProductStatus }))}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="discontinued">Discontinued</option>
            </select>

            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => setForm((prev) => ({ ...prev, is_featured: e.target.checked }))}
              />
              Featured product
            </label>

<div className="md:col-span-2">
              <label className="text-sm text-foreground block mb-2">
                Main image {editingProduct ? '(optional - leave empty to keep existing)' : '(required)'}
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
                required={!editingProduct}
              />
            </div>

<div className="md:col-span-2">
              <label className="text-sm text-foreground block mb-2">Additional images (multiple)</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    additional_images: e.target.files ? Array.from(e.target.files) : [],
                  }))
                }
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm text-foreground block mb-2">Attributes</label>
              <div className="flex flex-wrap gap-2">
                {attributes.map((attr) => (
                  <label key={attr.id} className="flex items-center gap-2 text-sm text-foreground">
                    <input
                      type="checkbox"
                      checked={form.attributes.includes(attr.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setForm((prev) => ({
                            ...prev,
                            attributes: [...prev.attributes, attr.id],
                          }))
                        } else {
                          setForm((prev) => ({
                            ...prev,
                            attributes: prev.attributes.filter((id) => id !== attr.id),
                          }))
                        }
                      }}
                    />
                    {attr.name}
                  </label>
                ))}
                {attributes.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No attributes available. Create attributes in the Attributes page.
                  </p>
                )}
              </div>
            </div>

            <div className="md:col-span-2">
<div className="md:col-span-2 flex gap-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Upload Product'}
                </Button>
                {editingProduct && (
                  <Button type="button" variant="outline" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Card>
      )}

      <Card className="p-4 mb-6">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-0 bg-transparent focus:ring-0 placeholder:text-muted-foreground"
          />
        </div>
      </Card>

      <Card className="p-6">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading products...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
<th className="text-left py-3 px-4 font-semibold text-foreground">Image</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Product Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Category</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Price</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Stock</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
<tr key={product.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">
                          No-img
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-foreground font-medium">{product.name}</td>
                    <td className="py-3 px-4 text-sm text-foreground">{product.category_name || '-'}</td>
                    <td className="py-3 px-4 text-sm font-semibold text-foreground">₵{product.price}</td>
                    <td className="py-3 px-4 text-sm text-foreground">{getStockLabel(product.stock_quantity)}</td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyles(product.status || 'active')}`}>
                        {product.status || 'active'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(product)}
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setDeletingProduct(product)}
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogTitle>Delete Product</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{product.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setDeletingProduct(null)}>Cancel</AlertDialogCancel>
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
{filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-6 px-4 text-center text-sm text-muted-foreground">
                      No products found.
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
