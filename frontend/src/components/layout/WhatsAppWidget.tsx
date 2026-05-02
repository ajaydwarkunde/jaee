import { useState } from 'react'
import { X, MessageCircle } from 'lucide-react'
import { useStoreSettings } from '@/hooks/useStoreSettings'

const DEFAULT_MESSAGE = 'Hi! I have a question about Jaai products.'

export default function WhatsAppWidget() {
  const { whatsappPhoneDigits } = useStoreSettings()
  const [showTooltip, setShowTooltip] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  const handleClick = () => {
    window.open(
      `https://wa.me/${whatsappPhoneDigits}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`,
      '_blank'
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {showTooltip && !dismissed && (
        <div className="bg-soft-white rounded-lg shadow-soft-lg p-3 pr-8 animate-scale-in max-w-[220px] relative">
          <button onClick={() => setDismissed(true)} className="absolute top-2 right-2 text-warm-gray hover:text-charcoal" aria-label="Close">
            <X className="w-3 h-3" />
          </button>
          <p className="text-sm text-charcoal font-medium">Need help?</p>
          <p className="text-xs text-warm-gray mt-1">Chat with us on WhatsApp for quick support!</p>
        </div>
      )}
      <button
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        className="w-14 h-14 bg-[#25D366] hover:bg-[#1da851] text-white rounded-full shadow-soft-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    </div>
  )
}
