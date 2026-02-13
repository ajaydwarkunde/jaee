import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { settingsService, StoreSetting } from '@/services/settingsService'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Save, Settings, Truck, RefreshCw, MessageSquare, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

type SettingGroup = {
  title: string
  icon: React.ReactNode
  keys: string[]
}

const SETTING_GROUPS: SettingGroup[] = [
  {
    title: 'Shipping',
    icon: <Truck className="w-5 h-5" />,
    keys: ['free_shipping_enabled', 'free_shipping_threshold', 'shipping_charges', 'estimated_delivery_days'],
  },
  {
    title: 'Returns & COD',
    icon: <RefreshCw className="w-5 h-5" />,
    keys: ['return_days', 'return_policy_text', 'cod_enabled', 'cod_charges'],
  },
  {
    title: 'Contact & Social',
    icon: <MessageSquare className="w-5 h-5" />,
    keys: ['support_email', 'support_phone', 'instagram_handle'],
  },
  {
    title: 'Announcements',
    icon: <Settings className="w-5 h-5" />,
    keys: ['announcement_enabled', 'announcement_text'],
  },
]

const SETTING_LABELS: Record<string, string> = {
  free_shipping_enabled: 'Free Shipping Enabled',
  free_shipping_threshold: 'Free Shipping Min Order (₹)',
  shipping_charges: 'Standard Shipping (₹)',
  estimated_delivery_days: 'Estimated Delivery Days',
  return_days: 'Return Period (days)',
  return_policy_text: 'Return Policy Text',
  cod_enabled: 'Cash on Delivery',
  cod_charges: 'COD Charges (₹)',
  support_email: 'Support Email',
  support_phone: 'Support Phone',
  instagram_handle: 'Instagram Handle',
  announcement_enabled: 'Show Announcement',
  announcement_text: 'Announcement Text',
}

export default function AdminSettings() {
  const queryClient = useQueryClient()
  const [editedValues, setEditedValues] = useState<Record<string, string>>({})
  const [hasChanges, setHasChanges] = useState(false)

  const { data: settings, isLoading } = useQuery({
    queryKey: ['adminSettings'],
    queryFn: settingsService.getAllSettings,
  })

  const updateMutation = useMutation({
    mutationFn: (updates: Record<string, string>) => settingsService.updateSettings(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSettings'] })
      queryClient.invalidateQueries({ queryKey: ['storeSettings'] })
      setEditedValues({})
      setHasChanges(false)
      toast.success('Settings saved successfully')
    },
    onError: () => {
      toast.error('Failed to save settings')
    },
  })

  const handleChange = (key: string, value: string) => {
    setEditedValues((prev) => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handleToggle = (key: string, currentValue: string) => {
    const newValue = currentValue === 'true' ? 'false' : 'true'
    handleChange(key, newValue)
  }

  const handleSave = () => {
    if (Object.keys(editedValues).length === 0) return
    updateMutation.mutate(editedValues)
  }

  const getValue = (setting: StoreSetting): string => {
    return editedValues[setting.key] ?? setting.value
  }

  const settingsMap = new Map(settings?.map((s) => [s.key, s]))

  if (isLoading) {
    return (
      <div className="bg-cream min-h-screen py-8">
        <div className="container-custom flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-rose border-t-transparent" />
        </div>
      </div>
    )
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
              <h1 className="heading-2 text-charcoal">Store Settings</h1>
              <p className="text-warm-gray mt-1">Configure your store's shipping, returns, and more</p>
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || updateMutation.isPending}
            icon={<Save className="w-4 h-4" />}
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        {/* Settings Groups */}
        <div className="grid md:grid-cols-2 gap-6">
          {SETTING_GROUPS.map((group) => (
            <Card key={group.title} className="h-full flex flex-col">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="p-2 bg-blush rounded-lg">{group.icon}</span>
                  {group.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 flex-1">
                {group.keys.map((key) => {
                  const setting = settingsMap.get(key)
                  if (!setting) return null

                  const value = getValue(setting)
                  const isBoolean = setting.type === 'BOOLEAN'
                  const isEdited = editedValues[key] !== undefined

                  return (
                    <div key={key} className="space-y-2">
                      <label className="flex items-center justify-between gap-3">
                        <span className={`text-sm font-medium ${isEdited ? 'text-rose' : 'text-charcoal'}`}>
                          {SETTING_LABELS[key] || key}
                          {isEdited && <span className="text-rose ml-1">*</span>}
                        </span>
                        {isBoolean && (
                          <button
                            type="button"
                            onClick={() => handleToggle(key, value)}
                            className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 ${
                              value === 'true' ? 'bg-rose' : 'bg-warm-gray/30'
                            }`}
                          >
                            <span
                              className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${
                                value === 'true' ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        )}
                      </label>
                      {!isBoolean && (
                        <Input
                          type={setting.type === 'NUMBER' ? 'number' : 'text'}
                          value={value}
                          onChange={(e) => handleChange(key, e.target.value)}
                          className="text-sm"
                        />
                      )}
                      {setting.description && (
                        <p className="text-xs text-warm-gray">{setting.description}</p>
                      )}
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Unsaved changes indicator */}
        {hasChanges && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-charcoal text-cream px-6 py-3 rounded-full shadow-lg flex items-center gap-4 z-50">
            <span className="text-sm">You have unsaved changes</span>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={updateMutation.isPending}
            >
              Save
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
