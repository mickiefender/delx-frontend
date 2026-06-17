'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { AccountSidebar } from '@/components/account/account-sidebar'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Loader,
  CheckCircle,
  Home,
  Building2,
  Star,
  ChevronDown,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Address {
  id: string
  label: string
  type: 'home' | 'work' | 'other'
  firstName: string
  lastName: string
  phone: string
  street: string
  city: string
  state: string
  zip: string
  country: string
  isDefault: boolean
}

const emptyForm: Omit<Address, 'id'> = {
  label: '',
  type: 'home',
  firstName: '',
  lastName: '',
  phone: '',
  street: '',
  city: '',
  state: '',
  zip: '',
  country: 'Ghana',
  isDefault: false,
}

export default function AddressesPage() {
  const router = useRouter()
  const { user, isAuthReady, isAuthenticated } = useAuth()

  const [addresses, setAddresses] = useState<Address[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    if (isAuthReady && !isAuthenticated) {
      router.push('/auth/login')
      return
    }

    if (isAuthReady) {
      loadAddresses()
    }
  }, [isAuthReady, isAuthenticated, router])

  const loadAddresses = () => {
    setIsLoading(true)
    try {
      const stored = localStorage.getItem('user_addresses')
      if (stored) {
        setAddresses(JSON.parse(stored))
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false)
    }
  }

  const saveAddresses = (updated: Address[]) => {
    localStorage.setItem('user_addresses', JSON.stringify(updated))
    setAddresses(updated)
  }

  const handleOpenNew = () => {
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(true)
  }

  const handleOpenEdit = (addr: Address) => {
    setForm({
      label: addr.label,
      type: addr.type,
      firstName: addr.firstName,
      lastName: addr.lastName,
      phone: addr.phone,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      zip: addr.zip,
      country: addr.country,
      isDefault: addr.isDefault,
    })
    setEditingId(addr.id)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    const updated = addresses.filter(a => a.id !== id)
    // If the default was deleted, make the first one default
    if (!updated.some(a => a.isDefault) && updated.length > 0) {
      updated[0].isDefault = true
    }
    saveAddresses(updated)
    toast.success('Address removed')
  }

  const handleSetDefault = (id: string) => {
    const updated = addresses.map(a => ({
      ...a,
      isDefault: a.id === id,
    }))
    saveAddresses(updated)
    toast.success('Default address updated')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // Simulate API call
      await new Promise(r => setTimeout(r, 600))

      const newAddr: Address = {
        id: editingId || crypto.randomUUID(),
        ...form,
      }

      let updated: Address[]
      if (editingId) {
        updated = addresses.map(a => (a.id === editingId ? newAddr : a))
      } else {
        // First address is default by default
        if (addresses.length === 0) {
          newAddr.isDefault = true
        }
        updated = [...addresses, newAddr]
      }

      saveAddresses(updated)
      setShowForm(false)
      setEditingId(null)
      toast.success(editingId ? 'Address updated' : 'Address added')
    } catch {
      toast.error('Failed to save address')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  if (!isAuthReady) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background flex items-center justify-center">
          <Loader className="w-8 h-8 animate-spin" />
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-emerald-500" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold">Addresses</h1>
              </div>
              <p className="text-muted-foreground">Manage your shipping and billing addresses</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <AccountSidebar />

              <div className="lg:col-span-3">
                {isLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <>
                    {/* Action Bar */}
                    <div className="flex items-center justify-between mb-6">
                      <p className="text-sm text-muted-foreground">
                        {addresses.length} {addresses.length === 1 ? 'address' : 'addresses'}
                      </p>
                      {!showForm && (
                        <Button onClick={handleOpenNew} className="gap-2">
                          <Plus className="w-4 h-4" />
                          Add Address
                        </Button>
                      )}
                    </div>

                    {/* Address Form */}
                    {showForm && (
                      <div className="bg-card border border-border rounded-xl p-6 mb-8 animate-in slide-in-from-top-2 duration-200">
                        <h3 className="text-lg font-semibold mb-6">
                          {editingId ? 'Edit Address' : 'Add New Address'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-5">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                              <label className="text-sm font-medium block mb-2">Address Label</label>
                              <Input
                                placeholder="e.g. Home, Office, Parents' House"
                                value={form.label}
                                onChange={e => setForm(p => ({ ...p, label: e.target.value }))}
                                required
                              />
                            </div>
                          </div>

                          {/* Type selector */}
                          <div>
                            <label className="text-sm font-medium block mb-2">Address Type</label>
                            <div className="flex gap-3">
                              {(['home', 'work', 'other'] as const).map(t => (
                                <button
                                  key={t}
                                  type="button"
                                  onClick={() => setForm(p => ({ ...p, type: t }))}
                                  className={cn(
                                    'flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all',
                                    form.type === t
                                      ? 'border-accent bg-accent/10 text-accent'
                                      : 'border-border text-muted-foreground hover:border-muted-foreground/30'
                                  )}
                                >
                                  {t === 'home' ? <Home className="w-4 h-4" /> : t === 'work' ? <Building2 className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                                  <span className="capitalize">{t}</span>
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium block mb-2">First Name</label>
                              <Input
                                placeholder="First name"
                                value={form.firstName}
                                onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))}
                                required
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium block mb-2">Last Name</label>
                              <Input
                                placeholder="Last name"
                                value={form.lastName}
                                onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))}
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-sm font-medium block mb-2">Phone Number</label>
                            <Input
                              type="tel"
                              placeholder="+233 50 123 4567"
                              value={form.phone}
                              onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                              required
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium block mb-2">Street Address</label>
                            <Input
                              placeholder="123 Main Street, Apt 4B"
                              value={form.street}
                              onChange={e => setForm(p => ({ ...p, street: e.target.value }))}
                              required
                            />
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="col-span-1">
                              <label className="text-sm font-medium block mb-2">City</label>
                              <Input
                                placeholder="Accra"
                                value={form.city}
                                onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
                                required
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium block mb-2">State/Region</label>
                              <Input
                                placeholder="Greater Accra"
                                value={form.state}
                                onChange={e => setForm(p => ({ ...p, state: e.target.value }))}
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium block mb-2">Postal Code</label>
                              <Input
                                placeholder="GA-123"
                                value={form.zip}
                                onChange={e => setForm(p => ({ ...p, zip: e.target.value }))}
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium block mb-2">Country</label>
                              <Input
                                value={form.country}
                                onChange={e => setForm(p => ({ ...p, country: e.target.value }))}
                                required
                              />
                            </div>
                          </div>

                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={form.isDefault}
                              onChange={e => setForm(p => ({ ...p, isDefault: e.target.checked }))}
                              className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
                            />
                            <span className="text-sm">Set as default address</span>
                          </label>

                          <div className="flex gap-3 pt-2">
                            <Button type="submit" disabled={isSaving} className="gap-2 min-w-[140px]">
                              {isSaving ? (
                                <>
                                  <Loader className="w-4 h-4 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                editingId ? 'Update Address' : 'Save Address'
                              )}
                            </Button>
                            <Button type="button" variant="outline" onClick={handleCancel}>
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* Address List */}
                    {addresses.length === 0 && !showForm ? (
                      <div className="bg-card border border-border rounded-xl p-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                          <MapPin className="w-7 h-7 text-emerald-500" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">No addresses yet</h3>
                        <p className="text-muted-foreground mb-6">
                          Add a shipping address so we know where to deliver your orders
                        </p>
                        <Button onClick={handleOpenNew} className="gap-2">
                          <Plus className="w-4 h-4" />
                          Add Your First Address
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {addresses.map(addr => (
                          <div
                            key={addr.id}
                            className={cn(
                              'bg-card border rounded-xl p-5 transition-all duration-200 group relative',
                              addr.isDefault
                                ? 'border-accent/50 ring-1 ring-accent/20'
                                : 'border-border hover:border-accent/30'
                            )}
                          >
                            {/* Default Badge */}
                            {addr.isDefault && (
                              <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 bg-accent/10 text-accent text-[10px] font-semibold rounded-full">
                                <Star className="w-3 h-3 fill-accent" />
                                Default
                              </div>
                            )}

                            {/* Type Icon + Label */}
                            <div className="flex items-center gap-2 mb-3">
                              <div className={cn(
                                'w-8 h-8 rounded-lg flex items-center justify-center',
                                addr.type === 'home' ? 'bg-orange-500/10 text-orange-500' :
                                addr.type === 'work' ? 'bg-blue-500/10 text-blue-500' :
                                'bg-muted text-muted-foreground'
                              )}>
                                {addr.type === 'home' ? <Home className="w-4 h-4" /> :
                                 addr.type === 'work' ? <Building2 className="w-4 h-4" /> :
                                 <MapPin className="w-4 h-4" />}
                              </div>
                              <span className="text-sm font-semibold capitalize">{addr.label || addr.type}</span>
                            </div>

                            {/* Address Details */}
                            <div className="space-y-1 text-sm mb-4">
                              <p className="font-medium">{addr.firstName} {addr.lastName}</p>
                              <p className="text-muted-foreground">{addr.street}</p>
                              <p className="text-muted-foreground">
                                {addr.city}{addr.state ? `, ${addr.state}` : ''}{addr.zip ? ` ${addr.zip}` : ''}
                              </p>
                              <p className="text-muted-foreground">{addr.country}</p>
                              <p className="text-muted-foreground">{addr.phone}</p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 pt-3 border-t border-border">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="gap-1.5 text-xs"
                                onClick={() => handleOpenEdit(addr)}
                              >
                                <Pencil className="w-3.5 h-3.5" />
                                Edit
                              </Button>
                              {!addr.isDefault && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="gap-1.5 text-xs"
                                  onClick={() => handleSetDefault(addr.id)}
                                >
                                  <Star className="w-3.5 h-3.5" />
                                  Set Default
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="gap-1.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 ml-auto"
                                onClick={() => handleDelete(addr.id)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
