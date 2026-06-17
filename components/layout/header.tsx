'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { useCartStore } from '@/lib/store/cart'
import { useWishlistStore } from '@/lib/store/wishlist'
import { Button } from '@/components/ui/button'
import { fetchPublicSettings } from '@/lib/services/settings'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

import {
  Search,
  ShoppingCart,
  Menu,
  X,
  Heart,
  User,
  LogOut,
  Shield,
  ChevronDown,
} from 'lucide-react'

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [siteLogo, setSiteLogo] = useState<string | null>(null)

const { user, isAuthenticated, signOut, isAdmin, isAuthReady } =
    useAuth()

  const cartItems = useCartStore((state) => state.items)
  const wishlistItems = useWishlistStore((state) => state.items)

  const cartCount = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  )

  const wishlistCount = wishlistItems.length

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }

    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isMobileMenuOpen])

  useEffect(() => {
    let cancelled = false

    const toAbsoluteMediaUrl = (
      url?: string | null
    ): string => {
      if (!url) return ''

      if (
        url.startsWith('http://') ||
        url.startsWith('https://')
      ) {
        return url
      }

      const backendBase = (
        process.env.NEXT_PUBLIC_API_URL ||
        'http://localhost:8000/api/v1'
      ).replace(/\/api\/v1\/?$/, '')

      if (url.startsWith('/')) {
        return `${backendBase}${url}`
      }

      return `${backendBase}/${url}`
    }

    const load = async () => {
      try {
        const settings = await fetchPublicSettings()

        if (cancelled) return

        const logo = (settings as any).site_logo as
          | string
          | null
          | undefined

        setSiteLogo(
          logo ? toAbsoluteMediaUrl(logo) : null
        )
      } catch {
        // fallback silently
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [])

  const canRenderClientState =
    isMounted && isAuthReady

  const closeMobileMenu = () =>
    setIsMobileMenuOpen(false)

  return (
    <>
      <header className="sticky top-0 z-40">
        {/* Main Header */}
        <div className="bg-primary text-primary-foreground shadow-md">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              {/* Top Header */}
              <div className="flex items-center justify-between gap-4 py-4">
                {/* Logo */}
                <Link
                  href="/"
                  className="flex items-center gap-2 flex-shrink-0"
                >
                  {siteLogo ? (
                    <img
                      src={siteLogo}
                      alt="Delx"
                      className="w-23 h-14 rounded-md "
                      loading="eager"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-md bg-white" />
                  )}

                  <span className="hidden sm:inline text-xl font-bold">
                    Delx
                  </span>
                </Link>

                {/* Desktop Search */}
                <div className="hidden md:flex flex-1 max-w-xl">
                  <div className="relative flex w-full">
                    <input
                      type="text"
                      placeholder="Search for products..."
                      value={searchQuery}
                      onChange={(e) =>
                        setSearchQuery(e.target.value)
                      }
                      className="w-full rounded-l-xl border-0 bg-white px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none"
                    />

                    <button className="flex items-center justify-center rounded-r-xl bg-black px-5 hover:bg-black/90 transition-colors">
                      <Search className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 sm:gap-3">
{/* Mobile Wishlist */}
                  <Link
                    href="/wishlist"
                    className="relative md:hidden flex items-center justify-center p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <Heart className="w-5 h-5" />

                    {isMounted &&
                      wishlistCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full bg-white text-primary text-xs font-bold">
                          {wishlistCount}
                        </span>
                      )}
                  </Link>

                  {/* Desktop Wishlist */}
                  <Link
                    href="/wishlist"
                    className="relative hidden sm:flex p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <Heart className="w-5 h-5" />

                    {isMounted &&
                      wishlistCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full bg-white text-primary text-xs font-bold">
                          {wishlistCount}
                        </span>
                      )}
                  </Link>

                  {/* Admin */}
                  {canRenderClientState &&
                    isAdmin && (
                      <Link
                        href="/admin"
                        className="hidden sm:flex p-2 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <Shield className="w-5 h-5" />
                      </Link>
                    )}

                  {/* Cart */}
                  <Link
                    href="/cart"
                    className="relative flex items-center justify-center p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <ShoppingCart className="w-5 h-5" />

                    {isMounted &&
                      cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full bg-white text-primary text-xs font-bold">
                          {cartCount}
                        </span>
                      )}
                  </Link>

                  {/* User Menu */}
                  {canRenderClientState &&
                  isAuthenticated &&
                  user ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-1 rounded-lg p-2 hover:bg-white/10 transition-colors">
                          <User className="w-5 h-5" />

                          <ChevronDown className="hidden sm:inline w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent
                        align="end"
                        className="w-52 mt-2"
                      >
                        <div className="px-2 py-2">
                          <p className="text-sm font-medium">
                            {user.first_name ||
                              user.email}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem asChild>
                          <Link href="/account">
                            Dashboard
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                          <Link href="/account/profile">
                            My Profile
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                          <Link href="/account/orders">
                            Orders
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                          <Link href="/account/addresses">
                            Addresses
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onClick={signOut}
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign Out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Link href="/auth/login">
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-white text-primary hover:bg-white/90"
                      >
                        Sign In
                      </Button>
                    </Link>
                  )}

                  {/* Mobile Menu Button */}
                  <button
                    onClick={() =>
                      setIsMobileMenuOpen(
                        !isMobileMenuOpen
                      )
                    }
                    className="relative md:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-white/10 transition-all duration-300"
                  >
                    <Menu
                      className={`absolute w-6 h-6 transition-all duration-300 ${
                        isMobileMenuOpen
                          ? 'opacity-0 rotate-90 scale-75'
                          : 'opacity-100 rotate-0 scale-100'
                      }`}
                    />

                    <X
                      className={`absolute w-6 h-6 transition-all duration-300 ${
                        isMobileMenuOpen
                          ? 'opacity-100 rotate-0 scale-100'
                          : 'opacity-0 -rotate-90 scale-75'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Mobile Search */}
              <div className="md:hidden pb-4">
                <div className="flex relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full rounded-l-xl border-0 bg-white px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none"
                  />

                  <button className="rounded-r-xl bg-black px-5 hover:bg-black/90 transition-colors">
                    <Search className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center justify-between border-t border-white/20 py-4">
                <div className="flex items-center gap-6">
                  <Link
                    href="/"
                    className="text-sm font-medium hover:opacity-80 transition-opacity"
                  >
                    Home
                  </Link>

                  <Link
                    href="/products"
                    className="text-sm hover:opacity-80 transition-opacity"
                  >
                    Products
                  </Link>

                  <Link
                    href="/faq"
                    className="text-sm hover:opacity-80 transition-opacity"
                  >
                    FAQs
                  </Link>

                  <Link
                    href="/help"
                    className="text-sm hover:opacity-80 transition-opacity"
                  >
                    Help Center
                  </Link>
                </div>

               
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Fullscreen Mobile Menu */}
      <div
        className={`fixed inset-0 z-[100] md:hidden transition-all duration-300 ${
          isMobileMenuOpen
            ? 'visible opacity-100'
            : 'invisible opacity-0'
        }`}
      >
        {/* Overlay */}
        <div
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
            isMobileMenuOpen
              ? 'opacity-100'
              : 'opacity-0'
          }`}
          onClick={closeMobileMenu}
        />

        {/* Menu Panel */}
        <div
          className={`absolute inset-0 bg-background transform transition-transform duration-500 ease-in-out ${
            isMobileMenuOpen
              ? 'translate-x-0'
              : 'translate-x-full'
          }`}
        >
          {/* Top */}
          <div className="flex items-center justify-between border-b border-border px-6 py-5">
            <div className="flex items-center gap-3">
              {siteLogo && (
                <img
                  src={siteLogo}
                  alt="Delx"
                  className="w-12 h-12 rounded-lg object-cover"
                />
              )}

              <span className="text-2xl font-bold">
                Delx
              </span>
            </div>

            <button
              onClick={closeMobileMenu}
              className="flex items-center justify-center w-11 h-11 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <div className="flex flex-col justify-center h-[80vh] px-8 space-y-8">
            <Link
              href="/"
              onClick={closeMobileMenu}
              className="text-3xl font-semibold hover:text-primary transition-colors"
            >
              Home
            </Link>

            <Link
              href="/products"
              onClick={closeMobileMenu}
              className="text-3xl font-semibold hover:text-primary transition-colors"
            >
              Products
            </Link>

            <Link
              href="/faq"
              onClick={closeMobileMenu}
              className="text-3xl font-semibold hover:text-primary transition-colors"
            >
              FAQs
            </Link>

            <Link
              href="/help"
              onClick={closeMobileMenu}
              className="text-3xl font-semibold hover:text-primary transition-colors"
            >
              Help Center
            </Link>

            <Link
              href="/cart"
              onClick={closeMobileMenu}
              className="text-3xl font-semibold hover:text-primary transition-colors"
            >
              Cart
            </Link>

            <Link
              href="/wishlist"
              onClick={closeMobileMenu}
              className="text-3xl font-semibold hover:text-primary transition-colors"
            >
              Wishlist
            </Link>

            <div className="pt-6 border-t border-border">
              <Link
                href="/wishlist"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 text-xl hover:text-primary transition-colors"
              >
                <Heart className="w-6 h-6" />
                Wishlist
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
