'use client'

import { Star } from 'lucide-react'

const testimonials = [
  {
    id: 1,
    name: 'Ama Osei',
    title: 'Fashion Enthusiast',
    content: 'Delchris has completely transformed how I shop for premium fashion. The quality is unmatched and the customer service is exceptional.',
    rating: 5,
    avatar: '👩',
  },
  {
    id: 2,
    name: 'Kwame Mensah',
    title: 'Business Professional',
    content: 'Finally found a platform that understands luxury and delivers on quality. Every purchase has exceeded my expectations.',
    rating: 5,
    avatar: '👨',
  },
  {
    id: 3,
    name: 'Akosua Boateng',
    title: 'Style Blogger',
    content: 'The curated collection at Delchris is absolutely stunning. I recommend it to all my followers looking for premium items.',
    rating: 5,
    avatar: '👩‍🦰',
  },
]

export function TestimonialSection() {
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
