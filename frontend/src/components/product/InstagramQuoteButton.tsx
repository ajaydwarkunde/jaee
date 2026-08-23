import { useState } from 'react'
import { Instagram } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import { buildProductQuoteMessage, instagramDmUrl } from '@/lib/utils'

interface InstagramQuoteButtonProps {
  handle: string
  productName: string
  sku?: string | null
  size?: string | null
  fragrance?: string | null
  color?: string | null
  productUrl: string
  className?: string
}

export default function InstagramQuoteButton({
  handle,
  productName,
  sku,
  size,
  fragrance,
  color,
  productUrl,
  className,
}: InstagramQuoteButtonProps) {
  const [busy, setBusy] = useState(false)
  const message = buildProductQuoteMessage({
    productName,
    sku,
    size,
    fragrance,
    color,
    productUrl,
  })

  const openInquiry = async () => {
    setBusy(true)
    try {
      await navigator.clipboard.writeText(message)
      toast.success('Message copied. Paste it in Instagram and tap Send.')
    } catch {
      toast('Copy this message into Instagram, then send it.', { duration: 6000 })
    }
    window.open(instagramDmUrl(handle), '_blank', 'noopener,noreferrer')
    setBusy(false)
  }

  return (
    <div className={className}>
      <Button
        type="button"
        onClick={() => void openInquiry()}
        loading={busy}
        icon={<Instagram className="w-5 h-5" />}
        className="w-full"
        size="lg"
      >
        Message on Instagram for pricing
      </Button>
      <p className="mt-2 text-xs text-warm-gray">
        Instagram cannot pre-fill a DM. The product details are copied for you — paste once and send.
      </p>
    </div>
  )
}
