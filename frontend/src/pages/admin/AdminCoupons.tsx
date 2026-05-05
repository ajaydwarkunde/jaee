import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { 
  Tag, Plus, Edit2, Trash2, ArrowLeft, Percent, DollarSign, 
  Calendar, Users, CheckCircle 
} from 'lucide-react'
import { couponService, Coupon, CouponCreateRequest } from '@/services/couponService'
import { formatPrice } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

interface CouponFormData {
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: string;
  minOrderAmount: string;
  maxDiscountAmount: string;
  usageLimit: string;
  limitOneUsePerCustomer: boolean;
  validFrom: string;
  validUntil: string;
  active: boolean;
}

const initialFormData: CouponFormData = {
  code: '',
  description: '',
  discountType: 'PERCENTAGE',
  discountValue: '',
  minOrderAmount: '',
  maxDiscountAmount: '',
  usageLimit: '',
  limitOneUsePerCustomer: true,
  validFrom: '',
  validUntil: '',
  active: true,
}

export default function AdminCoupons() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [showFormModal, setShowFormModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [deletingCoupon, setDeletingCoupon] = useState<Coupon | null>(null)
  const [formData, setFormData] = useState<CouponFormData>(initialFormData)

  const { data: couponsData, isLoading } = useQuery({
    queryKey: ['admin-coupons', page],
    queryFn: () => couponService.getAllCoupons(page, 20),
  })

  const createMutation = useMutation({
    mutationFn: (data: CouponCreateRequest) => couponService.createCoupon(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] })
      toast.success('Coupon created successfully')
      closeFormModal()
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create coupon')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CouponCreateRequest }) =>
      couponService.updateCoupon(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] })
      toast.success('Coupon updated successfully')
      closeFormModal()
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update coupon')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => couponService.deleteCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] })
      toast.success('Coupon deleted successfully')
      setShowDeleteModal(false)
      setDeletingCoupon(null)
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete coupon')
    },
  })

  const openCreateModal = () => {
    setFormData(initialFormData)
    setEditingCoupon(null)
    setShowFormModal(true)
  }

  const openEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon)
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      minOrderAmount: coupon.minOrderAmount?.toString() || '',
      maxDiscountAmount: coupon.maxDiscountAmount?.toString() || '',
      usageLimit: coupon.usageLimit?.toString() || '',
      limitOneUsePerCustomer: coupon.limitOneUsePerCustomer !== false,
      validFrom: coupon.validFrom ? formatDateForInput(coupon.validFrom) : '',
      validUntil: coupon.validUntil ? formatDateForInput(coupon.validUntil) : '',
      active: coupon.active,
    })
    setShowFormModal(true)
  }

  const closeFormModal = () => {
    setShowFormModal(false)
    setEditingCoupon(null)
    setFormData(initialFormData)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const payload: CouponCreateRequest = {
      code: formData.code.toUpperCase(),
      description: formData.description || undefined,
      discountType: formData.discountType,
      discountValue: parseFloat(formData.discountValue),
      minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : undefined,
      maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : undefined,
      usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
      limitOneUsePerCustomer: formData.limitOneUsePerCustomer,
      validFrom: formData.validFrom ? new Date(formData.validFrom).toISOString() : undefined,
      validUntil: formData.validUntil ? new Date(formData.validUntil).toISOString() : undefined,
      active: formData.active,
    }

    if (editingCoupon) {
      updateMutation.mutate({ id: editingCoupon.id, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const formatDateForInput = (isoDate: string) => {
    const date = new Date(isoDate)
    return date.toISOString().slice(0, 16)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  if (isLoading) {
    return <LoadingSpinner fullScreen />
  }

  const coupons = couponsData?.content || []
  const totalPages = couponsData?.totalPages || 1

  return (
    <div className="min-h-screen bg-cream">
      <div className="container-custom py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="p-2 hover:bg-warm-gray/20 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="heading-2">Promo Codes</h1>
              <p className="text-charcoal/60 mt-1">Manage discount coupons and promotional offers</p>
            </div>
          </div>
          <Button onClick={openCreateModal}>
            <Plus className="w-4 h-4 mr-2" />
            Create Coupon
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-soft-white rounded-xl p-4 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose/10 flex items-center justify-center">
                <Tag className="w-5 h-5 text-rose" />
              </div>
              <div>
                <p className="text-sm text-charcoal/60">Total Coupons</p>
                <p className="text-xl font-semibold">{couponsData?.totalElements || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-soft-white rounded-xl p-4 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-charcoal/60">Active</p>
                <p className="text-xl font-semibold">
                  {coupons.filter(c => c.active && c.valid).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-soft-white rounded-xl p-4 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                <Percent className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-charcoal/60">Percentage</p>
                <p className="text-xl font-semibold">
                  {coupons.filter(c => c.discountType === 'PERCENTAGE').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-soft-white rounded-xl p-4 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-charcoal/60">Fixed Amount</p>
                <p className="text-xl font-semibold">
                  {coupons.filter(c => c.discountType === 'FIXED').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Coupons Table */}
        <div className="bg-soft-white rounded-xl shadow-soft overflow-hidden">
          {coupons.length === 0 ? (
            <div className="p-12 text-center">
              <Tag className="w-12 h-12 mx-auto mb-4 text-charcoal/30" />
              <h3 className="text-lg font-medium mb-2">No coupons yet</h3>
              <p className="text-charcoal/60 mb-4">Create your first promotional coupon</p>
              <Button onClick={openCreateModal}>
                <Plus className="w-4 h-4 mr-2" />
                Create Coupon
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-cream/50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-charcoal/70">Code</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-charcoal/70">Discount</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-charcoal/70">Min Order</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-charcoal/70">Usage</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-charcoal/70">Per customer</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-charcoal/70">Valid Until</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-charcoal/70">Status</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-charcoal/70">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {coupons.map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-cream/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            coupon.discountType === 'PERCENTAGE' ? 'bg-rose/10' : 'bg-blue-100'
                          }`}>
                            {coupon.discountType === 'PERCENTAGE' ? (
                              <Percent className="w-4 h-4 text-rose" />
                            ) : (
                              <DollarSign className="w-4 h-4 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-mono font-semibold">{coupon.code}</p>
                            {coupon.description && (
                              <p className="text-xs text-charcoal/60">{coupon.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium">
                          {coupon.discountType === 'PERCENTAGE' 
                            ? `${coupon.discountValue}%`
                            : formatPrice(coupon.discountValue)}
                        </span>
                        {coupon.maxDiscountAmount && coupon.discountType === 'PERCENTAGE' && (
                          <p className="text-xs text-charcoal/60">
                            Max: {formatPrice(coupon.maxDiscountAmount)}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {coupon.minOrderAmount ? formatPrice(coupon.minOrderAmount) : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-charcoal/40" />
                          <span>{coupon.usedCount}</span>
                          {coupon.usageLimit && (
                            <span className="text-charcoal/60">/ {coupon.usageLimit}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-charcoal/80">
                          {coupon.limitOneUsePerCustomer !== false ? 'Once' : 'Multiple'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {coupon.validUntil ? (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-charcoal/40" />
                            <span className="text-sm">{formatDate(coupon.validUntil)}</span>
                          </div>
                        ) : (
                          <span className="text-charcoal/40">No expiry</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={coupon.active && coupon.valid ? 'success' : 'error'}>
                          {coupon.active && coupon.valid ? 'Active' : coupon.active ? 'Expired' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(coupon)}
                            className="p-2 hover:bg-cream rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4 text-charcoal/70" />
                          </button>
                          <button
                            onClick={() => {
                              setDeletingCoupon(coupon)
                              setShowDeleteModal(true)
                            }}
                            className="p-2 hover:bg-error/10 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-error" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                Previous
              </Button>
              <span className="text-sm text-charcoal/60">
                Page {page + 1} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showFormModal}
        onClose={closeFormModal}
        title={editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input
                label="Coupon Code *"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                placeholder="e.g., SUMMER20"
                required
              />
            </div>
            <div className="col-span-2">
              <Input
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="e.g., Summer sale - 20% off"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Discount Type *
              </label>
              <select
                value={formData.discountType}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  discountType: e.target.value as 'PERCENTAGE' | 'FIXED' 
                }))}
                className="w-full px-4 py-2.5 rounded-lg border border-warm-gray/30 focus:border-rose focus:ring-1 focus:ring-rose"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount (₹)</option>
              </select>
            </div>
            <div>
              <Input
                label={`Discount Value ${formData.discountType === 'PERCENTAGE' ? '(%)' : '(₹)'} *`}
                type="number"
                value={formData.discountValue}
                onChange={(e) => setFormData(prev => ({ ...prev, discountValue: e.target.value }))}
                placeholder={formData.discountType === 'PERCENTAGE' ? 'e.g., 20' : 'e.g., 100'}
                min="0"
                step={formData.discountType === 'PERCENTAGE' ? '1' : '0.01'}
                required
              />
            </div>
            <div>
              <Input
                label="Min Order Amount (₹)"
                type="number"
                value={formData.minOrderAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, minOrderAmount: e.target.value }))}
                placeholder="e.g., 500"
                min="0"
              />
            </div>
            {formData.discountType === 'PERCENTAGE' && (
              <div>
                <Input
                  label="Max Discount (₹)"
                  type="number"
                  value={formData.maxDiscountAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxDiscountAmount: e.target.value }))}
                  placeholder="e.g., 200"
                  min="0"
                />
              </div>
            )}
            <div>
              <Input
                label="Usage Limit"
                type="number"
                value={formData.usageLimit}
                onChange={(e) => setFormData(prev => ({ ...prev, usageLimit: e.target.value }))}
                placeholder="Leave empty for unlimited"
                min="0"
              />
            </div>
            <div className="col-span-2">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={formData.limitOneUsePerCustomer}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, limitOneUsePerCustomer: e.target.checked }))
                  }
                  className="mt-1 rounded border-warm-gray/40 text-rose focus:ring-rose"
                />
                <span>
                  <span className="text-sm font-medium text-charcoal block">One use per customer</span>
                  <span className="text-xs text-charcoal/60">
                    Off allows the same account to redeem this code multiple times (still respects overall usage limit).
                  </span>
                </span>
              </label>
            </div>
            <div>
              <Input
                label="Valid From"
                type="datetime-local"
                value={formData.validFrom}
                onChange={(e) => setFormData(prev => ({ ...prev, validFrom: e.target.value }))}
              />
            </div>
            <div>
              <Input
                label="Valid Until"
                type="datetime-local"
                value={formData.validUntil}
                onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
              />
            </div>
            <div className="col-span-2">
              <label className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, active: !prev.active }))}
                  className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 ${
                    formData.active ? 'bg-rose' : 'bg-warm-gray/30'
                  }`}
                >
                  <span
                    className={`absolute left-0.5 top-0.5 w-5 h-5 bg-soft-white rounded-full shadow-md transition-transform duration-200 ${
                      formData.active ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className="text-sm font-medium">Active</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={closeFormModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'Saving...'
                : editingCoupon
                ? 'Update Coupon'
                : 'Create Coupon'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setDeletingCoupon(null)
        }}
        title="Delete Coupon"
      >
        <p className="text-charcoal/70 mb-6">
          Are you sure you want to delete the coupon <strong>{deletingCoupon?.code}</strong>? 
          This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setShowDeleteModal(false)
              setDeletingCoupon(null)
            }}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => deletingCoupon && deleteMutation.mutate(deletingCoupon.id)}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
