import { useState } from 'react'
import { X } from 'lucide-react'
import { useStoreSettings } from '@/hooks/useStoreSettings'

export default function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(false)
  const { freeShippingThreshold } = useStoreSettings()

  if (dismissed) return null

  return (
    <div className="bg-rose text-soft-white text-center py-2 px-4 text-sm relative">
      <p className="font-medium">
        ✨ Free shipping on orders over ₹{freeShippingThreshold} · Use code <span className="font-bold">JAAI10</span> for 10% off your first order!
      </p>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-soft-white/20 rounded-full transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
