import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, MapPin, Plus, Pencil, Trash2, Home } from 'lucide-react'
import { addressService } from '@/services/addressService'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'
import type { Address, AddressFormData } from '@/types'

export default function AddressesPage() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<AddressFormData>({
    line1: '', line2: '', city: '', state: '', country: 'India', zip: '', phone: '', isDefault: false,
  })

  const { data: addresses, isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: addressService.getAddresses,
  })

  const createMutation = useMutation({
    mutationFn: (data: AddressFormData) => addressService.createAddress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      resetForm()
      toast.success('Address added')
    },
    onError: () => toast.error('Failed to add address'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: AddressFormData }) => addressService.updateAddress(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      resetForm()
      toast.success('Address updated')
    },
    onError: () => toast.error('Failed to update address'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => addressService.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      toast.success('Address deleted')
    },
    onError: () => toast.error('Failed to delete address'),
  })

  const setDefaultMutation = useMutation({
    mutationFn: (id: number) => addressService.setDefault(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      toast.success('Default address updated')
    },
    onError: () => toast.error('Failed to update default'),
  })

  const resetForm = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({ line1: '', line2: '', city: '', state: '', country: 'India', zip: '', phone: '', isDefault: false })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.line1 || !formData.city) {
      toast.error('Please fill required fields')
      return
    }
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleEdit = (address: Address) => {
    setFormData({
      line1: address.line1,
      line2: address.line2 || '',
      city: address.city,
      state: address.state || '',
      country: address.country,
      zip: address.zip || '',
      phone: address.phone || '',
      isDefault: address.isDefault,
    })
    setEditingId(address.id)
    setShowForm(true)
  }

  if (isLoading) return <LoadingSpinner fullScreen />

  return (
    <div className="bg-cream min-h-screen py-8 md:py-12">
      <div className="container-custom max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/account" className="p-2 hover:bg-blush rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-charcoal" />
            </Link>
            <h1 className="heading-3 text-charcoal">My Addresses</h1>
          </div>
          {!showForm && (
            <Button onClick={() => setShowForm(true)} size="sm" icon={<Plus className="w-4 h-4" />}>
              Add Address
            </Button>
          )}
        </div>

        {/* Address Form */}
        {showForm && (
          <div className="bg-soft-white rounded-xl shadow-soft p-6 mb-6">
            <h2 className="font-serif text-lg font-medium text-charcoal mb-4">
              {editingId ? 'Edit Address' : 'New Address'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Address Line 1 *" name="line1" value={formData.line1} onChange={handleChange} placeholder="123 Main Street" required />
              <Input label="Address Line 2" name="line2" value={formData.line2 || ''} onChange={handleChange} placeholder="Apartment, suite, etc." />
              <div className="grid grid-cols-2 gap-4">
                <Input label="City *" name="city" value={formData.city} onChange={handleChange} placeholder="Mumbai" required />
                <Input label="State" name="state" value={formData.state || ''} onChange={handleChange} placeholder="Maharashtra" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Input label="Country" name="country" value={formData.country} onChange={handleChange} placeholder="India" />
                <Input label="PIN Code" name="zip" value={formData.zip || ''} onChange={handleChange} placeholder="400001" />
                <Input label="Phone" name="phone" value={formData.phone || ''} onChange={handleChange} placeholder="+91 98765 43210" />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>
                  {editingId ? 'Update Address' : 'Save Address'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Address List */}
        {(!addresses || addresses.length === 0) && !showForm ? (
          <div className="bg-soft-white rounded-xl p-12 text-center shadow-soft">
            <MapPin className="w-16 h-16 text-warm-gray/50 mx-auto mb-4" />
            <h2 className="heading-4 text-charcoal mb-2">No addresses saved</h2>
            <p className="text-warm-gray mb-8">Add an address to make checkout faster.</p>
            <Button onClick={() => setShowForm(true)} icon={<Plus className="w-4 h-4" />}>
              Add Address
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses?.map((address) => (
              <div
                key={address.id}
                className={`bg-soft-white rounded-xl shadow-soft p-4 border-2 ${
                  address.isDefault ? 'border-rose' : 'border-transparent'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-rose/10 rounded-lg mt-0.5">
                      <Home className="w-5 h-5 text-rose" />
                    </div>
                    <div>
                      <p className="font-medium text-charcoal">{address.line1}</p>
                      {address.line2 && <p className="text-sm text-warm-gray">{address.line2}</p>}
                      <p className="text-sm text-warm-gray">
                        {address.city}{address.state ? `, ${address.state}` : ''}{address.zip ? ` - ${address.zip}` : ''}
                      </p>
                      <p className="text-sm text-warm-gray">{address.country}</p>
                      {address.phone && <p className="text-sm text-warm-gray mt-1">Phone: {address.phone}</p>}
                      <div className="flex items-center gap-2 mt-2">
                        {address.isDefault && (
                          <span className="text-xs bg-rose/10 text-rose px-2 py-0.5 rounded-full font-medium">Default</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {!address.isDefault && (
                      <button
                        onClick={() => setDefaultMutation.mutate(address.id)}
                        className="text-xs text-rose hover:underline px-2 py-1"
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(address)}
                      className="p-2 text-warm-gray hover:text-charcoal transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(address.id)}
                      className="p-2 text-warm-gray hover:text-error transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
