import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Package, Eye, ChevronDown, ArrowLeft, Clock, CheckCircle, Truck, XCircle, DollarSign, MapPin } from 'lucide-react'
import { orderService } from '@/services/orderService'
import { formatPrice } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
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
  const [showTrackingModal, setShowTrackingModal] = useState(false)
  const [trackingForm, setTrackingForm] = useState({ trackingNumber: '', trackingUrl: '', carrier: '' })

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders', statusFilter, page],
    queryFn: () => orderService.getAllOrders({ status: statusFilter, page, size: 20 }),
  })

  const { data: stats } = useQuery({
    queryKey: ['admin-order-stats'],
    queryFn: orderService.getOrderStats,
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: string }) =>
      orderService.updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
      queryClient.invalidateQueries({ queryKey: ['admin-order-stats'] })
      toast.success('Order status updated')
      setShowStatusModal(false)
      setSelectedOrder(null)
    },
    onError: () => {
      toast.error('Failed to update status')
    },
  })

  const updateTrackingMutation = useMutation({
    mutationFn: ({ orderId, tracking }: { orderId: number; tracking: { trackingNumber: string; trackingUrl: string; carrier: string } }) =>
      orderService.updateOrderTracking(orderId, tracking),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
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
    updateStatusMutation.mutate({ orderId: selectedOrder.id, status: newStatus })
  }

  const handleUpdateTracking = () => {
    if (!selectedOrder) return
    updateTrackingMutation.mutate({ orderId: selectedOrder.id, tracking: trackingForm })
  }

  const openStatusModal = (order: Order) => {
    setSelectedOrder(order)
    setNewStatus(order.status)
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
        {/* Header */}
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

        {/* Stats Cards */}
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

        {/* Filters */}
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

        {/* Orders Table */}
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
                  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING
                  return (
                    <tr key={order.id} className="border-t border-blush hover:bg-blush/20">
                      <td className="p-4">
                        <span className="font-mono text-sm">#{order.id}</span>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-charcoal">{order.userName || 'N/A'}</p>
                          <p className="text-sm text-warm-gray">{order.customerEmail}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-warm-gray">{order.itemCount || order.items?.length || 0} items</span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold tabular-nums">{formatPrice(order.totalAmount)}</span>
                      </td>
                      <td className="p-4">
                        <Badge variant={statusConfig.color as 'success' | 'error' | 'warning'}>
                          <span className="flex items-center gap-1">
                            {statusConfig.icon}
                            {order.status}
                          </span>
                        </Badge>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-warm-gray">{formatDate(order.createdAt)}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/orders/${order.id}`}
                            className="p-2 text-warm-gray hover:text-charcoal transition-colors"
                            title="View Order"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => openTrackingModal(order)}
                            className="p-2 text-warm-gray hover:text-blue-600 transition-colors"
                            title="Update Tracking"
                          >
                            <MapPin className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openStatusModal(order)}
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

          {/* Pagination */}
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

        {/* Update Status Modal */}
        <Modal
          isOpen={showStatusModal}
          onClose={() => setShowStatusModal(false)}
          title={`Update Order #${selectedOrder?.id}`}
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-warm-gray">
              Current status: <Badge>{selectedOrder?.status}</Badge>
            </p>
            
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">New Status</label>
              <div className="grid grid-cols-2 gap-2">
                {ORDER_STATUSES.filter(s => s !== 'ALL').map((status) => (
                  <button
                    key={status}
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

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowStatusModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleUpdateStatus}
                loading={updateStatusMutation.isPending}
                disabled={newStatus === selectedOrder?.status}
                className="flex-1"
              >
                Update Status
              </Button>
            </div>
          </div>
        </Modal>

        {/* Update Tracking Modal */}
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

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`${color} rounded-xl p-4`}>
      <p className="text-sm text-warm-gray">{label}</p>
      <p className="text-2xl font-bold text-charcoal">{value}</p>
    </div>
  )
}
