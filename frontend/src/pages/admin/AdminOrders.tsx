import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  Package,
  ChevronDown,
  ArrowLeft,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  DollarSign,
  MapPin,
} from 'lucide-react'
import { orderService } from '@/services/orderService'
import { formatPrice } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import OrderItemsBreakdown from '@/components/order/OrderItemsBreakdown'
import toast from 'react-hot-toast'
import type { Order } from '@/types'

const ORDER_STATUSES = ['ALL', 'PENDING', 'PAID', 'SHIPPED', 'FULFILLED', 'CANCELLED']

const STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode; bgColor: string }> = {
  PENDING: { color: 'warning', icon: <Clock className="w-4 h-4" />, bgColor: 'bg-warning/10' },
  PAID: { color: 'success', icon: <DollarSign className="w-4 h-4" />, bgColor: 'bg-success/10' },
  SHIPPED: { color: 'info', icon: <Truck className="w-4 h-4" />, bgColor: 'bg-blue-100' },
  FULFILLED: { color: 'success', icon: <CheckCircle className="w-4 h-4" />, bgColor: 'bg-success/10' },
  CANCELLED: { color: 'error', icon: <XCircle className="w-4 h-4" />, bgColor: 'bg-error/10' },
}

export default function AdminOrders() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [page, setPage] = useState(0)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [customStatusDraft, setCustomStatusDraft] = useState('')
  const [showTrackingModal, setShowTrackingModal] = useState(false)
  const [trackingForm, setTrackingForm] = useState({ trackingNumber: '', trackingUrl: '', carrier: '' })
  const [detailOrderId, setDetailOrderId] = useState<number | null>(null)
  const [actionsMenuOrderId, setActionsMenuOrderId] = useState<number | null>(null)
  const [noteDraft, setNoteDraft] = useState('')

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders', statusFilter, page],
    queryFn: () => orderService.getAllOrders({ status: statusFilter, page, size: 20 }),
  })

  const { data: stats } = useQuery({
    queryKey: ['admin-order-stats'],
    queryFn: orderService.getOrderStats,
  })

  const { data: detailOrder, isLoading: detailLoading } = useQuery({
    queryKey: ['admin-order-detail', detailOrderId],
    queryFn: () => orderService.getOrderByIdAdmin(detailOrderId!),
    enabled: detailOrderId != null,
  })

  useEffect(() => {
    setNoteDraft('')
  }, [detailOrderId])

  const updateStatusMutation = useMutation({
    mutationFn: ({
      orderId,
      status,
      customStatus,
    }: {
      orderId: number
      status: string
      customStatus: string
    }) => orderService.updateOrderStatus(orderId, { status, customStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
      queryClient.invalidateQueries({ queryKey: ['admin-order-stats'] })
      queryClient.invalidateQueries({ queryKey: ['admin-order-detail'] })
      toast.success('Order status updated')
      setShowStatusModal(false)
      setSelectedOrder(null)
    },
    onError: () => {
      toast.error('Failed to update status')
    },
  })

  const appendNoteMutation = useMutation({
    mutationFn: ({ orderId, note }: { orderId: number; note: string }) =>
      orderService.appendOrderNote(orderId, note),
    onSuccess: (data) => {
      queryClient.setQueryData(['admin-order-detail', data.id], data)
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
      toast.success('Note added')
      setNoteDraft('')
    },
    onError: () => toast.error('Failed to add note'),
  })

  const updateTrackingMutation = useMutation({
    mutationFn: ({
      orderId,
      tracking,
    }: {
      orderId: number
      tracking: { trackingNumber: string; trackingUrl: string; carrier: string }
    }) => orderService.updateOrderTracking(orderId, tracking),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
      queryClient.invalidateQueries({ queryKey: ['admin-order-detail'] })
      toast.success('Tracking info updated')
      setShowTrackingModal(false)
      setSelectedOrder(null)
    },
    onError: () => {
      toast.error('Failed to update tracking')
    },
  })

  const handleUpdateStatus = () => {
    if (!selectedOrder || !newStatus) return
    updateStatusMutation.mutate({
      orderId: selectedOrder.id,
      status: newStatus,
      customStatus: customStatusDraft.trim(),
    })
  }

  const handleUpdateTracking = () => {
    if (!selectedOrder) return
    updateTrackingMutation.mutate({ orderId: selectedOrder.id, tracking: trackingForm })
  }

  const openStatusModal = (order: Order) => {
    setSelectedOrder(order)
    setNewStatus(order.status)
    setCustomStatusDraft(order.customStatus ?? '')
    setShowStatusModal(true)
  }

  const openTrackingModal = (order: Order) => {
    setSelectedOrder(order)
    setTrackingForm({
      trackingNumber: order.trackingNumber || '',
      trackingUrl: order.trackingUrl || '',
      carrier: order.carrier || '',
    })
    setShowTrackingModal(true)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (isLoading) {
    return <LoadingSpinner fullScreen />
  }

  return (
    <div className="bg-cream min-h-screen py-8">
      <div className="container-custom">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="p-2 hover:bg-blush rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="heading-2 text-charcoal">Orders</h1>
              <p className="text-warm-gray mt-1">Manage customer orders</p>
            </div>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <StatCard label="Total" value={stats.total} color="bg-charcoal/10" />
            <StatCard label="Pending" value={stats.pending} color="bg-warning/10" />
            <StatCard label="Paid" value={stats.paid} color="bg-success/10" />
            <StatCard label="Shipped" value={stats.shipped} color="bg-blue-100" />
            <StatCard label="Fulfilled" value={stats.fulfilled} color="bg-success/20" />
            <StatCard label="Cancelled" value={stats.cancelled} color="bg-error/10" />
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-6">
          {ORDER_STATUSES.map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status)
                setPage(0)
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-rose text-soft-white'
                  : 'bg-soft-white text-charcoal hover:bg-blush'
              }`}
            >
              {status === 'ALL' ? 'All Orders' : status}
            </button>
          ))}
        </div>

        <div className="bg-soft-white rounded-xl shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blush/50">
                <tr>
                  <th className="text-left p-4 font-medium text-charcoal">Order ID</th>
                  <th className="text-left p-4 font-medium text-charcoal">Customer</th>
                  <th className="text-left p-4 font-medium text-charcoal">Items</th>
                  <th className="text-left p-4 font-medium text-charcoal">Total</th>
                  <th className="text-left p-4 font-medium text-charcoal">Status</th>
                  <th className="text-left p-4 font-medium text-charcoal">Date</th>
                  <th className="text-right p-4 font-medium text-charcoal">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders?.content.map((order) => {
                  const workflow = order.status
                  const statusConfig = STATUS_CONFIG[workflow] || STATUS_CONFIG.PENDING
                  const label = order.displayStatus || order.status
                  return (
                    <tr key={order.id} className="border-t border-blush hover:bg-blush/20">
                      <td className="p-4">
                        <span className="font-mono text-sm">#{order.id}</span>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="text-charcoal">{order.userName || 'N/A'}</p>
                          <p className="text-sm text-warm-gray break-all">{order.customerEmail}</p>
                          {order.customerPhone && (
                            <p className="text-sm text-charcoal tabular-nums mt-0.5">{order.customerPhone}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-warm-gray">{order.itemCount || order.items?.length || 0} items</span>
                      </td>
                      <td className="p-4">
                        <span className="tabular-nums text-charcoal">{formatPrice(order.totalAmount)}</span>
                      </td>
                      <td className="p-4">
                        <Badge variant={statusConfig.color as 'success' | 'error' | 'warning'}>
                          <span className="flex items-center gap-1">
                            {statusConfig.icon}
                            {label}
                          </span>
                        </Badge>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-warm-gray">{formatDate(order.createdAt)}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end relative">
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg border border-blush bg-soft-white hover:bg-blush/30 text-charcoal"
                            onClick={(e) => {
                              e.stopPropagation()
                              setActionsMenuOrderId((id) => (id === order.id ? null : order.id))
                            }}
                          >
                            Actions
                            <ChevronDown className="w-4 h-4 opacity-70" />
                          </button>
                          {actionsMenuOrderId === order.id && (
                            <div
                              className="absolute right-0 top-full mt-1 z-40 min-w-[200px] rounded-lg border border-blush bg-soft-white shadow-soft-lg py-1 text-sm"
                              role="menu"
                            >
                              <button
                                type="button"
                                className="w-full text-left px-4 py-2 hover:bg-blush/40 text-charcoal"
                                onClick={() => {
                                  setDetailOrderId(order.id)
                                  setActionsMenuOrderId(null)
                                }}
                              >
                                View details
                              </button>
                              <button
                                type="button"
                                className="w-full text-left px-4 py-2 hover:bg-blush/40 text-charcoal"
                                onClick={() => {
                                  openStatusModal(order)
                                  setActionsMenuOrderId(null)
                                }}
                              >
                                Update status
                              </button>
                              <button
                                type="button"
                                className="w-full text-left px-4 py-2 hover:bg-blush/40 text-charcoal"
                                onClick={() => {
                                  openTrackingModal(order)
                                  setActionsMenuOrderId(null)
                                }}
                              >
                                Tracking
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {orders?.content.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-warm-gray">
                      <Package className="w-12 h-12 mx-auto mb-4 opacity-30" />
                      <p>No orders found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {orders && orders.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 p-4 border-t border-blush">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((p) => p - 1)}
                disabled={orders.first}
              >
                Previous
              </Button>
              <span className="text-sm text-warm-gray">
                Page {orders.page + 1} of {orders.totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={orders.last}
              >
                Next
              </Button>
            </div>
          )}
        </div>

        <Modal
          isOpen={showStatusModal}
          onClose={() => setShowStatusModal(false)}
          title={`Update status — Order #${selectedOrder?.id}`}
          size="md"
        >
          <div className="space-y-4">
            <p className="text-warm-gray text-sm">
              Workflow status drives filters and reporting. Optionally add a custom label for this order only.
            </p>
            <p className="text-sm">
              Current:{' '}
              <Badge>{selectedOrder?.displayStatus || selectedOrder?.status}</Badge>
            </p>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Preset status</label>
              <div className="grid grid-cols-2 gap-2">
                {ORDER_STATUSES.filter((s) => s !== 'ALL').map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setNewStatus(status)}
                    className={`p-3 rounded-lg border-2 transition-colors text-sm font-medium ${
                      newStatus === status
                        ? 'border-rose bg-rose/10 text-rose'
                        : 'border-blush hover:border-warm-gray'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="Custom status label (optional)"
              value={customStatusDraft}
              onChange={(e) => setCustomStatusDraft(e.target.value)}
              placeholder="e.g. Packed — awaiting pickup"
            />
            <p className="text-xs text-warm-gray">
              If set, this text is shown as the main status label for this order. Clear the field to show only the
              preset above.
            </p>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowStatusModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleUpdateStatus}
                loading={updateStatusMutation.isPending}
                disabled={
                  !newStatus ||
                  (newStatus === selectedOrder?.status &&
                    customStatusDraft.trim() === (selectedOrder?.customStatus ?? '').trim())
                }
                className="flex-1"
              >
                Save
              </Button>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={detailOrderId != null}
          onClose={() => setDetailOrderId(null)}
          title={detailOrder ? `Order #${detailOrder.id}` : 'Order'}
          size="xl"
        >
          {detailLoading && (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-rose border-t-transparent" />
            </div>
          )}
          {!detailLoading && detailOrder && (
            <OrderDetailPanel
              order={detailOrder}
              noteDraft={noteDraft}
              setNoteDraft={setNoteDraft}
              onAppendNote={() => {
                if (!noteDraft.trim()) {
                  toast.error('Enter a note')
                  return
                }
                appendNoteMutation.mutate({ orderId: detailOrder.id, note: noteDraft.trim() })
              }}
              appendPending={appendNoteMutation.isPending}
              onOpenStatus={() => openStatusModal(detailOrder)}
              onOpenTracking={() => openTrackingModal(detailOrder)}
            />
          )}
        </Modal>

        <Modal
          isOpen={showTrackingModal}
          onClose={() => setShowTrackingModal(false)}
          title={`Tracking — Order #${selectedOrder?.id}`}
          size="sm"
        >
          <div className="space-y-4">
            <Input
              label="Carrier"
              value={trackingForm.carrier}
              onChange={(e) => setTrackingForm({ ...trackingForm, carrier: e.target.value })}
              placeholder="e.g. Delhivery, BlueDart, India Post"
            />
            <Input
              label="Tracking Number"
              value={trackingForm.trackingNumber}
              onChange={(e) => setTrackingForm({ ...trackingForm, trackingNumber: e.target.value })}
              placeholder="e.g. AWB1234567890"
            />
            <Input
              label="Tracking URL"
              value={trackingForm.trackingUrl}
              onChange={(e) => setTrackingForm({ ...trackingForm, trackingUrl: e.target.value })}
              placeholder="https://www.delhivery.com/track/package/..."
            />

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowTrackingModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleUpdateTracking}
                loading={updateTrackingMutation.isPending}
                className="flex-1"
              >
                Save Tracking
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}

