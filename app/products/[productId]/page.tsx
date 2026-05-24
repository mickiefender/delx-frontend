'use client'

import { useEffect, useMemo, useState, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useCartStore } from '@/lib/store/cart'
import { Star, Heart, Truck, Shield, ArrowLeft, Link as LinkIcon, Share2, Facebook, Twitter, Linkedin, MessageCircle, ShoppingBag } from 'lucide-react'
import { toast } from 'sonner'
import { fetchStoreProductBySlug, ProductDetailItem, ProductImageItem } from '@/lib/services/products'
import { HomeAdsSection } from '@/components/home/home-ads-section'
import { useAuthStore } from '@/lib/store/auth'

type ProductReview = {
  id: string
  product?: string
  user_name?: string
  title?: string
  content?: string
  rating: number
  is_verified_purchase?: boolean
  helpful_count: number
  created_at: string
  images?: Array<{ id?: string; image?: string }> | Array<{ image?: string }> | Array<string>
}


const sanitizeProductDescription = (html: string): string => {
  if (typeof window === 'undefined') return html

  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  const blockedTags = ['script', 'style', 'iframe', 'object', 'embed', 'form']
  blockedTags.forEach((tag) => {
    doc.querySelectorAll(tag).forEach((node) => node.remove())
  })

  doc.querySelectorAll('*').forEach((el) => {
    Array.from(el.attributes).forEach((attr) => {
      const attrName = attr.name.toLowerCase()
      const attrValue = attr.value.trim().toLowerCase()

      if (attrName.startsWith('on')) {
        el.removeAttribute(attr.name)
      }

      if ((attrName === 'href' || attrName === 'src') && attrValue.startsWith('javascript:')) {
        el.removeAttribute(attr.name)
      }
    })
  })

  return doc.body.innerHTML
}

function formatGhs(amount: number): string {
  return `₵${amount.toFixed(2).replace(/\.00$/, '')}`
}

const toAbsoluteMediaUrl = (url?: string | null): string => {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'
  const backendBase = API_BASE_URL.replace(/\/api\/v1\/?$/, '')

  if (url.startsWith('/')) return `${backendBase}${url}`
  return `${backendBase}/${url}`
}

type ShareButtonProps = {
  label: string
  icon: React.ReactNode
  href: (url: string, text: string) => string
}

function ShareButton({ label, icon, href }: ShareButtonProps) {
  return (
    <button
      type="button"
      onClick={() => {
        const url = typeof window !== 'undefined' ? window.location.href : ''
        const text =
          typeof window !== 'undefined' ? (window as any).__PRODUCT_SHARE_TEXT__ : ''
        if (!url) return
        window.open(href(url, text || ''), '_blank', 'noopener,noreferrer')
      }}
      className="inline-flex items-center gap-2 px-3 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm"
      aria-label={`Share to ${label}`}
    >
      {icon}
      {label}
    </button>
  )
}

