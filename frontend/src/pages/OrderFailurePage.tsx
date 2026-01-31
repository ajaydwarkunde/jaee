import { Link } from 'react-router-dom'
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function OrderFailurePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blush via-cream to-champagne py-12 flex items-center justify-center">
      <div className="container-custom max-w-md">
        <div className="bg-soft-white rounded-2xl shadow-soft-xl p-8 md:p-12 text-center">
          {/* Error Icon */}
          <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-error" />
          </div>

          <h1 className="heading-2 text-charcoal mb-2">Payment Failed</h1>
          <p className="text-warm-gray mb-8">
            We couldn't process your payment. Don't worry, no charges were made. 
            Please try again or use a different payment method.
          </p>

          <div className="flex flex-col gap-4">
            <Link to="/cart">
              <Button className="w-full" icon={<RefreshCw className="w-5 h-5" />}>
                Try Again
              </Button>
            </Link>
            <Link to="/shop">
              <Button variant="outline" className="w-full" icon={<ArrowLeft className="w-5 h-5" />}>
                Continue Shopping
              </Button>
            </Link>
          </div>

          <p className="text-sm text-warm-gray mt-8">
            Need help?{' '}
            <a href="mailto:support@jaee.com" className="text-rose hover:underline">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
