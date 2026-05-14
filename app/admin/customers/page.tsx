'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail, Phone, Search, Eye, X, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/lib/store/auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

type AdminUserListItem = {
  id: number
  username: string
  email: string
  full_name?: string
  phone_number?: string | null
  is_staff: boolean
  is_superuser: boolean
  is_verified?: boolean
  preferred_currency?: string
  preferred_language?: string
  created_at?: string
  updated_at?: string
}

type AdminUserDetail = AdminUserListItem & {
  profile_image?: string | null
  bio?: string | null
  gender?: string
  date_of_birth?: string | null
  newsletter_subscribed?: boolean
}

const toFullName = (u: AdminUserDetail) => {
  const n = (u.full_name || '').trim()
  if (n) return n
  return u.username || 'Customer'
}

export default function AdminCustomersPage() {
  const token = useAuthStore.getState().token

  const headers = useMemo(() => {
    if (!token) return null
    return { Authorization: `Token ${token}` }
  }, [token])

  const [searchTerm, setSearchTerm] = useState('')
  const [customers, setCustomers] = useState<AdminUserListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal state
  const [selectedCustomer, setSelectedCustomer] = useState<AdminUserDetail | null>(null)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)

  const filteredCustomers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) return customers

    return customers.filter((customer) => {
      const name = (customer.full_name || customer.username || '').toLowerCase()
      const email = (customer.email || '').toLowerCase()
      return name.includes(q) || email.includes(q)
    })
  }, [customers, searchTerm])

  const closeModal = () => {
    setSelectedCustomer(null)
    setDetailError(null)
  }

  const fetchCustomers = async () => {
    if (!headers) throw new Error('Admin token not found. Please log in again.')

    const res = await fetch(`${API_BASE_URL}/users/?ordering=-created_at`, { headers })
    const json = await res.json()

    if (!res.ok) {
      throw new Error((json as any)?.error || `Failed to fetch customers (${res.status})`)
    }

    const list: AdminUserListItem[] = Array.isArray(json)
      ? json
      : (json as any)?.results
        ? (json as any).results
        : []

    // “Real customers” => exclude staff/superusers
    return list.filter((u) => !u.is_staff && !u.is_superuser)
  }

  const openCustomerDetail = async (customer: AdminUserListItem) => {
    if (!headers) return

    setIsDetailLoading(true)
    setDetailError(null)
    setSelectedCustomer(null)

    try {
      const res = await fetch(`${API_BASE_URL}/users/${customer.id}/`, { headers })
      const json = (await res.json()) as AdminUserDetail

      if (!res.ok) {
        throw new Error((json as any)?.error || `Failed to load customer details (${res.status})`)
      }

      setSelectedCustomer(json)
    } catch (e) {
      setDetailError(e instanceof Error ? e.message : 'Failed to load customer details')
    } finally {
      setIsDetailLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const list = await fetchCustomers()
        if (!cancelled) setCustomers(list)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load customers')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headers])

  return (
    <div className="p-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Customers</h1>
        <p className="text-muted-foreground mt-1">View all real customers and manage account info</p>
      </div>

      <Card className="p-4 mb-6">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-0 bg-transparent focus:ring-0 placeholder:text-muted-foreground"
          />
          <span className="ml-auto text-sm text-muted-foreground">
            {filteredCustomers.length} customer{filteredCustomers.length === 1 ? '' : 's'}
          </span>
        </div>
      </Card>

      {loading ? (
        <div className="min-h-[260px] flex items-center justify-center">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading customers...
          </div>
        </div>
      ) : error ? (
        <Card className="p-6 border-red-300">
          <p className="text-destructive font-semibold mb-2">Could not load customers</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </Card>
      ) : filteredCustomers.length === 0 ? (
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">No customers found.</p>
        </Card>
      ) : (
        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Phone</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Currency</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm text-foreground font-medium">
                      {toFullName(customer)}
                    </td>

                    <td className="py-3 px-4 text-sm text-foreground">{customer.email}</td>

                    <td className="py-3 px-4 text-sm text-foreground">
                      {customer.phone_number || '—'}
                    </td>

                    <td className="py-3 px-4 text-sm text-foreground">
                      {customer.preferred_currency || 'GHS'}
                    </td>

                    <td className="py-3 px-4 text-sm">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Real
                      </span>
                    </td>

                    <td className="py-3 px-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openCustomerDetail(customer)}
                          title="View customer details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            window.location.href = `mailto:${customer.email}`
                          }}
                          title="Email customer"
                        >
                          <Mail className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal */}
      {selectedCustomer || isDetailLoading || detailError ? (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg w-full max-w-3xl max-h-[85vh] overflow-y-auto">
            <div className="p-4 flex items-start justify-between border-b border-border">
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-foreground truncate">
                  Customer Details
                </h2>
                <p className="text-muted-foreground mt-1 truncate">
                  {selectedCustomer ? toFullName(selectedCustomer) : ''}
                </p>
              </div>

              <Button variant="ghost" size="sm" onClick={closeModal} className="gap-2">
                <X className="w-4 h-4" />
                Close
              </Button>
            </div>

            <div className="p-4">
              {isDetailLoading ? (
                <div className="min-h-[160px] flex items-center gap-2 text-muted-foreground text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading customer details...
                </div>
              ) : detailError ? (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <p className="font-semibold text-destructive">Failed to load customer</p>
                  <p className="text-sm text-muted-foreground mt-1">{detailError}</p>
                </div>
              ) : selectedCustomer ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-muted/30 border border-border rounded-lg p-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Profile</p>
                    <p className="text-sm text-foreground font-semibold">{toFullName(selectedCustomer)}</p>
                    <p className="text-sm text-muted-foreground mt-1 truncate">{selectedCustomer.email}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Phone: {selectedCustomer.phone_number || '—'}
                    </p>

                    <p className="text-sm text-muted-foreground mt-3">
                      Preferred language: {selectedCustomer.preferred_language || 'en'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Preferred currency: {selectedCustomer.preferred_currency || 'GHS'}
                    </p>

                    <p className="text-sm text-muted-foreground mt-3">
                      Verified: {selectedCustomer.is_verified ? 'Yes' : 'No'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Newsletter: {selectedCustomer.newsletter_subscribed ? 'Subscribed' : 'Not subscribed'}
                    </p>
                  </div>

                  <div className="bg-muted/30 border border-border rounded-lg p-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Account</p>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between gap-3">
                        <span className="text-muted-foreground">User ID</span>
                        <span className="font-semibold">{selectedCustomer.id}</span>
                      </div>

                      <div className="flex justify-between gap-3">
                        <span className="text-muted-foreground">Role</span>
                        <span className="font-semibold">Customer</span>
                      </div>

                      <div className="flex justify-between gap-3">
                        <span className="text-muted-foreground">Created</span>
                        <span className="font-semibold">
                          {selectedCustomer.created_at ? new Date(selectedCustomer.created_at).toLocaleString() : '—'}
                        </span>
                      </div>

                      <div className="flex justify-between gap-3">
                        <span className="text-muted-foreground">Updated</span>
                        <span className="font-semibold">
                          {selectedCustomer.updated_at ? new Date(selectedCustomer.updated_at).toLocaleString() : '—'}
                        </span>
                      </div>
                    </div>

                    {selectedCustomer.bio ? (
                      <div className="mt-4">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Bio</p>
                        <p className="text-sm text-foreground whitespace-pre-wrap">{selectedCustomer.bio}</p>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