function OrderDetailPanel({
  order,
  noteDraft,
  setNoteDraft,
  onAppendNote,
  appendPending,
  onOpenStatus,
  onOpenTracking,
}: {
  order: Order
  noteDraft: string
  setNoteDraft: (s: string) => void
  onAppendNote: () => void
  appendPending: boolean
  onOpenStatus: () => void
  onOpenTracking: () => void
}) {
  const disc = order.discountAmount ?? 0
  const ship = order.shippingAmount ?? 0
  const sub =
    order.itemsSubtotal ??
    order.items.reduce((s, i) => s + i.subtotal, 0)
  const computedTotal = sub - disc + ship
  const roundedDiff = Math.abs(computedTotal - order.totalAmount)
  const totalsAligned = roundedDiff < 0.02

  const workflowCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING

  return (
    <div className="space-y-6 max-h-[min(85vh,900px)] overflow-y-auto pr-1">
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" onClick={onOpenStatus}>
          Update status
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onOpenTracking} icon={<MapPin className="w-4 h-4" />}>
          Tracking
        </Button>
      </div>

      <div className="rounded-xl border border-blush p-4 bg-soft-white">
        <p className="text-xs uppercase tracking-wide text-warm-gray mb-3">Customer details</p>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium text-warm-gray mb-1">Name</dt>
            <dd className="text-charcoal font-medium">{order.userName || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-warm-gray mb-1">Phone number</dt>
            <dd className="text-charcoal font-medium tabular-nums text-base">{order.customerPhone || '—'}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium text-warm-gray mb-1">Email address</dt>
            <dd className="text-charcoal font-medium break-all text-base">{order.customerEmail || '—'}</dd>
          </div>
        </dl>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="text-warm-gray">Workflow:</span>
        <Badge variant={workflowCfg.color as 'success' | 'error' | 'warning'}>
          <span className="flex items-center gap-1">
            {workflowCfg.icon}
            {order.status}
          </span>
        </Badge>
        {(order.customStatus || order.displayStatus) && (
          <span className="text-warm-gray">
            Display label: <span className="text-charcoal font-medium">{order.displayStatus}</span>
          </span>
        )}
      </div>

      {order.shippingAddress && (
        <div>
          <p className="text-xs uppercase tracking-wide text-warm-gray mb-1">Shipping address</p>
          <p className="text-sm text-charcoal whitespace-pre-line rounded-lg border border-blush/80 p-3 bg-blush/10">
            {order.shippingAddress}
          </p>
        </div>
      )}

      <div className="rounded-xl border border-blush p-4 space-y-3 bg-soft-white">
        <p className="text-xs uppercase tracking-wide text-warm-gray">Order totals & calculation</p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-warm-gray">Items subtotal</span>
            <span className="tabular-nums text-charcoal">{formatPrice(sub, order.currency)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-warm-gray">Total discount{couponLabel(order.couponCode)}</span>
            <span className="tabular-nums text-charcoal">
              {disc > 0 ? `−${formatPrice(disc, order.currency)}` : formatPrice(0, order.currency)}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-warm-gray">Shipping{zoneLabel(order.shippingZone)}</span>
            <span className="tabular-nums text-charcoal">{formatPrice(ship, order.currency)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-warm-gray">Total weight (order)</span>
            <span className="tabular-nums text-charcoal">
              {order.totalWeightKg != null && order.totalWeightKg > 0
                ? `${order.totalWeightKg.toFixed(3)} kg`
                : '—'}
            </span>
          </div>
          <div className="border-t border-blush pt-3 mt-1 flex justify-between gap-4 font-semibold text-base">
            <span className="text-charcoal">Final payable amount</span>
            <span className="tabular-nums text-rose">{formatPrice(order.totalAmount, order.currency)}</span>
          </div>
        </div>
        {!totalsAligned && (
          <p className="text-xs text-warning">
            Check: items subtotal − discount + shipping ({formatPrice(computedTotal, order.currency)}) differs from
            stored total by {formatPrice(roundedDiff, order.currency)} — historical orders may predate captured fields.
          </p>
        )}
        <p className="text-xs text-warm-gray">
          Formula: items subtotal − total discount + shipping charges = final payable.
        </p>
      </div>

      <div>
        <p className="text-sm font-medium text-charcoal mb-3">Line items (SKU, qty, weights)</p>
        <OrderItemsBreakdown items={order.items} currency={order.currency} dense showWeights />
      </div>

      <div className="rounded-xl border border-blush p-4 bg-blush/15">
        <p className="text-xs uppercase tracking-wide text-warm-gray mb-2">Internal notes</p>
        <pre className="whitespace-pre-wrap text-sm text-charcoal mb-4 min-h-[3rem] bg-soft-white border border-blush/60 rounded-lg p-3 font-sans">
          {order.internalNotes?.trim() ? order.internalNotes : 'No notes yet. Add one below — timestamps are added automatically.'}
        </pre>
        <label className="block text-xs font-medium text-charcoal mb-1">Add note</label>
        <textarea
          value={noteDraft}
          onChange={(e) => setNoteDraft(e.target.value)}
          rows={3}
          placeholder="Visible to admins only; previous notes are kept."
          className="w-full px-3 py-2 rounded-lg border border-blush bg-soft-white text-sm text-charcoal placeholder:text-warm-gray focus:outline-none focus:border-rose resize-y mb-3"
        />
        <Button type="button" size="sm" onClick={onAppendNote} loading={appendPending} disabled={!noteDraft.trim()}>
          Append note
        </Button>
      </div>
    </div>
  )
}

function couponLabel(code: string | null | undefined) {
  return code ? ` (${code})` : ''
}

function zoneLabel(zone: string | null | undefined) {
  return zone ? ` (${zone})` : ''
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`${color} rounded-xl p-4`}>
      <p className="text-sm text-warm-gray">{label}</p>
      <p className="text-2xl text-charcoal tabular-nums">{value}</p>
    </div>
  )
}
