import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Gift, ArrowLeft, Clock, CheckCircle, Eye, ChevronDown, XCircle, Search as SearchIcon, Mail, Phone } from 'lucide-react'
import { api } from '@/lib/api'
import { formatPrice } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

interface GiftHamperRequest {
  id: number
  userId: number | null
  customerName: string
  customerEmail: string
  customerPhone: string | null
  hamperSize: string
  occasion: string
  items: string
  wrapping: string
  messageCard: string | null
  recipientName: string | null
  colorTheme: string
  quantity: number
  estimatedPrice: number
  notes: string | null
  status: string
  createdAt: string
}

const REQUEST_STATUSES = ['ALL', 'PENDING', 'REVIEWED', 'ACCEPTED', 'COMPLETED', 'CANCELLED']

const STATUS_CONFIG: Record<string, { variant: 'warning' | 'default' | 'success' | 'error'; icon: React.ReactNode }> = {
  PENDING: { variant: 'warning', icon: <Clock className="w-3.5 h-3.5" /> },
  REVIEWED: { variant: 'default', icon: <Eye className="w-3.5 h-3.5" /> },
  ACCEPTED: { variant: 'success', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  COMPLETED: { variant: 'success', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  CANCELLED: { variant: 'error', icon: <XCircle className="w-3.5 h-3.5" /> },
}

const LABELS: Record<string, string> = {
  small: 'Petite',
  medium: 'Classic',
  large: 'Grand',
  premium: 'Luxe',
  birthday: 'Birthday',
  wedding: 'Wedding',
  anniversary: 'Anniversary',
  housewarming: 'Housewarming',
  thankyou: 'Thank You',
  corporate: 'Corporate',
  festival: 'Festival',
  other: 'Other',
  classic: 'Classic',
  luxury: 'Luxury',
  'eco-friendly': 'Eco-Friendly',
  festive: 'Festive',
  'rose-gold': 'Rose Gold',
  pastels: 'Pastels',
  'earth-tones': 'Earth Tones',
  monochrome: 'Monochrome',
  vibrant: 'Vibrant',
  candle: 'Scented Candle',
  diffuser: 'Reed Diffuser',
  'bath-salts': 'Bath Salts',
  chocolates: 'Artisan Chocolates',
  'dried-flowers': 'Dried Flowers',
  soap: 'Handmade Soap',
  tea: 'Premium Tea',
  'essential-oils': 'Essential Oils',
}

function label(key: string): string {
  return LABELS[key] || key
}

function fetchAllRequests(): Promise<GiftHamperRequest[]> {
  return api.get('/gift-hampers/admin/all').then(res => res.data.data)
}

function updateRequestStatus(id: number, status: string) {
  return api.patch(`/gift-hampers/admin/${id}/status`, { status })
}

export default function AdminGiftHampers() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [selectedRequest, setSelectedRequest] = useState<GiftHamperRequest | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [newStatus, setNewStatus] = useState('')

  const { data: requests, isLoading } = useQuery({
    queryKey: ['admin-gift-hampers'],
    queryFn: fetchAllRequests,
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => updateRequestStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gift-hampers'] })
      toast.success('Status updated')
      setShowStatusModal(false)
      setSelectedRequest(null)
    },
    onError: () => toast.error('Failed to update status'),
  })

  const filtered = (requests || []).filter(r => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      return (
        r.customerName.toLowerCase().includes(q) ||
        r.customerEmail.toLowerCase().includes(q) ||
        r.id.toString().includes(q) ||
        (r.recipientName || '').toLowerCase().includes(q)
      )
    }
    return true
  })

  const counts = (requests || []).reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1
    acc.total = (acc.total || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const openDetail = (r: GiftHamperRequest) => {
    setSelectedRequest(r)
    setShowDetailModal(true)
  }

  const openStatusModal = (r: GiftHamperRequest) => {
    setSelectedRequest(r)
    setNewStatus(r.status)
    setShowStatusModal(true)
  }

  const handleUpdateStatus = () => {
    if (!selectedRequest || !newStatus) return
    updateStatusMutation.mutate({ id: selectedRequest.id, status: newStatus })
  }

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  if (isLoading) return <LoadingSpinner fullScreen />

  return (
    <div className="bg-cream min-h-screen py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="p-2 hover:bg-blush rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="heading-2 text-charcoal">Gift Hampers</h1>
              <p className="text-warm-gray mt-1">Manage custom gift hamper requests</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatCard label="Total" value={counts.total || 0} color="bg-charcoal/10" />
          <StatCard label="Pending" value={counts.PENDING || 0} color="bg-warning/10" />
          <StatCard label="Reviewed" value={counts.REVIEWED || 0} color="bg-rose/10" />
          <StatCard label="Accepted" value={counts.ACCEPTED || 0} color="bg-success/10" />
          <StatCard label="Completed" value={counts.COMPLETED || 0} color="bg-success/20" />
          <StatCard label="Cancelled" value={counts.CANCELLED || 0} color="bg-error/10" />
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-xs">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search name, email, recipient, or ID..."
              className="w-full pl-9 pr-4 py-2.5 bg-soft-white border border-blush rounded-lg text-sm focus:outline-none focus:border-rose transition-colors"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {REQUEST_STATUSES.map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-rose text-soft-white'
                    : 'bg-soft-white text-charcoal hover:bg-blush'
                }`}
              >
                {status === 'ALL' ? 'All' : status}
                {status !== 'ALL' && counts[status] ? ` (${counts[status]})` : ''}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-soft-white rounded-xl shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blush/50">
                <tr>
                  <th className="text-left p-4 font-medium text-charcoal">ID</th>
                  <th className="text-left p-4 font-medium text-charcoal">Customer</th>
                  <th className="text-left p-4 font-medium text-charcoal hidden md:table-cell">Hamper</th>
                  <th className="text-left p-4 font-medium text-charcoal hidden lg:table-cell">Items</th>
                  <th className="text-left p-4 font-medium text-charcoal">Price</th>
                  <th className="text-left p-4 font-medium text-charcoal">Status</th>
                  <th className="text-left p-4 font-medium text-charcoal hidden lg:table-cell">Date</th>
                  <th className="text-right p-4 font-medium text-charcoal">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => {
                  const sc = STATUS_CONFIG[r.status] || STATUS_CONFIG.PENDING
                  const itemList = r.items ? r.items.split(',').map(i => i.trim()) : []
                  return (
                    <tr key={r.id} className="border-t border-blush hover:bg-blush/20 transition-colors">
                      <td className="p-4">
                        <span className="font-mono text-sm">#{r.id}</span>
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-charcoal text-sm">{r.customerName}</p>
                        <p className="text-xs text-warm-gray">{r.customerEmail}</p>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <div className="text-sm">
                          <span className="text-charcoal">{label(r.hamperSize)}</span>
                          <span className="text-warm-gray"> · {label(r.occasion)}</span>
                        </div>
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        <span className="text-sm text-warm-gray">{itemList.length} items</span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-sm tabular-nums">{formatPrice(r.estimatedPrice)}</span>
                      </td>
                      <td className="p-4">
                        <Badge variant={sc.variant}>
                          <span className="flex items-center gap-1">
                            {sc.icon}
                            {r.status}
                          </span>
                        </Badge>
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        <span className="text-sm text-warm-gray">{formatDate(r.createdAt)}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openDetail(r)}
                            className="p-2 text-warm-gray hover:text-charcoal transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openStatusModal(r)}
                            className="p-2 text-warm-gray hover:text-rose transition-colors"
                            title="Update Status"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-warm-gray">
                      <Gift className="w-12 h-12 mx-auto mb-4 opacity-30" />
                      <p>No gift hamper requests found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Modal */}
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title={`Gift Hamper #${selectedRequest?.id}`}
        >
          {selectedRequest && (
            <div className="space-y-6">
              {/* Customer */}
              <div>
                <h3 className="text-sm font-medium text-warm-gray uppercase tracking-wide mb-3">Customer</h3>
                <div className="bg-cream rounded-lg p-4 space-y-2">
                  <p className="font-medium text-charcoal">{selectedRequest.customerName}</p>
                  <a href={`mailto:${selectedRequest.customerEmail}`} className="flex items-center gap-2 text-sm text-rose hover:underline">
                    <Mail className="w-4 h-4" />
                    {selectedRequest.customerEmail}
                  </a>
                  {selectedRequest.customerPhone && (
                    <a href={`tel:${selectedRequest.customerPhone}`} className="flex items-center gap-2 text-sm text-charcoal hover:text-rose">
                      <Phone className="w-4 h-4" />
                      {selectedRequest.customerPhone}
                    </a>
                  )}
                </div>
              </div>

              {/* Hamper details */}
              <div>
                <h3 className="text-sm font-medium text-warm-gray uppercase tracking-wide mb-3">Hamper Configuration</h3>
                <div className="bg-cream rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                    <Detail label="Size" value={label(selectedRequest.hamperSize)} />
                    <Detail label="Occasion" value={label(selectedRequest.occasion)} />
                    <Detail label="Wrapping" value={label(selectedRequest.wrapping)} />
                    <Detail label="Color Theme" value={label(selectedRequest.colorTheme)} />
                    <Detail label="Quantity" value={String(selectedRequest.quantity)} />
                    {selectedRequest.recipientName && (
                      <Detail label="Recipient" value={selectedRequest.recipientName} />
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-blush/50">
                    <span className="text-sm text-warm-gray">Items Included:</span>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {selectedRequest.items.split(',').map(i => i.trim()).map(id => (
                        <span key={id} className="inline-flex items-center px-2.5 py-1 bg-rose/10 text-rose text-xs font-medium rounded-full">
                          {label(id)}
                        </span>
                      ))}
                    </div>
                  </div>

                  {selectedRequest.messageCard && (
                    <div className="mt-3 pt-3 border-t border-blush/50">
                      <span className="text-sm text-warm-gray">Gift Message:</span>
                      <p className="text-sm font-medium text-charcoal italic mt-1">"{selectedRequest.messageCard}"</p>
                    </div>
                  )}

                  {selectedRequest.notes && (
                    <div className="mt-3 pt-3 border-t border-blush/50">
                      <span className="text-sm text-warm-gray">Notes:</span>
                      <p className="text-sm text-charcoal mt-1">{selectedRequest.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Price + Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-rose/5 rounded-lg p-4">
                <div>
                  <p className="text-sm text-warm-gray">Estimated Price</p>
                  <p className="text-xl font-bold text-rose">{formatPrice(selectedRequest.estimatedPrice)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-warm-gray">Status</p>
                  <Badge variant={STATUS_CONFIG[selectedRequest.status]?.variant || 'default'} size="md">
                    <span className="flex items-center gap-1">
                      {STATUS_CONFIG[selectedRequest.status]?.icon}
                      {selectedRequest.status}
                    </span>
                  </Badge>
                </div>
              </div>

              <p className="text-xs text-warm-gray">Submitted on {formatDate(selectedRequest.createdAt)}</p>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setShowDetailModal(false)} className="flex-1">
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setShowDetailModal(false)
                    openStatusModal(selectedRequest)
                  }}
                  className="flex-1"
                >
                  Update Status
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Status Update Modal */}
        <Modal
          isOpen={showStatusModal}
          onClose={() => setShowStatusModal(false)}
          title={`Update Status — #${selectedRequest?.id}`}
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-warm-gray text-sm">
              Current: <Badge variant={STATUS_CONFIG[selectedRequest?.status || 'PENDING']?.variant || 'default'}>{selectedRequest?.status}</Badge>
            </p>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">New Status</label>
              <div className="grid grid-cols-2 gap-2">
                {REQUEST_STATUSES.filter(s => s !== 'ALL').map(status => (
                  <button
                    key={status}
                    onClick={() => setNewStatus(status)}
                    className={`p-3 rounded-lg border-2 transition-colors text-sm font-medium ${
                      newStatus === status
                        ? 'border-rose bg-rose/10 text-rose'
                        : 'border-blush hover:border-warm-gray text-charcoal'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowStatusModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleUpdateStatus}
                loading={updateStatusMutation.isPending}
                disabled={newStatus === selectedRequest?.status}
                className="flex-1"
              >
                Update Status
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`${color} rounded-xl p-4`}>
      <p className="text-sm text-warm-gray">{label}</p>
      <p className="text-2xl font-bold text-charcoal">{value}</p>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-sm text-warm-gray">{label}:</span>
      <p className="text-sm font-medium text-charcoal">{value}</p>
    </div>
  )
}