export default function ProductDetailPage({ params }: { params: Promise<{ productId: string }> }) {
  const resolvedParams = use(params)
  const slug = resolvedParams.productId
  const router = useRouter()

  const { addItem } = useCartStore()
  const [quantity, setQuantity] = useState<number>(1)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewData, setReviewData] = useState<{ title: string; content: string; rating: number }>({
    title: '',
    content: '',
    rating: 5,
  })
  const [isWishlisted, setIsWishlisted] = useState(false)

  const [product, setProduct] = useState<ProductDetailItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedImage, setSelectedImage] = useState<string>('')

  const [reviews, setReviews] = useState<ProductReview[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [reviewsError, setReviewsError] = useState<string | null>(null)

  type RelatedProduct = {
    id: string | number
    slug: string
    name: string
    image?: string
    price?: string | number
  }

  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([])
  const [relatedLoading, setRelatedLoading] = useState(false)
  const [relatedError, setRelatedError] = useState<string | null>(null)

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true)
        setError('')
        const data = await fetchStoreProductBySlug(slug)
        setProduct(data)
        if (data.image) setSelectedImage(data.image)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load product details.')
      } finally {
        setLoading(false)
      }
}

    loadProduct()
  }, [slug])

  useEffect(() => {
    if (!product?.id) return
    let cancelled = false

    async function loadRelated() {
      setRelatedLoading(true)
      setRelatedError(null)

      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'
        const res = await fetch(`${API_BASE_URL}/products/related/?product_id=${product?.id}`)
        if (!res.ok) {
          const text = await res.text()
          throw new Error(text || `Failed to load related products (${res.status})`)
        }

        const json = await res.json()
        const list: RelatedProduct[] = Array.isArray(json)
          ? json
          : Array.isArray(json?.results)
            ? json.results
            : []

        if (!cancelled) setRelatedProducts(list)
      } catch (e) {
        if (!cancelled) {
          setRelatedError(e instanceof Error ? e.message : 'Failed to load related products')
          setRelatedProducts([])
        }
      } finally {
        if (!cancelled) setRelatedLoading(false)
      }
    }

    async function loadReviews() {
      setReviewsLoading(true)
      setReviewsError(null)

      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'
        const res = await fetch(`${API_BASE_URL}/reviews/?product=${product?.id}&ordering=-created_at`)

        if (!res.ok) {
          const text = await res.text()
          throw new Error(text || `Failed to load reviews (${res.status})`)
        }

        const json = await res.json()
        const list: ProductReview[] = Array.isArray(json) ? json : Array.isArray(json?.results) ? json.results : []

        if (!cancelled) setReviews(list)
      } catch (e) {
        if (!cancelled) {
          setReviewsError(e instanceof Error ? e.message : 'Failed to load reviews')
          setReviews([])
        }
      } finally {
        if (!cancelled) setReviewsLoading(false)
      }
    }

    loadRelated()
    loadReviews()

    return () => {
      cancelled = true
    }
  }, [product?.id])

  const handleAddToCart = () => {
    if (!product) return
    const price = Number(product.price)
    addItem({
      id: `${product.id}`,
      productId: `${product.id}`,
      name: product.name,
      price,
      quantity,
      image: product.image || '🛍️',
    })
    toast.success(`${quantity} item(s) added to cart!`)
  }

  const handleBuyNow = () => {
    if (!product) return
    const price = Number(product.price)
    addItem({
      id: `${product.id}`,
      productId: `${product.id}`,
      name: product.name,
      price,
      quantity,
      image: product.image || '🛍️',
    })
    toast.success(`${quantity} item(s) added! Proceeding to checkout...`)
    router.push('/checkout')
  }

  const handleSubmitReview = async () => {
    if (!product?.id) return
    if (!reviewData.title.trim() || !reviewData.content.trim()) {
      toast.error('Please fill in all review fields')
      return
    }

    const token = useAuthStore.getState().token
    if (!token) {
      toast.error('Please sign in to submit a review')
      return
    }

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'
      const res = await fetch(`${API_BASE_URL}/reviews/`, {
        method: 'POST',
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product: product?.id,
          title: reviewData.title,
          content: reviewData.content,
          rating: reviewData.rating,
        }),
      })

      const text = await res.text()
      if (!res.ok) {
        throw new Error(text || `Failed to submit review (${res.status})`)
      }

      toast.success('Review submitted successfully!')
      setReviewData({ title: '', content: '', rating: 5 })
      setShowReviewForm(false)

      if (!product?.id) return

      // refresh
      const refreshRes = await fetch(
        `${API_BASE_URL}/reviews/?product=${product?.id}&ordering=-created_at`
      )
      if (refreshRes.ok) {
        const json = await refreshRes.json()
        const list: ProductReview[] = Array.isArray(json) ? json : Array.isArray(json?.results) ? json.results : []
        setReviews(list)
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to submit review')
    }
  }

  const averageRating = useMemo(() => {
    if (!reviews.length) return '0.0'
    const value = reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / reviews.length
    return value.toFixed(1)
  }, [reviews])

  const safeDescriptionHtml = useMemo(() => {
    if (!product?.description) return ''
    return sanitizeProductDescription(product.description)
  }, [product?.description])

  const price = product ? Number(product.price) : 0
  const originalPrice = product?.original_price ? Number(product.original_price) : null
  const inStock = product ? product.stock_quantity > 0 : false
  const features = product?.short_description
    ? product.short_description.split('.').map((item) => item.trim()).filter(Boolean)
    : ['Premium quality product', 'Carefully selected materials', 'Backed by our quality guarantee']

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background flex items-center justify-center px-4">
          <div className="text-muted-foreground">Loading product...</div>
        </main>
        <Footer />
      </>
    )
  }

  if (error || !product) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || 'Product not found.'}</p>
            <Link href="/products">
              <Button variant="outline">Back to Products</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const productImages: ProductImageItem[] = product.images || []

  return (
    <>
      <Header />
      <main className="bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb / Back */}
          <div className="mb-6">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Products
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Gallery */}
            <div className="lg:col-span-7">
              <Card className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:gap-6">
                  <div className="w-full sm:w-[72%]">
                    <div className="rounded-lg overflow-hidden border border-border bg-muted flex items-center justify-center min-h-[320px]">
                      {selectedImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={selectedImage} alt={product.name} className="w-full h-full max-h-[480px] object-contain" />
                      ) : (
                        <div className="text-6xl">🛍️</div>
                      )}
                    </div>
                  </div>

                  {/* Thumbnails */}
                  {productImages.length > 0 && (
                    <div className="w-full sm:w-[28%] mt-4 sm:mt-0">
                      <div className="grid grid-cols-4 sm:grid-cols-1 gap-3 sm:gap-3">
                        {productImages.map((img) => {
                          const isSelected = selectedImage === img.image
                          return (
                            <button
                              key={img.id}
                              type="button"
                              onClick={() => setSelectedImage(img.image)}
                              className={`h-20 w-full rounded-lg overflow-hidden border-2 transition-all ${
                                isSelected ? 'border-accent ring-2 ring-accent/30' : 'border-border hover:border-accent'
                              }`}
                              aria-label={`View image for ${product.name}`}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={img.image} alt={img.alt_text || product.name} className="w-full h-full object-cover" />
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Main image quick action row */}
                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h1 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight break-words">
                      {product.name}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                      {product.category_name || 'Uncategorized'}
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    className="shrink-0"
                    size="lg"
                    onClick={() => setIsWishlisted((v) => !v)}
                    aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                </div>

                {/* Social share row */}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-2 text-sm text-muted-foreground mr-1">
                    <Share2 className="w-4 h-4" />
                    Share
                  </div>

                  {(() => {
                    const primaryImage = selectedImage || product.image || product.images?.[0]?.image || ''
                    const shareText = `Check out: ${product.name} (${formatGhs(price)}) • ${product.category_name || 'Category'}`
                    // Expose to ShareButton click handler without re-render coupling.
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ;(window as any).__PRODUCT_SHARE_TEXT__ = `${shareText}${primaryImage ? `\nImage: ${primaryImage}` : ''}`
                    return null
                  })()}

                  <ShareButton
                    label="WhatsApp"
                    icon={<MessageCircle className="w-4 h-4" />}
                    href={(url, text) => `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`}
                  />
                  <ShareButton
                    label="Facebook"
                    icon={<Facebook className="w-4 h-4" />}
                    href={(url, text) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`}
                  />
                  <ShareButton
                    label="X"
                    icon={<Twitter className="w-4 h-4" />}
                    href={(url, text) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`}
                  />
                  <ShareButton
                    label="LinkedIn"
                    icon={<Linkedin className="w-4 h-4" />}
                    href={(url, text) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(text)}`}
                  />

                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const url = typeof window !== 'undefined' ? window.location.href : ''
                        if (!url) return
                        const primaryImage = selectedImage || product.image || product.images?.[0]?.image || ''
                        const shareText = `Check out: ${product.name} (${formatGhs(price)}) • ${product.category_name || 'Category'}`
                        const finalText = `${shareText}${primaryImage ? `\nImage: ${primaryImage}` : ''}\n${url}`
                        await navigator.clipboard.writeText(finalText)
                        toast.success('Share text copied!')
                      } catch {
                        toast.error('Unable to copy link')
                      }
                    }}
                    className="inline-flex items-center gap-2 px-3 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm"
                  >
                    <LinkIcon className="w-4 h-4" />
                    Copy
                  </button>
                </div>

                {/* Rating row */}
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(Number(product.rating))
                              ? 'fill-accent text-accent'
                              : 'text-muted-foreground'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-semibold text-foreground">{product.rating}</span>
                  </div>
                  <span className="text-muted-foreground">({product.review_count} reviews)</span>
                </div>
              </Card>
            </div>

            {/* Purchase / Summary */}
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-[5.25rem]">
                <Card className="p-4 sm:p-6">
                  {/* Price */}
                  <div className="mb-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-4xl font-bold text-foreground">
                          {formatGhs(price)}
                        </div>
                        {originalPrice && originalPrice > price && (
                          <div className="mt-2 flex flex-wrap items-center gap-3">
                            <div className="text-2xl line-through text-muted-foreground">
                              {formatGhs(originalPrice)}
                            </div>
                            <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                              Save {Math.round((1 - price / originalPrice) * 100)}%
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-muted-foreground mb-1">Stock Status</p>
                        <p className={`font-medium ${inStock ? 'text-green-700' : 'text-red-700'}`}>
                          {inStock ? 'In Stock' : 'Out of Stock'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Description preview */}
                  {safeDescriptionHtml ? (
                    <div className="mb-5">
                      <h3 className="font-semibold text-foreground mb-3">About this item</h3>
                      <div
                        className="text-foreground leading-relaxed prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: safeDescriptionHtml }}
                      />
                    </div>
                  ) : (
                    <p className="text-muted-foreground mb-5">No description available for this product.</p>
                  )}

{/* Quantity + CTA */}
                  <div className="mb-5">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
                      <div className="flex items-center justify-between sm:justify-none border border-border rounded-lg">
                        <button
                          type="button"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="px-4 py-2 text-foreground hover:bg-muted transition-colors"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="px-4 py-2 font-semibold">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => setQuantity(quantity + 1)}
                          className="px-4 py-2 text-foreground hover:bg-muted transition-colors"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
                        <Button onClick={handleAddToCart} variant="outline" className="flex-1" size="lg" disabled={!inStock}>
                          <ShoppingBag className="w-5 h-5 mr-2" />
                          Add to Cart
                        </Button>
                        <Button onClick={handleBuyNow} className="flex-1" size="lg" disabled={!inStock}>
                          Buy Now
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Product guarantees */}
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                      <Truck className="w-5 h-5 text-muted-foreground" />
                      <div className="text-sm">
                        <p className="font-medium text-foreground">Free Shipping</p>
                        <p className="text-xs text-muted-foreground">On orders over ₵100</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                      <Shield className="w-5 h-5 text-muted-foreground" />
                      <div className="text-sm">
                        <p className="font-medium text-foreground">30-Day Returns</p>
                        <p className="text-xs text-muted-foreground">Easy returns & refunds</p>
                      </div>
                    </div>
                  </div>

                  {/* SKU / Details */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">SKU</p>
                      <p className="font-medium text-foreground">{product.sku || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Quantity</p>
                      <p className="font-medium text-foreground">{product.stock_quantity} available</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Key Features below purchase card */}
              <Card className="p-4 sm:p-6 mt-6">
                <h2 className="text-xl font-bold text-foreground mb-3">Key Features</h2>
                <ul className="space-y-2">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-foreground">
                      <span className="text-accent mt-1">✓</span>
                      <span className="leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>

          {/* Ads (banners) */}
          <div className="mt-8">
            <HomeAdsSection />
          </div>

          {/* Related Products */}
          <section className="mt-10">
            <div className="flex items-center justify-between mb-4 gap-4">
              <h2 className="text-lg sm:text-xl font-bold text-foreground">Related Products</h2>
              <p className="text-xs text-muted-foreground">
                {relatedLoading ? 'Loading…' : relatedProducts.length ? 'You may also like' : ''}
              </p>
            </div>

            {relatedError ? (
              <div className="text-sm text-destructive">{relatedError}</div>
            ) : relatedLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="border border-border bg-card rounded-lg p-3">
                    <div className="h-28 bg-muted rounded-md mb-2" />
                    <div className="h-3 bg-muted rounded w-4/5 mb-2" />
                    <div className="h-3 bg-muted rounded w-2/5" />
                  </div>
                ))}
              </div>
            ) : relatedProducts.length === 0 ? (
              <div className="text-sm text-muted-foreground">No related products found.</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {relatedProducts.map((p) => (
                  <Link
                    key={String(p.id)}
                    href={`/products/${p.slug}`}
                    className="group border border-border bg-card rounded-lg overflow-hidden hover:shadow-sm transition-shadow"
                  >
                    <div className="h-28 bg-muted flex items-center justify-center overflow-hidden">
                      {p.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <span className="text-4xl">🛍️</span>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-semibold text-foreground line-clamp-2">{p.name}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

              {/* Reviews */}
          <div className="mt-6">
            <Card className="p-4">
              <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4">Customer Reviews</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 pb-6 border-b border-border">
                <div className="text-center md:pr-4 md:border-r md:border-border md:mb-0 mb-3">
                  <p className="text-3xl font-bold text-foreground mb-1">{averageRating}</p>
                  <div className="flex justify-center mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(parseFloat(averageRating)) ? 'fill-accent text-accent' : 'text-muted-foreground'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground text-xs">{reviews.length} verified reviews</p>
                </div>

                <div className="md:col-span-2">
                  {reviewsLoading ? (
                    <div className="text-sm text-muted-foreground">Loading reviews…</div>
                  ) : reviewsError ? (
                    <div className="text-sm text-destructive">{reviewsError}</div>
                  ) : (
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map((rating) => {
                        const count = reviews.filter((r) => Number(r.rating) === rating).length
                        const percentage = reviews.length ? (count / reviews.length) * 100 : 0
                        return (
                          <div key={rating} className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground w-10">{rating} ★</span>
                            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-accent" style={{ width: `${percentage}%` }} />
                            </div>
                            <span className="text-xs text-muted-foreground w-8 text-right">{count}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              {!showReviewForm && (
                <Button onClick={() => setShowReviewForm(true)} className="mb-4" variant="outline" size="sm">
                  Write a Review
                </Button>
              )}

              {showReviewForm && (
                <div className="bg-muted/50 p-4 rounded-lg mb-5 border border-border">
                  <h3 className="text-sm font-bold text-foreground mb-3">Share your experience</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewData((prev) => ({ ...prev, rating: star }))}
                            className="p-1"
                            aria-label={`Set rating to ${star}`}
                          >
                            <Star
                              className={`w-8 h-8 ${
                                star <= reviewData.rating ? 'fill-accent text-accent' : 'text-muted-foreground'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Review Title</label>
                      <Input
                        placeholder="Sum up your experience..."
                        value={reviewData.title}
                        onChange={(e) => setReviewData((prev) => ({ ...prev, title: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Your Review</label>
                      <textarea
                        placeholder="Tell us more about your experience with this product..."
                        value={reviewData.content}
                        onChange={(e) => setReviewData((prev) => ({ ...prev, content: e.target.value }))}
                        className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                        rows={4}
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button type="button" onClick={handleSubmitReview}>
                        Submit Review
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowReviewForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {reviews.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No reviews yet. Be the first to review.</div>
                ) : (
                  reviews.map((review) => (
                    <div key={review.id} className="border border-border rounded-lg p-3 hover:bg-muted/30 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground text-sm truncate">{review.user_name || 'Customer'}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {review.created_at ? new Date(review.created_at).toLocaleDateString() : ''}
                          </p>
                        </div>

                        <div className="flex shrink-0">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < Number(review.rating) ? 'fill-accent text-accent' : 'text-muted-foreground'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {review.title && <h4 className="font-semibold text-foreground text-sm mt-2">{review.title}</h4>}
                      {review.content && <p className="text-foreground text-sm mt-1 leading-relaxed">{review.content}</p>}

                      <div className="mt-2 flex items-center justify-between">
                        <button
                          type="button"
                          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                          onClick={() => toast.message('Thanks for your feedback!')}
                        >
                          Helpful ({review.helpful_count ?? 0})
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
