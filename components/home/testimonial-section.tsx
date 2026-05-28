'use client'

import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import { getFeaturedReviews, type Review } from '@/lib/services/reviews'

// Fallback testimonials when no backend reviews available
const fallbackTestimonials = [
  {
    id: 1,
    name: 'Ama Osei',
    title: 'Fashion Enthusiast',
    content: 'Delchris has completely transformed how I shop for premium fashion. The quality is unmatched and the customer service is exceptional.',
    rating: 5,
    avatar: '',
  },
  {
    id: 2,
    name: 'Kwame Mensah',
    title: 'Business Professional',
    content: 'Finally found a platform that understands luxury and delivers on quality. Every purchase has exceeded my expectations.',
    rating: 5,
    avatar: '',
  },
  {
    id: 3,
    name: 'Akosua Boateng',
    title: 'Style Blogger',
    content: 'The curated collection at Delchris is absolutely stunning. I recommend it to all my followers looking for premium items.',
    rating: 5,
    avatar: '',
  },
]

interface Testimonial {
  id: number
  name: string
  title: string
  content: string
  rating: number
  avatar: string
}

function mapReviewToTestimonial(review: Review, index: number): Testimonial {
  return {
    id: review.id,
    name: review.user_name || `Customer ${index + 1}`,
    title: review.is_verified_purchase ? 'Verified Customer' : 'Customer',
    content: review.content,
    rating: review.rating,
    avatar: ['', '', '', '', '', ''][index % 6] || '',
  }
}

export function TestimonialSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(fallbackTestimonials)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchReviews() {
      try {
        const reviews = await getFeaturedReviews()
        
        if (reviews && reviews.length > 0) {
          // Map backend reviews to testimonial format
          const mapped = reviews.slice(0, 3).map((review, index) => 
            mapReviewToTestimonial(review, index)
          )
          setTestimonials(mapped)
        }
      } catch (error) {
        console.error('Error fetching reviews:', error)
        // Keep fallback testimonials on error
      } finally {
        setIsLoading(false)
      }
    }

    fetchReviews()
  }, [])

  if (isLoading) {
    // Show skeleton loading state
    return (
      <div>
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-semibold mb-4 text-balance">
            What Our Customers Say
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Real experiences from real customers who trust Delchris.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div 
              key={i}
              className="bg-background border border-border rounded-lg p-6"
            >
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="w-4 h-4 text-muted"
                  />
                ))}
              </div>
              <div className="h-20 bg-muted/50 rounded mb-6 animate-pulse" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-muted/50 rounded animate-pulse" />
                  <div className="h-3 w-16 bg-muted/50 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-semibold mb-4 text-balance">
          What Our Customers Say
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Real experiences from real customers who trust Delchris.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((testimonial) => (
          <div 
            key={testimonial.id}
            className="bg-background border border-border rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            {/* Rating */}
            <div className="flex gap-1 mb-4">
              {Array.from({ length: testimonial.rating }).map((_, i) => (
                <Star
                  key={i}
                  className="w-4 h-4 fill-accent text-accent"
                />
              ))}
            </div>

            {/* Content */}
            <p className="text-muted-foreground mb-6">
              "{testimonial.content}"
            </p>

            {/* Author */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg">
                {testimonial.avatar}
              </div>
              <div>
                <p className="font-semibold text-sm">{testimonial.name}</p>
                <p className="text-xs text-muted-foreground">{testimonial.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
