import { useState } from 'react'
import { Copy, Instagram } from 'lucide-react'
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
  const [showMessage, setShowMessage] = useState(false)
  const message = buildProductQuoteMessage({
    productName,
    sku,
    size,
    fragrance,
    color,
    productUrl,
  })

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message)
      toast.success('Message copied. Paste it into Instagram and tap Send.')
    } catch {
      toast.error('Could not copy automatically. Select and copy the message below.')
    }
  }

  return (
    <div className={className}>
      {!showMessage ? (
        <Button
          type="button"
          onClick={() => setShowMessage(true)}
          icon={<Instagram className="w-5 h-5" />}
          className="w-full"
          size="lg"
        >
          Prepare Instagram message
        </Button>
      ) : (
        <div className="rounded-xl border border-blush-dark bg-soft-white p-4 shadow-soft">
          <p className="mb-2 text-sm font-medium text-charcoal">Your message is ready</p>
          <textarea
            readOnly
            value={message}
            onFocus={(event) => event.currentTarget.select()}
            aria-label="Prepared Instagram message"
            className="min-h-52 w-full resize-y rounded-lg border border-blush-dark bg-cream p-3 text-sm text-charcoal focus:border-rose focus:outline-none focus:ring-2 focus:ring-rose/20"
          />
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => void copyMessage()}
              icon={<Copy className="h-4 w-4" />}
              className="w-full"
            >
              Copy message
            </Button>
            <Button
              type="button"
              onClick={() =>
                window.open(instagramDmUrl(handle), '_blank', 'noopener,noreferrer')
              }
              icon={<Instagram className="h-4 w-4" />}
              className="w-full"
            >
              Open Instagram
            </Button>
          </div>
          <p className="mt-2 text-xs text-warm-gray">
            Instagram does not allow websites to pre-fill DMs. Copy this prepared message, open
            Instagram, then paste and send it.
          </p>
        </div>
      )}
    </div>
  )
}
