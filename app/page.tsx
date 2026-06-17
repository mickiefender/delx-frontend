import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { HeroSection } from '@/components/home/hero-section'
import { FeaturedProducts } from '@/components/home/featured-products'
import { CollectionSection } from '@/components/home/collection-section'
import { HomeAdsSection } from '@/components/home/home-ads-section'
import { CategoriesSection } from '@/components/home/categories-section'
import { BrandsSection } from '@/components/home/brands-section'
import { TestimonialSection } from '@/components/home/testimonial-section'
import { MobileAppsDownloadSection } from '@/components/home/mobile-apps-download-section'

export const metadata = {
  title: 'Delchris - Premium Fashion & Lifestyle',
  description: 'Discover curated premium fashion, lifestyle, and luxury products. Experience excellence with Delchris.',
}

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <HeroSection />

        {/* Categories Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card">
          <div className="max-w-7xl mx-auto">
            <CategoriesSection />
          </div>
        </section>

        {/* Featured Brands */}
        <section className="py-10 px-4 sm:px-6 lg:px-8 bg-background">
          <div className="max-w-7xl mx-auto">
            <BrandsSection label="Featured Brands" />
          </div>
        </section>

{/* Featured Products */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <FeaturedProducts />
          </div>
        </section>

        {/* Collection Section - Products by Collection Type */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card">
          <div className="max-w-7xl mx-auto">
            <CollectionSection />
          </div>
        </section>

        {/* Ads Section - two banners uploaded via admin */}
        <div className="bg-background">
          <HomeAdsSection />
        </div>

        {/* Call to Action */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-semibold mb-4 text-balance">
              Quality & Excellence in Every Purchase
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Experience the finest selection of premium products, carefully curated for discerning customers.
            </p>
            <Link href="/products">
              <Button 
                size="lg" 
                variant="secondary"
                className="rounded-full px-8"
              >
                Explore Collection
              </Button>
            </Link>
          </div>
        </section>

        <MobileAppsDownloadSection />

        {/* Testimonials */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card">
          <div className="max-w-7xl mx-auto">
            <TestimonialSection />
          </div>
        </section>

        {/* Trust Badges */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
              <div>
                <h3 className="font-semibold mb-2">Fast Delivery</h3>
                <p className="text-muted-foreground text-sm">
                  Quick shipping across Ghana and West Africa
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Secure Payment</h3>
                <p className="text-muted-foreground text-sm">
                  Multiple payment options for your convenience
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Money-back Guarantee</h3>
                <p className="text-muted-foreground text-sm">
                  100% satisfaction or your money back
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
