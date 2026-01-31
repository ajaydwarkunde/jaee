import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, MapPin, Plus, Pencil, Trash2, Home, Building } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'

interface Address {
  id: number
  type: 'home' | 'work' | 'other'
  name: string
  phone: string
  street: string
  city: string
  state: string
  pincode: string
  isDefault: boolean
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: 1,
      type: 'home',
      name: 'John Doe',
      phone: '+91 98765 43210',
      street: '123 Rose Garden Lane, Apt 4B',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      isDefault: true,
    },
  ])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    type: 'home' as 'home' | 'work' | 'other',
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingId) {
      setAddresses(addresses.map(addr => 
        addr.id === editingId ? { ...formData, id: editingId, isDefault: addr.isDefault } : addr
      ))
      toast.success('Address updated')
    } else {
      setAddresses([...addresses, { ...formData, id: Date.now(), isDefault: addresses.length === 0 }])
      toast.success('Address added')
    }
    
    setShowForm(false)
    setEditingId(null)
    setFormData({ type: 'home', name: '', phone: '', street: '', city: '', state: '', pincode: '' })
  }

  const handleEdit = (address: Address) => {
    setFormData({
      type: address.type,
      name: address.name,
      phone: address.phone,
      street: address.street,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
    })
    setEditingId(address.id)
    setShowForm(true)
  }

  const handleDelete = (id: number) => {
    setAddresses(addresses.filter(addr => addr.id !== id))
    toast.success('Address deleted')
  }

  const setDefault = (id: number) => {
    setAddresses(addresses.map(addr => ({ ...addr, isDefault: addr.id === id })))
    toast.success('Default address updated')
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'home': return <Home className="w-4 h-4" />
      case 'work': return <Building className="w-4 h-4" />
      default: return <MapPin className="w-4 h-4" />
    }
  }

  return (
    <div className="bg-cream min-h-screen py-8 md:py-12">
      <div className="container-custom max-w-2xl">
        {/* Back Link */}
        <Link
          to="/account"
          className="inline-flex items-center text-warm-gray hover:text-charcoal mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Account
        </Link>

        <div className="flex items-center justify-between mb-8">
          <h1 className="heading-2 text-charcoal">My Addresses</h1>
          {!showForm && (
            <Button
              onClick={() => setShowForm(true)}
              icon={<Plus className="w-4 h-4" />}
              size="sm"
            >
              Add New
            </Button>
          )}
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-soft-white rounded-xl shadow-soft p-6 mb-6">
            <h2 className="font-serif text-lg font-medium text-charcoal mb-4">
              {editingId ? 'Edit Address' : 'Add New Address'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {(['home', 'work', 'other'] as const).map((type) => (
                  <label
                    key={type}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      formData.type === type
                        ? 'border-rose bg-rose/10 text-rose'
                        : 'border-blush text-warm-gray hover:border-rose/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value={type}
                      checked={formData.type === type}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    {getTypeIcon(type)}
                    <span className="capitalize">{type}</span>
                  </label>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  required
                />
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  required
                />
              </div>

              <Input
                name="street"
                value={formData.street}
                onChange={handleChange}
                placeholder="Street Address"
                required
              />

              <div className="grid md:grid-cols-3 gap-4">
                <Input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  required
                />
                <Input
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State"
                  required
                />
                <Input
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="PIN Code"
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingId(null)
                    setFormData({ type: 'home', name: '', phone: '', street: '', city: '', state: '', pincode: '' })
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {editingId ? 'Update Address' : 'Save Address'}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Address List */}
        {addresses.length === 0 && !showForm ? (
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
            {addresses.map((address) => (
              <div
                key={address.id}
                className={`bg-soft-white rounded-xl shadow-soft p-4 border-2 ${
                  address.isDefault ? 'border-rose' : 'border-transparent'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`p-2 rounded-lg ${
                      address.isDefault ? 'bg-rose/10 text-rose' : 'bg-blush text-warm-gray'
                    }`}>
                      {getTypeIcon(address.type)}
                    </span>
                    <div>
                      <span className="font-medium text-charcoal capitalize">
                        {address.type}
                      </span>
                      {address.isDefault && (
                        <span className="ml-2 text-xs bg-rose text-soft-white px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(address)}
                      className="p-2 text-warm-gray hover:text-rose transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(address.id)}
                      className="p-2 text-warm-gray hover:text-error transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="text-charcoal">
                  <p className="font-medium">{address.name}</p>
                  <p className="text-sm text-warm-gray">{address.phone}</p>
                  <p className="text-sm mt-2">
                    {address.street}<br />
                    {address.city}, {address.state} - {address.pincode}
                  </p>
                </div>

                {!address.isDefault && (
                  <button
                    onClick={() => setDefault(address.id)}
                    className="mt-4 text-sm text-rose hover:underline"
                  >
                    Set as default
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
